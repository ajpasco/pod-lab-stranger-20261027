# Gate 7 narrow review: decision G1 applied to TECH-SPEC r7 and eval-plan r4

Inputs read: `docs/TECH-SPEC.md` (revision 7), `docs/eval-plan.md` (revision 4),
`docs/inputs/decisions-2026-10-27.md` (G1), `docs/PRD.md` (revision 4), the review, blueprint and
eval-plan rubrics. Nothing else. Format: `docs/orchestrator/rubrics/review.md`.

## 1. G1 applied faithfully and consistently

Compared against the G1 row of the decisions file, item by item.

- Image digest `node@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d`: the same
  64 hex characters in TECH-SPEC sections 6, 10, 12, 13 and in eval plan section 8. The shortened form in
  the section 13 layout tree (`de170b39...122f38d`) matches. Faithful.
- `node:22-bookworm-slim`, "Node 22.23.4 when proven": same hedge as G1 in both documents. Faithful.
- Every step of `eval/run.sh` inside the container: TECH-SPEC section 6 and the section 13 tree name the
  Node-major check, the conventions step and `node --test eval/tests/*.test.mjs`. Eval plan section 8
  lists the same three, in the same order, "inside the container". The conventions row of eval plan
  section 6 agrees. Faithful.
- Calling user's uid:gid, never root: stated in both documents (TECH-SPEC sections 6, 10, 13; eval plan
  sections 3 and 8). Faithful.
- Repository mounted as the working directory: TECH-SPEC section 6 and section 13 tree; eval plan
  section 8. Faithful.
- Docker required: TECH-SPEC sections 6, 12 and 13; eval plan section 8. Faithful.
- The application still targets Node 22 via `engines`: TECH-SPEC section 6 (`">=22 <23"`, "that is
  unchanged") and section 13. Faithful.
- Lab proof "non-root uid, `chmod 000` read refused, bind-mount read and write work, 2026-10-27":
  quoted the same in TECH-SPEC section 10 and P1 and in eval plan section 3. Faithful.
- P1: TECH-SPEC (P1 row, section 10 last row) says P1 holds wherever the calling user is not root. Eval
  plan section 3 and section 8 say the same, and both say that if the calling user is root the permission
  tests fail with "P1 not met". F3 is kept: the orchestrator still verifies at gate 7. The two
  statements are consistent. The "14 rows" (blueprint) against "19 tests" (eval plan) is a rows-versus-tests
  difference. I counted both and each is right: 14 register rows, 19 tests.

Finding: none found against fidelity. See R-G1-001 (stale wording) below.

## 2. The two documents agree with each other

- How the suite runs: TECH-SPEC sections 4, 6, 12, 13 and eval plan sections 3, 6, 8 give the same
  runner, order, log path, glob form and exit rule. Agreed.
- Revision pointers: the blueprint names the eval plan revision 4 (intro; section 13 "eval plan revision 4
  section 7"). The eval plan names the blueprint revision 7 (header and "Built from"). The eval plan's
  r3 paragraph says revision 6, which is history and correct for r3. The PRD and mockup are named as
  revision 4 in both, and PRD change-list row 4 is the latest. No stale pointer found.
- Open points: the documents do NOT agree. See R-G1-002.

## 3. Nothing else changed

- PRD criteria: I counted the acceptance bullets: 13 + 10 + 13 + 13 + 5 + 6 = 60.
- Register rows: 13 + 10 + 13 + 13 + 5 + 6 = 60, one to one with the PRD.
- Tests: 18 + 12 + 16 + 16 + 7 + 7 = 76. Positive 18, negative 58, integration 61, e2e 2, restraint 13.
- Ownership: story 1 = 18 + 12 + 7 + 7 + 8 usage rows = 52; story 2 = 12 + 12 = 24. Section 9 and
  section 13 agree.
- Permission-dependent tests: 5 + 4 + 4 + 4 + 2 = 19, as stated.
- Requirement IDs created downstream: none; both documents say so and I found none.
- New scope: none. Docker is the user's decision (G1), not an addition by the drafter. The register
  criteria, rows and test rows are unchanged by G1.

Finding: none found.

## Findings

### R-G1-001
- severity: advisory
- resolution: plan-correction
- description: TECH-SPEC section 13 still says there is no container, in a row about tools that are
  declined. Since G1 the suite does run in a container, so the line reads as contradicting section 6. The
  sense is "no container lint, tally ships no container" (section 12 scopes it correctly).
- basis: section 13 table, row "Secret scan, dependency audit, container lint": "none; declined by the user
  (Q19), and moot: no dependencies, no secrets, no container". Compare section 6: "`eval/run.sh` runs
  every step ... inside the container `node@sha256:de17...`".

### R-G1-002
- severity: advisory
- resolution: plan-correction
- description: The documents disagree about open points. The blueprint adds P6 (Docker availability) as
  open and blocking the suite. The eval plan, revised for the same G1, still says nothing is open and
  never mentions P6, though its Commands section now needs Docker and a registry pull. A reader of the
  eval plan alone would believe the commands are runnable as written.
- basis: eval plan section 11: "None." and "so none remains open". Eval plan section 8: "Docker is
  required, and the first run pulls the image". TECH-SPEC section 11, P6: "The inputs do not say whether
  the build environment and the gate runner have Docker, or can pull the image by digest."

### R-G1-003
- severity: advisory
- resolution: user-decision
- description: Check 4. P6 is a genuine open point and not a decision without a decider: it states a fact
  nobody has established, and it names what it blocks. It makes no decision. It does not name who
  establishes the fact or what follows if the answer is no. If the gate runner has no Docker or cannot pull
  the image, G1 cannot be carried out and the user would have to decide again; that is the gap, and no
  alternative is proposed here. I rate it advisory because the plan records it honestly; it becomes a
  blocker at gate 7 if the answer is no.
- basis: TECH-SPEC section 11: "| P6 | G1 makes Docker a requirement of running the suite. ... | the suite
  cannot be run by the build side or the gate until it is confirmed |". G1 states the proof only from the
  lab: "Proven on 2026-10-27: non-root uid, `chmod 000` read refused, bind-mount read and write work."
  Cost if the answer is no: all 76 tests and the conventions step cannot run on the gate runner; every
  register row loses its evidence. If yes: nothing is lost. Cost of confirming it: not stated by the
  inputs; I cannot estimate it.

## What I could not judge

- Whether the digest really names `node:22-bookworm-slim` at Node 22.23.4, or whether a pull by digest
  succeeds. I have no access to the registry and no inputs that prove it; I compared the string only.
- Whether the lab proof was run as stated. I read it only as quoted in G1.
- Whether `eval/run.sh` or the tests exist and behave as the documents say. They are not inputs.

## Verdict

Counts: 0 blockers, 3 advisories (R-G1-001 plan-correction, R-G1-002 plan-correction, R-G1-003
user-decision).

Costed list for the user-decision finding:
- R-G1-003 (P6, Docker availability on the build side and the gate runner): blocks running the suite at
  all, so 76 tests and the conventions step, until confirmed; if unavailable, G1 needs a fresh decision.
  Affects both stories' evidence. No criterion becomes unobservable while the answer is yes. Cost of
  confirming: cannot be stated from the inputs.

**No blockers.** The plan may go to the user for acceptance, with the three advisories listed.
