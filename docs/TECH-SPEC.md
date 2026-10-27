# Technical blueprint: tally (revision 7)

Built from `docs/PRD.md` revision 4 and `docs/MOCKUP.md` revision 4, with the user's technical
answers (Q1, Q19, Q20, Q21), the user's gate-6 and gate-7 decisions (`docs/inputs/decisions-2026-10-27.md`, cited
as "Decisions 2026-10-27, F<n>" or "G<n>") and the gate-4 recorded defaults. Revision 7 is a narrow
revision applying G1 (the user, Decisions 2026-10-27, G1): `eval/run.sh` runs every step of the
acceptance suite inside a Node 22 container pinned by digest, as the calling user, so sections 4, 6, 10,
11, 12 and 13 now say so, and the pointers to the eval plan name its revision 4 (G6R3-001, the eval plan
being revised to revision 4 for G1 only). The application itself still runs on any Node 22 (`engines`),
unchanged; no register row changes its criterion and no requirement ID is created. Revision 6 answers the second
gate-6 review (`docs/reviews/gate-6-review-r2.md`: G6R2-001, G6R2-003, G6R2-004), reference fixes only:
the PRD and mockup revisions are named as 4; the usage-error rows of REQ-03 and REQ-04 are stated as
story 1's, as the eval plan (revision 4) has them; P3 is closed. No register row changes its criterion
and no requirement ID is created. Revision 5 answers the gate-6 review
(`docs/reviews/gate-6-review.md`: R6-001, R6-002, R6-003, R6-009) and applies F1, F2, F3, F4 and F6:
concurrency (O1) and overflow (P2) are decided as known limitations, P1 is accepted as a precondition,
the reason for declining ESLint, Prettier and a type checker is recorded, and the runner command, report
path and run behaviour are fixed. No register row changes its criterion and no requirement ID is
created. Revision 4 answers the gate-4 third
review (`docs/reviews/gate-4-findings-r3.md`: R3-01, R3-02): the section 5 table is whole again, and
every in-scope line of section 12 names one decider. Revision 3 answers the gate-4
re-review (`docs/reviews/gate-4-findings-r2.md`: R2-01 to R2-06), applies the user's decisions E1 to
E6 and the story split S1 (Q21). Revision 2 had answered the first gate-4 review and applied D1 to D6
(Q20).

"Recorded default" is used only for the defaults the orchestrator proposed with Q19 and the user has
not overridden: one entry point and small plain-function modules, no classes; `tally.json` as a JSON
object of name to whole number; every write via a temporary file and rename; acceptance tests as child
processes with `node:test`. (The fifth, Node 22, is now the user's own decision as Node 22.x with a
refusal check: Q21, E4.) Every other decision names its decider: the user (Q-number, D-number,
E-number, S-number), or a cited PRD clause. Nothing here adds a requirement; criteria are cited as
"REQ-nn acc. k", the k-th bullet under that requirement's Acceptance, counted as in the mockup.

## 1. Profile and fit

A command-line program in Node.js 22.x with no dependencies, run from a terminal in any directory; it
keeps its state in `tally.json` in that directory (Q1). The product is four commands over one small
file, so the design is one entry point, a usage module, a store, two domain modules and one small
module per command, all plain functions, no classes, no framework, no server. That is as much
structure as the PRD's six requirements need, and one module per command lets the two stories of
section 9 own separate files.

## 2. Layers and dependency direction

| Layer | Part | May import |
|---|---|---|
| 1. Boundary | `app/bin/tally.js`: reads `process.argv`, runs the steps in order, loads the module of a valid command, maps errors to the exit status and stderr, writes stdout | layers 2 and 3 |
| 2. Parts (peers) | `usage.js` (argv to a command; validates the arguments of all four commands), `store.js` (reads `tally.json`, checks the stored layout of section 7, and writes it), and one module per command under `app/src/commands/`: `add.js`, `list.js`, `reset.js`, `remove.js` (each holds that command's rule) | layer 3 only; never each other |
| 3. Domain | `names.js` (what a valid name is, name order), `errors.js` (the two failure kinds) | nothing in `app/` |

One-way: boundary, then parts, then domain. A command module never touches the file system. Each
exports `run(counters, name)`, taking the checked counters (a `Map`) and, except for `list`, the
name, and returning the new counters and the text to print; and a boolean `writes` that is true for
`add`, `reset` and `remove` and false for `list`. `reset.js` and `remove.js` throw
`CouldNotBeCarriedOut` for a missing counter. The module that touches the file system (`store.js`)
reads, checks that what it read has the stored layout of section 7 (using `names.js` for the name
rule), and writes; it applies no command rule, so it never decides what `add`, `reset`, `remove` or
`list` do. `store.js`, `usage.js` and the command modules do not import each other: the boundary hands
the checked counters from the store to the command and the result back to the store.

The boundary loads a command module by dynamic `import()` of `../src/commands/<command>.js`, where
`<command>` is the value `usage.js` has already accepted as one of the four command names; input is
never used as a path (section 5).

## 3. Requirements by layer

| Layer | Story (section 9) | Requirements |
|---|---|---|
| 1. Boundary: `bin/tally.js` | 1 | REQ-06 |
| 2. Parts: `usage.js` | 1 | REQ-05 |
| 2. Parts: `commands/add.js` | 1 | REQ-01 |
| 2. Parts: `commands/list.js` | 1 | REQ-02 |
| 2. Parts: `commands/reset.js` | 2 | REQ-03 |
| 2. Parts: `commands/remove.js` | 2 | REQ-04 |
| 2. Parts: `store.js` | 1 | none of its own; it serves the failure criteria (damaged, unreadable, unwritable) of the four commands |
| 3. Domain | 1 | none of its own; `names.js` and `errors.js` serve the parts above |

The blueprint creates no requirement ID. The usage-error criteria of REQ-03 and REQ-04 (no name, empty
name, name with whitespace, extra argument) are decided by `usage.js` in story 1, because `usage.js`
validates all four commands' arguments (REQ-05 and REQ-06 need that); the requirements stay placed
where the PRD gave them, with story 2's modules. The rows of those usage-error criteria (acc. 6 to 9
of each) are story 1's; story 2 owns the other rows of REQ-03 and REQ-04 (section 4, section 9).

## 4. Verification register

Common mechanism, defined once and named in each row:

- **Child-process test**: a `node:test` case creates a fresh temporary directory, writes the starting
  state (or none), runs `node app/bin/tally.js <args>` as a child process with that directory as its
  current directory, and asserts what the person would see: exit status, stdout, stderr, and the
  bytes of `tally.json` (or its absence) before and after. "Message on stderr" means stderr holds at
  least one non-whitespace character; the wording is not asserted (PRD decides none).
