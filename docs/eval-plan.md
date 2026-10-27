# Eval plan and stories: tally

**Revision 5.** Narrow revision of revision 4, from Decisions 2026-10-27, G2 (gate-7 finding G7-02):
the rows are frozen in two packets. Changed: a line in the Commands section (8) stating the packets
and a new "Freeze packets" subsection in section 9. No requirement, criterion, register row, test row,
count, owner, state before the build or story is changed: still 76 tests, 52 in story 1 and 24 in
story 2.

**Revision 4.** Narrow revision of revision 3, from Decisions 2026-10-27, G1 (gate-7 finding G7-01):
the suite runs inside the Node 22 container pinned by digest, as the calling user. Changed: the
Commands section (8), what the suite needs present, the environment for the permission rows (section
3) and the conventions step's runtime (section 6); the reference to the blueprint (`docs/TECH-SPEC.md`)
now names revision 7. No requirement, criterion, register row, test row, count, owner, state before the
build or story is changed: still 76 tests.

**Revision 3.** Narrow revision of revision 2, from review finding G6R2-001 (gate-6 review, round 2):
the references to the upstream documents now name `docs/PRD.md` revision 4, `docs/MOCKUP.md`
revision 4 and `docs/TECH-SPEC.md` revision 6, and blueprint open point P3 is stated as closed by
section 7 of this plan. None of those revisions changed a requirement, a criterion, a register row or
a story's file ownership. No test row, count or story is changed: still 76 tests.

**Revision 2.** Narrow revision of revision 1, from the user's decisions of 2026-10-27 (cited as
"Decisions 2026-10-27, F<n>") and the advisories R6-007, R6-008, R6-010 (gate-6 review) and G5-01
(gate-5 findings). Changed: ownership of T-REQ-03-N4 to N7 and T-REQ-04-N4 to N7 moved to story 1
(R6-007); the State before the build of T-REQ-03-N14 and T-REQ-04-N14 (G5-01); the trace of the 15
tests with no single acceptance bullet (F5, R6-010); former open questions Q-A to Q-E replaced by
their decided values (F6, R6-008); O1, P2 and P1 recorded as decided (F1, F2, F3). No requirement ID
is created or changed, and no test is added or removed: still 76 tests.

Built from `docs/PRD.md` revision 4 (REQ-01 to REQ-06, 60 acceptance criteria), `docs/TECH-SPEC.md`
revision 7 (verification register of 60 rows, sections 7, 9, 11 and 13) and `docs/MOCKUP.md`
revision 4 (journeys). It creates no requirement ID. Criteria are cited as "acc. k", the k-th bullet
under a requirement's Acceptance, counted as in the PRD, the register and the mockup.

## 1. How the tests observe tally

Every test is a `node:test` case that creates a fresh temporary directory, writes a starting state
(or none), runs `node app/bin/tally.js <args>` as a child process (no shell, arguments passed as an
array) with a directory inside it as the current directory, and asserts what the person would see:
exit status, stdout, stderr, and the directory's contents. The tests import only Node built-ins
(`node:test`, `node:assert`, `node:fs`, `node:os`, `node:path`, `node:child_process`) and nothing from
`app/`. **Every row observes the application from outside its process, so coverage rule 5 is met by
construction**: no row is an in-process row, and no criterion rests on one.

The only application path a test names is the entry command `app/bin/tally.js`. No test names a
module, a function, a message wording, or the layout of `tally.json` in a Then. Setup alone writes
`tally.json` in the layout of TECH-SPEC section 7 (the starting state has to be written somehow);
counters are read back through `tally list`, and "unchanged" is a comparison of bytes, never a parse.

Vocabulary used in the table:

- **Fixture "holding X"**: `tally.json` written before the run with those counters. "No file": none.
- **Silent**: stdout and stderr are both empty.
- **Refusal**: stdout is empty and stderr holds at least one non-whitespace character. Wording is
  never asserted (the PRD decides none).
- **Unchanged**: the bytes of `tally.json` equal the bytes before the run, or it is still absent if it
  was absent. For the permission states the mode is also equal, compared before permissions are
  restored and the bytes after.
- **Readback**: after the run, `tally list` is run in the same directory and its stdout is compared.
- **Dir listing**: the names in the working directory; the **parent listing** is the names in the
  temporary directory that contains the working directory.

## 2. The trap, and how every row designs it out

Before the build `app/bin/tally.js` does not exist, and `node` itself exits 1 with text on stderr and
nothing on stdout. Between story 1 and story 2, `tally reset coffee` and `tally remove coffee` exit 1
with one `tally: ...` line because their modules are absent (TECH-SPEC section 7). A row whose
expected outcome is "exit 1, stderr non-empty, stdout empty, file unchanged" would therefore pass
when the feature does not exist. Two rules close this.

**Rule G (guard).** Every row whose expected exit status is 1, and every restraint row (whose "nothing
happened" outcomes also hold for a missing program), first runs the command under test **successfully
in a separate, clean directory** and requires exit 0. If it does not, the test fails with the message
`GUARD <command> not implemented (exit <n>)` before it asserts anything about the failure. The
guard is the same command word as the test's, so it cannot be satisfied by another command:

| Guard | Used by | Clean-directory run it requires |
|---|---|---|
| G add | story 1 rows on `add` | no file; `add probe` exits 0 and readback is exactly `probe 1` |
| G list | story 1 rows on `list` | file holding `probe` 1; `list` exits 0 and stdout is exactly `probe 1` and a line feed |
| G reset | story 2 rows on `reset` | file holding `probe` 1; `reset probe` exits 0, then readback is exactly `probe 0` |
| G remove | story 2 rows on `remove` | file holding `probe` 1; `remove probe` exits 0, then readback is empty |

**Rule X (exit 2 needs no guard).** A row that expects exit 2 cannot be satisfied by a missing
program, because `node` and a missing module both exit 1. These rows fail honestly before the build
without a guard. (After story 1 the exit-2 usage rows on `reset` and `remove`, T-REQ-03-N4 to N7 and
T-REQ-04-N4 to N7, are decided by `usage.js`; they are owned by story 1 and pass after it, recorded
in the table.)

**Rule R (restraint rows assert a positive).** A restraint row that only asserted "nothing else was
created" would pass over an empty scaffold. Each one requires the successful run (exit 0 and the
expected `tally.json` or output) before it asserts the absence, or applies Rule G or Rule X.

