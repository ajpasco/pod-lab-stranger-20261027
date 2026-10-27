#!/bin/sh
# The acceptance run of tally: the one command, locally and in the gate. Run from the repository
# root as `sh eval/run.sh` (docs/eval-plan.md section 8; docs/TECH-SPEC.md sections 6 and 13).
#
# Every step runs inside the Node 22 container pinned by digest (node:22-bookworm-slim), as the
# calling user's uid:gid and never as root, with the repository mounted as the working directory
# (Decisions 2026-10-27, G1). Docker is required; the first run pulls the image. Inside the
# container eval/inside.sh runs the Node-major check (E4), the conventions step and the tests.
#
# Every step runs and every result is logged to eval/report/eval.log (never committed; F6 B) and to
# stdout; the exit status is non-zero if any step failed (F6 E).
set -u

IMAGE="node@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d"

root=$(cd "$(dirname "$0")/.." && pwd) || exit 1
cd "$root" || exit 1

mkdir -p eval/report || exit 1
LOG=eval/report/eval.log
STATUS_FILE=eval/report/.container-status
: > "$LOG"
rm -f "$STATUS_FILE"

log() {
  printf '%s\n' "$*" | tee -a "$LOG"
}

uid=$(id -u)
gid=$(id -g)

log "eval: $(date -u '+%Y-%m-%dT%H:%M:%SZ') image $IMAGE as uid:gid $uid:$gid"
if [ "$uid" = "0" ]; then
  log "P1 not met: running as root (uid 0); the permission tests will fail on their own precondition"
fi

{
  docker run --rm --user "$uid:$gid" -e HOME=/tmp -v "$root":/w -w /w "$IMAGE" sh eval/inside.sh
  echo "$?" > "$STATUS_FILE"
} 2>&1 | tee -a "$LOG"

status=$(cat "$STATUS_FILE" 2>/dev/null)
rm -f "$STATUS_FILE"
if [ -z "$status" ]; then
  status=1
fi

if [ "$status" -eq 0 ]; then
  log "eval: PASSED (every step exit 0)"
else
  log "eval: FAILED (container run exit $status); see the step results above and $LOG"
fi
exit "$status"