- **Child-process test with permissions**: the same, with the starting state made by `fs.chmodSync`
  in the temporary directory: `0o000` on the file for unreadable, `0o444` for a file that does not
  allow writing, `0o555` on the directory for a directory that does not allow writing. The test
  first checks that the operating system really refuses the access, and fails with a named message
  if it does not (see section 11, P1). Permissions are restored before the directory is removed.
- **Damaged starting states** used wherever a row says "damaged": text that is not JSON, an empty
  file, and each shape defined as damaged in section 7.

Evidence for every row: the row's result line in the eval log written by `eval/run.sh` at
`eval/report/eval.log`, never committed (the user, Decisions 2026-10-27, F6 B), a record that stays
inspectable after the run. The row ids belong to the eval plan. Every mechanism above runs inside the
container of section 6 (the user, Decisions 2026-10-27, G1), as the calling non-root user.

| Criterion | Mechanism | Evidence it produces |
|---|---|---|
| REQ-01 acc. 1: add creates `coffee` at 1, nothing on stdout or stderr, exit 0 | Child-process test | Eval-log row result: exit 0, stdout and stderr empty, file holds `coffee` 1 |
| REQ-01 acc. 2: add raises `coffee` 3 to 4, others unchanged | Child-process test | Row result: exit 0, silent, `coffee` 4, other counters as before |
| REQ-01 acc. 3: add with no tally.json creates it with `coffee` at 1 | Child-process test | Row result: exit 0, silent, file now exists with `coffee` 1 |
| REQ-01 acc. 4: `add Coffee` leaves `coffee` at 3 and creates `Coffee` at 1 | Child-process test | Row result: exit 0, both counters with those values |
| REQ-01 acc. 5: `add -x` creates `-x` at 1 | Child-process test | Row result: exit 0, file holds `-x` 1 |
| REQ-01 acc. 6: `add` with no name exits 2, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, file bytes equal |
| REQ-01 acc. 7: `add ""` exits 2, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, file bytes equal |
| REQ-01 acc. 8: `add "a b"` exits 2, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, file bytes equal |
| REQ-01 acc. 9: `add a b` exits 2, no `a` or `b` created, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, file bytes equal |
| REQ-01 acc. 10: damaged file, `add coffee` exits 1, file byte-for-byte as it was | Child-process test, each damaged starting state | Row result per state: exit 1, stdout empty, stderr non-empty, bytes equal |
| REQ-01 acc. 11: unreadable file, `add coffee` exits 1, file as it was | Child-process test with permissions | Row result: exit 1, stdout empty, stderr non-empty, mode and bytes as before (read back after restoring permission) |
| REQ-01 acc. 12: file that does not allow writing, or no file in a directory that does not allow writing: exit 1, file as it was or still absent | Child-process test with permissions, both cases | Row result per case: exit 1, stdout empty, stderr non-empty, bytes equal or file still absent |
| REQ-01 acc. 13: writable file in a directory that does not allow writing, `add coffee` exits 1, file unchanged | Child-process test with permissions | Row result: exit 1, stdout empty, stderr non-empty, bytes equal |
| REQ-02 acc. 1: each line is name, one space, value | Child-process test | Row result: stdout is exactly `coffee 3\n` for a fixture of `coffee` at 3 |
| REQ-02 acc. 2: `b` 2, `a` 1, `B` 5 print `B 5`, `a 1`, `b 2`, exit 0, stderr empty | Child-process test | Row result: stdout exactly those three lines in that order, exit 0, stderr empty |
| REQ-02 acc. 3: a reset counter is listed as `coffee 0` | Child-process test; the starting file holds `coffee` at 0, the state a reset leaves, so the row runs `list` only and does not need story 2 (section 9); the chain `reset`, then `list` is REQ-03 acc. 2 | Row result: stdout contains `coffee 0` |
| REQ-02 acc. 4: no counters, nothing on stdout, exit 0 | Child-process test | Row result: exit 0, stdout empty |
| REQ-02 acc. 5: no tally.json, nothing on stdout, exit 0, file not created | Child-process test | Row result: exit 0, stdout empty, file still absent |
| REQ-02 acc. 6: after any successful list the file is unchanged | Child-process test with permissions (for the read-only file and read-only directory fixtures; plain child-process test for the others), over the success fixtures of REQ-02 (with counters, none, no file, read-only file, read-only directory) | Row result per fixture: bytes (or absence) equal after |
| REQ-02 acc. 7: readable but unwritable file, and existing file in a directory that does not allow writing: list prints the counters sorted, exit 0, file unchanged | Child-process test with permissions, both cases | Row result per case: exit 0, three sorted lines, bytes equal |
| REQ-02 acc. 8: `list x` exits 2, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-02 acc. 9: damaged file, `list` exits 1, file as it was | Child-process test, each damaged starting state | Row result per state: exit 1, stdout empty, stderr non-empty, bytes equal |
| REQ-02 acc. 10: unreadable file, `list` exits 1 | Child-process test with permissions | Row result: exit 1, stdout empty, stderr non-empty, file as before |
| REQ-03 acc. 1: `reset coffee` with `coffee` 3, `tea` 2: silent, exit 0, `coffee` 0, `tea` 2 | Child-process test | Row result: exit 0, silent, counters as stated |
| REQ-03 acc. 2: after that reset, `list` includes `coffee 0` | Child-process test (`reset`, then `list`) | Row result: stdout includes line `coffee 0` |
| REQ-03 acc. 3: no counter `coffee`, `reset coffee` exits 1, file unchanged | Child-process test | Row result: exit 1, stdout empty, stderr non-empty, bytes equal |
| REQ-03 acc. 4: no tally.json, `reset coffee` exits 1, file still absent | Child-process test | Row result: exit 1, stdout empty, stderr non-empty, file absent |
| REQ-03 acc. 5: `reset Coffee` with `coffee` 3 exits 1, `coffee` still 3 | Child-process test | Row result: exit 1, `coffee` 3 |
| REQ-03 acc. 6: `reset` with no name exits 2, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-03 acc. 7: `reset ""` exits 2, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-03 acc. 8: `reset "a b"` exits 2, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-03 acc. 9: `reset a b` exits 2, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-03 acc. 10: damaged file, `reset coffee` exits 1, file as it was | Child-process test, each damaged starting state | Row result per state: exit 1, stdout empty, stderr non-empty, bytes equal |
| REQ-03 acc. 11: unreadable file, `reset coffee` exits 1 | Child-process test with permissions | Row result: exit 1, stdout empty, stderr non-empty, file as before |
| REQ-03 acc. 12: file that does not allow writing, `reset coffee` exits 1, file as it was | Child-process test with permissions | Row result: exit 1, stdout empty, stderr non-empty, bytes equal |
| REQ-03 acc. 13: writable file holding `coffee` in a directory that does not allow writing: exit 1, file unchanged | Child-process test with permissions | Row result: exit 1, stdout empty, stderr non-empty, bytes equal |
| REQ-04 acc. 1: `remove coffee` with `coffee` 3, `tea` 2: silent, exit 0, no `coffee`, `tea` 2 | Child-process test | Row result: exit 0, silent, counters as stated |
| REQ-04 acc. 2: after that removal, `list` has no `coffee` line | Child-process test (`remove`, then `list`) | Row result: stdout has no `coffee` line |
| REQ-04 acc. 3: no counter `coffee`, `remove coffee` exits 1, file unchanged | Child-process test | Row result: exit 1, stdout empty, stderr non-empty, bytes equal |
| REQ-04 acc. 4: no tally.json, `remove coffee` exits 1, file still absent | Child-process test | Row result: exit 1, stdout empty, stderr non-empty, file absent |
| REQ-04 acc. 5: `remove Coffee` with `coffee` 3 exits 1, `coffee` still 3 | Child-process test | Row result: exit 1, `coffee` 3 |
| REQ-04 acc. 6: `remove` with no name exits 2, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-04 acc. 7: `remove ""` exits 2, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-04 acc. 8: `remove "a b"` exits 2, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-04 acc. 9: `remove a b` exits 2, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-04 acc. 10: damaged file, `remove coffee` exits 1, file as it was | Child-process test, each damaged starting state | Row result per state: exit 1, stdout empty, stderr non-empty, bytes equal |
| REQ-04 acc. 11: unreadable file, `remove coffee` exits 1 | Child-process test with permissions | Row result: exit 1, stdout empty, stderr non-empty, file as before |
| REQ-04 acc. 12: file that does not allow writing, `remove coffee` exits 1, file as it was | Child-process test with permissions | Row result: exit 1, stdout empty, stderr non-empty, bytes equal |
| REQ-04 acc. 13: writable file holding `coffee` in a directory that does not allow writing: exit 1, file unchanged | Child-process test with permissions | Row result: exit 1, stdout empty, stderr non-empty, bytes equal |
| REQ-05 acc. 1: `tally` with no command exits 2, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-05 acc. 2: `frobnicate` exits 2, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-05 acc. 3: `--help` and `-h` each exit 2, nothing on stdout, file unchanged | Child-process test, one run per argument | Row result per argument: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-05 acc. 4: `Add coffee` exits 2, file unchanged | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal, no counter created |
| REQ-05 acc. 5: damaged file, `frobnicate` exits 2, not 1 | Child-process test | Row result: exit 2, stderr non-empty, bytes equal |
| REQ-06 acc. 1: damaged file, `add` with no name exits 2, byte-for-byte as it was | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-06 acc. 2: damaged file, `reset` with no name exits 2 | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-06 acc. 3: damaged file, `remove "a b"` exits 2 | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-06 acc. 4: damaged file, `list x` exits 2 | Child-process test | Row result: exit 2, stdout empty, stderr non-empty, bytes equal |
| REQ-06 acc. 5: unreadable file, `add a b` exits 2, file as it was | Child-process test with permissions | Row result: exit 2, stdout empty, stderr non-empty, file as before |
| REQ-06 acc. 6: unwritable file, `add a b` exits 2, file as it was | Child-process test with permissions, both the file case and the directory case | Row result per case: exit 2, stdout empty, stderr non-empty, bytes equal |

