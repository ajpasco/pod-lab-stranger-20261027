#!/bin/sh
# Runs inside the pinned Node 22 container, started by eval/run.sh, from the repository root
# (mounted as /w). Steps, in order (docs/eval-plan.md section 8):
#   1. the Node-major check (Q21, E4): refuse, before any check or test, unless node's major is 22;
#   2. the conventions step, sh eval/conventions.sh;
#   3. the acceptance tests, node --test eval/tests/*.test.mjs (a shell glob; F6 C), with Node's
#      built-in reporter and no reporter flag.
# A failing conventions step does not stop the tests (F6 E). Each step's exit status is printed;
# the script exits non-zero if any step failed.
set -u

major=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null)
echo "== step: node-major-check (node $(node --version 2>/dev/null))"
if [ "$major" != "22" ]; then
  echo "eval: refusing to run: the major version of node is '${major}', not 22 (Q21, E4)"
  echo "== result: node-major-check FAILED (exit 1)"
  exit 1
fi
echo "== result: node-major-check passed (exit 0)"

failed=0

echo "== step: conventions (sh eval/conventions.sh)"
sh eval/conventions.sh
status=$?
if [ "$status" -eq 0 ]; then
  echo "== result: conventions passed (exit 0)"
else
  echo "== result: conventions FAILED (exit $status)"
  failed=1
fi

echo "== step: tests (node --test eval/tests/*.test.mjs)"
node --test eval/tests/*.test.mjs
status=$?
if [ "$status" -eq 0 ]; then
  echo "== result: tests passed (exit 0)"
else
  echo "== result: tests FAILED (exit $status)"
  failed=1
fi

exit "$failed"
