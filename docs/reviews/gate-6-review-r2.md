# Gate-6 planning review, round 2: tally

Reviewer: a session started for this task. Inputs read: `docs/PRD.md` (revision 4),
`docs/MOCKUP.md`, `docs/TECH-SPEC.md` (revision 5), `docs/eval-plan.md` (revision 2),
`docs/inputs/decisions-2026-10-27.md`, the rubrics `review.md`, `prd.md`, `blueprint.md`,
`eval-plan.md`, and `docs/orchestrator/PRACTICES.md`. Nothing under `docs/reviews/`, no state file
and no implementation was read.

Finding ids are prefixed `G6R2-` so they cannot be confused with earlier reviews.

## What I could not judge

- The Q-numbers (Q1 to Q17) cited by the PRD point to a preparation record that is not an input. I
  could check that each requirement cites an answer. I could not check that the answer says what the
  PRD says it does.
- The blueprint's Q19, Q20 (D1 to D6), Q21 (E1 to E6, S1) are not among my inputs. Following the
  instruction, I took each attribution to the user as the user's. I could not check the wording.
- Whether the grading environment is a non-root POSIX one (P1). The user accepted this as a
  precondition and the orchestrator verifies it at gate 7.
- Whether the preload that observes network attempts (F6 D) works as described. The eval plan leaves
  its details to the test author.

## Findings

### G6R2-001
- severity: advisory
- description: Revision pointers are stale. The mockup, the blueprint and the eval plan name the PRD
  as revision 3 and the eval plan names the blueprint as revision 4. The PRD is now revision 4 and the
  blueprint revision 5. PRD revision 4 changes no requirement, criterion or behaviour, so nothing
  below is wrong because of it. A reader cannot tell from the headers which revision was reviewed.
- basis: MOCKUP: "Mockup of `docs/PRD.md` revision 3". TECH-SPEC: "Built from `docs/PRD.md` revision 3
  and `docs/MOCKUP.md` revision 3". Eval plan: "Built from `docs/PRD.md` revision 3 ... `docs/TECH-SPEC.md`
  revision 4". Against TECH-SPEC title "(revision 5)" and PRD change list row "| 4 | 2026-10-27 |".
- resolution: plan-correction

### G6R2-002
- severity: advisory
- description: The mockup's closing list still treats O1 (simultaneous commands) as an open question.
  PRD revision 4 closed it as a known limitation (section 8) and states that no questions are open.
  The mockup claim does no harm to behaviour, but it contradicts the PRD it mocks up.
- basis: MOCKUP: "**Open question O1** (two commands at the same moment). The PRD has no criterion for
  it". PRD section 9: "None are open. O1 was decided as a known limitation".
- resolution: plan-correction

### G6R2-003
- severity: advisory
- description: The blueprint says story 2 owns all the rows of REQ-03 and REQ-04. The eval plan's
  story table gives eight of them (T-REQ-03-N4 to N7, T-REQ-04-N4 to N7) to story 1, and blueprint
  sections 3, 7 and 9 already say that `usage.js`, a story 1 file, decides them. The test-level
  ownership in the eval plan is internally consistent and gives each test exactly one owner. Only the
  blueprint sentence disagrees with it, so a brief written from the blueprint could assign those eight
  rows to the wrong story.
- basis: TECH-SPEC section 4: "Story 2 owns the rows of REQ-03 and REQ-04". Eval plan section 9, story
  1: "and the eight usage rows T-REQ-03-N4 to N7 and T-REQ-04-N4 to N7, which `usage.js` makes green".
- resolution: plan-correction

### G6R2-004
- severity: advisory
- description: Open point P3 is still listed as open in the blueprint, although the eval plan section
  7 now supplies the content of `forbidden-in-app.txt`. The blueprint's closing sentence says "the rest
  of P3 stays open" without saying what remains. The eval plan reports no open questions.
- basis: TECH-SPEC section 11: "P3 | `eval/conventions/forbidden-in-app.txt` ... is completed by the eval
  plan ... | the conventions step, until the eval plan names them" and "the rest of P3 stays open".
  Eval plan section 7 lists the seven patterns, and section 11: "None."
- resolution: plan-correction