Rows by story (section 9): story 1 owns the rows of REQ-01, REQ-02, REQ-05 and REQ-06, and the
usage-error rows of REQ-03 and REQ-04 (acc. 6 to 9 of each, decided by `usage.js`). None of them runs
`reset` or `remove` to its end: REQ-06 acc. 2 and 3 and those eight rows name `reset` and `remove` but
stop at `usage.js` with exit 2 before any command module is loaded. Story 2 owns the other rows of
REQ-03 and REQ-04 (acc. 1 to 5 and 10 to 13 of each) and may use `add` and `list` from story 1. This
is the eval plan's story table.

The four non-functional lines of the PRD (NFR-1 to NFR-4) have no criterion and so no row; the
conventions step (section 13) holds the form of the code and asserts no business outcome.

## 5. Security controls

tally has no identity, no secret and no network (PRD §3). Its inputs are the command line and the
contents of `tally.json`.

| Input | Validated | Missing | Malformed | Unauthorized (no permission) | Never logged or stored |
|---|---|---|---|---|---|
| Command (REQ-05) | Exactly one of `add`, `list`, `reset`, `remove`, case-sensitive | exit 2, message on stderr | unknown command: exit 2, message | not applicable | nothing is logged |
| Arguments of `add`, `reset`, `remove` (REQ-01, REQ-03, REQ-04, REQ-06) | Exactly one argument after the command, a valid name: non-empty, no whitespace (section 7). A name is data: it is never run, never used as a path, and a name such as `__proto__` is held in a `Map` so it is an ordinary counter | no name: exit 2, message on stderr, stdout empty, file unchanged | empty or whitespace name, or more than one argument: exit 2, message, stdout empty, file unchanged | not applicable | the message may repeat the person's own name; nothing else is echoed |
| Arguments of `list` (REQ-02, REQ-06) | No argument after the command | not applicable: `list` takes none | any argument, including an empty one (`list x`): exit 2, message on stderr, stdout empty, file unchanged | not applicable | the message may repeat the person's own argument; nothing else is echoed |
| `tally.json` contents (REQ-01 to REQ-04) | Parsed and checked against the layout of section 7 before any use | absent file is an empty set of counters | damaged: exit 1, message, file untouched | unreadable: exit 1, message, file untouched | messages never print the file's contents; they name the file and the cause |
| Writing `tally.json` (REQ-01, REQ-03, REQ-04) | Checked before and during the write (section 7) | not applicable | not applicable | unwritable: exit 1, message, file as it was | no temporary file is left behind after a failure; no counter values are written anywhere but `tally.json` |

All argument checks are made by `usage.js`, for all four commands, before any command module is loaded
and before the file is touched (REQ-06; section 7, "Order of work").

An unexpected internal error is not an input. It prints one `tally: …` line and exit 1, and never a
stack trace (the user, Q20, D5).

