# Gate 3 findings, round 3: tally (PRD r3, MOCKUP r3)

Verdict: no blockers. One new advisory (R3-01). R2-01 is closed. R2-02 is carried to gate 4 (advisory).

## Checker's verdict (docs/orchestrator/rubrics/prd.md), for docs/PRD.md

### Numbering
- REQ-01 to REQ-06 each appear once as a heading. The sequence has no holes.
- Every Acceptance bullet sits under exactly one REQ. I counted the bullets myself: REQ-01 13, REQ-02 10, REQ-03 13, REQ-04 13, REQ-05 5, REQ-06 6 (60 in all). The mockup coverage table has the same count per requirement.
- No criterion sits outside the requirements. Section 6 holds NFR-1 to NFR-4 only.
- Result: clean.

### Per requirement

| Req | Traced | Criteria all observable | Role prohibitions present | Input-failure cases present |
|---|---|---|---|---|
| REQ-01 | yes (Q1, Q4, Q5, Q7, Q9, Q10, Q12, Q13, Q16, Q17) | yes | yes, as the failure criteria. Section 3 says there are no other prohibitions. | yes: missing, empty, whitespace, extra, damaged, unreadable, unwritable (file, absent-file directory, existing-file directory) |
| REQ-02 | yes (Q1, Q3, Q6, Q7, Q10, Q11, Q12, Q13, Q16, Q17) | yes | yes | yes: extra, damaged, unreadable. Names do not apply to `list`. |
| REQ-03 | yes (Q1, Q4, Q5, Q7, Q9, Q10, Q12, Q13, Q16, Q17) | yes | yes | yes |
| REQ-04 | yes (same set as REQ-03) | yes | yes | yes |
| REQ-05 | yes (Q8, Q14, Q15) | yes | yes | yes: none, unknown, `--help`/`-h`, case |
| REQ-06 | yes (Q14, with Q10, Q13, Q16, Q17) | yes | yes | yes |

### Unobservable criteria
- None judged unobservable. R2-02 (carried below) concerns a definition edge, not a stated criterion.

### Technical-choice check
- Exit statuses, stdout and stderr, the file name tally.json, JSON and Unicode-value order are the user's own decisions (Q1, Q8, Q11). Each is cited. The layout and the whitespace character set are deferred to the blueprint in the definitions.
- None found beyond those.

### Undefined terms
- None found. "Extra arguments", "Valid name", "Missing name", "Unreadable", "Unwritable" and "Sorted by name" are defined in section 4.

### Trace check against the recorded answers
- Each cited Q matches the recorded answer. Q15, Q16 and Q17 are quoted in the change list in the user's words. They match the PREPARATION-STATE text.
- None found of a requirement or criterion with no trace.

## Findings

### R3-01 (advisory, plan-correction): the mockup does not show the directory case of REQ-06 acceptance 6
- Basis, PRD section 4: "A read-only directory makes tally.json unwritable even when tally.json exists and the file itself allows writing". REQ-06 acceptance 6: "With an unwritable tally.json, `tally add a b` exits 2, not 1 ...".
- Basis, MOCKUP "Criteria not fully demonstrated": "Transcript 60 shows the file case only. The PRD gives one outcome for every unwritable case, and no separate transcript is added for the directory case." The coverage table reads "60 (file case only; see below)".
- Under PRD r3 the criterion covers the directory case. The mockup shows REQ-01 acceptance 12 and REQ-02 acceptance 7 split into file and directory transcripts, but not this one. The gate rule is that the mockup demonstrates every journey the PRD claims. The omission is disclosed and no behaviour is altered or invented, so this is advisory only.
- Resolution: add a transcript for the directory case, or leave the disclosure as it stands. Either is a mockup-only change.

### R2-02 (advisory, plan-correction): carried
- See the status table below.

## Mockup check (ORCHESTRATOR.md, Gate 3)
- Every journey is demonstrated, with the one disclosed exception in R3-01. Transcripts 1 to 60 map to the 60 PRD bullets. The "acceptance N" numbers match the PRD's bullet order: REQ-01 13 (12 split into 12 and 13), REQ-02 7 (split into 18 and 19), REQ-03 13 and REQ-04 13 (new directory transcripts 35 and 48), REQ-05 and REQ-06 unchanged.
- It claims no journey the PRD lacks. Transcripts 14, 19, 35 and 48 are the Q17 cases that PRD r3 now states. Transcript 13 is the absent-file directory case of REQ-01 acceptance 12.
- It changes no behaviour. Error wording is a placeholder. The cross-reference in Transcript 19 ("Transcripts 14, 35 and 48") is correct.
- Result: clean apart from R3-01.

## Status of the earlier findings

| ID | Status | Basis |
|---|---|---|
| R2-01 | closed | PRD section 4 "Unwritable tally.json" now says "A read-only directory makes tally.json unwritable even when tally.json exists and the file itself allows writing" and cites Q13, Q16, Q17. Q17 is recorded as the user's answer. REQ-01 acceptance 13, REQ-03 acceptance 13 and REQ-04 acceptance 13 each state the case: exit 1, a message on stderr, nothing on stdout, and tally.json unchanged. REQ-01, 03 and 04 file-case criteria are narrowed so each covers one case. REQ-02 acceptance 7 keeps `list` succeeding. The mockup shows it in Transcripts 14, 19, 35 and 48. The only residue is the mockup gap in R3-01. |
| R2-02 | carried (still open, advisory) | PRD section 4 "Damaged tally.json" is unchanged: "valid JSON that does not hold named counters each with a whole-number value". It still does not say whether a stored negative value, or a stored name that is empty or has whitespace, is damaged. The definition does say the layout is a technical choice for the blueprint. The change list says R2-02 "is carried to the blueprint", and PREPARATION-STATE records it as carried to gate 4. It does not block any stated criterion. The gate-4 blueprint must settle it, citing Q4 and Q7, and return to the user if a product rule is needed. |