### G6R2-005
- severity: advisory
- description: The mockup does not show the directory case of REQ-06 acc. 6, where an unwritable
  directory is an unwritable tally.json. The PRD makes that case part of "Unwritable tally.json", and
  the eval plan tests it (T-REQ-06-N6 runs U-file and U-dir). The mockup discloses the omission
  openly, so the PRD behaviour is not contradicted. It is one journey the PRD claims that the mockup
  does not demonstrate.
- basis: MOCKUP: "Transcript 60 shows the file case only ... no separate transcript is added for the
  directory case." PRD REQ-06 acc. 6 and the definition "A read-only directory makes tally.json
  unwritable even when tally.json exists".
- resolution: plan-correction

## Check 1: each artifact against its own rubric

### The PRD (rubric `prd.md`, Checker's verdict)

- Numbering: REQ-01 to REQ-06 each appear once, with no holes and one width. Every criterion sits under
  exactly one requirement. Counts are 13, 10, 13, 13, 5 and 6, so 60 criteria. No criterion lies
  outside a requirement. No blocker.
- IDs originate in the PRD only. The blueprint and the eval plan cite them and create none.
- Per requirement:

| Requirement | Traced to a user statement | Criteria observable | Role prohibitions present | Input-failure cases present |
|---|---|---|---|---|
| REQ-01 | yes (Q1, Q4, Q5, Q7, Q9, Q10, Q12, Q13, Q16, Q17) | yes | yes (section 3 states there are none beyond the input failures, which are criteria) | yes: missing, empty, whitespace, extra argument, damaged, unreadable, unwritable |
| REQ-02 | yes | yes | yes | yes: extra argument, damaged, unreadable |
| REQ-03 | yes | yes | yes | yes |
| REQ-04 | yes | yes | yes | yes |
| REQ-05 | yes (Q8, Q14, Q15) | yes | yes | yes: no command, unknown, `--help`, `-h`, wrong case |
| REQ-06 | yes (Q14) | yes | yes | yes |

- Unobservable criteria: none found. "Prints a message on stderr" is observable as a non-empty stderr.
  The eval plan records that the wording is undecided.
- Undefined terms: none found. "Whitespace" is defined as "whitespace characters" with the exact set
  deferred to the blueprint. I judged this defined, because the blueprint (section 7, D1a) fixes the
  set, which is the route `prd.md` names for a technical fact the user decided. The eval plan records
  it under "Untestable as written".
- Technical choices in criteria: none found. Exit statuses and the file name `tally.json` are the
  user's own words (Q1, Q8, Q13).
- Change list: revision 4 quotes the user's words. No requirement was touched.
- Verdict: no blockers.

### The mockup (judged by: demonstrates every journey the PRD claims and no others)

- All 60 criteria map to transcripts through the coverage table (60 transcripts). No transcript shows
  a journey the PRD does not claim. The omissions are disclosed in "Criteria not fully demonstrated".
- Defects: G6R2-002 (stale open-question note), G6R2-005 (REQ-06 acc. 6 directory case not shown),
  G6R2-001 (revision pointer). All advisory.

### The blueprint (rubric `blueprint.md`, Checker's verdict)

- Any requirement ID originating in the blueprint: no. It cites the PRD's IDs only.
- Requirements placed exactly once: all six. Exceptions: none.
- Criteria with no register row: none found. The register has 60 rows, which match the 60 criteria one
  to one.
- Register rows whose evidence is an agent's claim: none found. Every row's evidence is the row's result
  line in `eval/report/eval.log`. The user chose that path (F6 B). There is no human-review row, so no
  pre-review is owed.
- Requirements accepting input with no failure behaviour: none found (section 5 covers command,
  arguments, file contents and the write).
- Shared objects with no concurrency answer: none found (section 8, known limitation F1).
- Decisions with no decider: none found. No decision cites a clause and also records a question.
- PRACTICES section A concerns with no line in section 12: none found. All 8 security, 8 reliability, 4
  observability and 6 delivery concerns have their own line.
- Concerns the stack brings beyond section A with no line: none found (exit status and streams, file
  mode, symbolic link, platform, interrupts, client).
