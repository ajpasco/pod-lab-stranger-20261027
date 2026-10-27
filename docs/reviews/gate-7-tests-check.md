# Gate 7: acceptance tests as code, checked against the eval plan

Reviewer: fresh session, did not write the tests. Method: read every file of packet 1
(`eval/run.sh`, `inside.sh`, `conventions.sh`, `conventions/`, `tests/`, `tests/lib/`, `stories/1.*`) and
packet 2 (`.pod/packet-2/eval/tests/*`, `stories/2.*`) against `docs/eval-plan.md` rev 5, TECH-SPEC rev 7
sections 6, 7, 9 and 13, and Decisions 2026-10-27 F6, G1, G2. I could not execute code in this session.
The only run evidence is the existing `eval/report/eval.log` (packet 1 against an absent `app/`).

**Verdict: no blockers; the tests match the plan. 8 advisories, none needs a change before the freeze.**

## Blockers

None found.

What I checked, and the basis:

- **Row count and titles.** Packet 1 has exactly 52 top-level tests, each title starting with its ID:
  REQ-01 P1-P5 and N1-N13 (18), REQ-02 P1-P7 and N1-N5 (12), REQ-05 P1 and N1-N6 (7), REQ-06 P1 and
  N1-N6 (7), T-REQ-03-N4 to N7 and T-REQ-04-N4 to N7 (8). `eval.log` shows 52 `ok/not ok N - T-REQ-...`
  lines. Packet 2 has 24: REQ-03 and REQ-04 each P1, P2, N1-N3, N8-N14 (12 each). The IDs of the two
  packets are disjoint, with no extra and no missing ID. `tests/lib/` files do not match `*.test.mjs`.
- **Assertions against Given/When/Then.** Each test matches its row: fixtures, arguments, exit codes,
  Silent, Refusal, Unchanged and Readback. D1 to D14 in `harness.mjs` match plan section 4, and D-short
  is D1, D2 and D4. The 19 permission rows use the plan's four states (mode 000, 444, 644 in a 555
  directory, no file in a 555 directory). Unchanged for permission states compares the mode before
  restoring and the bytes after.
- **No technical choice asserted.** A grep of the tests finds no `tally:` wording, no `app/src` module
  name, no `store.js`/`usage.js`/`errors.js`/`names.js`, no temporary-file pattern and no `JSON.parse`.
  The only application path named is `app/bin/tally.js`. `counters()` writes JSON in setup only, and
  "unchanged" compares bytes. The line feed on `list` lines is the F5 decision.
- **Rule G.** `guard(command)` follows the plan table (`add`: no file, `add probe`, readback exactly
  `probe 1`; `list`: stdout exactly `probe 1\n`; `reset`: readback `probe 0`; `remove`: readback empty)
  and fails with `GUARD <command> not implemented (exit <n>...)`. It runs before the first exit-1 or
  restraint assertion in every row the plan marks [G ...]: T-REQ-01-N5 to N11, T-REQ-02-N2 to N5,
  T-REQ-06-P1 (both guards), and T-REQ-03/04 N1-N3 and N8-N14. In the permission rows the P1 check comes
  first and then the guard, as the plan says. Restraint rows without a guard (T-REQ-01-N12, N13,
  T-REQ-05-N6) require exit 0 or exit 2 first (Rules R and X).
- **P1.** `makePermState` calls `assertNotRoot` (fails with "P1 not met: ..." for root or Windows), then
  `p1Refused`. That checks that opening mode 000 for reading, opening mode 444 with `r+`, and creating a
  scratch file in a 555 directory are each refused. Any other outcome is `assert.fail("P1 not met: ...")`,
  and an unexpected error code is rethrown. No path passes or skips. Modes are restored in `t.after`
  also on failure.
- **Vacuity.** `eval.log` shows `# pass 0`, `# fail 90` (52 tests and their subtests) with `app/` absent.
  By reading, the same holds for packet 2: every row needs exit 0 or a guard, and no packet 2 row is
  Rule X.
- **`run.sh` (G1, F6).** The image is `node@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d`,
  identical to the plan, TECH-SPEC section 6 and G1. It runs `--user "$(id -u):$(id -g)"` with the
  repository mounted at `/w` as the working directory. `inside.sh` runs the E4 major check first (exit 1
  before any step if the major is not 22), then `sh eval/conventions.sh`, then
  `node --test eval/tests/*.test.mjs` (glob, no reporter flag, F6 C). A failing conventions step does not
  stop the tests (F6 E). The log goes to `eval/report/eval.log` (F6 B), which `eval/.gitignore` excludes.
  `run.sh` exits with the container's status, non-zero if any step failed.
