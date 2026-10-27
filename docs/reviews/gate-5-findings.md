# Gate 5 findings: eval plan and stories (tally, eval-plan revision 1)

Reviewed: `docs/eval-plan.md` r1 against `docs/orchestrator/rubrics/eval-plan.md`, ORCHESTRATOR Gate 5,
PRD r3 and TECH-SPEC r4. I counted the PRD bullets myself: REQ-01 13, REQ-02 10, REQ-03 13, REQ-04 13,
REQ-05 5, REQ-06 6, which is 60. The register has 60 rows. The plan has 76 tests, and I re-added every
count in section 13: 18 P, 58 N, 61 integration, 2 e2e, 13 restraint, 44 + 32 by story, 19 permission tests.

Verdict: no blockers. The plan satisfies the rubric and Gate 5. Seven advisories follow.

## Checker's verdict (rubric)

- Requirements missing a P or an N test: none found. Every requirement has both; REQ-05 P1 and REQ-06 P1 are derived (see G5-06).
- Tests with no or an unknown requirement: none found. Every ID is T-REQ-0n-..., and the plan mints no ID.
- Criteria absent from both the tests and the gaps: none found. I checked the section 12 map bullet by bullet against the PRD. REQ-01 acc. 12 is covered by N7 and N8; REQ-02 acc. 6 and 7 by P6 and P7.
- Register rows with no test: none found. All 60 rows map one to one.
- Criteria whose only evidence is in-process rows: none found. Every row is a child-process run, and no test imports `app/`.
- Tests with no owner story: none found.
- Tests with no state-before-the-build value: none found. Every row has a `fails:` value, and no row has `passes:` or `cannot run:`.
- Overlapping story scope: none found. The file lists are disjoint, and story 2's test names `reset*` and `remove*` do not collide with story 1's.
- Tests depending on a later story's files: none found. REQ-02-P3 starts from coffee 0. REQ-06-N2 and N3 stop in the usage check. Story 2 uses story 1's `add` and `list`.
- Gaps and untestable sections: both exist (section 10).

## Gate 5 checklist

- P and N per requirement, IDs inherited: pass.
- ID, Given/When/Then, kind, owner story and state before the build on every row: pass.
- Restraint rows exist (13): pass.
- Business outcomes only: pass (see Q1 below).
- Stories ordered with disjoint scope: pass.
- Gaps recorded and no ambiguity resolved by invention: mostly pass (see G5-02).

## Explicit questions

**Q1. Does any "Then" assert a technical choice?** None found in any Given/When/Then.
- Exit codes 1 and 2, silence, "stderr non-empty" and the file bytes are all PRD outcomes. Wording is expressly not asserted.
- Rows observe state through `tally list`, never through the layout of `tally.json`.
- Names of `app/` parts appear only in the State column (`usage.js decides`, `reset module absent`). That is a diagnosis, not an assertion. The one `app/` path in the plan is the entry command in section 1.
- Two Then clauses go beyond the PRD's wording but come from the register: the trailing line feed (G5-02) and the silence of `add Coffee` and `add -x` (G5-03).

**Q2. Can a failure-expecting row pass vacuously?** None found.
- Every row expecting exit 1 carries a guard: G add, G list, G reset or G remove. I checked all of them. These include T-REQ-06-P1 (G list and G add), the restraint rows, and the REQ-03 and REQ-04 N14 rows.
- Each guard requires exit 0 and a readback in a clean directory, with the same command word as the test. Neither a missing program nor an absent reset or remove module can satisfy it.
- Every row expecting exit 2 (Rule X) fails before the build, because node and a missing module both exit 1.
- Between story 1 and story 2, the reset and remove rows that expect exit 1 fail on the guard.
- The eight story 2 usage rows (T-REQ-03-N4 to N7, T-REQ-04-N4 to N7) pass after story 1 because they expect a real exit 2. The plan records this honestly in the State column, in section 9 and in section 13, and TECH-SPEC section 7 agrees. Not a defect.
- The State text is inexact for two rows (G5-01), but neither can pass vacuously.

**Q3. Tests tracing to something that is not an acceptance bullet** (basis the plan gives): see G5-06 and G5-07.

## Findings

### G5-01 (advisory, plan-correction): State before the build is inexact for T-REQ-03-N14 and T-REQ-04-N14

Basis: the rows say "fails: node exit 1 at the `add` setup. After story 1: fails, `reset` exits 1 with a
`tally: ...` line". Section 2 says "A guarded row runs the guard first and the scenario second", and
both rows carry [G reset] / [G remove].
- The guard runs first. It uses a fixture file, not `add`, so the real failure before the build is `GUARD reset not implemented (exit 1)`.
- After story 1 it is the same guard failure, not a failure of the scenario itself.
- The rows still fail, so there is no vacuous pass. But the freeze reads this field, and it should match what the log will print.

### G5-02 (advisory, user-decision): a trailing line feed on `list` output is asserted but the PRD does not state it