- Section B conventions with no tool, version or configuration file: none found. Where a tool is
  declined (types, formatting and lint, naming, comments, commits, function length and complexity), the
  row says so, names the user's decision (Q19) and the reason (F4), and assigns the rule to the fresh
  reader.
- Section B practices neither made concrete nor declined with a reason: none found. Layering, Layout,
  Errors, Logging, Configuration, Dependencies, Types, Formatting and lint, the builder's own tests,
  Naming, Comments, Commits and The client all appear.
- Layout tree and size limits: both present (section 13: 300 lines per file, 50 per function,
  complexity 10).
- Open points: P1 is an accepted precondition (F3) and P3 is stale (G6R2-004).
- Production-readiness defaults below the PRACTICES recommendation: no lock, no logs, no lockfile or
  audit, no `fsync`, no schema version, and no type checker, linter or formatter. Each carries a
  recorded reason and a decider (the user: F1, F4, Q19, Q20 D4). Nothing is left to report as a new
  costed decision.
- Technical choices recorded in the blueprint, not verified as the thing under test: none found.
- Verdict: no blockers. Advisories G6R2-001, G6R2-003 and G6R2-004.

### The eval plan and stories (rubric `eval-plan.md`, Checker's verdict)

I recounted the plan and it agrees with itself.

- Counts: 76 tests. Per requirement they are 18, 12, 16, 16, 7 and 7. By polarity they are 18 positive
  and 58 negative. By kind they are 61 integration, 2 e2e and 13 restraint. Story 1 owns 52 and story 2
  owns 24. 19 tests depend on permissions, and I counted them again.
- Requirements missing a P or an N test: none.
- Tests with no or an unknown requirement: none.
- Criteria absent from both the tests and the gaps: none. Section 12 maps all 60.
- Register rows with no test: none.
- Criteria whose only evidence is in-process rows: none. Every row runs the application as a child
  process and imports nothing from `app/`.
- Tests with no owner story, or no state-before-the-build value: none.
- Overlapping story scope: none. Story 1 owns the shared files, `usage.js`, `add.js`, `list.js` and its
  own named tests. Story 2 owns `reset.js`, `remove.js` and its own named tests.
- Tests depending on a later story's files: none found. See check 3.
- Gaps and untestable sections: both exist (section 10).
- The conventions step sits under its own heading (section 6) as a non-row. It names the tool, the
  pinned version, the configuration and the blueprint section that binds it.
- Restraint rows exist per surface: nothing stored, no network, text from data is never a control, and a
  refused command stores nothing.
- No row names a status code, a table shape, a log format or a module as its subject. The rows that
  rest on blueprint-level user decisions (D3, D9, D10 as damaged states) are disclosed in section 4 and
  in the register.
- Verdict: no blockers.

## Check 2: across artifacts

- PRD criteria to the blueprint register: 60 criteria, 60 rows. None missing.
- Register rows to eval-plan tests: 60 rows, each mapped by section 12. None missing.
- The blueprint's story shape against the eval plan's story table: the file lists match. The row-level
  ownership statement differs (G6R2-003).
- The mockup against the PRD's journeys: no extra journey. One claimed case is not shown (G6R2-005).

## Check 3: sequencing

None found.

- The eval plan's mechanism for the gap between stories is sound. Rule G makes every exit-1 row fail
  honestly when the program or module is absent. Rule X makes the exit-2 rows fail honestly before the
  build.
- No story 1 row runs `reset` or `remove` to its end (T-REQ-02-P3 starts from a file holding `coffee` 0,
  and the usage rows stop in `usage.js`). Story 2 rows use only story 1's `add` and `list`.
- The combined rows T-REQ-03-P2 and T-REQ-04-P2 (e2e) sit in story 2, after the commands they chain.
- No eval needs a file that a later story creates.

## Check 4: ownership

None found. Each of the 76 tests has one owner story. The stories' file scopes share no file, and
neither owns anything under `eval/`, `docs/` or `.github/`.

## Verdict

Counts by severity: 0 blockers, 5 advisories (G6R2-001 to G6R2-005). There are no `user-decision` or
`blueprint-change` findings, so there is no costed decision list to give. All five advisories are
`plan-correction`. They fix stale text and add no scope.

**No blockers.** The plan may go to the user for acceptance, with the advisories listed.