- **`check.mjs` (section 13).** It implements: `node --check` on `.js/.mjs/.cjs` and `JSON.parse` on
  `.json`; no non-empty dependency fields in `package.json`; imports only `node:` built-ins or relative
  paths inside `app/`; 300-line limit (`MAX_LINES`); only `src/store.js` imports fs (exempting
  `app/test/`); layering by the section 2 "May import" map, including the computed
  `../src/commands/` dynamic import from `bin/tally.js`; no `process.env`; no empty `catch`; forbidden
  literals from `forbidden-in-app.txt`, case-sensitive. All limits and the import map are constants in
  the file. The only file it reads besides the `app/` files it checks is `forbidden-in-app.txt`, which
  matches plan section 7 line for line (7 lines). An absent or empty `app/` passes (the log shows this).
- **Scope files.** `stories/1.txt` is the 12 paths of plan section 9 and TECH-SPEC section 9.
  `stories/2.txt` is `reset.js`, `remove.js`, `app/test/reset*.test.js` and `app/test/remove*.test.js`.
  The two are disjoint. Neither names `eval/`, `docs/` or `.github/`.
- **Brief inputs.** `docs/PRD.md`, `docs/MOCKUP.md`, `docs/TECH-SPEC.md`, `docs/eval-plan.md` and the
  `eval/stories/*.txt` named by the briefs all exist (`2.txt` is staged in packet 2). The row counts in
  the briefs (18+12+7+7+8 = 52; 12+12 = 24) are correct.

## Advisories

**A1 (plan-correction). `eval/stories/1.md` "Done means" and "The tests it must turn green" describe a
suite that packet 1 does not contain.**
Basis: "Because story 2's 24 rows still fail by design, the script as a whole exits non-zero after this
story; read the log and confirm that every failing row is a story-2 row" and "The other 24 rows ... are
expected to keep failing after this story". Under G2 and plan section 8/9 packet 1 freezes only the 52
story-1 rows, and `run.sh` runs the glob, so after story 1 the run exits 0 with no failing row. A
builder could waste time looking for failures. No test is affected.

**A2 (advisory). Stricter than the plan: the network recorder is checked.**
Basis: `expectNoNetwork` also requires that the preload loaded (`<log>.loaded`), and
`assertRecorderWorks` runs a positive control needing at least 4 recorded attempts, in T-REQ-01-N11,
T-REQ-02-N5, T-REQ-03-N13 and T-REQ-04-N13. The plan's assertion is only "none recorded". This guards
against a recorder that silently records nothing, and I see no conflict. The control path never ran in
`eval.log`, because every row stops at its guard first, so I could not verify that it passes on Node
22.23.4. Run it once against the reference build before the freeze.

**A3 (advisory). Order of guard and P1 check in the multi-state rows.**
Basis: T-REQ-01-N10, T-REQ-02-N4, T-REQ-03-N12 and T-REQ-04-N12 call `guard(...)` once at the top, and
the P1 check runs inside each permission subtest. The plan says "P1 check first for the last three".
Every permission case still starts with its own P1 check before it runs tally, and a failure of either
makes the row fail. On an unimplemented app as root, the visible message is the GUARD message, not
"P1 not met". Nothing can pass.

**A4 (advisory). `run.sh` with a root caller.**
Basis: `docker run --user "$uid:$gid"` runs as root when `id -u` is 0, and the script only logs "P1 not
met". G1 says "never root". Plan section 3 accepts this: the permission tests then fail with "P1 not
met". It is consistent with the plan, but the literal G1 words would have refused to start.

**A5 (advisory). `check.mjs` is stricter than the section 13 text.**
Basis, each beyond the quoted rows:
- Rejects symbolic links under `app/`.
- Parses `.cjs` files as well.
- Matches `process.env` as text, so it also matches comments and strings, and in `app/test/`.
- Matches forbidden literals in file paths as well as contents.
- Rejects any non-literal `import()`/`require()` outside the `../src/commands/<x>` form in
  `bin/tally.js`.
- Flags any import of a file that is not a section 2 module, and any non-section-2 file that imports
  one.
- Counts a `catch` containing only a comment as empty.

All of these are in the spirit of the section 13 rows. `node --check` also reads the nearest
`app/package.json` to decide the module type. That is not check configuration.

**A6 (advisory). Other additions to the plan text.**
- `run.sh` passes `-e HOME=/tmp`.
- `harness.mjs` limits a child to 30 s and gives it only PATH, HOME, LANG and TMPDIR.
- `guard` requires exact `probe 1\n` for `list` and exact readbacks for the others, as the plan table says.
- T-REQ-03-N14 and T-REQ-04-N14 also read back after the `add` setup and after each step. That is a
  superset of the plan's Then.

**A7 (advisory). Stale reference.**
Basis: the `harness.mjs` header says "docs/eval-plan.md, revision 4"; the plan is revision 5. Comment
only.

**A8 (advisory). Packet 2 staging.**
Basis: `.pod/packet-2/eval/tests/*.test.mjs` import `./lib/harness.mjs`, which exists only in packet 1's
`eval/tests/lib/`. They run only after being placed in `eval/tests/` beside it, which is the intent.
Packet 2 changes no harness or run script. I did not execute them.

## Not verified

- No run of the harness against an implementation, and no run as root (the "P1 not met" path is by
  reading, not execution).
- The packet 2 "State before the build" values (the "after story 1" column) are not observable from the
  files alone.
