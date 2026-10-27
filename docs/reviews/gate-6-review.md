# Gate-6 planning review: tally

Reviewed: `docs/PRD.md` (revision 3), `docs/MOCKUP.md`, `docs/TECH-SPEC.md` (revision 4),
`docs/eval-plan.md`, against the rubrics `prd.md`, `blueprint.md`, `eval-plan.md`, `review.md` and
`PRACTICES.md`. Nothing else was read. Decisions the artifacts attribute to the user are taken as the
user's.

I checked these counts by hand and they agree across artifacts.

- Criteria per requirement: 13, 10, 13, 13, 5 and 6, which is 60.
- Register rows: 60.
- Tests: 76, made up of 18 positive and 58 negative; 61 integration, 2 e2e and 13 restraint.
- Story split: 44 tests in story 1 and 32 in story 2.
- Permission-dependent tests: 14 register rows and 19 tests.

## 1. PRD checker's verdict (rubric `prd.md`)

- **Numbering.** REQ-01 to REQ-06 each appear once, with no holes. Every criterion sits under one
  requirement and none is outside. No blocker.
- **Per requirement:**

| Requirement | Traced | Criteria observable | Role prohibitions | Input-failure cases |
|---|---|---|---|---|
| REQ-01 | yes | yes | yes (section 3 states there are none beyond the input failures) | yes |
| REQ-02 | yes | yes | yes | yes |
| REQ-03 | yes | yes | yes | yes |
| REQ-04 | yes | yes | yes | yes |
| REQ-05 | yes | yes | yes | yes |
| REQ-06 | yes | yes | yes | yes |

- **Criteria judged unobservable:** none found.
  - Exit status is the CLI form of what the person sees, and the user decided it (Q8, Q13). I did not
    treat it as a technical choice.
- **Undefined terms:** none found.
  - "Whitespace" is deferred to the blueprint, which defines it (TECH-SPEC section 7). That is
    recorded in R6-005 and R6-004.
- **No blockers in the PRD.** Advisories: R6-004, R6-005.

## 2. Mockup (judged: every PRD journey, and no others)

- Every one of the 60 criteria maps to a transcript (coverage table).
- No transcript shows a journey the PRD does not claim.
- Gap: REQ-06 acc. 6, directory case. See R6-006.

## 3. Blueprint checker's verdict (rubric `blueprint.md`)

- **Requirement ID originating in the blueprint:** none found.
- **Requirements placed exactly once:** all six; no exceptions.
  - The note under section 3 says `usage.js` (story 1) decides the usage criteria of REQ-03 and
    REQ-04. The requirements stay placed where the PRD gave them.
- **Criteria with no register row:** none found (60 rows).
- **Register rows whose evidence is an agent's claim:** none found. Evidence is a result line in the
  eval log. No row is a human review.
- **Requirements accepting input with no failure behaviour:** none found (section 5).
- **Shared objects with no concurrency answer:** none found. Section 8 describes the design.
  - The decision on guarding is open. See R6-001.
- **Decisions with no decider:** none found.
  - The rows "Concurrency" and "Overflow" are decided "pending the user". I judged them open points,
    because both are also in section 11 with what they block.
  - If the rubric is read strictly, they are decider-less rows and count as blockers. This is flagged
    in R6-001 and R6-002 for the user.
- **Section A concerns with no line:** none found. All 26 concerns have their own line.
- **Concerns beyond section A with no line:** none found. Exit status, file mode, symbolic link,
  platform, interrupts and client are answered.
- **Section B conventions with no tool, version or file:** none beyond those declined with a decider.
  Types, formatting and lint, naming, comments, commits and function length and complexity are held
  by the fresh reader, declined as tools by the user (Q19). See R6-009.
- **Section B practices neither made concrete nor declined:** none found.
- **Layout tree and size limits:** both present.
- **Findings below the PRACTICES recommendation without a recorded reason:** R6-009.

## 4. Eval plan checker's verdict (rubric `eval-plan.md`)

- **Requirements missing a P or an N test:** none found.
- **Tests with no or an unknown requirement:** none found.
- **Criteria absent from both tests and gaps:** none found.
- **Register rows with no test:** none found.
- **Criteria whose only evidence is in-process rows:** none found. Every row runs the CLI as a child
  process.
- **Tests with no owner story, or no state-before-the-build value:** none found.
- **Overlapping story scope:** none found.
- **Tests depending on a later story's files:** none found.
  - Story 1's rows never run `reset` or `remove` to their end.
  - Story 2's rows use story 1's `add` and `list`.
