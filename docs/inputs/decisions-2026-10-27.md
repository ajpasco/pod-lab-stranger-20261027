# Decisions: tally, gate 6, 2026-10-27

The user's answers to the gate-6 costed decision list (question Q22 in `docs/PREPARATION-STATE.md`),
built from the planning review `docs/reviews/gate-6-review.md`. Each answer is numbered and is a cited
source of scope on the same footing as the confirmed scope. Decider for every item: **the user**.

The user's reply, verbatim: "Accept all. F1 known limitation. F2 known limitation. F3 accept. F4 your
wording of my reason is right. F5 keep them. F6 accept A to E."

| # | Question | Decision |
|---|---|---|
| F1 | Two tally commands run at the same moment in the same directory (open question O1). | Known limitation. No lock: the later write wins and one update can be lost; the file is never left damaged. No guard, no criterion, no test. |
| F2 | `add` on a counter already at 9007199254740991 (open point P2). | Known limitation. No new behaviour and no criterion. Consequence, stated as part of the limitation: if reached, the value written is one the next read treats as damaged, so later commands refuse with exit 1 until the file is fixed by hand; no data is removed. |
| F3 | The 19 permission-dependent tests need a non-root POSIX grading environment (P1). | Accepted as a precondition of the suite. The orchestrator verifies it at gate 7 against the grading runner. If unmet, those tests fail with "P1 not met"; none passes. |
| F4 | Reason for declining ESLint, Prettier and a type checker (Q19). | The reason is: "keeps tally and its tests free of third-party code (Q1)". |
| F5 | The 15 tests with no single acceptance bullet: two positive tests (T-REQ-05-P1, T-REQ-06-P1) required by the rule that every requirement has a positive test, and 13 restraint tests required by gate 5. Also: `list` lines end with a line feed; `add Coffee` and `add -x` print nothing (Q9). | Keep all of them, as written. |
| G1 | (gate 7, finding G7-01) The gate's workflow sets up Python 3.12 but no Node, and `eval/run.sh` refuses a Node major other than 22. How does the suite get Node 22? User's words: "A: run the suite inside the Node 22 container pinned by digest, as the calling user." | `eval/run.sh` runs every step inside the container `node@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d` (`node:22-bookworm-slim`, Node 22.23.4 when proven), as the calling user's uid:gid (never root), with the repository mounted. Docker is required to run the suite. Proven on 2026-10-27: non-root uid, `chmod 000` read refused, bind-mount read and write work. |
| G2 | (gate 7, finding G7-02) Every pull request is judged by main's whole suite, so freezing all 76 rows at once would block story 1 forever. User's words: "A: two freeze packets, the documented route. Packet 1 now with the documents, the harness, story 1's 52 rows and its brief and scope; packet 2 after story 1 merges." | Packet 1 (now): `docs/`, the harness (`eval/run.sh`, `eval/inside.sh`, `eval/conventions*`, `eval/tests/lib/`), the 52 story-1 rows, `eval/stories/1.*`. Packet 2 (after story 1 merges, its own founder approval, per INCREMENT.md): the 24 story-2 rows and `eval/stories/2.*`. Main's first push carries a placeholder `eval/run.sh` that exits 0 with no rows, so the packet-1 pull request can be judged. |
| F6 | Eval-side details left open by the eval plan (Q-A to Q-E). | (A) `eval/conventions/forbidden-in-app.txt` holds one literal text per line, matched case-sensitively. (B) The report path is `eval/report/eval.log`, never committed. (C) The tests run as `node --test eval/tests/*.test.mjs` (a shell glob), not the directory form. (D) No-network is observed by a preload passed to the child through `NODE_OPTIONS`. (E) `eval/run.sh` runs every step, logs every result, and exits non-zero if any step failed. |
