# Gate 4 findings, round 4: tally technical blueprint (TECH-SPEC.md revision 4)

Rubric: `docs/orchestrator/rubrics/blueprint.md`. Narrow review of the r3 findings R3-01 and R3-02 and
of what revision 4 might have broken. Deciders checked against PREPARATION-STATE ("Questions asked, and
the answers" Q1 to Q21, the recorded-defaults paragraph after Q19, "Decisions" D1 to D6, E1 to E6, S1,
"Open questions" O1, P2) and PRD r3.

Verdict: **zero blockers, zero advisories.** R3-01 and R3-02 are closed. Revision 4 broke nothing.

## 1. Status of R3-01 and R3-02

### R3-01: closed
- Basis: section 5 now reads as one unbroken table. The header is line 164, the separator line 165, and
  the five rows (Command, Arguments of `add`/`reset`/`remove`, Arguments of `list`, `tally.json`
  contents, Writing `tally.json`) are lines 166 to 170, with no line between them. The paragraph "All
  argument checks are made by `usage.js` ..." is at line 172, after the table, and the "unexpected
  internal error" paragraph follows it. Content is unchanged.

### R3-02: closed
- The `bin` field now has a section 10 row (line 341): "`app/package.json` declares `bin`, mapping the
  command `tally` to `app/bin/tally.js` | PRD §3 (the person runs `tally add <name>`, `tally list`,
  `tally reset <name>`, `tally remove <name>`)". PRD §3 line 22 holds exactly that text. Section 12
  "Running locally" (line 399) cites the same clause (PRD §3). A clause is cited and no user question is
  recorded for it, so the rubric's "one or the other" rule holds.
- The in-scope lines R3-02 named now carry deciders: "Configuration" cites PRD §1 ("without setting
  anything up", PRD line 9); "Invariants" cites PRD §4 "Damaged tally.json" and "Could not be carried
  out" and NFR-4 (PRD line 266).
- The two "pending the user" rows (Concurrency, O1; Overflow, P2) stay as open points, as R3-02 said they
  should. Both are in section 11 and in PREPARATION-STATE "Open questions".

## 2. Deciders in section 10 and section 12

Section 10, all 33 rows: none found without a real decider.
- Q1, Q19, Q20 (D1a to D1f, D2, D3, D4, D5, D6) and Q21 (E1, E2, E4, E5, E6, S1) all exist in
  PREPARATION-STATE and say what the row says. The absent-module row cites S1 and follows from D5, both
  recorded.
- "Recorded default" is used for the four rows in the recorded-defaults paragraph (one entry point and
  plain functions; JSON object of name to whole number; write via temporary file and rename; `node:test`
  child-process tests). The `eval/tests/` folder is called a detail of that default, as before.
- PRD clauses cited exist: §4 "Counter", "Damaged tally.json", "Sorted by name" ("by Unicode value",
  line 67), "Usage error", "Could not be carried out", "Failure", "Unwritable tally.json"; REQ-06; §3.
- Concurrency (O1) and overflow (P2) are marked "pending the user" and are open points, not decisions.

Section 12, every in-scope and excluded line: none found without a decider and, for exclusions, a return
condition.
- Exclusions name the user: Q1 (identity, transport, cross-origin, shutdown, health, request identity,
  metrics, client practices), Q21 E3 (secrets, containers, timeouts, seed data, time and identifiers),
  Q20 D1f and D4 (schema evolution, `fsync`, logs, lockfile). Backups and Platform rest on PRD §6, whose
  text is "none are invented here".
- In-scope lines name a PRD clause or a user decision: Input validation (PRD REQ-01 to REQ-06, §4), What
  is never logged (D5, PRD §2), Start-up (PRD §1), Errors (PRD §4, E1, D5), Running locally (PRD §3),
  Configuration (PRD §1), Invariants (PRD §4, NFR-4), Exit status (PRD §4), File mode (D1d), Symbolic
  link (D6).

## 3. What the rubric's verdict covers, rechecked on revision 4

- **Requirement IDs originating in the blueprint:** none. Only REQ-01 to REQ-06 appear. O, P, L, D, E, S
  and R labels are not requirement IDs.
- **Requirements placed exactly once (section 3):** REQ-06 boundary, REQ-05 `usage.js`, REQ-01 `add.js`,
  REQ-02 `list.js`, REQ-03 `reset.js`, REQ-04 `remove.js`. No exceptions.
- **Register rows:** 60, one per PRD acceptance bullet, by my count of lines 90 to 149 of the register:
  REQ-01 13, REQ-02 10, REQ-03 13, REQ-04 13, REQ-05 5, REQ-06 6. These match the PRD's counts recorded
  in PREPARATION-STATE and the wording of the r3 review. Criteria with no row: none. Every row's evidence
  is an eval-log result line from an automated test; no agent claim.
- **Input with no failure behaviour:** none. **Shared object with no concurrency answer:** none (section
  8, O1 open). **Section A and beyond-A concerns with no line:** none. **Section B practices with no tool
  or reason:** none. Layout tree and size limits present.
- Section 9 is unchanged in shape: the file scopes of the two stories are disjoint, and no story 1 row
  depends on a story 2 file.

## Findings

None found.

## Open points carried, not findings

O1 (concurrency) and P2 (overflow at 9007199254740991) are open and go to the gate 6 decision list as the
user directed in Q20. P1 (permission rows need a non-root POSIX environment, 14 rows) is an open point
for gate 7 and is stated in section 11. P3 is for the eval plan.
