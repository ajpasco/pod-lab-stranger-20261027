# Gate 3 findings, round 2: tally (PRD r2, MOCKUP r2)

Verdict: no blockers. Two advisories. G3-01 to G3-08 and G3-10 are closed. G3-09 is not applicable.

## Checker's verdict (docs/orchestrator/rubrics/prd.md), for docs/PRD.md

### Numbering
- REQ-01 to REQ-06 each appear once as a heading, and there are no holes.
- Every Acceptance bullet sits under exactly one REQ. I counted 12, 10, 12, 12, 5 and 6 bullets for REQ-01 to REQ-06. These match the mockup coverage table row for row.
- No criterion sits outside the requirements. Section 6 now holds NFR-1 to NFR-4 only, with no "Observable" line.
- Result: clean.

### Per requirement

| Req | Traced | Criteria all observable | Role prohibitions present | Input-failure cases present |
|---|---|---|---|---|
| REQ-01 | yes (Q1, Q4, Q5, Q7, Q9, Q10, Q12, Q13, Q16) | yes | yes, as the failure criteria (see G3-09) | yes: missing, empty, whitespace, extra, damaged, unreadable, unwritable |
| REQ-02 | yes (Q1, Q3, Q6, Q7, Q10, Q11, Q13, Q16) | yes | yes | yes: extra, damaged, unreadable. Names do not apply. |
| REQ-03 | yes | yes | yes | yes |
| REQ-04 | yes | yes | yes | yes |
| REQ-05 | yes (Q8, Q15 for acceptance 4, Q14) | yes | yes | yes |
| REQ-06 | yes (Q14, with Q10, Q13, Q16) | yes | yes | yes |

### Unobservable criteria
- None judged unobservable.
- Two edge cases inside the "damaged" and "unwritable" definitions are not settled. See R2-01 and R2-02. Both are advisory, because every stated criterion can be checked.

### Technical-choice check
- Exit statuses 0, 1 and 2, stdout and stderr, the file name tally.json, JSON and Unicode-value order are all the user's own decisions (Q1, Q8, Q11). Each is cited, so they may stay in the criteria.
- The layout and the whitespace character set are explicitly left to the blueprint.
- None found beyond those.

### Undefined terms
- None found. "Whitespace" is defined by the ordinary word, with the exact set deferred to the blueprint and a space used as the example. That is acceptable.

## Findings

### R2-01 (advisory, user-decision): an existing, writable tally.json inside a read-only directory is unspecified for `add`, `reset` and `remove`
- Basis, PRD section 4: "Unwritable tally.json: tally cannot write tally.json, because the file (or, when the file does not exist, the directory) does not allow it".
- Basis, PRD REQ-02 acceptance 7: "a read-only file or directory" for `list`.
- Basis, Q13: "(e.g. no permission, read-only directory) ... same as a damaged file".
- If the file allows writing but its directory does not, the definition does not count the directory, because the file exists. Q13 names a read-only directory as a failure case. Whether `add coffee` then succeeds or exits 1 is therefore not decided. No transcript or criterion covers it. The mockup (Transcript 18) shows only `list` for this setup.
- Resolution: the user states what happens, or accepts that the blueprint decides it.

### R2-02 (advisory, plan-correction): "whole-number value" and "named counters" leave a hand-edited file undecided
- Basis, PRD section 4: "valid JSON that does not hold named counters each with a whole-number value".
- A stored value of -2 may or may not be a whole number. A stored name that is empty or contains a space may or may not be a "named counter". Nothing in the PRD settles these, and no `add`, `reset` or `remove` can produce them.
- This is the residue of G3-02. The main defect, the undefined "expected shape", is fixed. The edge cases do not stop any stated criterion from being checked.
- Resolution: either say in one line whether negative values and non-name keys count as damaged, or leave them to the blueprint and say so in the definition.

## Mockup check (ORCHESTRATOR.md, Gate 3)
- Every journey is demonstrated. Transcripts 1 to 57 map to the PRD's 57 acceptance bullets. The "acceptance N" numbers match the PRD. The coverage table is complete, and where two transcripts split a criterion (12, REQ-02 7 and REQ-05 3) both are labelled.
- It claims no journey the PRD lacks. Transcript 18 is the directory half of REQ-02 acceptance 7. Transcript 50 cites Q15, which the PRD now cites as well. The earlier pending-decision label is gone.
- It changes no behaviour. Error wording is a placeholder. The "Criteria not fully demonstrated" section discloses the open points honestly, including that Transcripts 17 and 18 show nothing on stderr. The PRD says only "as it would otherwise". This is a disclosed reading, not a new claim.
- The mockup is clean.

## Status of the earlier findings

| ID | Status | Basis |
|---|---|---|
| G3-01 | closed | Q15 is recorded and cited. PRD definitions (Command, Unknown command) and REQ-05 acceptance 4 cite "(Q8, Q15)". The change list quotes the user's words. |
| G3-02 | closed, with residue R2-02 | "Damaged" is defined observably: not valid JSON, or valid JSON without named counters with whole-number values. "Whitespace" is defined and the exact set is deferred to the blueprint. The negative-value and key-name edge cases remain as R2-02. |
| G3-03 | closed | Section 6 holds no "Observable" line. The mockup has no old Transcript 54 journey. Directory independence is covered by REQ-02 acceptance 5 (Transcript 16). |
| G3-04 | closed | Q15 is in the PRD. The mockup no longer carries a pending label and labels Transcript 50 "decided". |
| G3-05 | closed | Transcripts 33 and 45 show unwritable `reset` and `remove`. The mockup explains why a directory-only variant adds nothing for those two commands: with no file they exit 1 as "no such counter". That follows from the PRD definition. |
| G3-06 | closed | Q16 is answered and recorded. "Unreadable" and "Unwritable" are split. REQ-02 acceptance 7 is added and shown in Transcripts 17 and 18. Related edge: R2-01. |
| G3-07 | closed | Section 1 is reduced to a quotation from Q1. The invented examples are gone. |
| G3-08 | closed | The REQ-06 duplicate of REQ-01 acceptance 10 is removed. REQ-05 acceptance 5 is kept, with the reason given in the change list: REQ-06 has no unknown-command criterion. |
| G3-09 | not applicable | It was a record, not a defect. The role prohibitions are still stated as the failure criteria under REQ-01 to REQ-06. |
| G3-10 | closed | REQ-06 acceptance 5 now says "and tally.json is as it was". Acceptance 6 does the same. |