Basis: T-REQ-02-P1 says stdout "ending in a line feed". Guard G list says "stdout is exactly `probe 1` and a line feed". Section 10 "Untestable" says "The PRD does not say whether the last line ends in a line feed. The tests follow the register."
- The assertion comes from the accepted register, not from the PRD.
- Every `list` readback, and so many rows, inherits it.
- A builder that prints no final line feed fails nearly all of story 1 on a point the PRD leaves open.
- The plan records the gap openly, so this is not hidden. The user should confirm the register's choice or state it in the PRD.

### G5-03 (advisory, plan-correction): T-REQ-01-N13 asserts silence in cases the PRD does not state as silent

Basis: N13 says "every successful run exits 0 with stdout and stderr both exactly empty", including `Coffee` beside `coffee` and `-x`.
- PRD REQ-01 acc. 4 and 5 say only "exits 0".
- Silence is stated in acc. 1 to 3.
- The plan traces N13 to "nothing else". It is consistent with acc. 1 to 3 and with TECH-SPEC section 7 ("`add` ... write nothing to stdout"), but it is one of the traced-by-inference rows (G5-06).

### G5-04 (advisory, plan-correction): the pinned test command is not yet shown to work on Node 22

Basis: section 8 pins `node --test eval/tests/`. Section 11 Q-C says "Whether `node --test eval/tests/` runs a directory argument and ignores non-test helper files as intended on Node 22 must be shown when the tests are written, before the freeze."
- From memory (I could not run it), Node 21 and later treat arguments as glob patterns and may not recurse into a directory path.
- The rubric says the commands are what the freeze pins.
- An unverified pinned command is a freeze risk. Resolve Q-C before the freeze, or pin a command known to work, such as a glob.

### G5-05 (advisory, plan-correction): open questions Q-A, Q-B and Q-D leave frozen mechanics unfixed

Basis, quoted from the plan:
- Q-A: "The format of `forbidden-in-app.txt` lines ... is `check.mjs`'s to fix".
- Q-B: "the ignore rule lives outside this file".
- Q-D: the network observation details "are the test author's".

These are all eval-side details and none change a row's outcome. Two of them are worth tightening:
- Section 7 lists `eval.log` and `--test-reporter` as forbidden text without a fixed matching rule.
- Section 3 puts the P1 check "before anything else", but Rule G runs the guard first and the "fails:" values say GUARD. In a root environment the permission rows would report `P1 not met` instead. Section 3 should say which comes first.

### G5-06 (advisory, user-decision): two P tests have no acceptance bullet

Basis, as the plan states it in section 10:
- T-REQ-05-P1, from the PRD definition of "Unknown command".
- T-REQ-06-P1, from the Flow of REQ-06.

These satisfy rubric coverage rule 1, which requires a P test per requirement. Their basis is a cited PRD clause, so this is not a blocker. The plan itself offers them for removal if the user does not accept the trace.

### G5-07 (advisory, user-decision): 13 restraint rows have no acceptance bullet; the network rows rest on NFR-4 wording that does not say "no network"

Basis, per the plan's section 10: the rows are T-REQ-01-N10 to N13, T-REQ-02-N4 and N5, T-REQ-03-N12 to N14, T-REQ-04-N12 to N14 and T-REQ-05-N6. The plan traces them to "the PRD's 'nothing else' (sections 2 and 7), to the definition of 'Failure' ... and to NFR-4 (no server)".
- Gate 5 requires restraint tests, including "no unexpected network calls and no unexpected stored data".
- The four network rows are T-REQ-01-N11, T-REQ-02-N5, T-REQ-03-N13 and T-REQ-04-N13. NFR-4 says no web, database or server, which does not literally forbid an outbound call.
- Several rows go beyond the acceptance bullets:
  - Name-as-data cases (`../x`, `__proto__`, `constructor`, `a/b`, `$HOME`, `*`, and `toString` for reset and remove) are derived from PRD "Valid name" and "no such counter", with the "name is data" rule coming from TECH-SPEC section 5.
  - The damaged states D3 (byte-order mark), D9 (negative) and D10 (above 9007199254740991) come from the user decisions Q20 D1c and Q21 E2, as recorded in TECH-SPEC section 7. The register covers them through "each shape defined as damaged".
- The plan states these bases and offers the 15 rows for removal if the user does not accept them. Report them to the user as the scope the plan added.

## Conventions step

Clean. Section 6 names the tool (Node 22.x running `check.mjs`), the pinned version (v22.23.2), the configuration (none read from `app/`; constants in `check.mjs`; `forbidden-in-app.txt`) and the TECH-SPEC section 13 rows that bind it. It has no test ID or Given/When/Then. It states that it runs clean on an empty `app/` and that the introducing pull request shows the run.

## Sections found clean

Coverage in both directions, counts, story scope and ordering, ownership of every test, state between stories (consistent with TECH-SPEC section 7), the gaps and untestable sections, and the conventions step: none found.
