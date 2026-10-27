# Gate 4 findings, round 3: tally technical blueprint (TECH-SPEC.md revision 3)

Rubric: `docs/orchestrator/rubrics/blueprint.md`. Upstream authority: PRD r3 and MOCKUP r3 (not
reviewed). Deciders checked against PREPARATION-STATE "Questions asked, and the answers" (Q1 to Q21 and
the recorded-defaults paragraph), "Open questions" and "Decisions" (D1 to D6, E1 to E6, S1). Sections 12
and 13 judged against PRACTICES A, B, C. Section 9 checked against ORCHESTRATOR Gate 5. Independent
review first; the status of the r2 findings is at the end.

Verdict: **clean of blockers. Zero blockers, three advisories.** All six r2 findings are closed.

## Checker's verdict, in rubric order

**1. Does any requirement ID originate in the blueprint?** No. REQ-01 to REQ-06 are cited as the PRD
gave them. O1, P1 to P5, L1, D, E and S identifiers are not requirements. No gate-3 failure.

**2. Requirements placed exactly once.** Section 3: REQ-06 boundary; REQ-05 `usage.js`; REQ-01
`add.js`; REQ-02 `list.js`; REQ-03 `reset.js`; REQ-04 `remove.js`. `store.js` and the domain layer
carry none of their own. No exceptions. The usage-error criteria of REQ-03 and REQ-04 are decided by
`usage.js` in story 1, and section 3 says the requirements stay placed where the PRD gave them.

**3. Criteria with no register row.** None found. I counted the PRD r3 bullets under each Acceptance
heading from the file: REQ-01 13, REQ-02 10, REQ-03 13, REQ-04 13, REQ-05 5, REQ-06 6 = 60. The
register has 13, 10, 13, 13, 5 and 6 rows = 60, one row per bullet, in the PRD's order, with matching
wording. No row without a bullet. NFR-1 to NFR-4 have no criterion and section 4 says so.

**4. Register rows whose evidence is an agent's claim.** None found. Every row is an automated
child-process test whose evidence is its result line in the eval log written by `eval/run.sh`. No row
uses human review, so the two-step rule does not arise.

**5. Requirements accepting input with no failure behaviour.** None found. Section 5 now has a separate
row for the arguments of `list` (REQ-02, REQ-06) with exit 2, stdout empty and file unchanged for
`list x`. The command row, the name-argument row, the `tally.json` contents row and the write row give
missing, malformed and unauthorized behaviour.

**6. Shared objects with no concurrency answer.** None found. Section 8 answers for `tally.json`
(atomic rename, no lock, a lost update possible when writers overlap, unique temporary file names). The
guard-or-accept decision is open as O1, carried to gate 6 at the user's direction (Q20; PRD §8).

**7. Decisions with no decider.** No blocker. Every settled row in section 10 names the user (Q, D, E
or S number), a recorded default from the five in PREPARATION-STATE, or a PRD clause. All cited deciders
exist: Q1, Q19, Q20 (D1a to D1f, D2 to D6), Q21 (E1 to E6, S1). Two rows state "pending the user"
(concurrency, O1; overflow, P2). They are open points, not decisions; see R3-02.

**8. Section A concerns with no line in section 12.** None found. Security 8, Reliability 8,
Observability 4 and Delivery and data 6 each have their own line. Exclusions name a decider (Q1, Q20
D1f and D4, Q21 E3) and a return condition.

**9. Concerns the stack brings beyond section A, with no line.** None found. Exit status and streams,
file mode, symbolic link, platform, interrupts and the client are answered.

**10. Section B conventions with no tool, version or configuration file.** None found. Every row
names `check.mjs` on Node 22.x (v22.23.2) with constants in its own source (no configuration file, which
the section states), `eval/run.sh`, `eval/conventions/forbidden-in-app.txt`, or a user-declined "no
tool" with the decider. The Errors row now names `check.mjs` for the empty `catch` (E1).

**11. Section B practices neither made concrete nor declined with a reason.** None found. Layering,
Layout, Errors, Logging, Configuration, Dependencies, Types, Formatting and lint, the builder's own
tests, Naming, Comments, Commits and the client all appear. Logging and the client carry a sentence on
why they do not apply. The no-tool rows (Types, Formatting and lint, Naming, Comments, Commits, and
function length and complexity in Layout) rest on the user's Q19 ("Node only, no installed tools") and
Q20 D2 and D3. The user's choice is authoritative and is not re-argued; the blueprint records the decider.

**12. Layout tree and size limits.** Both present. The tree has one line per folder and file group
(`app/`, `bin/`, `src/`, `commands/`, `test/`, `eval/` with `run.sh`, `conventions.sh`, `conventions/`,
`tests/`, `stories/`, `docs/`, `.github/`). Limits: file at most 300 lines (`check.mjs`, `MAX_LINES`),
function at most 50 lines, complexity at most 10 (fresh reader). The ESLint rules `max-lines`,
`max-lines-per-function` and `complexity` are named and recorded as not used because the user declined
ESLint (Q19). Decider: Q20 D2.