## 6. Configuration

None. There are no environment variables, flags or configuration files, so nothing is required at
start and nothing is read at import time. Fixed values: the file name is `tally.json`, in the
process's current directory; Node 22.x is declared in `app/package.json` as `"engines": {"node":
">=22 <23"}`, and the application runs on any Node 22 (Q21, E4); that is unchanged.

The acceptance suite is a separate matter and its runtime is fixed by the user (Decisions 2026-10-27,
G1): `eval/run.sh` runs every step (the Node-major check, the conventions step, and the
`node --test eval/tests/*.test.mjs` run) inside the container
`node@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d` (`node:22-bookworm-slim`;
Node 22.23.4 when proven), as the calling user's uid:gid and never root, with the repository mounted as
the working directory. Docker is required to run the suite. The major-version check of Q21, E4 stays,
as a guard inside the container: `eval/run.sh` reads the major version of the `node` it runs there and
refuses, with a message and a non-zero exit before any test or check starts, if the major is not 22.
These are properties of the suite, not settings of tally: tally still has no configuration.

## 7. Data

One store: the file `tally.json` in the current directory. Nothing else is stored.

**Layout (recorded default; R2-02).** A JSON object whose keys are counter names and whose values
are counter values, for example `{"coffee": 3, "tea": 2}`. An empty object is valid and means no
counters. The spacing of the written JSON and the order of keys carry no meaning; the PRD decides
neither and no register row depends on them.

**What counts as damaged.** PRD §4 "Damaged tally.json" ("not valid JSON, or valid JSON that does not
hold named counters each with a whole-number value") covers the first four items below. A stored
negative value is damaged by the user's decision (Q21, E2); the byte-order mark and the upper bound are
the user's decision (Q20, D1c). The file exists, and any of these holds:

- it is not valid JSON, including an empty file, or (the user, Q20, D1c) a file that starts with a
  byte-order mark;
- the top-level value is not an object (an array, `null`, a string, a number or a boolean);
- a key is not a valid name: it is empty or contains whitespace;
- a value is not a whole number: a fraction such as 1.5, a string, `null`, a boolean, an object or an
  array;
- a value is a negative number (the user, Q21, E2);
- a value is above 9007199254740991 (`Number.MAX_SAFE_INTEGER`) (the user, Q20, D1c).

A key written twice is read with the last value, as JSON parsing does, and is not damaged (the user,
Q20, D1c). Any stored counter is read and kept as typed: names keep their case (Q12). A value spelled
`1.0` or `1e2` is read by JSON parsing as the whole number 1 or 100 and is not damaged (the user, Q21,
E6). The check that decides all this lives in `store.js`, which calls `names.js` for the name rule
(section 2).

**Valid name.** Non-empty, with no character that has the Unicode `White_Space` property (regular
expression `\p{White_Space}` with the `u` flag): space, tab, line feed, carriage return, vertical
tab, form feed, U+0085, U+00A0, U+1680, U+2000 to U+200A, U+2028, U+2029, U+202F, U+205F and U+3000.
This is the whitespace set PRD §4 defers here, decided by the user (Q20, D1a).

**Order.** `list` sorts names by Unicode code point, comparing code points and not UTF-16 code
units, so characters outside the Basic Multilingual Plane sort after those inside it, as their
Unicode values say. This is what PRD §4 "Sorted by name" states ("by Unicode value"). Uniqueness of a
name is by exact string equality: a JSON object cannot hold a key twice, and the checked counters are
held in a `Map`.

**Reading.** A missing file (`ENOENT`) is an empty set of counters and is never created by reading.
Any other failure to read, or to parse, as above, is a failure and writes nothing.

**Writing (recorded default).** Every write goes to a temporary file in the same directory
(`.tally.json.<process id>.<random>.tmp`, created with exclusive create), which is given the
existing file's permission mode if there is one (the user, Q20, D1d) and then renamed over
`tally.json`. Because a rename ignores the target file's own permissions, the store first checks, for
an existing file, that the process may write it (`fs.accessSync` with `W_OK`; PRD §4 "Unwritable
tally.json") and fails if not. A directory that does not allow writing makes creating the temporary
file fail, which is why Q17 is a failure. Any failure removes the temporary file and leaves
`tally.json` as it was, or absent. The write is not flushed to disk (no `fsync`): a power cut
mid-write may lose the last change but never damages the file (the user, Q20, D4).

**Symbolic link (known limitation).** If `tally.json` is a symbolic link, the rename replaces the link
with a regular file on the first write; the file the link pointed to is not changed. This is a known
limitation, with no new behaviour and no row (the user, Q20, D6). It is listed in section 11 (L1).

**Output.** `list` builds its whole output as one string after reading and checking, then writes it
to stdout once; `add`, `reset` and `remove` write nothing to stdout. Messages go to stderr as one line
beginning `tally: `, wording the builder's (the user, Q20, D1b). Exit status: 0 success; 2 a usage
error (PRD §4 "Usage error"); 1 a command that could not be carried out (PRD §4 "Could not be carried
out"). An unexpected internal error also exits 1, with one `tally: …` line on stderr, stdout empty and
no stack trace (the user, Q20, D5).

**Order of work (REQ-06).** 1. Parse and validate the command line (`usage.js`); on error stop with
exit 2 before anything touches the file system. 2. Load the module of the accepted command
(`app/src/commands/<command>.js`). 3. Read the file (`store.js`). 4. Apply the rule (the command
module's `run`); on a missing counter stop with exit 1. 5. If the module's `writes` is true (`add`,
`reset`, `remove`), write; `list` prints and never calls the write path.

**Between story 1 and story 2.** Until story 2 is merged, `app/src/commands/reset.js` and
`app/src/commands/remove.js` do not exist. A valid `tally reset coffee` (or `tally remove coffee`)
passes step 1, and step 2 fails because the import cannot find the module
(`ERR_MODULE_NOT_FOUND`). The boundary has no special case for it: it is an unexpected internal error
and takes the rule of D5: exit 1, stdout empty, one `tally: …` line on stderr, no stack trace. Step 3
is never reached, so `tally.json` is unchanged, or still absent. This is not the PRD's exit 1 "could
not be carried out", and it ends when story 2 lands. Usage errors for these commands (`tally reset`,
`tally remove "a b"`) still exit 2 in this state, as step 1 precedes step 2. No story 1 row depends on
the missing modules (section 4, rows by story).

## 8. Concurrency

The one shared object is `tally.json`, and two tally commands in the same directory can act on it at
the same moment. The design does this: each command reads the file, changes it in memory and
replaces it by renaming a temporary file (section 7). A reader therefore never sees a half-written
file and the file is never left damaged, but there is no lock, so when two writers overlap, the later
rename wins and the other update is lost. Temporary file names include the process id and a random
part so overlapping writers never share one. This is decided as a known limitation: no lock, the later
write wins and one update can be lost, the file is never left damaged; no guard, no criterion, no test
(the user, Decisions 2026-10-27, F1; open point O1, now closed). No row verifies concurrent behaviour,
and the PRD has no criterion for it.

## 9. Stories and integration

Shape only; the eval plan holds detail.

Two stories, the user's split (Q21, S1), run in order. The acceptance tests are `node:test` cases
driving the CLI as a child process (section 4).

- **Story 1, `add` and `list`**: REQ-01, REQ-02, REQ-05, REQ-06, and the usage-error rows of REQ-03
  and REQ-04 (acc. 6 to 9 of each), which `usage.js` decides. Owns `app/package.json`,
  `app/bin/tally.js`, `app/src/usage.js`, `app/src/store.js`, `app/src/names.js`, `app/src/errors.js`,
  `app/src/commands/add.js`, `app/src/commands/list.js`, and may use `app/test/`, with test files
  named for the parts it owns (`add.test.js`, `list.test.js`, `usage.test.js`, `store.test.js`).
- **Story 2, `reset` and `remove`**: REQ-03 and REQ-04 as placed in section 3, and the rows of both
  except their usage-error rows (acc. 6 to 9), which are story 1's. Owns only `app/src/commands/reset.js` and
  `app/src/commands/remove.js`, and its own tests under `app/test/`, named `reset*.test.js` and
  `remove*.test.js` so they do not collide with story 1's. It edits none of story 1's files: the
  entry point loads a command's module when the command is valid (section 2), `usage.js` already
  validates all four commands, and `store.js`, `names.js` and `errors.js` are complete in story 1.
- **Order and disjointness**: story 1 first, then story 2. The file scopes share no file. No story 1
  row depends on a file story 2 creates: the only story 1 row that mentioned `reset` (REQ-02 acc. 3)
  starts from a file holding `coffee` at 0 (section 4), and the usage rows that name `reset` and
  `remove` stop in `usage.js`. Story 2's rows use story 1's `add` and `list`, which exist by then.
- **State between the stories**: `tally reset coffee` and `tally remove coffee` fail with exit 1 and
  one `tally: …` line because the module is absent (section 7, "Between story 1 and story 2"); the eval
  plan takes each story 2 row's "expected state before the build" from that fact. The same holds for
  the usage rows of REQ-03 and REQ-04, which already pass after story 1, because `usage.js` decides
  them.
- **Protected**: neither story owns anything under `eval/`, `docs/` or `.github/`, and neither
  touches the root `package.json` (protected paths). tally's own `package.json` is `app/package.json`.
- **Integration**: the acceptance tests run `app/bin/tally.js`; there is no other integration point.

## 10. Decisions

| Decision | Decided by |
|---|---|
| Node.js, no dependencies, `tally.json` in the current directory, no web, database or server | the user (Q1) |
| Conventions step is Node only, no installed tools; the step checks that files parse, that `package.json` declares no dependencies, that only built-in modules are imported, and the line limit. ESLint, Prettier and a type checker are declined because this "keeps tally and its tests free of third-party code (Q1)" | the user (Q19); the reason, the user (Decisions 2026-10-27, F4) |
| The acceptance tests run as `node --test eval/tests/*.test.mjs` (a shell glob); the log is `eval/report/eval.log`, never committed; `eval/run.sh` runs every step, logs every result and exits non-zero if any step failed | the user (Decisions 2026-10-27, F6 C, B, E) |
| The application runs on Node 22.x (`engines`); `eval/run.sh` refuses to run the suite on another major version, now as a guard inside the container | the user (Q21, E4) |
| G1: `eval/run.sh` runs every step (Node-major check, conventions step, `node --test eval/tests/*.test.mjs`) inside the container `node@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d` (`node:22-bookworm-slim`), as the calling user's uid:gid (never root), with the repository mounted as the working directory; Docker is required to run the suite. Proven on 2026-10-27: non-root uid, `chmod 000` read refused, bind-mount read and write work. The tool's "pinned version" is the image digest | the user (Decisions 2026-10-27, G1) |
| Two stories: story 1 `add` and `list`, story 2 `reset` and `remove`; each command in its own module under `app/src/commands/`; story 1 owns everything shared, including `usage.js` for all four commands; the entry point loads the module of a valid command; the absent module between the stories is an unexpected internal error (exit 1, D5), with no special case | the user (Q21, S1); the absent-module outcome follows from D5 (Q20) |
| One entry point and small plain-function modules, no classes | recorded default |
| `tally.json` is a JSON object mapping name to whole number | recorded default |
| Every write via a temporary file in the same directory, renamed into place | recorded default |
| Acceptance tests run `tally` as a child process with `node:test`, no dependencies; they live in `eval/tests/` | recorded default; the folder is a detail of it |
| Damaged: not valid JSON, non-object top level, empty or whitespace-containing stored name, non-whole or non-number value | PRD §4 "Counter" ("whole-number value", "valid name") and "Damaged tally.json" |
| A stored negative value is damaged | the user (Q21, E2) |
| A stored value spelled `1.0` or `1e2` is read as 1 or 100 and is not damaged | the user (Q21, E6) |
| Damaged also covers a leading byte-order mark and values above 9007199254740991; a duplicate key is read last-wins and is not damaged | the user (Q20, D1c) |
| Whitespace is the Unicode `White_Space` set | the user (Q20, D1a) |
| Messages: one line starting `tally: `, wording left to the builder | the user (Q20, D1b) |
| A write keeps the existing file's permission mode | the user (Q20, D1d) |
| Style: two-space indent, semicolons, double quotes | the user (Q20, D1e) |
| No format-version field in `tally.json` | the user (Q20, D1f; D4) |
| Sort by code point, not UTF-16 code unit | PRD §4 "Sorted by name" ("by Unicode value") |
| Usage is checked, and exit 2 reported, before the file is read or written | PRD REQ-06 |
| Exit 0 success, 2 usage error, 1 could not be carried out; failures print nothing on stdout, a line on stderr, and leave the file as it was | PRD §4 "Usage error", "Could not be carried out", "Failure" |
| An unexpected internal error exits 1 with one `tally: …` line on stderr, no stack trace | the user (Q20, D5) |
| An existing file is checked for write permission before the rename, because rename ignores it | PRD §4 "Unwritable tally.json" (file does not allow writing) |
| A symlinked `tally.json` is replaced by a regular file on the first write: known limitation, no new behaviour | the user (Q20, D6) |
| Limits: file at most 300 lines, checked by `check.mjs`; function at most 50 lines and cyclomatic complexity at most 10, held by the fresh reader | the user (Q20, D2) |
| `check.mjs` also checks that only `app/src/store.js` imports the file system, that every module imports only as section 2 allows, and that `process.env` appears nowhere under `app/` | the user (Q20, D3) |
| `check.mjs` also refuses an empty `catch` block under `app/`; the rest of the errors rule stays with the fresh reader | the user (Q21, E1) |
| `app/test/` is exempt from the file-system and layer-order check (D3a) only; every other check applies to it | the user (Q21, E5) |
| Accepted below the PRACTICES recommendation: no logs, no lockfile or audit, no `fsync`, no schema version (no lock: see the Concurrency row) | the user (Q20, D4) |
| Concurrency: atomic rename, no lock, a concurrent update can be lost: known limitation, no guard, no criterion, no test | the user (Decisions 2026-10-27, F1); described in section 8 |
| `app/package.json` declares `bin`, mapping the command `tally` to `app/bin/tally.js` | PRD §3 (the person runs `tally add <name>`, `tally list`, `tally reset <name>`, `tally remove <name>`) |
| Overflow of `add` at 9007199254740991: known limitation, no new behaviour, no criterion (section 11, L2) | the user (Decisions 2026-10-27, F2) |
| P1 (a non-root POSIX grading environment) is a precondition of the suite; the orchestrator verifies it at gate 7 against the grading runner. Inside the G1 container the grader is the calling non-root user, so P1 holds wherever the calling user is not root | the user (Decisions 2026-10-27, F3; G1) |

## 11. Open points

| # | Open point | Blocks |
|---|---|---|
| P1 | The permission rows (REQ-01 acc. 11 to 13, REQ-02 acc. 6, 7 and 10, REQ-03 acc. 11 to 13, REQ-04 acc. 11 to 13, REQ-06 acc. 5 and 6: 14 rows) need a build and gate environment where `chmod` is honoured: not run as root (root reads and writes regardless of permission), on a file system that enforces POSIX modes, on a non-Windows platform. REQ-02 acc. 6 is in the list because its read-only fixtures are made with `chmod` too. The user has accepted this as a precondition of the suite (Decisions 2026-10-27, F3). The orchestrator verifies it at gate 7 against the grading runner. If it is unmet, those tests fail with "P1 not met" and none passes; the tests detect this and fail with a named message rather than pass vacuously. Under G1 (the user, Decisions 2026-10-27) the suite runs inside the pinned Node 22 container as the calling user's uid:gid, never root, so the grader is that non-root user and P1 holds wherever the calling user is not root. Lab proof recorded in G1, 2026-10-27: non-root uid, `chmod 000` read refused, bind-mount read and write work. The calling user being non-root (the gate runner's own user) remains what gate 7 verifies. | the 14 permission rows (listed above) cannot be shown satisfiable until gate 7 verifies it |
| P6 | G1 makes Docker a requirement of running the suite. The inputs do not say whether the build environment and the gate runner have Docker, or can pull the image by digest. | the suite cannot be run by the build side or the gate until it is confirmed |
Closed in revision 3: P4 (scope of the frozen checks over `app/test/`), by the user (Q21, E5), section
13; P5 (`1.0` and `1e2`), by the user (Q21, E6), section 7. The identifiers P4 and P5 are not reused.
Closed in revision 5: O1 (concurrent commands), by the user (Decisions 2026-10-27, F1), section 8:
known limitation, no lock; P2 (overflow of `add`), by the user (Decisions 2026-10-27, F2), now L2
below. The identifiers O1 and P2 are not reused.
Closed in revision 6: P3 (the content of `eval/conventions/forbidden-in-app.txt`, PRACTICES section C
rule 8), by the eval plan revision 4 section 7, which supplies the content, and by the user
(Decisions 2026-10-27, F6(A)); the report path and the runner command were already fixed by the user
(F6 B, C). `node:test` is not listed in the file, because the builder's own tests may use it. The
identifier P3 is not reused.

**Known limitations** (decided, not open):

| # | Limitation | Decided by |
|---|---|---|
| L1 | A symlinked `tally.json` is replaced by a regular file on the first write; the link's target is not changed. No new behaviour, no new row. | the user (Q20, D6) |
| L2 | `add` on a counter already at 9007199254740991 has no new behaviour and no criterion. If it is reached, the value written is one the next read treats as damaged (section 7), so later commands refuse with exit 1 until the file is fixed by hand; no data is removed. | the user (Decisions 2026-10-27, F2) |

The recorded defaults of section 10 (the four named at the top) are open to the user's override at
review; an override of the file layout or the write method would change sections 7 and 4 only.

## 12. Production-readiness review

**Security**

- Identity and authorization: excluded by the user (Q1; PRD §3: no sign-in, one role). Returns if a second person or role is added.
- Input validation: in scope, at the boundary and on read (sections 5 and 7); required by PRD REQ-01 to REQ-06 and PRD §4 "Usage error" and "Damaged tally.json".
- Secrets: none exist; excluded by the user (Q21, E3). Returns if tally ever reads a credential.
- Dependencies: none; the user (Q1, NFR-2). No lockfile and no audit: the user (Q20, D4), because there are no dependencies; audit tooling also declined by the user (Q19). Returns if a dependency is ever allowed.
- Transport: excluded by the user (Q1: no server). Returns with any network feature.
- Cross-origin access and security headers: excluded by the user (Q1: no web). Returns with any web interface.
- Containers: excluded for tally itself by the user (Q21, E3); tally ships as files run with `node`. Returns if it is ever packaged as an image. This does not touch the acceptance suite, which runs in a pinned Node 22 container by the user's decision (Decisions 2026-10-27, G1; section 6).
- What is never logged or stored: in scope; the application-wide rule is section 5's last column (no file contents in messages, no stack trace (the user, Q20, D5), nothing stored but `tally.json`). The only data tally holds is the counters (PRD §2); the stack-trace rule is the user's (Q20, D5).

**Reliability**

- Start-up: in scope: no configuration (section 6), nothing read at import time; the entry point runs one function when started. Nothing to fail fast on, since there is no setting. Decided by PRD §1 ("without setting anything up").
- Shutdown: excluded by the user (Q1: no server); the process runs one command and exits. An interrupt mid-write can leave a temporary file but never changes `tally.json`. Returns if tally ever runs as a long-lived process.
- Health: excluded by the user (Q1: no server). Returns with any server or platform that polls.
- Timeouts: excluded by the user (Q21, E3); tally makes no outbound call. Returns with any network call.
- Shared objects: section 8. No lock, below the PRACTICES recommendation: a known limitation, decided by the user (Decisions 2026-10-27, F1). Returns if the user decides to guard.
- Retries and idempotency: per PRD, a repeated `add` adds again (REQ-01), a repeated `reset` leaves 0 (REQ-03), and a repeated `remove` fails with exit 1 as the counter is gone (REQ-04); nothing is silently doubled by tally itself.
- Schema evolution: excluded; the layout carries no version field and there is no migration tool: the user (Q20, D1f and D4). Returns if the layout ever changes.
- Backups and retention: none; excluded because the PRD states no requirement (PRD §6: none invented), so no figure is given. Returns if the user states a retention or backup need. No `fsync`: a power cut mid-write may lose the last change but never damages the file: the user (Q20, D4); returns if the user wants durability across power loss.

**Observability**

- Logs: none; the stderr message on failure is the only output: the user (Q20, D4). Returns if tally ever runs unattended or as a service.
- Request identity: excluded by the user (Q1: no server, no requests). Returns with any server.
- Errors: in scope: failures are raised as the two kinds PRD §4 defines ("Usage error", "Could not be carried out"), defined in `errors.js` and mapped to a message and exit status once in `bin/tally.js`; an empty `catch` block under `app/` is refused by `check.mjs` (the user, Q21, E1). An unexpected internal error exits 1 with one `tally: …` line and no stack trace: the user (Q20, D5).
- Metrics and alerting: excluded by the user (Q1: no server). Returns with any service or platform that collects them.

**Delivery and data**

- Reproducible build: no build step and no lockfile because there are no dependencies; the user (Q20, D4). A lockfile returns with the first dependency. The acceptance suite's runtime is reproducible by the image digest `node@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d` (the user, Decisions 2026-10-27, G1).
- Configuration: none (section 6), so no example file; PRD §1 ("without setting anything up"). Returns with the first setting.
- Running locally: in scope: the person runs `tally <command>` (PRD §3), so `app/package.json` declares `bin` mapping `tally` to `app/bin/tally.js` (section 10). The person runs the application with their own Node 22; running the acceptance suite locally is `eval/run.sh`, which needs Docker and runs inside the pinned container as the calling user (the user, Decisions 2026-10-27, G1; section 6).
- Seed data: excluded by the user (Q21, E3); there is nothing to preload (PRD §3 has no users). Returns if a feature needs preloaded data.
- Invariants: in scope: the stored layout is checked by `store.js` on read (section 7); the command rules (a missing counter fails `reset` and `remove`) are held by `commands/reset.js` and `commands/remove.js`; there is no database (NFR-4), so no constraint can enforce them in a store. Decided by PRD §4 "Damaged tally.json" and "Could not be carried out".
- Time and identifiers: excluded by the user (Q21, E3); tally stores neither. Returns if a feature stores a time or an identifier.

**Beyond section A, for a command-line tool**

- Exit status and streams: in scope (section 7, PRD §4): 0, 1, 2 as defined; stdout only for `list`.
- File mode: the write keeps an existing file's permission mode (section 7); the user (Q20, D1d).
- Symbolic link as `tally.json`: replaced by a regular file on the first write; known limitation, the user (Q20, D6); section 11 L1. Returns as a behaviour if the user asks that links be followed.
- Platform: POSIX permissions are assumed by the acceptance tests (P1), which run as the calling non-root user inside the G1 container, and Docker is required to run the suite (section 6); the PRD states no platform requirement (PRD §6). Returns if the user states a platform.
- Interrupts: covered under Shutdown above; excluded as a long-lived-process concern by the user (Q1: no server).
- The client practices (browser bundle, screen-reader labels): not applicable; there is no browser client, decided by the user (Q1: no web).

## 13. Conventions

The tool for every check below is Node 22.x itself, run by `eval/conventions.sh`, with no installed
tool (the user, Q19). "Pinned version": the image digest
`node@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d` (`node:22-bookworm-slim`,
Node 22.23.4 when proven), inside which `eval/run.sh` runs every step as the calling user (the user,
Decisions 2026-10-27, G1; section 6). `app/package.json` still declares `"engines": {"node": ">=22
<23"}` for the application (Q21, E4), and E4's major check stays in `eval/run.sh` as a guard inside the
container: it refuses to run, before any test or check, when the major version of `node` is not 22. The one
frozen script is `eval/conventions/check.mjs`, invoked as `node eval/conventions/check.mjs app`; it
reads no file under `app/` for configuration, holds its limits as constants in its own source, and
reads `eval/conventions/forbidden-in-app.txt`. It makes these checks: files parse; `package.json`
declares no dependencies; only built-in modules and relative paths are imported (Q19); the
file-length limit (Q19, D2); the two import checks and the `process.env` check (the user, Q20, D3);
no empty `catch` block (the user, Q21, E1); forbidden references (PRACTICES section C rule 8).
`app/test/` is exempt from the import checks of D3(a) only (the user, Q21, E5); every other check
applies to it.
Where a practice has no tool, the row says "no tool — declined as a tool by the user (Q19); held by
the fresh reader", and the rule stands as a decision of the user, not a wish. The reason for declining
ESLint, Prettier and a type checker is that this "keeps tally and its tests free of third-party code
(Q1)" (the user, Decisions 2026-10-27, F4).

**Layout**

```
app/                 application code only; no tests of the acceptance suite, no docs
  package.json       name, "type": "module", "bin", "engines"; no dependency fields of any kind
  bin/               the entry point only (boundary: argv, order of steps, exit status, stderr, stdout)
  src/               the parts and the domain, one concern per file:
                       usage.js (argv to command; arguments of all four commands),
                       store.js (the only file that touches the file system),
                       names.js (valid name, order), errors.js (the two failure kinds);
                       nothing else, no "utils"
    commands/        one module per command, the rule only, no file access: add.js, list.js
                       (story 1), reset.js, remove.js (story 2)
  test/              the builder's own tests, optional; run by the builder, never by the gate;
                       story 1 and story 2 name their files apart (section 9)
eval/                frozen; not the builder's to change
  run.sh             the one command that runs the acceptance tests and the conventions step and
                       writes the eval log (the same command locally and in the gate); runs every
                       step inside the container node@sha256:de170b39...122f38d (node:22-bookworm-slim)
                       as the calling user's uid:gid, never root, with the repository mounted as the
                       working directory; Docker is required (G1); first, inside the container,
                       refuses to run if the major version of node is not 22 (Q21, E4); runs the
                       tests as `node --test eval/tests/*.test.mjs` (a shell glob; F6 C); runs
                       every step, logs every result to `eval/report/eval.log`, never committed
                       (F6 B), and exits non-zero if any step failed (F6 E); F6 and G1 are the
                       user's, Decisions 2026-10-27
  conventions.sh     runs the conventions step: Node 22.x (inside the G1 container, started by run.sh)
                       on eval/conventions/check.mjs against app/
  conventions/       check.mjs and forbidden-in-app.txt; the only configuration the step reads
  tests/             the acceptance tests: node:test cases that run app/bin/tally.js as child
                       processes (a detail of the recorded default); nothing of app/ is imported
  stories/           <n>.txt scope file and <n>.md brief per story (two stories, section 9)
docs/                PRD, blueprint, eval plan; not the builder's to change
.github/             the pull-request gate; a protected path, not the builder's to change (section 9)
```

**Limits.** A file under `app/` is at most 300 lines, checked by `check.mjs` (constant `MAX_LINES =
300`). A function is at most 50 lines and has cyclomatic complexity at most 10, held by the fresh
reader. The limits are the user's (Q20, D2). The linter rules that would count them (ESLint
`max-lines`, `max-lines-per-function`, `complexity`) are not used, because the user declined
ESLint (Q19), which "keeps tally and its tests free of third-party code (Q1)" (the user, Decisions
2026-10-27, F4).

| Practice | Tool, version, file | Rule |
|---|---|---|
| Layering | `eval/conventions/check.mjs` on Node 22.x in the G1 image (digest in the intro of this section); constants in its own source, import map = the "May import" column of section 2 | Only `app/src/store.js` imports `node:fs`, `fs`, `node:fs/promises` or `fs/promises`; every module under `app/` imports only as section 2 allows: `bin/tally.js` (layers 2 and 3, and the dynamic `import()` of a specifier beginning `../src/commands/`, which the check reads as an import of layer 2); `usage.js`, `store.js` and each file under `src/commands/` (layer 3 only, so a command module imports `../names.js` and `../errors.js` and never `usage.js`, `store.js` or another command); `names.js` and `errors.js` (nothing in `app/`). A command module never performs file access; `store.js` reads, checks the stored layout and writes, and applies no command rule. The user (Q20, D3a). `app/test/` is exempt from this check only (the user, Q21, E5). |
| Layout | `check.mjs` (file length, 300); the fresh reader for the rest | The tree above; a module holds one concern; no classes; files are at most 300 lines (the user, Q20, D2). Function length and complexity: no tool — declined as a tool by the user (Q19); held by the fresh reader (at most 50 lines, complexity at most 10; Q20, D2). |
| Errors | `eval/conventions/check.mjs` on Node 22.x in the G1 image, no configuration file (constants in its own source), for the empty `catch`; the rest held by the fresh reader | `check.mjs` refuses an empty `catch` block under `app/` (the user, Q21, E1). The fresh reader holds the rest: failures are thrown as `UsageError` (exit 2) or `CouldNotBeCarriedOut` (exit 1) from `errors.js` and mapped once in `bin/tally.js`; an unexpected error, including a command module that cannot be loaded (section 7), becomes one `tally: …` line, exit 1, no stack trace (Q20, D5); no error turned into a default value except a missing file read as no counters (section 7). |
| Logging | not applicable: tally has no logger (no logs: the user, Q20, D4) | The only output is the stderr message and the `list` lines; nothing from section 5's "never" column. |
| Configuration | `eval/conventions/check.mjs` on Node 22.x in the G1 image; no configuration file | No `process.env` anywhere under `app/` (the user, Q20, D3b); no settings; nothing reads the environment. |
| Runtime version | `eval/run.sh` (the container invocation and the check are in the script; no configuration file); pinned version = the image `node@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d` (`node:22-bookworm-slim`) | `eval/run.sh` runs every step in that image as the calling user's uid:gid, never root, repository mounted (the user, Decisions 2026-10-27, G1); inside it, it still refuses to run, before any test or check, if the major version of `node` is not 22 (the user, Q21, E4, now a guard); `app/package.json` `engines` states the application's range. |
| Dependencies | `eval/conventions/check.mjs` on Node 22.x in the G1 image | `app/package.json` declares no `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies` or `bundledDependencies` (absent or empty); every import is a `node:` built-in or a relative path inside `app/`. |
| Parsing | `node --check` run by `check.mjs` on every `.js` and `.mjs` file under `app/`; `JSON.parse` on every `.json` | Every file under `app/` parses. |
| Types | no tool — declined as a tool by the user (Q19), because it "keeps tally and its tests free of third-party code (Q1)" (Decisions 2026-10-27, F4); held by the fresh reader | No type checker; the code is plain JavaScript with no suppression comments. |
| Formatting and lint | no tool (ESLint and Prettier) — declined as a tool by the user (Q19), because it "keeps tally and its tests free of third-party code (Q1)" (Decisions 2026-10-27, F4); held by the fresh reader | Two-space indent, semicolons, double quotes (the user, Q20, D1e). |
| Secret scan, dependency audit, container lint | none; declined by the user (Q19), and moot: no dependencies, no secrets, no container | Not run. |
| Forbidden references | `check.mjs` and `eval/conventions/forbidden-in-app.txt` | No file under `app/` matches a pattern of the list (PRACTICES section C rule 8; contents per the eval plan revision 4 section 7; P3 of section 11 is closed). |
| The builder's own tests | `node --test` by the builder; `check.mjs` still applies to these files, except the layering check (the user, Q21, E5) | Allowed under `app/test/`; never run by the gate and never a reason a row may be skipped; story 1 and story 2 name their test files apart (section 9). |
| Naming | no tool — declined as a tool by the user (Q19); held by the fresh reader | Files and functions use the PRD's words (counter, name, value, list, reset, remove, usage); no `helpers` or `utils`. |
| Comments | no tool — declined as a tool by the user (Q19); held by the fresh reader | Say why, never what; no commented-out code; no `TODO` in a finished story. |
| Commits | no tool — declined as a tool by the user (Q19); held by the fresh reader | One story per branch; messages say what changed and why in plain English. |
| The client | not applicable | There is no browser client (Q1); declined. |

Every builder is bound to this section through its brief and preamble; the fresh reader is handed
it with each diff. A convention believed wrong goes in the handoff note, named.
