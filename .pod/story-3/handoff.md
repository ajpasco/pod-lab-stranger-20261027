# Story 3 handoff: list into a reader that stops early (D-1)

## What I built

`app/bin/tally.js` only. The failure mapping that was inline in the top-level `catch` is now a
function, `fail(err)`, used in two places:

- the top-level `catch` around `main`, for an error the `process.stdout.write` call throws;
- a listener, `process.stdout.on("error", fail)`, installed before `main` runs, for an `EPIPE` (or
  any other write error) that arrives later as an event on stdout.

`fail` returns without a word when the error's `code` is `EPIPE` (a closed stdout, TECH-SPEC
section 10), so the process ends with exit 0 and nothing on stderr. Any other error keeps the D5
rule as before: one `tally: …` line on stderr and the usual exit status (1, or 2 for a usage error).
No command module, `store.js` or `usage.js` changed; `list` never calls the write path, so
`tally.json` is untouched.

My own tests, `app/test/tally.test.js`, run the entry point as a child process:

1. `list` over 100,000 counters, stdout a pipe destroyed after the first chunk: first line
   `c000000 0`, stderr empty, exit 0, file bytes equal.
2. `list` with stdout opened on `/dev/full` (ENOSPC): one `tally: …` line, exit 1. Skipped where
   `/dev/full` does not exist (macOS).

## What passes

- `sh eval/run.sh` from the repository root: exit 0, "eval: PASSED (every step exit 0)". Node-major
  check passed, conventions passed (17 files, 0 problems), tests 207 subtests, 207 pass, 0 fail,
  T-REQ-02-P8 included (`ok 19`).
- `node --test app/test/*.test.js` on macOS (Node 22.23.2): 28 pass, 1 skipped (the `/dev/full`
  case).
- `app/test/tally.test.js` in the pinned image (`node@sha256:de170b39…`, uid 501): 2 of 2 pass, the
  `/dev/full` case included.
- Fails before the fix: with the listener removed, test 1 fails with `Error: write EPIPE` on stderr,
  which is D-1 as reported.

## What did not pass, or was not shown

- I did not observe the path where `process.stdout.write` itself *throws* `EPIPE` inside `main`.
  On both macOS and Linux the error arrived as the event. That path goes through the same `fail`, so
  it is handled, but no test here makes it happen.
- When a non-`EPIPE` error arrives as an event after part of `list`'s output was written, stdout is
  not empty, which D5's "stdout empty" cannot hold once bytes have gone. The rule's stderr line and
  exit 1 do hold.

No test or convention seems wrong to me.
