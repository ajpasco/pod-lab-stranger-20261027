# Story 2 handoff: reset and remove

## What I built

- `app/src/commands/reset.js` (REQ-03): `writes = true`; `run(counters, name)` throws
  `CouldNotBeCarriedOut` ("there is no counter "<name>" to reset") when the name is not in the
  `Map`, and otherwise returns a new `Map` with the counter set to 0 and empty output.
- `app/src/commands/remove.js` (REQ-04): the same shape. It deletes the counter from a new `Map`;
  the message is "... to remove".
- Both import `../errors.js` only, touch no file system and don't change the `Map` they are given.
  The name in the message is quoted with `JSON.stringify`, as `usage.js` and `store.js` already do.
  That keeps the message on one line. Neither module needs `names.js`, because the name has already
  been checked by `usage.js`.
- `app/test/reset.test.js` and `app/test/remove.test.js` cover `writes`, the success case, the
  original `Map` being left unchanged, a missing counter, case-sensitivity and `__proto__`.

None of story 1's files, nothing under `eval/`, `docs/` or `.github/`, and no `package.json` were
changed.

## What passes

- `sh eval/run.sh`, run from the repository root as uid 501 (not root): the node-major check, the
  conventions step (16 files, 0 problems) and the tests all pass. There are 206 tests, 206 pass and
  0 fail; they cover all 76 rows, including the 24 story-2 rows and story 1's 52 rows. The run
  ended with "eval: PASSED (every step exit 0)".
- `node --test app/test/*.test.js`: 27 of 27 pass. Note that `node --test app/test/` (a directory)
  does not work on Node 22; you have to pass the glob.

## What did not pass / concerns

Nothing failed. I don't think any test or convention is wrong.
