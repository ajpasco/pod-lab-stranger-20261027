# Gate-6 planning review, round 3: tally (narrow check)

Reviewer: a session started for this task. Inputs read: `docs/PRD.md` (revision 4), `docs/MOCKUP.md`
(revision 4), `docs/TECH-SPEC.md` (revision 6), `docs/eval-plan.md` (revision 3),
`docs/inputs/decisions-2026-10-27.md`, `docs/reviews/gate-6-review-r2.md` (findings only), and the
rubric `docs/orchestrator/rubrics/review.md`. No implementation and no state file was read. Finding ids
are prefixed `G6R3-`.

## What I could not judge

- The Q-numbers (Q1 to Q21) cited by the documents point to a preparation record that is not an input.
  I took each attribution to the user as the user's.
- Whether the grading environment meets P1 (non-root POSIX). That is the orchestrator's check at gate 7.
- This was a narrow check. I did not redo the per-rubric reviews (`prd.md`, `blueprint.md`,
  `eval-plan.md`) beyond the counts and cross-document checks below.

## Findings

### G6R3-001
- severity: advisory
- description: The blueprint still names the eval plan as "revision 2", but the eval plan is now
  revision 3. What the blueprint says about revision 2 is still true, because revision 3 changed no
  row, count, story or section 7 content. A reader cannot tell from the pointer that section 7 is
  unchanged in the current revision. This is the same kind of stale pointer as G6R2-001, in one place
  the fix missed.
- basis: TECH-SPEC section 11: "by the eval plan revision 2 section 7"; section 13, row Forbidden
  references: "contents per the eval plan revision 2 section 7"; header: "as the eval plan (revision 2)
  has them". Against eval plan: "**Revision 3.**" and "None of those revisions changed a requirement, a
  criterion, a register row or a story's file ownership."
- resolution: plan-correction

### G6R3-002 (carried, expected)
- severity: advisory
- description: G6R2-005 remains as the disclosed mockup gap: REQ-06 acc. 6, directory case, has no
  transcript of its own. The PRD behaviour is not contradicted, and the eval plan tests both cases.
- basis: MOCKUP: "Transcript 60 shows the file case only. The PRD gives one outcome for every unwritable
  case, and no separate transcript is added for the directory case." Eval plan T-REQ-06-N6: "U-file and
  U-dir ... each exits 2".
- resolution: plan-correction (accepted gap; no action needed)

## Check 1: closure of G6R2-001 to G6R2-005

- **G6R2-001 (stale revision pointers): closed**, except the one leftover in G6R3-001.
  - MOCKUP: "Mockup of `docs/PRD.md` revision 4"; title "(revision 4)".
  - TECH-SPEC: "Built from `docs/PRD.md` revision 4 and `docs/MOCKUP.md` revision 4"; title "(revision 6)".
  - Eval plan: "Built from `docs/PRD.md` revision 4 ... `docs/TECH-SPEC.md` revision 6 ... and
    `docs/MOCKUP.md` revision 4".
  - Against PRD change list row "| 4 | 2026-10-27 |".
- **G6R2-002 (mockup treats O1 as open): closed.** MOCKUP: "**Known limitation O1** (two commands at the
  same moment). The user decided it is a known limitation (Decisions 2026-10-27, F1; PRD section 8). It
  is not an open question." PRD section 9: "None are open."
- **G6R2-003 (blueprint says story 2 owns all of REQ-03 and REQ-04 rows): closed.** TECH-SPEC section 4:
  "story 1 owns the rows of REQ-01, REQ-02, REQ-05 and REQ-06, and the usage-error rows of REQ-03 and
  REQ-04 (acc. 6 to 9 of each ...). ... Story 2 owns the other rows of REQ-03 and REQ-04 (acc. 1 to 5 and
  10 to 13 of each)". Section 3 and section 9 say the same. This matches eval plan section 9.
- **G6R2-004 (P3 stale): closed.** TECH-SPEC section 11: "Closed in revision 6: P3 ... by the eval plan
  revision 2 section 7, which supplies the content, and by the user (Decisions 2026-10-27, F6(A))";
  section 13: "P3 of section 11 is closed". Eval plan section 7: "Blueprint open point P3 is closed by this
  section". The phrase "the rest of P3 stays open" is gone.
- **G6R2-005 (mockup gap): remains, as disclosed** (G6R3-002).

## Check 2: agreement across the four documents

- Revision references: agree (see G6R2-001 above), apart from G6R3-001.
- O1 and P2 as known limitations: PRD section 8 states both (F1, F2) and section 9 says none are open.
  The mockup treats O1 as a known limitation. TECH-SPEC section 8, section 10 and section 11 (L2) treat O1
  and P2 as closed. Eval plan sections 10 and 11 say "O1 and P2 are known limitations ... so none remains
  open". No document lists either as open.
- Story ownership, recounted from the eval plan tables:
  - Story 1: REQ-01 has P1 to P5 and N1 to N13 (18); REQ-02 has P1 to P7 and N1 to N5 (12); REQ-05 has P1
    and N1 to N6 (7); REQ-06 has P1 and N1 to N6 (7). That is 44. Add T-REQ-03-N4 to N7 and
    T-REQ-04-N4 to N7 (8). Total **52**.
  - Story 2: REQ-03 has P1, P2, N1 to N3 and N8 to N14 (12); REQ-04 the same (12). Total **24**.
  - 52 + 24 = **76**. Section 13 per-requirement totals 18, 12, 16, 16, 7, 7 also give 76.
  - The blueprint (sections 3, 4, 9) and the eval plan (sections 5, 9, 13) agree on this split.
- Other counts re-checked: 18 positive and 58 negative; 13 restraint rows, 2 e2e, 61 integration; 19
  permission-dependent tests (5 + 4 + 4 + 4 + 2). All agree with section 13.
- P3: closed in the blueprint and in the eval plan. None found open.

## Check 3: nothing broken

- 60 PRD criteria: REQ-01 13, REQ-02 10, REQ-03 13, REQ-04 13, REQ-05 5, REQ-06 6. Total 60.
- 60 register rows: the same counts, one to one with the criteria. No row text changed.
- Every criterion has a test: eval plan section 12 maps all 60. Nothing is missing.
- Mockup: 60 transcripts, 60 rows in the coverage table. It shows no journey the PRD lacks.
- Story file scopes are disjoint. Story 1 has the shared files, `add.js`, `list.js` and its named tests.
  Story 2 has `reset.js`, `remove.js` and `reset*.test.js` and `remove*.test.js`. Neither owns anything
  under `eval/`, `docs/` or `.github/`.
- No test depends on a later story's files. The eight usage rows owned by story 1 are Rule X rows that
  stop in `usage.js` with exit 2. T-REQ-02-P3 starts from a file holding `coffee` at 0. Story 2 rows use
  only `add` and `list`.
- Every test has exactly one owner story. This is unchanged.
- No requirement ID was created downstream. The blueprint states "The blueprint creates no requirement
  ID" and the eval plan "creates no requirement ID". The PRD's change list for revision 4 records "no
  requirement, criterion or ID changes".

## Verdict

Counts by severity: 0 blockers, 2 advisories (G6R3-001 and the expected G6R3-002). Both are
`plan-correction`. There are no `user-decision` or `blueprint-change` findings, so there is no costed
decision list to give. G6R2-001 to G6R2-004 are closed, and G6R2-005 remains only as the disclosed mockup
gap. G6R3-001 is a leftover pointer and adds no scope.

**No blockers.** The plan may go to the user for acceptance, with the advisories listed.
