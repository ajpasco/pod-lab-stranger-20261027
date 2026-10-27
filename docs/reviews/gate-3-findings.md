# Gate 3 findings: tally (PRD r1, MOCKUP r1)

Verdict: not clean. Four blockers and six advisories. Three of the blockers are small PRD corrections. The fourth, G3-01, needs the user's answer to Q15.

## Checker's verdict (docs/orchestrator/rubrics/prd.md), for docs/PRD.md

### Numbering
- REQ-01 to REQ-06 each appear once as a heading, and there are no holes.
- Every bullet under "Acceptance" sits under exactly one REQ.
- Section 6 (NFR-3) carries an "Observable" criterion that sits under no REQ. See G3-03.
- REQ-06 acceptance 6 restates REQ-01 acceptance 10. REQ-05 acceptance 5 and REQ-06 acceptance 1 to 4 overlap in the same way. See G3-08.

### Per requirement

| Req | Traced | Criteria all observable | Role prohibitions present | Input-failure cases present |
|---|---|---|---|---|
| REQ-01 | yes | yes | yes (see G3-09) | yes (missing, empty, whitespace, extra, damaged, unusable) |
| REQ-02 | yes | yes | yes (see G3-09) | yes (extra, damaged, unreadable). Names are not applicable. |
| REQ-03 | yes | yes | yes (see G3-09) | yes |
| REQ-04 | yes | yes | yes (see G3-09) | yes |
| REQ-05 | **no** for acceptance 4 (G3-01); yes for the rest | yes | yes (see G3-09) | yes |
| REQ-06 | yes | yes | yes (see G3-09) | yes |

### Unobservable criteria
- "Damaged tally.json ... not valid JSON or not the expected shape" (section 4, used by every damaged-file criterion). "Expected shape" is never said in business terms, so a second person cannot tell which files must give exit 1. See G3-02.
- No other criterion judged unobservable.

### Technical-choice check
- Exit statuses 0, 1 and 2, stdout, stderr, the file name tally.json and "Unicode value" order are all the user's own decisions (Q1, Q8, Q11). They stay in the criteria.
- None found beyond those.

## Findings

### G3-01 (blocker, user-decision): REQ-05 acceptance 4 traces to nothing the user said, and Q15 is missing from the PRD
- Basis, PRD REQ-05: "`tally Add coffee` (different letter case from `add`) is an unknown command: exits 2 ... (Q8, Q12)".
- Q12 answers whether counter names are case-sensitive. Q8 covers no command or an unknown command. Neither says whether command names are case-sensitive.
- PREPARATION-STATE Q15 is unanswered ("(waiting)"). The orchestrator itself notes the criterion is "inferred".
- The rubric says a drafter that cannot cite an answer for a requirement "must list it under open questions instead".
- PRD section 8 lists only O1. The PRD header and change list cite Q1 to Q14 and never mention Q15.
- MOCKUP Transcript 46 does cite Q15, which the PRD never does.
- Resolution: the user answers Q15. Until then, the criterion is removed from REQ-05 and listed as an open question, with the user as the one it waits on.

### G3-02 (blocker, plan-correction): "expected shape" and "whitespace" are not defined
- Basis, PRD section 4: "Damaged tally.json ... not valid JSON or not the expected shape (Q7)".
- "Expected shape" is not defined anywhere in the PRD.
- Examples a tester cannot settle: a counter with a negative value, a fractional value, a string value, a top-level array, or an empty file.
- Q7 uses the same phrase, but the PRD must state the business meaning. For example: "valid JSON that is a set of names each with a whole-number value".
- This is an undefined term, so the rubric makes it a blocker.
- "Valid name: any non-empty text that contains no whitespace" also leaves "whitespace" undefined.
- Resolution: define both terms in section 4.