- **Gaps and untestable sections:** both present.
- **Conventions step:** present under its own heading, with no row attributes.
- **Restraint rows:** present for the single surface.
- **Review rows:** none, and none are needed.
- **No blockers in the eval plan.** Advisories: R6-007, R6-008, R6-010.

## 5. Cross-artifact checks

- **PRD to blueprint register to eval plan:** one to one for all 60 criteria.
- **Blueprint story shape to eval plan story table:** matches. The files owned, the order and the
  disjoint scopes agree.
- **Sequencing:** sound.
  - T-REQ-02-P3 starts from a file holding `coffee` at 0, so it needs no story 2.
  - The guards use the same command word as the test.
  - The between-stories state is stated for every story 2 row.
- **Ownership:** every test has one owner story. Every file has one owning story, or is frozen under
  `eval/`. The one wrinkle is R6-007.

## 6. Findings

### R6-001
- **severity:** advisory
- **description:** The concurrency decision is open (O1). TECH-SPEC section 10 and section 12 also
  record "no lock" as the user's decision (D4) while calling it "subject to O1", so the same
  decision is both made and pending.
- **basis:** Section 8: "Whether to guard against this or accept it as a limitation is the user's
  decision, pending as O1". Section 10: "Accepted below the PRACTICES recommendation: no lock
  (subject to O1) ... the user (Q20, D4)", and "Concurrency: ... pending the user (O1)". PRD section 8,
  O1.
- **resolution:** user-decision

### R6-002
- **severity:** advisory
- **description:** `add` on a counter already at the largest storable value has no defined
  outcome. The PRD is silent. The blueprint's own rule makes a stored value above that limit
  "damaged", so tally could write a file it then refuses to read.
- **basis:** Section 11, P2: "The PRD is silent. ... Needs a PRD decision; no row exists." Section 7:
  "a value is above 9007199254740991 ... damaged (the user, Q20, D1c)". Eval plan section 10 lists
  "`add` at 9007199254740991 (P2)" among decisions with no test.
- **resolution:** user-decision

### R6-003
- **severity:** advisory
- **description:** Whether the grading environment honours file modes (non-root, POSIX) is unknown.
  The 14 register rows and 19 tests that need it cannot be shown satisfiable until it is confirmed.
  The tests fail by name instead of passing vacuously.
- **basis:** Section 11, P1: "The recorded answers do not say what the environment is." Eval plan
  section 3: "The build orchestrator confirms at gate 7 that the grading environment is a non-root POSIX
  one."
- **resolution:** user-decision

### R6-004
- **severity:** advisory
- **description:** The tests assert damaged-file outcomes that the PRD text does not state. The BOM,
  negative value (D9) and value above 9007199254740991 (D10) states must exit 1. The PRD's definition
  of damaged says only "not valid JSON, or valid JSON that does not hold named counters each with a
  whole-number value". The user's decisions (Q20 D1c, Q21 E2) are recorded in the blueprint, but the
  PRD change list has no round for them.
- **basis:** Eval plan section 4: "D3, D9 and D10 are damaged by the user's decisions ... rather than by
  the PRD's wording alone". PRD section 9 lists revisions 1 to 3 and none mentions negative, BOM or
  upper-bound values.
- **resolution:** plan-correction (a PRD change entry recording the user's decisions, with the user's
  words)

### R6-005
- **severity:** advisory
- **description:** Several PRD criteria cover more than one case, although the rubric wants one case
  per criterion. The PRD's own revision 3 says it narrowed criteria for that reason. The eval plan and
  mockup already split these cases, so the cost is only the coverage map's clarity.
- **basis:**
  - REQ-01 acc. 12: "With an existing tally.json that does not allow writing, or with no tally.json
    in a directory that does not allow writing".
  - REQ-02 acc. 7: "This holds for a file that does not allow writing and for an existing file in a
    directory that does not allow writing".
  - REQ-05 acc. 3: "`tally --help` and `tally -h` ... each exits 2".
  - REQ-06 acc. 6: "unwritable tally.json", which covers both the file and the directory form.
- **resolution:** plan-correction

### R6-006
- **severity:** advisory
- **description:** The mockup does not demonstrate the directory form of REQ-06 acc. 6, although the
  PRD defines "unwritable" to include it. The mockup discloses this and gives its reason.
- **basis:** MOCKUP, "Criteria not fully demonstrated": "Transcript 60 shows the file case only."
  The coverage table row: "REQ-06, 6 | 60 (file case only; see below)". The eval plan's T-REQ-06-N6
  does test both forms.
- **resolution:** plan-correction

### R6-007
- **severity:** advisory
- **description:** Eight tests are owned by story 2 and listed under "tests it must turn green",
  although story 1's `usage.js` makes them pass. A story-1 run therefore shows them green outside
  story 1's list. Ownership is single, but the owner is not the story that does the work.