Rows cite these rules as `[G add]`, `[G list]`, `[G reset]`, `[G remove]`, `[X]`, `[R]`. A guarded row
runs the guard first and the scenario second. The "State before the build" of every row is stated
honestly: `fails:` with what it reports. For story 2 rows it is given both before any build and after
story 1 where they differ. For the eight story 1 usage rows on `reset` and `remove` it is `fails:`
before any build, and they pass after story 1.

## 3. The environment for the permission rows (TECH-SPEC P1)

Permission rows make their starting state with `fs.chmodSync`. They need a **non-root POSIX user, on a
file system that enforces POSIX modes, on a non-Windows platform**; root reads and writes regardless
of mode. This is recorded as a precondition of the commands in section 8, accepted by the user (Decisions
2026-10-27, F3) and verified by the orchestrator at gate 7 against the grading runner. Each permission test, before
anything else, **checks the operating system really refuses the access and otherwise fails with the
named message `P1 not met: <what was not refused>`; it never passes and is never skipped**:

- the process is not root (`process.getuid()` is not 0);
- for the unreadable state, opening the fixture for reading fails;
- for the read-only file state, opening the fixture for writing fails;
- for the read-only directory state, creating a scratch file in the directory fails (a scratch file
  that wrongly succeeds is removed).

Permissions are restored before the temporary directory is removed, also when the test fails. The
build orchestrator confirms at gate 7 that the grading environment is a non-root POSIX one (P1).

**P1 inside the container (Decisions 2026-10-27, G1).** The suite runs inside a container as the
calling user's uid:gid, never root (section 8). P1 is therefore met inside the container whenever the
calling user is not root. The lab proof recorded in G1, made on 2026-10-27: the process has a non-root
uid, a read of a `chmod 000` file is refused, and a bind-mounted repository can be read and written. If
the calling user is root, P1 is not met and the permission tests fail with "P1 not met".

Permission states used below:

| State | Made by |
|---|---|
| **U-read** (unreadable file) | file mode `0o000` |
| **U-file** (file does not allow writing, directory does) | file mode `0o444` |
| **U-dir** (existing, writable file in a directory that does not allow writing) | file mode `0o644` in a directory mode `0o555` |
| **U-dirabsent** (no file, directory does not allow writing) | no file in a directory mode `0o555` |

## 4. Damaged starting states

"Damaged" rows run once per state, each state a subtest of the one test. The states are those of
TECH-SPEC section 7 ("What counts as damaged"). D3, D9 and D10 are damaged by the user's decisions
(Q20 D1c, Q21 E2) rather than by the PRD's wording alone; the register lists them.

| State | Content of `tally.json` |
|---|---|
| D1 | text that is not JSON |
| D2 | an empty file |
| D3 | a byte-order mark followed by an otherwise valid object |
| D4 | a top-level array |
| D5 | the top-level value `null` |
| D6 | a counter whose value is a fraction (1.5) |
| D7 | a counter whose value is a string |
| D8 | a counter whose value is `null` |
| D9 | a counter whose value is negative |
| D10 | a counter whose value is 9007199254740992 |
| D11 | a counter whose name is empty |
| D12 | a counter whose name contains a space |
| D13 | a counter whose value is a boolean |
| D14 | a counter whose value is an object |

**D-short** is D1, D2 and D4. Rows that expect exit 2 use D-short: the point is that the file is not
consulted, not that every shape is refused.

## 5. The test table

Owner story and state before the build use these words: "node exit 1" means `node` exits 1 because
`app/bin/tally.js` is absent, with text on stderr and nothing on stdout. The guard text in a
"fails:" is the `GUARD ... not implemented (exit 1)` message.

### REQ-01: Add to a counter (story 1)

| ID | Given / When / Then | Kind | Owner story | State before the build |
|---|---|---|---|---|
| T-REQ-01-P1 | Given a file holding tea 2 and no `coffee`, when the person runs `add coffee`, then (acc. 1) it exits 0, is Silent, and Readback is exactly `coffee 1` and `tea 2`. | integration | 1 | fails: node exit 1, expected 0 |
| T-REQ-01-P2 | Given a file holding coffee 3, tea 2 and B 5, when the person runs `add coffee`, then (acc. 2) it exits 0, is Silent, and Readback is `B 5`, `coffee 4`, `tea 2` (every other counter as before). | integration | 1 | fails: node exit 1, expected 0 |
| T-REQ-01-P3 | Given no file in the directory, when the person runs `add coffee`, then (acc. 3) it exits 0, is Silent, `tally.json` now exists, and Readback is exactly `coffee 1`. | integration | 1 | fails: node exit 1, expected 0 |
| T-REQ-01-P4 | Given a file holding coffee 3, when the person runs `add Coffee`, then (acc. 4) it exits 0 and Readback is exactly `Coffee 1` and `coffee 3`. | integration | 1 | fails: node exit 1, expected 0 |
| T-REQ-01-P5 | Given a file holding no counter `-x`, when the person runs `add -x`, then (acc. 5) it exits 0 and Readback contains `-x 1`. | integration | 1 | fails: node exit 1, expected 0 |
| T-REQ-01-N1 | Given a file holding coffee 3, when the person runs `add` with no name, then (acc. 6) it exits 2, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 |
| T-REQ-01-N2 | Given a file holding coffee 3, when the person runs `add ""`, then (acc. 7) it exits 2, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 |
| T-REQ-01-N3 | Given a file holding coffee 3, when the person runs `add "a b"`, then (acc. 8) it exits 2, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 |
| T-REQ-01-N4 | Given a file holding coffee 3, when the person runs `add a b`, then (acc. 9) it exits 2, is a Refusal, the file is Unchanged, and Readback is exactly `coffee 3` (no counter `a` or `b` created or changed). [X] | integration | 1 | fails: node exit 1, expected 2 |
| T-REQ-01-N5 | Given a damaged file, for each of D1 to D14, when the person runs `add coffee`, then (acc. 10) it exits 1, is a Refusal, and the file is byte-for-byte Unchanged. [G add] | integration | 1 | fails: GUARD add not implemented (exit 1) |
| T-REQ-01-N6 | Given U-read holding coffee 3 (P1 check first), when the person runs `add coffee`, then (acc. 11) it exits 1, is a Refusal, and the file is Unchanged. [G add] | integration | 1 | fails: GUARD add not implemented (exit 1) |
| T-REQ-01-N7 | Given U-file holding coffee 3 (P1 check first), when the person runs `add coffee`, then (acc. 12, file case) it exits 1, is a Refusal, and the file is Unchanged. [G add] | integration | 1 | fails: GUARD add not implemented (exit 1) |
| T-REQ-01-N8 | Given U-dirabsent (P1 check first), when the person runs `add coffee`, then (acc. 12, absent-file case) it exits 1, is a Refusal, and `tally.json` is still absent. [G add] | integration | 1 | fails: GUARD add not implemented (exit 1) |
| T-REQ-01-N9 | Given U-dir holding coffee 3 (P1 check first), when the person runs `add coffee`, then (acc. 13) it exits 1, is a Refusal, and the file is Unchanged. [G add] | integration | 1 | fails: GUARD add not implemented (exit 1) |
| T-REQ-01-N10 | Given each of: no file; a file holding coffee 3; a damaged file (D1); a file with the usage error `add a b`; U-file; U-dir; U-dirabsent (P1 check first for the last three), when the person runs `add coffee` (or `add a b`), then nothing is stored but `tally.json`: after restoring permissions the Dir listing is only `tally.json` (or empty where there was and is no file), with no temporary or other file, after success and after failure alike. [R] [G add] | restraint | 1 | fails: GUARD add not implemented (exit 1) |
| T-REQ-01-N11 | Given a file holding coffee 3, when the person runs `add coffee` and, separately, `add coffee` against a damaged file (D1), with every network attempt of the child process recorded (connections, name lookups, datagram sockets, `fetch`), then both runs exit as expected (0 and 1) and **no network attempt was recorded**. [R] [G add] | restraint | 1 | fails: GUARD add not implemented (exit 1) |
| T-REQ-01-N12 | Given an empty working directory inside a fresh parent, for each name `../x`, `__proto__`, `constructor`, `a/b`, `$HOME` and `*`, when the person runs `add <name>`, then it exits 0, is Silent, Readback is exactly one line `<name> 1`, the Dir listing is only `tally.json`, and the parent listing is only the working directory (nothing outside `tally.json` changed); and with a file holding coffee 3, `add __proto__` leaves Readback exactly `__proto__ 1` and `coffee 3`. A name is data, never executed or used as a path. [R] | restraint | 1 | fails: node exit 1, expected 0 |
| T-REQ-01-N13 | Given each of: no file; a file holding other counters; the same name added three times in a row; `Coffee` beside `coffee`; `-x`, when the person runs `add`, then every successful run exits 0 with stdout and stderr both exactly empty (success of `add` writes nothing to either stream). [R] | restraint | 1 | fails: node exit 1, expected 0 |

