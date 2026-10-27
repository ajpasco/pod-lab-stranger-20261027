# Story 1 handoff: add and list

## What I built

- `app/package.json`: exactly the four fields the TECH-SPEC section 13 layout names: `name`,
  `"type": "module"`, `bin` (`tally` -> `bin/tally.js`) and `engines` `>=22 <23`. It has no
  `version`, no dependency field and no `scripts` field.
- `app/bin/tally.js`: the order of work of TECH-SPEC section 7. It runs `parseUsage`, then a dynamic
  `import()` of `../src/commands/<command>.js`, then `readCounters`, then the module's `run`, then
  `writeCounters` only if `writes` is true, then prints the output. All failures are mapped in one
  place: a usage error exits 2, anything else exits 1, and the message is always one `tally: ...`
  line with no stack trace. An unexpected error gets the prefix `unexpected error:`. Exit status is
  set through `process.exitCode`, so stdout is never cut off by `process.exit`.
- `app/src/usage.js`: validates the arguments of all four commands (no command, unknown command,
  case-sensitive names, missing, empty or whitespace name, extra argument, any argument to `list`).
  Names are quoted with `JSON.stringify` in messages, so a name holding a line break still gives a
  one-line message.
- `app/src/names.js`: `isValidName` (non-empty, no `\p{White_Space}`) and `compareNames` (compares
  by code point, not UTF-16 unit).
- `app/src/errors.js`: the two failure kinds, `UsageError` and `CouldNotBeCarriedOut`.
- `app/src/store.js`: the only module that touches the file system.
  - Reading: `ENOENT` means no counters. Any other read error, a byte-order mark, invalid JSON, a
    top-level value that is not an object, an invalid key, or a value that is not a safe integer
    `>= 0` exits 1. The result is a `Map`.
  - Writing: first checks `W_OK` on an existing file. Then it creates
    `.tally.json.<pid>.<random>.tmp` with `wx`, `fchmod`s it to the existing file's mode, writes it
    and renames it over `tally.json`. On any failure after creation the temporary file is removed.
    Messages name the file and the error code, never the contents.
- `app/src/commands/add.js` and `app/src/commands/list.js`: `run(counters, name)` returns
  `{ counters, output }`, and each exports `writes`. Neither imports anything except `../names.js`
  (list only).
- `app/test/{add,list,usage,store}.test.js`: 19 tests of my own. Run them with
  `node --test app/test/*.test.js` from the repository root; all 19 pass.

## What passes

`sh eval/run.sh` from the repository root (Docker, pinned image, Node 22.23.4, uid 501, not root)
exits 0:
- node-major-check: passed.
- conventions: 12 files under app/ checked (my test files included), 0 problems.
- tests: 52 top-level rows, 134 tests counting subtests, 134 pass, 0 fail.

I also checked by hand that `node app/bin/tally.js reset coffee` exits 1 and prints one
`tally: unexpected error: Cannot find module ...` line with no stack trace and no file created. This
is the "Between story 1 and story 2" state.

## Notes for the reader

- **Errors without classes.** The conventions say "no classes", and section 13 says failures are
  "thrown as `UsageError` ... or `CouldNotBeCarriedOut`". I resolved the conflict by making both
  kinds plain `Error`s whose `name` is `"UsageError"` or `"CouldNotBeCarriedOut"`. They are built by
  `usageError()` and `couldNotBeCarriedOut()` and recognised by `isUsageError()` and
  `isCouldNotBeCarriedOut()`. If the intent was `class UsageError extends Error`, the conventions
  would need to say so. I did not add a class.
- **Message for a missing command module.** Before story 2 the one-line message contains the
  absolute path of the missing module. That follows TECH-SPEC section 7 (no special case, D5's
  rule). It ends when story 2 lands.
- **Executable bit.** `app/bin/tally.js` has a `#!/usr/bin/env node` line, but I could not set its
  executable bit: `chmod` was not permitted in this session. The tests run it as `node
  app/bin/tally.js`, so no row depends on it. Running it directly through the `bin` entry after an
  `npm link` or install does not depend on it either, because npm makes bin targets executable.
  Someone may still want `git update-index --chmod=+x app/bin/tally.js`.
- No test or convention seemed wrong to me.

## Review round 1 (reader, at 6b706dc)

- [block] `app/package.json` had a `"version": "1.0.0"` field. The section 13 layout does not name
  it, and the handoff wrongly said the file held only the layout's fields. The finding is correct.
  I removed the field and corrected the description above. `sh eval/run.sh` exits 0 again:
  conventions 12 files, 0 problems; 134 of 134 tests pass (52 rows).