- **basis:** Eval plan section 9, story 2: "Eight of them (the usage rows T-REQ-03-N4 to N7 and
  T-REQ-04-N4 to N7) already pass after story 1 because `usage.js` decides them". TECH-SPEC section 3
  places REQ-03 and REQ-04 with story 2 while `usage.js` is story 1's.
- **resolution:** plan-correction

### R6-008
- **severity:** advisory
- **description:** The pinned command and the exclusion list depend on facts the plan itself marks
  unproven. The freeze would pin a command whose directory handling on Node 22 is unconfirmed, and
  would pin a list whose matching rule is undecided. If the command does not run the 76 rows, none of
  them can be graded.
- **basis:** Eval plan section 11, Q-C: "Whether `node --test eval/tests/` runs a directory argument
  ... on Node 22 must be shown when the tests are written, before the freeze." Q-A: the matching rule
  of `forbidden-in-app.txt` is "`check.mjs`'s to fix". Q-D: the network preload is "the test author's".
- **resolution:** plan-correction

### R6-009
- **severity:** advisory
- **description:** Defaults below the PRACTICES recommendation are decided by the user (Q19), but
  none carries a reason.
  - Type checking is not run.
  - Formatting and lint are not run.
  - Function length and complexity have no enforcing rule (the 50-line and complexity-10 limits are
    held by the fresh reader only).
  - The pinned tool version is a major (Node 22.x), not an exact version.
  - A reason is recorded for audit, secret scan and container lint ("moot").
- **basis:** TECH-SPEC section 13: "Types | no tool — declined as a tool by the user (Q19)"; "Formatting
  and lint | no tool — declined as a tool by the user (Q19)"; "The linter rules that would count them
  ... are not used, because the user declined ESLint (Q19)"; "Pinned version: Node 22.x (installed
  v22.23.2)". PRACTICES section C: "each pinned to an exact version".
- **resolution:** user-decision (for the orchestrator's costed list, with the recommendation
  PRACTICES gives)

### R6-010
- **severity:** advisory
- **description:** Fifteen tests trace to no acceptance bullet: T-REQ-05-P1, T-REQ-06-P1 and the 13
  restraint rows. The plan discloses this and offers to remove them if the user does not accept the
  trace. Coverage of the 60 criteria does not depend on them.
- **basis:** Eval plan section 10: "If the user does not accept these 15 rows as traced, they are the
  ones to remove; the 60 criteria stay covered."
- **resolution:** user-decision

## 7. Verdict

**Counts:** 0 blockers; 10 advisories (3 plan-correction, wait: R6-004, R6-005, R6-006, R6-007 and
R6-008 are plan-correction, which is 5; R6-001, R6-002, R6-003, R6-009 and R6-010 are user-decision,
which is 5; no blueprint-change).

**Costs of the user-decision findings:**

- **R6-001 (O1).** It blocks no test now, because no row verifies concurrent behaviour. If the user
  chooses a guard, the following change: TECH-SPEC section 8 and `store.js`, a PRD line, and new
  rows. Their count cannot be stated until the guard is chosen.
- **R6-002 (P2).** It leaves one outcome unobservable: `add` at the upper limit. No test can be
  written without a PRD criterion. If the user adopts the orchestrator's recommendation (exit 1,
  file unchanged), that costs one PRD criterion, one negative test under REQ-01 and a check in story
  1's `add.js` or `store.js`.
- **R6-003 (P1).** It leaves 14 criteria unconfirmable, across 19 tests in stories 1 and 2, until
  the environment is confirmed at gate 7. Cost of an alternative environment: cannot be stated.
- **R6-009.** It blocks no test. It bears on the conventions step only. Adding any tool changes
  TECH-SPEC section 13 and `eval/conventions/`, and the cost cannot be stated here.
- **R6-010.** It blocks nothing. Removing the rows would leave REQ-05 and REQ-06 without a positive
  test, which breaks coverage rule 1. The alternative is an observable positive criterion in the
  PRD, which is new scope for the user to decide.

**Verdict: No blockers.** The plan may go to the user for acceptance, with the ten advisories listed.
Five of the advisories (R6-001, R6-002, R6-003, R6-009, R6-010) need the user's answer, and R6-001 and
R6-002 are the open points the artifacts already reserve for gate 6. The other five are
`plan-correction` items and add no scope.

Caveat on the "decisions with no decider" check: I judged R6-001 and R6-002 to be open points, not
decisions without a decider. If the orchestrator reads the checker list strictly, they become
blockers of class `user-decision`, and the verdict becomes "Blockers including `user-decision`: stop,
the user decides".