### REQ-02: List the counters (story 1)

| ID | Given / When / Then | Kind | Owner story | State before the build |
|---|---|---|---|---|
| T-REQ-02-P1 | Given a file holding coffee 3, when the person runs `list`, then (acc. 1) it exits 0 and stdout is exactly the line `coffee 3` (name, one space, value) ending in a line feed. | integration | 1 | fails: node exit 1, expected 0 |
| T-REQ-02-P2 | Given a file holding b 2, a 1 and B 5, when the person runs `list`, then (acc. 2) stdout is exactly the three lines `B 5`, `a 1`, `b 2` in that order, it exits 0, and stderr is empty. | integration | 1 | fails: node exit 1, expected 0 |
| T-REQ-02-P3 | Given a file holding coffee 0 (the state a reset leaves; this row does not run `reset`), when the person runs `list`, then (acc. 3) it exits 0 and stdout is exactly `coffee 0`. | integration | 1 | fails: node exit 1, expected 0 |
| T-REQ-02-P4 | Given a file holding no counters, when the person runs `list`, then (acc. 4) it exits 0 and stdout is empty. | integration | 1 | fails: node exit 1, expected 0 |
| T-REQ-02-P5 | Given no file in the directory, when the person runs `list`, then (acc. 5) it exits 0, stdout is empty, and `tally.json` still does not exist. | integration | 1 | fails: node exit 1, expected 0 |
| T-REQ-02-P6 | Given each success fixture: a file with counters; a file with none; no file; U-file; U-dir (P1 check first for the last two), when the person runs `list`, then (acc. 6) it exits 0 and the file is Unchanged (or still absent). | integration | 1 | fails: node exit 1, expected 0 |
| T-REQ-02-P7 | Given U-file and, separately, U-dir, each holding b 2, a 1 and B 5 (P1 check first), when the person runs `list`, then (acc. 7) it exits 0, stdout is exactly `B 5`, `a 1`, `b 2` in that order, and the file is Unchanged. | integration | 1 | fails: node exit 1, expected 0 |
| T-REQ-02-N1 | Given a file holding coffee 3, when the person runs `list x`, then (acc. 8) it exits 2, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 |
| T-REQ-02-N2 | Given a damaged file, for each of D1 to D14, when the person runs `list`, then (acc. 9) it exits 1, is a Refusal, and the file is Unchanged. [G list] | integration | 1 | fails: GUARD list not implemented (exit 1) |
| T-REQ-02-N3 | Given U-read holding coffee 3 (P1 check first), when the person runs `list`, then (acc. 10) it exits 1, is a Refusal, and the file is Unchanged. [G list] | integration | 1 | fails: GUARD list not implemented (exit 1) |
| T-REQ-02-N4 | Given each of: a file with counters; a file with none; no file; U-file; U-dir (P1 check first for the last two), when the person runs `list`, then it exits 0 with the counters (or nothing) printed and the Dir listing is unchanged afterwards: no file created, no temporary file, nothing stored but what was there. [R] [G list] | restraint | 1 | fails: GUARD list not implemented (exit 1) |
| T-REQ-02-N5 | Given a file holding coffee 3, when the person runs `list`, and separately `list` against a damaged file (D1), with every network attempt of the child process recorded, then the runs exit 0 (printing `coffee 3`) and 1, and **no network attempt was recorded**. [R] [G list] | restraint | 1 | fails: GUARD list not implemented (exit 1) |

### REQ-03: Reset a counter to zero (story 2; N4 to N7 owned by story 1)

Story 2 rows use story 1's `list` for Readback and `add` for setup where noted, so they depend on
story 1 and on nothing later. For every row below the state is given before any build, and after story
1 where it differs. T-REQ-03-N4 to N7 keep their IDs and requirement (REQ-03 acc. 6 to 9); they are
owned by story 1 because `usage.js`, story 1's file, makes them green (Rule X, exit 2). They stop at
the usage check and run no `reset` module, so they depend on no story 2 file.