**Gate 5 consistency of section 9.** Consistent. File scopes are disjoint: story 1 owns `package.json`,
the entry point, `usage.js`, `store.js`, `names.js`, `errors.js`, `add.js`, `list.js` and four named
test files; story 2 owns `reset.js`, `remove.js` and `reset*.test.js` and `remove*.test.js`. Story 1's
rows do not depend on story 2's files: REQ-02 acc. 3 starts from a file already holding `coffee` at 0,
and REQ-06 acc. 2 and 3 stop in `usage.js` with exit 2 before any command module loads. Story 2's rows
use story 1's `add` and `list`, which exist by then. The state between the stories (an absent module is
an unexpected internal error, exit 1, with no special case) is stated, so the eval plan can derive each
"expected state before the build". This matches the user's split (Q21, S1).

## Findings

### R3-01 (advisory, plan-correction): a table in section 5 is broken by a paragraph
- Basis: after the `list` argument row, the line "All argument checks are made by `usage.js` ..." is
  followed directly by the two rows beginning "| `tally.json` contents (REQ-01 to REQ-04) |" and
  "| Writing `tally.json` ...". Those rows are detached from the table header and will not render as
  rows, so the failure behaviour for the file and the write reads as stray text.
- Resolution: move the paragraph below the table. No content changes.

### R3-02 (advisory, plan-correction): a few in-scope lines in section 12 and two section 10 rows name no decider
- Rubric: section 12 requires "in scope with the decision and who made it".
- Basis: "Running locally: `node app/bin/tally.js <command>`; `app/package.json` also declares `bin` so
  `tally` can be linked", "Configuration: none (section 6)" and "Invariants: ..." name no decider, and
  the `bin` field appears in no section 10 row. Section 10 rows "Concurrency ... pending the user (O1)"
  and "Overflow of `add` ... pending the user (P2)" have no decider yet. The `bin` field is a
  drafter's addition, not a user choice or a recorded default.
- Resolution: cite the deciding clause (for example NFR-1 to NFR-3 and Q1 for configuration) or mark
  the `bin` declaration as a drafter's detail the user may override. The two pending rows are properly
  open (O1, P2) and go to the gate 6 list as Q20 directs; no new decision is needed here.

### R3-03 (advisory, plan-correction): P2 leaves a reachable damaged-file state undescribed
- Basis: section 11 P2 and section 10: `add` on a counter at 9007199254740991 "not decided here". Under
  the design as written, such an `add` would store a value above the damage bound of section 7, so the
  next read of the file would report it damaged. The blueprint says no row exists and the PRD is silent.
- Resolution: none required of the blueprint (it adds no requirement). The orchestrator carries P2 to
  gate 6 with its recommendation (exit 1, file unchanged) as the user directed (Q20). Listed so the
  decision list states the consequence.

## Production-readiness defaults below the PRACTICES recommendation

Each carries a recorded reason and the user as decider, so none is a finding on its own. For the
orchestrator's costed list: no lock (D4, O1 pending); no logs, request identity, structured records or
metrics (D4, Q1); no stack trace for unexpected errors (D5); no lockfile or audit (D4, no
dependencies); no `fsync` (D4); no schema version (D1f, D4); no formatter, linter or type checker (Q19);
function length and complexity unchecked by a tool (D2, D3); Node pinned as `22.x` and not an exact
version (E4); no backups or retention (PRD §6). O1 and P2 stay on the gate 6 list.

## Sections found clean

1, 2, 3, 4 (60 of 60), 6, 7, 8, 9, 10 (apart from the pending rows in R3-02), 11, 12 (apart from
R3-02), 13. Section 5 is complete in content (R3-01 is layout only).

## Status of the r2 findings (R2-01 to R2-06)

- **R2-01: closed.** Section 5 has a "Arguments of `list` (REQ-02, REQ-06)" row: no argument allowed,
  `list x` and `list ""` exit 2, message on stderr, stdout empty, file unchanged. The name-argument row
  no longer claims REQ-02 or the wrong argument count.
- **R2-02: closed.** Q21 E1 ("E1 add the check") is recorded in section 10 and section 13: `check.mjs`
  refuses an empty `catch` block under `app/`; the Errors row names the tool, version and constants. The
  rest of the errors rule stays with the fresh reader, as stated.
- **R2-03: closed.** The negative-value rule is attributed to the user (Q21, E2) in sections 7 and 10.
- **R2-04: closed.** Section 12 cites E3 for Secrets, Containers, Timeouts, Seed data, and Time and
  identifiers, and the inference preface is gone. The code-point sort keeps its PRD §4 citation ("by
  Unicode value"), which the user accepted (PREPARATION-STATE G4r2-04).
- **R2-05: closed.** Section 6 and section 13 state Node 22.x and that `eval/run.sh` refuses to run
  when the major version is not 22 (Q21, E4); the Conventions table has a Runtime version row. The pin
  is a major version and not an exact one, by the user's choice.
- **R2-06: closed.** Q21 E5 exempts `app/test/` from the file-system and layer-order check only; it is
  stated in sections 10 and 13, and P4 is marked closed in section 11.