### G3-03 (blocker, plan-correction): a criterion sits outside the requirements
- Basis, PRD NFR-3: "Observable: running `tally add coffee` in one directory and `tally list` in a different directory that has no tally.json prints nothing from the second".
- This is an acceptance criterion under no REQ. The rubric treats a criterion left outside the requirements as a blocker.
- MOCKUP Transcript 54 then demonstrates it as a journey of its own.
- Resolution: move the criterion under a REQ (REQ-02 is the natural place), or drop it as an acceptance statement, and update the mockup to match.

### G3-04 (blocker, plan-correction): Q15 and the O1 handling are inconsistent across the two artifacts
- Basis: MOCKUP Transcript 46 is labelled "pending user decision (Q15)", and the mockup coverage table repeats the label.
- The PRD, which the mockup says it mirrors ("claims none the PRD lacks"), carries no such status.
- Gate 3 requires the mockup to claim nothing the PRD lacks.
- The mockup now records an open decision that exists only in PREPARATION-STATE.
- Resolution: this clears when G3-01 is fixed. The PRD lists the question, or the criterion and Transcript 46 go together.

### G3-05 (advisory, plan-correction): the mockup does not demonstrate the unwritable case for reset and remove
- Basis, PRD REQ-03 and REQ-04: "With an unusable tally.json, `tally reset coffee` exits 1 ..." and "Unusable ... cannot be read or cannot be written".
- MOCKUP "Criteria not fully demonstrated": "Transcripts 30 and 41 show only the unreadable variant."
- The gap is disclosed, but gate 3 asks that every journey be demonstrated.

### G3-06 (advisory, user-decision): `tally list` on a readable but unwritable tally.json is unspecified
- Basis, PRD section 4: "Unusable tally.json: tally.json cannot be read or cannot be written at all".
- REQ-02 covers only "an unreadable tally.json".
- Whether `list` fails when the file is readable but not writable is not stated, and Q13 does not answer it.
- This is a missing behaviour. It is a question for the user, not an assumption.

### G3-07 (advisory, plan-correction): the problem statement adds examples that are not the user's
- Basis, PRD section 1: "cups of coffee, runs of a build, occurrences of an event" and "Today they must either keep the number in their head, in a scratch file ... or install and configure a larger tool first".
- Only the quoted phrase is cited to Q1. The rest is invented context.
- The orchestrator noted the same.

### G3-08 (advisory, plan-correction): overlapping criteria
- Basis: REQ-06 acceptance 6 ("With a damaged tally.json, `tally add coffee` (correct usage) exits 1") duplicates REQ-01 acceptance 10.
- REQ-05 acceptance 5 ("With a damaged tally.json, `tally frobnicate` still exits 2") is covered in kind by REQ-06.
- The same case is stated under two requirements.

### G3-09 (advisory, plan-correction): the role has no prohibition criteria of its own
- Basis, PRD section 3: "May not: there are no prohibitions beyond the input-failure cases."
- This is acceptable, because the failure cases are criteria under the REQs. The statement is recorded so the rubric's "prohibitions are stated as criteria" rule is shown to be met by those cases.

### G3-10 (advisory, plan-correction): REQ-06 acceptance 5 states no tally.json outcome
- Basis: "With an unusable tally.json, `tally add a b` exits 2, not 1, prints a message on stderr and nothing on stdout (Q10, Q13, Q14)."
- Every sibling criterion says what tally.json looks like afterwards.
- The mockup (Transcript 52) acknowledges the omission.
- The "Failure" definition covers it by implication.

## Mockup check (ORCHESTRATOR.md, Gate 3)
- Transcripts 1 to 53 map one-to-one to the PRD's acceptance criteria. I checked the numbering of the "acceptance N" citations against the PRD and they match.
- The mockup adds no journey the PRD lacks, except that Transcript 46 carries a status (Q15) the PRD does not. See G3-04.
- The mockup changes no behaviour. Its error wording is a placeholder, and its coverage table matches the transcripts.
- Gaps: G3-05 (unwritable reset and remove), and Transcript 54, which depends on G3-03.