| ID | Given / When / Then | Kind | Owner story | State before the build |
|---|---|---|---|---|
| T-REQ-03-P1 | Given a file holding coffee 3 and tea 2, when the person runs `reset coffee`, then (acc. 1) it exits 0, is Silent, and Readback is exactly `coffee 0` and `tea 2`. | integration | 2 | fails: node exit 1, expected 0. After story 1: fails, exit 1 with a `tally: ...` line (reset module absent) |
| T-REQ-03-P2 | Given a file holding coffee 3 and tea 2, when the person runs `reset coffee` and then `list`, then (acc. 2) `list` exits 0 and its stdout includes the line `coffee 0`. | e2e | 2 | fails: node exit 1, expected 0. After story 1: fails at `reset`, exit 1 with a `tally: ...` line |
| T-REQ-03-N1 | Given a file holding tea 2 and no `coffee`, when the person runs `reset coffee`, then (acc. 3) it exits 1, is a Refusal, and the file is Unchanged. [G reset] | integration | 2 | fails: GUARD reset not implemented (exit 1). After story 1: same guard failure, exit 1 with a `tally: ...` line |
| T-REQ-03-N2 | Given no file, when the person runs `reset coffee`, then (acc. 4) it exits 1, is a Refusal, and `tally.json` still does not exist. [G reset] | integration | 2 | fails: GUARD reset not implemented (exit 1). After story 1: same guard failure |
| T-REQ-03-N3 | Given a file holding coffee 3, when the person runs `reset Coffee`, then (acc. 5) it exits 1, is a Refusal, the file is Unchanged, and Readback is exactly `coffee 3`. [G reset] | integration | 2 | fails: GUARD reset not implemented (exit 1). After story 1: same guard failure |
| T-REQ-03-N4 | Given a file holding coffee 3 and tea 2, when the person runs `reset` with no name, then (acc. 6) it exits 2, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 (before any build). Passes after story 1 (`usage.js`, story 1's, decides) |
| T-REQ-03-N5 | Given a file holding coffee 3 and tea 2, when the person runs `reset ""`, then (acc. 7) it exits 2, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 (before any build). Passes after story 1 |
| T-REQ-03-N6 | Given a file holding coffee 3 and tea 2, when the person runs `reset "a b"`, then (acc. 8) it exits 2, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 (before any build). Passes after story 1 |
| T-REQ-03-N7 | Given a file holding coffee 3 and tea 2, when the person runs `reset a b`, then (acc. 9) it exits 2, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 (before any build). Passes after story 1 |
| T-REQ-03-N8 | Given a damaged file, for each of D1 to D14, when the person runs `reset coffee`, then (acc. 10) it exits 1, is a Refusal, and the file is Unchanged. [G reset] | integration | 2 | fails: GUARD reset not implemented (exit 1). After story 1: same guard failure |
| T-REQ-03-N9 | Given U-read holding coffee 3 (P1 check first), when the person runs `reset coffee`, then (acc. 11) it exits 1, is a Refusal, and the file is Unchanged. [G reset] | integration | 2 | fails: GUARD reset not implemented (exit 1). After story 1: same guard failure |
| T-REQ-03-N10 | Given U-file holding coffee 3 (P1 check first), when the person runs `reset coffee`, then (acc. 12) it exits 1, is a Refusal, and the file is Unchanged. [G reset] | integration | 2 | fails: GUARD reset not implemented (exit 1). After story 1: same guard failure |
| T-REQ-03-N11 | Given U-dir holding coffee 3 (P1 check first), when the person runs `reset coffee`, then (acc. 13) it exits 1, is a Refusal, and the file is Unchanged. [G reset] | integration | 2 | fails: GUARD reset not implemented (exit 1). After story 1: same guard failure |
| T-REQ-03-N12 | Given each of: a file holding coffee 3 (success); no `coffee` (failure); a damaged file (D1); the usage error `reset a b`; U-file; U-dir (P1 check first for the last two), when the person runs `reset coffee`, then nothing is stored but `tally.json`: after restoring permissions the Dir listing is only the original `tally.json`, with no temporary or other file. [R] [G reset] | restraint | 2 | fails: GUARD reset not implemented (exit 1). After story 1: same guard failure |
| T-REQ-03-N13 | Given a file holding coffee 3, when the person runs `reset coffee` and, separately, `reset tea` (no such counter), with every network attempt of the child process recorded, then the runs exit 0 and 1 and **no network attempt was recorded**. [R] [G reset] | restraint | 2 | fails: GUARD reset not implemented (exit 1). After story 1: same guard failure |
| T-REQ-03-N14 | Given counters named `../x`, `__proto__`, `constructor` and `a/b` created with `add` (each at 1) beside coffee 3, when the person runs `reset <name>` for each, then each exits 0 and is Silent, Readback shows that counter at 0 and every other counter as before, the Dir listing is only `tally.json`, and the parent listing is only the working directory. And given a file holding only coffee 3, `reset __proto__`, `reset constructor` and `reset toString` each exit 1 (names that exist on plain objects are not counters), with the file Unchanged. A name is data. [R] [G reset] | restraint | 2 | fails: GUARD reset not implemented (exit 1), the guard message (Rule G), not the `add` setup, because the guard runs first on a fixture file. After story 1: same guard failure, exit 1 with a `tally: ...` line |

### REQ-04: Remove a counter (story 2; N4 to N7 owned by story 1)

T-REQ-04-N4 to N7 keep their IDs and requirement (REQ-04 acc. 6 to 9); they are owned by story 1
because `usage.js` makes them green. They stop at the usage check and run no `remove` module, so they
depend on no story 2 file.

| ID | Given / When / Then | Kind | Owner story | State before the build |
|---|---|---|---|---|
| T-REQ-04-P1 | Given a file holding coffee 3 and tea 2, when the person runs `remove coffee`, then (acc. 1) it exits 0, is Silent, and Readback is exactly `tea 2`. | integration | 2 | fails: node exit 1, expected 0. After story 1: fails, exit 1 with a `tally: ...` line (remove module absent) |
| T-REQ-04-P2 | Given a file holding coffee 3 and tea 2, when the person runs `remove coffee` and then `list`, then (acc. 2) `list` exits 0 and its stdout has no line for `coffee`. | e2e | 2 | fails: node exit 1, expected 0. After story 1: fails at `remove`, exit 1 with a `tally: ...` line |
| T-REQ-04-N1 | Given a file holding tea 2 and no `coffee`, when the person runs `remove coffee`, then (acc. 3) it exits 1, is a Refusal, and the file is Unchanged. [G remove] | integration | 2 | fails: GUARD remove not implemented (exit 1). After story 1: same guard failure, exit 1 with a `tally: ...` line |
| T-REQ-04-N2 | Given no file, when the person runs `remove coffee`, then (acc. 4) it exits 1, is a Refusal, and `tally.json` still does not exist. [G remove] | integration | 2 | fails: GUARD remove not implemented (exit 1). After story 1: same guard failure |
| T-REQ-04-N3 | Given a file holding coffee 3, when the person runs `remove Coffee`, then (acc. 5) it exits 1, is a Refusal, the file is Unchanged, and Readback is exactly `coffee 3`. [G remove] | integration | 2 | fails: GUARD remove not implemented (exit 1). After story 1: same guard failure |
| T-REQ-04-N4 | Given a file holding coffee 3 and tea 2, when the person runs `remove` with no name, then (acc. 6) it exits 2, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 (before any build). Passes after story 1 (`usage.js`, story 1's, decides) |
| T-REQ-04-N5 | Given a file holding coffee 3 and tea 2, when the person runs `remove ""`, then (acc. 7) it exits 2, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 (before any build). Passes after story 1 |
| T-REQ-04-N6 | Given a file holding coffee 3 and tea 2, when the person runs `remove "a b"`, then (acc. 8) it exits 2, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 (before any build). Passes after story 1 |
| T-REQ-04-N7 | Given a file holding coffee 3 and tea 2, when the person runs `remove a b`, then (acc. 9) it exits 2, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 (before any build). Passes after story 1 |
| T-REQ-04-N8 | Given a damaged file, for each of D1 to D14, when the person runs `remove coffee`, then (acc. 10) it exits 1, is a Refusal, and the file is Unchanged. [G remove] | integration | 2 | fails: GUARD remove not implemented (exit 1). After story 1: same guard failure |
| T-REQ-04-N9 | Given U-read holding coffee 3 (P1 check first), when the person runs `remove coffee`, then (acc. 11) it exits 1, is a Refusal, and the file is Unchanged. [G remove] | integration | 2 | fails: GUARD remove not implemented (exit 1). After story 1: same guard failure |
| T-REQ-04-N10 | Given U-file holding coffee 3 (P1 check first), when the person runs `remove coffee`, then (acc. 12) it exits 1, is a Refusal, and the file is Unchanged. [G remove] | integration | 2 | fails: GUARD remove not implemented (exit 1). After story 1: same guard failure |
| T-REQ-04-N11 | Given U-dir holding coffee 3 (P1 check first), when the person runs `remove coffee`, then (acc. 13) it exits 1, is a Refusal, and the file is Unchanged. [G remove] | integration | 2 | fails: GUARD remove not implemented (exit 1). After story 1: same guard failure |
| T-REQ-04-N12 | Given each of: a file holding coffee 3 and tea 2 (success); no `coffee` (failure); a damaged file (D1); the usage error `remove a b`; U-file; U-dir (P1 check first for the last two), when the person runs `remove coffee`, then nothing is stored but `tally.json`: after restoring permissions the Dir listing is only the original `tally.json`, with no temporary or other file. [R] [G remove] | restraint | 2 | fails: GUARD remove not implemented (exit 1). After story 1: same guard failure |
| T-REQ-04-N13 | Given a file holding coffee 3, when the person runs `remove coffee` and, separately, `remove tea` (no such counter), with every network attempt of the child process recorded, then the runs exit 0 and 1 and **no network attempt was recorded**. [R] [G remove] | restraint | 2 | fails: GUARD remove not implemented (exit 1). After story 1: same guard failure |
| T-REQ-04-N14 | Given counters named `../x`, `__proto__`, `constructor` and `a/b` created with `add` (each at 1) beside coffee 3, when the person runs `remove <name>` for each, then each exits 0 and is Silent, Readback no longer has that counter and has every other counter as before, the Dir listing is only `tally.json`, and the parent listing is only the working directory. And given a file holding only coffee 3, `remove __proto__`, `remove constructor` and `remove toString` each exit 1 (names that exist on plain objects are not counters), with the file Unchanged. A name is data. [R] [G remove] | restraint | 2 | fails: GUARD remove not implemented (exit 1), the guard message (Rule G), not the `add` setup, because the guard runs first on a fixture file. After story 1: same guard failure, exit 1 with a `tally: ...` line |

### REQ-05: Refuse a missing or unknown command (story 1)

| ID | Given / When / Then | Kind | Owner story | State before the build |
|---|---|---|---|---|
| T-REQ-05-P1 | Given a file holding coffee 3, when the person runs `add coffee` and `list` (the two commands this story builds, in lower case), then neither is refused as an unknown command: each exits 0 (`reset` and `remove` are accepted as commands by T-REQ-03-P1 and T-REQ-04-P1). Derived from the PRD definition of "Unknown command", not from an acceptance bullet; see section 10. | integration | 1 | fails: node exit 1, expected 0 |
| T-REQ-05-N1 | Given a file holding coffee 3, when the person runs `tally` with no command, then (acc. 1) it exits 2, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 |
| T-REQ-05-N2 | Given a file holding coffee 3, when the person runs `frobnicate`, then (acc. 2) it exits 2, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 |
| T-REQ-05-N3 | Given a file holding coffee 3, when the person runs `--help` and, separately, `-h`, then (acc. 3) each exits 2, stdout is empty (no help text), stderr is non-empty, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 |
| T-REQ-05-N4 | Given a file holding coffee 3, when the person runs `Add coffee`, then (acc. 4) it exits 2, is a Refusal, the file is Unchanged, and Readback is exactly `coffee 3` (no counter created). [X] | integration | 1 | fails: node exit 1, expected 2 |
| T-REQ-05-N5 | Given a damaged file (each of D-short), when the person runs `frobnicate`, then (acc. 5) it exits 2 and not 1, stderr is non-empty, and the file is byte-for-byte Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 |
| T-REQ-05-N6 | Given an empty directory (no `tally.json`), when the person runs, one after another, no command, `frobnicate`, `--help`, `-h` and `Add coffee`, then each exits 2 with stdout empty and the Dir listing is still empty: a refused command stores nothing and creates no file. [R] [X] | restraint | 1 | fails: node exit 1, expected 2 |

### REQ-06: Check usage before touching the file (story 1)

| ID | Given / When / Then | Kind | Owner story | State before the build |
|---|---|---|---|---|
| T-REQ-06-P1 | Given a damaged file (D1 and D4), when the person runs the correctly used `list` and, separately, `add coffee`, then each exits 1 and not 2, is a Refusal, and the file is Unchanged: the usage check lets a correctly used command through to the file. Derived from the Flow of REQ-06, not from an acceptance bullet; see section 10. [G list] [G add] | integration | 1 | fails: GUARD list not implemented (exit 1) |
| T-REQ-06-N1 | Given a damaged file (each of D-short), when the person runs `add` with no name, then (acc. 1) it exits 2 and not 1, is a Refusal, and the file is byte-for-byte Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 |
| T-REQ-06-N2 | Given a damaged file (each of D-short), when the person runs `reset` with no name, then (acc. 2) it exits 2 and not 1, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 |
| T-REQ-06-N3 | Given a damaged file (each of D-short), when the person runs `remove "a b"`, then (acc. 3) it exits 2 and not 1, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 |
| T-REQ-06-N4 | Given a damaged file (each of D-short), when the person runs `list x`, then (acc. 4) it exits 2 and not 1, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 |
| T-REQ-06-N5 | Given U-read holding coffee 3 (P1 check first), when the person runs `add a b`, then (acc. 5) it exits 2 and not 1, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 |
| T-REQ-06-N6 | Given an unwritable file in both its forms, U-file and U-dir, each holding coffee 3 (P1 check first), when the person runs `add a b`, then (acc. 6) each exits 2 and not 1, is a Refusal, and the file is Unchanged. [X] | integration | 1 | fails: node exit 1, expected 2 |

REQ-06 acc. 2 and 3 name `reset` and `remove` but stop at the usage check with exit 2, so the story 1
rows that carry them need no story 2 file.

## 6. Conventions step (not a row)

The acceptance run carries one step that is not a row (PRACTICES section C). It has no test id, no
Given / When / Then and no state before the build, asserts no business outcome, and traces to no
requirement. It is not a builder's to change, like everything under `eval/`.

| Check | Tool and pinned version | Configuration | Bound by (TECH-SPEC section 13) |
|---|---|---|---|
| Layering, file length (300 lines), no `process.env`, only built-in or relative imports, no empty `catch`, no dependencies in `app/package.json`, parsing, forbidden references | Node 22.x inside the container of section 8 (Decisions 2026-10-27, G1) running `node eval/conventions/check.mjs app`, started by `eval/conventions.sh`; no installed tool | none read from `app/`; limits are constants in `check.mjs`; reads `eval/conventions/forbidden-in-app.txt` | Conventions: the table rows Layering, Layout, Errors, Configuration, Dependencies, Parsing, Forbidden references; the introductory paragraph pinning Node 22.x |
| Runtime version | the Node-major check (E4) in `eval/run.sh`, run inside the container on Node 22.x | none | Conventions row "Runtime version"; section 6 |

Formatting, lint, types, secret scan, dependency audit and container lint are not run: declined by the
user (Q19), per TECH-SPEC section 13. The step runs clean on `app/` as it stands when it is introduced
(an empty `app/` has nothing to check, and the step passes; the rows fail by absence). The pull
request that introduces `eval/` shows that run. `check.mjs` reads no file under `app/` for
configuration, so nothing a builder places there switches a check off.

## 7. `eval/conventions/forbidden-in-app.txt` (TECH-SPEC P3)

Blueprint open point P3 is closed by this section and by Decisions 2026-10-27, F6(A).

This plan fixes the acceptance runner as `eval/run.sh`, the tests under `eval/tests/`, the conventions
step under `eval/conventions/`, and the report path `eval/report/eval.log`. No file under `app/` may
name them. `node:test` is **not** listed, because the builder's own tests under `app/test/` may use
it. Content, one literal text per line, matched case-sensitively (Decisions 2026-10-27, F6 A):

```
eval/tests
eval/run.sh
eval/conventions
eval/report
eval.log
--test-reporter
--test-reporter-destination
```

## 8. Commands

Run from the repository root, in this order. The freeze pins these; the branch's own scripts are
never used in their place.

1. `sh eval/run.sh`. Per Decisions 2026-10-27, G1, it runs every step below inside the container
   `node@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d`
   (`node:22-bookworm-slim`), as the calling user's uid:gid and never as root, with the repository
   mounted as the working directory. Docker is required, and the first run pulls the image. Inside the
   container it runs, in order:
   1. the Node check (E4), which remains: reads the major version of the `node` it will use (the one
      in the container) and refuses to run, with a
      message and a non-zero exit before any test or check starts, if the major is not 22;
   2. `sh eval/conventions.sh` (Node 22.x running `eval/conventions/check.mjs` on `app/`);
   3. `node --test eval/tests/*.test.mjs` (a shell glob, not the directory form; Decisions
      2026-10-27, F6 C) running the 76 rows of section 5, using Node's built-in reporter with no
      reporter flag.

   `eval/run.sh` runs every step, logs every result, and exits non-zero if any step failed (F6 E);
   a failure in the conventions step does not stop the tests from running.

**Freeze packets (Decisions 2026-10-27, G2; section 9).** The rows are frozen in two packets. Packet 1
(now) carries the documents, the harness, the 52 story-1 rows and story 1's brief and scope. Packet 2
(after story 1 merges, with its own founder approval) carries the 24 story-2 rows and story 2's brief
and scope. Main's first push carries a placeholder `eval/run.sh` with no rows, so the packet-1 pull
request can be judged. The commands above are those of the full suite of 76 rows; each packet's
`eval/run.sh` runs the rows that packet has frozen.

**Install: none.** tally has no dependencies (NFR-2), `app/package.json` declares none, and there is no
lockfile, so no install step exists and none is run.

**What the commands need present (Decisions 2026-10-27, G1):** **Docker**, able to run the pinned
image as the calling user; the image above, pulled on the first run (so the first run needs access to
the registry; later runs use the local copy). Node 22.x is supplied by the container, not by the host,
so no host Node is needed. The calling user must be **non-root on a file system that enforces modes,
not Windows (P1, section 3)** for the 19 permission-dependent tests; inside the container P1 is met
whenever the calling user is not root. Also a writable temporary directory inside the container and
write access to `eval/report/` through the mounted repository. No browser, database or provisioned
service is needed, and the tests make no network request (the image pull is the only network use, by
Docker, outside the tests). The non-root requirement (P1) is a precondition of the commands accepted by
the user (Decisions 2026-10-27, F3), verified at gate 7; if unmet, those tests fail with "P1 not met"
and none passes.

**Network observation:** the tests observe the child's network attempts through a preload passed to
the child through `NODE_OPTIONS` (Decisions 2026-10-27, F6 D); its details are the test author's and
the assertion is only "none recorded".

**Where the log is written:** `eval/run.sh` writes the combined output of all three steps to
`eval/report/eval.log` (Decisions 2026-10-27, F6 B). The log is never committed. Every test's title starts with its ID, so each row's result line in that log
is the evidence the verification register names. Failures of the conventions step are read there too.

## 9. Stories

| Story | Owns these files | Depends on | Tests it must turn green |
|---|---|---|---|
| 1: `add` and `list` | `app/package.json`, `app/bin/tally.js`, `app/src/usage.js`, `app/src/store.js`, `app/src/names.js`, `app/src/errors.js`, `app/src/commands/add.js`, `app/src/commands/list.js`; builder's own tests `app/test/add.test.js`, `app/test/list.test.js`, `app/test/usage.test.js`, `app/test/store.test.js` | none (starts from an empty `app/`) | all 52: the 44 of REQ-01 (T-REQ-01-P1 to P5, N1 to N13), REQ-02 (P1 to P7, N1 to N5), REQ-05 (P1, N1 to N6), REQ-06 (P1, N1 to N6), and the eight usage rows T-REQ-03-N4 to N7 and T-REQ-04-N4 to N7, which `usage.js` makes green |
| 2: `reset` and `remove` | `app/src/commands/reset.js`, `app/src/commands/remove.js`; builder's own tests `app/test/reset*.test.js`, `app/test/remove*.test.js` | story 1 (`add`, `list`, and `usage.js`, `store.js`, `names.js`, `errors.js`, all complete in story 1) | all 24: REQ-03 (P1, P2, N1 to N3, N8 to N14) and REQ-04 (P1, P2, N1 to N3, N8 to N14) |

- Scope is disjoint: the two stories share no file, and neither owns anything under `eval/`, `docs/` or
  `.github/`, nor the root `package.json`.
- No story's tests depend on a later story's files. Story 1's rows never run `reset` or `remove` to
  their end (T-REQ-02-P3 starts from a file holding coffee at 0; T-REQ-06-N2 and N3 stop at the usage
  check). The eight usage rows moved to story 1 (T-REQ-03-N4 to N7, T-REQ-04-N4 to N7; R6-007) also
  stop at the usage check with exit 2, before any `reset` or `remove` module would be reached, so story
  1 depends on no story 2 file. Story 2's rows use story 1's `add` and `list`, which exist by then.
- Every one of the 76 tests has exactly one owner (52 in story 1, 24 in story 2). Story 1 is one
  coherent change (the shared parts, two commands and the usage check); story 2 is two small modules.
- **State between the stories:** until story 2 lands, a valid `reset` or `remove` exits 1 with a
  `tally: ...` line, which is why every story 2 row that expects exit 1 carries Rule G.

### Freeze packets (Decisions 2026-10-27, G2)

Every pull request is judged by main's whole suite, so freezing all 76 rows at once would block story
1 forever. The rows are therefore frozen in two packets:

- **Packet 1 (now):** `docs/`, the harness (`eval/run.sh`, `eval/inside.sh`, `eval/conventions*`,
  `eval/tests/lib/`), the 52 story-1 rows, and story 1's brief and scope (`eval/stories/1.*`).
- **Packet 2 (after story 1 merges, with its own founder approval):** the 24 story-2 rows and story
  2's brief and scope (`eval/stories/2.*`).
- **Main's first push** carries a placeholder `eval/run.sh` that exits 0 with no rows, so the packet-1
  pull request can be judged.
- **"State before the build" of the story-2 rows** (the "After story 1" values in section 5) applies to
  packet 2's own rehearsal against main after story 1 has merged.

No row, count, owner or state is changed by the split: story 1 still owns 52 rows and story 2 still
owns 24.

## 10. Gaps, and what cannot be tested as written

### Gaps

Every acceptance criterion has a test (section 12 maps all 60). **No criterion is left without a test.**
Things the plan records openly:

- **Tests without an acceptance bullet.** The PRD gives REQ-05 and REQ-06 only refusals, yet coverage
  rule 1 needs a P test per requirement. T-REQ-05-P1 (from the definition of "Unknown command") and
  T-REQ-06-P1 (from the Flow of REQ-06) are added for that reason and trace to those texts. The 13
  restraint rows trace to the PRD's "nothing else" (sections 2 and 7), to the definition of "Failure"
  (a failure leaves `tally.json` as it was) and to NFR-4 (no server), which has no criterion of its
  own; the rubric and the user require restraint rows. The user decided to keep all 15 as written
  (Decisions 2026-10-27, F5); the 60 criteria stay covered either way.
- **Trace of the 15 tests with no single acceptance bullet.** Each keeps the basis it already cited,
  and each is also traced to Decisions 2026-10-27, F5:

  | Test | Basis already cited | Also traced to |
  |---|---|---|
  | T-REQ-05-P1 | PRD definition of "Unknown command"; coverage rule 1 | Decisions 2026-10-27, F5 |
  | T-REQ-06-P1 | Flow of REQ-06; coverage rule 1 | Decisions 2026-10-27, F5 |
  | T-REQ-01-N10 to N13, T-REQ-02-N4, N5, T-REQ-03-N12 to N14, T-REQ-04-N12 to N14, T-REQ-05-N6 (13 restraint rows) | gate-5 restraint rule; PRD "nothing else" (sections 2 and 7), definition of "Failure", NFR-4 | Decisions 2026-10-27, F5 |

- **Also decided by F5:** `list` lines end with a line feed (T-REQ-02-P1, Rule G list, and every
  Readback) and `add Coffee` and `add -x` print nothing (Q9; T-REQ-01-N13). Both stay as asserted
  (Decisions 2026-10-27, F5).
- **Known limitations decided by the user, with no test:** concurrent commands in one directory (O1):
  no lock, the later write wins and one update can be lost, the file is never left damaged (Decisions
  2026-10-27, F1); and `add` on a counter at 9007199254740991 (P2): no new behaviour and no
  criterion, and if reached, later commands refuse with exit 1 until the file is fixed by hand
  (Decisions 2026-10-27, F2).
- **Decisions with no PRD criterion and no register row, so no test:** the written file keeps an
  existing file's permission mode (D1d); a symbolic-link `tally.json` (L1); `1.0` and `1e2` read as
  numbers, a duplicate key read last-wins (E6, D1c); the Unicode `White_Space` set beyond the ordinary
  space; code-point order for characters outside the Basic Multilingual Plane; `app/package.json`
  declaring `bin`; the form of an unexpected internal error. The tests use the ordinary space as the
  PRD does.

### Untestable as written

| Criterion or text | Why it cannot be checked as stated | Wording that would make it testable |
|---|---|---|
| "prints a message on stderr" (every failure criterion) | The PRD decides no wording, so a test can only see that stderr is non-empty; any noise passes. | State a minimum, for example "one line that names the problem". |
| REQ-02 acc. 1 "one per line", `coffee 3` | The PRD does not say whether the last line ends in a line feed. The tests follow the register (stdout exactly `coffee 3` plus a line feed), kept by the user (Decisions 2026-10-27, F5). | "Each line, including the last, ends with a line feed." |
| "unreadable" and "unwritable" tally.json (REQ-01 acc. 11 to 13, REQ-02 acc. 6, 7, 10, REQ-03 and REQ-04 acc. 11 to 13, REQ-06 acc. 5, 6) | Checkable only where the operating system enforces permissions for a non-root user; the PRD names no platform. | State the supported platform and that the checks run as a non-root user (TECH-SPEC P1). |
| "Whitespace" (REQ-01, REQ-03, REQ-04, REQ-06) | The PRD defers the set to the blueprint and uses a space as its example. | Name the set in the PRD. |
| NFR-1 to NFR-4 | No acceptance criterion, so no row. The conventions step holds the form of the code (not a row), and the restraint rows cover "nothing stored" and "no network". | An observable criterion for each, if the user wants them proved. |
| "A message appears" for `--help` and `-h` | Fine as a refusal, but whether any help text should appear on stderr is not stated; only stdout being empty is asserted. | State whether help text is wanted. |

## 11. Open questions

None. Former Q-A to Q-E were decided by the user (Decisions 2026-10-27, F6) and are now stated where
they apply:

- **A (was Q-A).** `forbidden-in-app.txt` holds one literal text per line, matched case-sensitively
  (section 7).
- **B (was Q-B).** The report path is `eval/report/eval.log`, never committed (section 8).
- **C (was Q-C).** The tests run as `node --test eval/tests/*.test.mjs`, a shell glob (section 8).
- **D (was Q-D).** No-network is observed by a preload passed to the child through `NODE_OPTIONS`
  (section 8).
- **E (was Q-E).** `eval/run.sh` runs every step, logs every result, and exits non-zero if any step
  failed (section 8).

O1 and P2 are known limitations (Decisions 2026-10-27, F1, F2; section 10), and P1 is an accepted
precondition (F3; section 3), so none remains open.

## 12. Coverage map (criterion to test)

- REQ-01: acc. 1 P1; 2 P2; 3 P3; 4 P4; 5 P5; 6 N1; 7 N2; 8 N3; 9 N4; 10 N5; 11 N6; 12 N7 and N8; 13 N9.
- REQ-02: acc. 1 P1; 2 P2; 3 P3; 4 P4; 5 P5; 6 P6; 7 P7; 8 N1; 9 N2; 10 N3.
- REQ-03: acc. 1 P1; 2 P2; 3 N1; 4 N2; 5 N3; 6 N4; 7 N5; 8 N6; 9 N7; 10 N8; 11 N9; 12 N10; 13 N11.
- REQ-04: acc. 1 P1; 2 P2; 3 N1; 4 N2; 5 N3; 6 N4; 7 N5; 8 N6; 9 N7; 10 N8; 11 N9; 12 N10; 13 N11.
- REQ-05: acc. 1 N1; 2 N2; 3 N3; 4 N4; 5 N5.
- REQ-06: acc. 1 N1; 2 N2; 3 N3; 4 N4; 5 N5; 6 N6.

The register's 60 rows are these 60 criteria one to one; each has the test above.

## 13. Counts

| Requirement | Positive | Negative | Integration | e2e | Restraint | Expected to fail before any build | Owner |
|---|---|---|---|---|---|---|---|
| REQ-01 | 5 | 13 | 14 | 0 | 4 | 18 | 1 |
| REQ-02 | 7 | 5 | 10 | 0 | 2 | 12 | 1 |
| REQ-03 | 2 | 14 | 12 | 1 | 3 | 16 | 2 for 12 tests; 1 for N4 to N7 |
| REQ-04 | 2 | 14 | 12 | 1 | 3 | 16 | 2 for 12 tests; 1 for N4 to N7 |
| REQ-05 | 1 | 6 | 6 | 0 | 1 | 7 | 1 |
| REQ-06 | 1 | 6 | 7 | 0 | 0 | 7 | 1 |
| **Total** | **18** | **58** | **61** | **2** | **13** | **76** | 52 + 24 |

76 tests: 18 positive, 58 negative; 61 integration, 2 e2e, 13 restraint, 0 unit, 0 production, 0
review. **All 76 are expected to fail before any build**, and none passes or cannot run, so the
freeze reads a real failure everywhere. Story 1 owns 52 tests (the 44 of REQ-01, REQ-02, REQ-05 and
REQ-06, and the 8 usage rows T-REQ-03-N4 to N7 and T-REQ-04-N4 to N7); story 2 owns 24. After story 1
all 52 story 1 tests pass and the 24 story 2 tests still fail (reset and remove exit 1, module
absent). After story 2 all 76 pass. Counts per requirement, by kind and by expected failure are
unchanged from revision 1; only the owner changed for 8 tests. Permission-dependent tests (P1): 19, namely T-REQ-01-N6 to N10, T-REQ-02-P6, P7, N3, N4,
T-REQ-03-N9 to N12, T-REQ-04-N9 to N12 and T-REQ-06-N5, N6.

## 14. Checker's verdict (self-check)

- Requirements missing a P or an N test: none.
- Tests with no or an unknown requirement: none.
- Criteria absent from the tests and the gaps: none (section 12).
- Register rows with no test: none.
- Criteria whose only evidence is in-process rows: none; no row is in-process.
- Tests with no owner story, or no state-before-the-build value: none.
- Overlapping story scope, or tests depending on a later story's files: none.
- Gaps and untestable sections: both present (section 10).
- Open: the rubric rules this plan could not satisfy cleanly are listed in the drafter's closing note,
  chiefly the two P tests with no acceptance bullet and the restraint rows with no criterion, kept by
  the user (Decisions 2026-10-27, F5).
- Open questions: none (section 11).
