# Preparation state: tally

The orchestrator updates this file after every step. Any session can resume from this file alone.

- **Project:** tally
- **Runtime:** claude-code
- **Current step:** 7 of 7
- **Status:** gate 7 in progress — waiting for the user's acts (placeholder push, init, origin, push, protect, packet-1 PR) and the fresh test-code review. G1 (container) and G2 (two packets) decided. Evidence 2026-10-27: packet 1 on empty tree → exit 1, 1..52, 0 pass/90 fail, planned reasons only, conventions pass; throwaway with all 76 → exit 0, 1..76, 206 pass/0 fail, conventions 0 problems; throwaway deleted (python shutil; `.pod/ref-lab` and `app/` absent, verified). Packet 2 staged at `.pod/packet-2/eval/`; placeholder at `.pod/placeholder/eval/run.sh`; PR body at `.pod/freeze-1-body.md`. Fresh test-code review (`docs/reviews/gate-7-tests-check.md`): 0 blockers, 8 advisories; A1 (story-1 brief said run exits non-zero after story 1 — wrong under G2) fixed by a drafter after the review, plus A7 comment; A2 covered by the throwaway run; A3–A6, A8 accepted as stricter/informational. Next session: verify main's protection and the PR's gate status from GitHub after the user's commands; then the user runs preview (expected: fail, 52 rows by absence) and approve; then verify pod/approval, pod-gate and the merge; packet 2 after story 1 merges. Leftover scratch in /tmp from the suite drafter (tally-conv-lab*, tally-net-lab.mjs, net-*.mjs, q.txt, netlog-*) — no implementation; not deletable without approval. Planned single automatic plan-only correction after the answers: move T-REQ-03-N4..N7 and T-REQ-04-N4..N7 to story 1 (R6-007); fix G5-01 state text; apply F-answers; then a new review in a new session. R6-004 (stored-value rules are D1c/E2, user decisions recorded in the blueprint), R6-005 (bundled criteria: rubric forbids splitting after IDs; criterion-level coverage holds), R6-006 (= R3-01, already accepted by the user, Q18): no change. Orchestrator's instruction to the drafter: every row whose expected failure is exit 1 must not pass vacuously against an absent or partial `app/` (node itself exits 1 on a missing script; a missing command module also exits 1 by D5). Environment checked 2026-10-27: node v22.23.2, npm 10.9.8, `pod-works` on PATH.
- **Updated:** 2026-10-27

## Gate log

| Gate | Passed | By what evidence | Notes |
|---|---|---|---|
| 1 Your idea | yes, 2026-10-27 | Idea captured verbatim (Q1); orchestrator's restatement added nothing to it; user confirmed the restatement in words (Q2: "Yes, that restatement matches what I meant exactly. Nothing to correct."). | User instruction 2026-10-27: do not read the pod wiki; this project stands on its own. |
| 2 Clarify the scope | yes, 2026-10-27 | Q3–Q14 asked one at a time, each answer recorded in the user's words; every gap noted at gate 1 is answered (list format Q3, names Q4/Q5/Q12, empty list Q6, damaged file Q7, unreadable/unwritable file Q13, no/unknown command Q8, success output Q9, extra arguments Q10, sort order Q11, precedence Q14). No product question answered by assumption. One deferred question carried as O1. | Closed at the user's request after Q14. |
| 3 PRD and mockup | yes, 2026-10-27 | PRD r3 and mockup r3; fresh-checker review r3 with 0 blockers; orchestrator's own count of 60 criteria under REQ-01..06 with no holes; user's acceptance in words (Q18); R3-01 accepted as limitation by the user; R2-02 carried to gate 4; O1 carried to gate 6. | PRD r1 drafted. Orchestrator's own numbering check: REQ-01..REQ-06 each appear once as headings, no holes, every Acceptance bullet sits under one REQ heading. Orchestrator notes for the checker round (not yet findings): (a) REQ-05 criterion "`tally Add coffee` is an unknown command" is inferred — Q12 is about names, not commands — raised to the user as Q15; (b) REQ-06's last criterion duplicates a REQ-01 case; (c) NFR-3 carries an "Observable" check outside the requirements; (d) problem statement's examples and "today they must…" are not the user's words. The rubric's "standard to match" files (`docs/PRD.md`, `docs/PRD-reference.md`) do not exist in this repository; `docs/PRD.md` is this project's own output path. The rubric's rules are applied on their own. No reference PRD: tally has no readers outside the team (ORCHESTRATOR §1). Mockup for a CLI = terminal transcripts at `docs/MOCKUP.md`. |
| 4 Technical blueprint | yes, 2026-10-27 | TECH-SPEC r4 (sha256 04bfe527…). Reviews: r1 5 blockers → Q20 (D1–D6) + r2; r2 2 blockers → Q21 (E1–E6, S1) + r3; r3 0 blockers, 2 advisories → r4; r4 narrow re-check (fresh session a6bb169818d9ee271) 0 blockers, 0 advisories. Orchestrator verified: 60 register rows (grep count), §9 story scopes disjoint, §5 table whole, `bin` decider row present. User chose the options (Q19, Q20, Q21) and pre-authorised closing on a clean re-review (Q21). | Open points carried: O1, P2 → gate 6; P1 (non-root POSIX grading env) → gate 7; P3 (forbidden-in-app list) → eval plan. |
| 5 Evals and stories | yes, 2026-10-27 | eval-plan r1 (sha256 bf9ec889…); fresh checker a71a13bbf3d0cea2a: 0 blockers, 7 advisories (`docs/reviews/gate-5-findings.md`, 5dd7f093…). Orchestrator verified from the file: 76 test rows (grep), 18 P (every REQ has ≥1 P), 58 N; story table: story 1 owns 44 (REQ-01/02/05/06), story 2 owns 32 (REQ-03/04), scopes disjoint; Rule G (guard) designs out the vacuous exit-1 pass (§2). Restraint tests are required by gate 5 itself. | Advisories G5-01…G5-07 and the plan's own open questions Q-A…Q-D go to the gate-6 decision list. |
| 6 Planning review | yes, 2026-10-27 — accepted by the user in advance, conditional on a clean narrow check (Q23); narrow check r3 (fresh session acef79d4a48b2f13f, `docs/reviews/gate-6-review-r3.md` a8f85cac…) found 0 blockers: G6R2-001…004 closed; G6R2-005 = accepted mockup gap; G6R3-001 (TECH-SPEC r6 still points at "eval plan revision 2"; content unchanged) recorded by the orchestrator as an accepted advisory, reported to the user. Final hashes: PRD r4 26924dec…, MOCKUP r4 1a8da917…, TECH-SPEC r6 25d3b369…, eval-plan r3 160bcc8e…, decisions 026aad3b…. | Earlier: | Review r1 (a9b148bf150b1fdff): 0 blockers, 10 advisories → Q22 (F1–F6, decisions file) → the one automatic correction pass (PRD r4 ac4b4f43506dc74b0, TECH-SPEC r5 ad1ad2e005e7a82dc, eval-plan r2 aed881c976807e29a) → review r2 in a new session (a9dc73cc59ae901c7, `docs/reviews/gate-6-review-r2.md` 0d02dc75…): 0 blockers, 5 advisories (G6R2-001…005, all plan-correction: stale revision references; mockup still calls O1 open; TECH-SPEC §4 says story 2 owns all REQ-03/04 rows vs eval-plan's 8 moved to story 1; P3 still listed open; R3-01 repeat). Orchestrator verified: 76 tests, 8 moved rows owner 1, O1/P2 closed in TECH-SPEC. | Hashes after correction: PRD 26924dec…, TECH-SPEC c8e70483…, eval-plan 24fc9bea…, MOCKUP unchanged 3121bf6f…, decisions 026aad3b…. |
| 7 Ready to build |  |  | Started 2026-10-27. Read the pod-works template (read-only): `pod-gate.yml` sets up Python 3.12 but no Node; `gate.sh` runs `sh eval/run.sh` on `ubuntu-latest` with main's eval/ and the PR's app/. `init` on this repo stamps only `.github/` (+ `.pod/.gitignore`, `.gitignore` line) because eval/ will exist — must run AFTER eval/ is written, or it stamps a sample eval/, app/ and root package.json. New finding G7-01 (blueprint-change): the runner's Node major is unknown and run.sh refuses non-22 (E4). Lab proof 2026-10-27: `docker run --user 501:20 node:22-bookworm-slim` → v22.23.4, uid 501, `chmod 000` read refused (P1 holds), bind-mount read and write OK; digest node@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d. Asked as Q24. |

## Artifacts

| Artifact | Path | SHA-256 | Revision | Valid |
|---|---|---|---|---|
| PRD | docs/PRD.md | 1c9b70fc98ef92cecba2c5ec876e843d21945101de6d906ee1a05ddc2f477c78 | 3 (r1 a1c531dd29fe5452c; r2 ad43b34bded911b00; r3 ae7e475fb88438b8f) — accepted by the user (Q18) | yes |
| Blueprint | docs/TECH-SPEC.md | 04bfe52712248c138cff24085eeb12eb17bd0e7317d3c3ba263b41d9b1124060 | 4 (r1 a9d092c35b5967c92; r2 ab332104c2d6c68a0; r3 a3890932ba05072d0; r4 a554b300a0269b590) | yes |
| Review findings (gate 4) | docs/reviews/gate-4-findings.md; -r2; -r3; -r4 | 6f3a3f19…; 92194af2…; 40ca76fe…; 29a449a4… (full hashes: 6f3a3f1971fb480d59e5fdd70474d5fdf6167018eec45da5ca710bb799badce5; 92194af25a62e77de7d2bcbbaec2dbf2088028017149504d4b4f699aae9b8afd; 40ca76fe8313edd2f2ee6bf28715c9567d81764123aebc63d1c86fa30bacf969; 29a449a47be4181965f35f925c33444f16d670f6742a9b4b118bbf37ca71b751) | r1–r4 | yes |
| Mockup | docs/MOCKUP.md | 3121bf6f2bbe159dffb27cf5090b27e2d7eb1c5691b76d9a40a5a9558515759c | 3 (r1 a69f09adb271d4bbc; r2 ae8c9970114243cb4; r3 a371cb2d25f01b9fd), of PRD r3 — accepted (Q18) | yes |
| Blueprint |  |  |  |  |
| Eval plan | docs/eval-plan.md | bf9ec88948e28cb8877794cf9c2a3c7553e45bd910e32afa5ce6cd1ed11a16f6 | 1 (drafter ada592920c83649b6) | yes |
| Story list | docs/eval-plan.md §9 | (same file) | 1 | yes |
| Review findings (gate 5) | docs/reviews/gate-5-findings.md | 5dd7f0932aaae6aafaca2091587795bed24ca310deda9f6577c053fea969d4f3 | 1 | yes |
| Review findings (gate 3) | docs/reviews/gate-3-findings.md; -r2.md; -r3.md | 98629e2a730305e3d8c830fcc7834b5036d5ac6fbb41062b03a81baed88f7d73; 5d8eafa8b449be444cc57022a254ea876d15e1b3321f148178a96d95040a0b55; 98e9cc61851ed81e176a5a1047d38c54535faa76654ee6f9682cecdb273a61a4 | r1, r2, r3 | yes |

Hashes computed 2026-10-27 with `python3 -I` hashlib (user instruction with Q18: no `shasum`; use python3 hashlib or node crypto).

`Valid` is `no` once something upstream of it changed. An invalid artifact is never carried
forward; the run returns to the earliest invalidated gate.

## Questions asked, and the answers

| # | Question | Answer | Kind |
|---|---|---|---|
| Q1 | In your own words: what is tally, who is it for, and what should it let them do? | Verbatim, 2026-10-27: "tally is a small command-line tool, written in Node.js with no dependencies, that keeps named counters in a JSON file called tally.json in the current directory. It is for me and anyone like me who wants to count things from a terminal without setting anything up. It should let them do four things: 'tally add <name>' increments a counter, creating it at 1 if it does not exist; 'tally list' prints every counter and its value, one per line, sorted by name; 'tally reset <name>' sets one counter to zero; 'tally remove <name>' deletes a counter. If the name is missing from a command that needs one, tally exits 2 with a message on stderr. If reset or remove names a counter that does not exist, tally exits 1 with a message on stderr. That is the whole product: no web, no database, no server, nothing else." | product |
| Q2 | Does the orchestrator's restatement of the scope (in the session, 2026-10-27) match what you meant? | "Yes, that restatement matches what I meant exactly. Nothing to correct." | product |
| Q3 | What exactly does one line of `tally list` look like? | Option A: "the name, one space, then the value, so 'coffee 3'." User added: "Names will not be allowed to contain whitespace; I'll confirm that when you ask about names." | product |
| Q4 | Which names are valid? | Option A: "any non-empty text without whitespace is a valid name." (Confirms the intent stated with Q3.) | product |
| Q5 | What happens when a name breaks the rule? (answered by the user unprompted, with Q4) | "a name that is empty or contains whitespace is treated exactly like a missing name, exit 2 with a message on stderr. No separate error path for it." | product |
| Q6 | What does `tally list` do when there are no counters? | Option A: "prints nothing and exits 0. That covers the case where tally.json does not exist yet too." | product |
| Q7 | What happens when `tally.json` exists but cannot be read as tally's counters (not valid JSON, or not the expected shape)? | Option A: "refuse and change nothing. Exit 1 with a message on stderr, file untouched. No new exit code." | product |
| Q8 | What happens when tally is run with no command, or with a command it does not know? | Option A: "no command or an unknown command exits 2 with a message on stderr, stdout empty. Exit 2 means 'you used tally wrong' everywhere." | product |
| Q9 | What do `add`, `reset` and `remove` print, and with what exit code, when they succeed? | Option A: "on success add, reset and remove print nothing and exit 0." | product |
| Q10 | What happens when a command gets more arguments than it takes (e.g. `tally add a b`, `tally list x`)? | Option A: "extra arguments are 'you used tally wrong': exit 2, message on stderr, stdout empty, nothing changed." | product |
| Q11 | What exactly does "sorted by name" mean for `tally list`? | Option A: "plain character order, by Unicode value. Predictable everywhere." (Note for the blueprint: code point vs UTF-16 code unit differ only for characters outside the Basic Multilingual Plane; that is a technical choice to record there, not a product question.) | product |
| Q12 | Are names case-sensitive: are `coffee` and `Coffee` two counters or one? | Option A: "case-sensitive, two counters. Names are stored exactly as typed." | product |
| Q13 | What happens when tally cannot read or write `tally.json` at all (e.g. no permission, read-only directory)? | Option A: "same as a damaged file. Exit 1, message on stderr, file left as it was. Exit 1 means the command could not be carried out; exit 2 means you used tally wrong." | product |
| Q14 | When a command is both used wrong and could not be carried out (e.g. `tally add` with no name while `tally.json` is damaged), which exit code wins? | Option A: "exit 2 wins. Usage is checked before the file is touched." | product |
| Q15 | (gate 3) Are command names case-sensitive: is `tally Add coffee` an unknown command (exit 2), or the same as `tally add coffee`? Raised because the PRD drafter inferred it from Q12, which is about counter names. | Option A: "command names are case-sensitive; 'tally Add coffee' is an unknown command, exit 2." | product |
| Q16 | (gate 3, from G3-06) `list` only reads. When `tally.json` can be read but not written (read-only file or directory), does `tally list` succeed, or fail with exit 1 under Q13? | Option A: "list succeeds on a file it can read but not write. Only add, reset and remove fail on a file they cannot write." | product |
| Q17 | (gate 3, from R2-01) `tally.json` exists and is writable, but its directory is read-only: do `add`, `reset` and `remove` succeed, or fail with exit 1? | Option A: "they fail, exit 1, message on stderr, file unchanged. A read-only directory is a failure as Q13 said." | product |
| Q18 | (gate 3) Accept PRD r3 with mockup r3, R3-01 accepted as a mockup limitation, R2-02 and O1 carried? | "Yes. I accept PRD revision 3 and mockup revision 3 as the result of gate 3, with R3-01 accepted as a mockup limitation and R2-02 and O1 carried forward as you described." Also: "do not use shasum; compute SHA-256 with python3 (hashlib) or node (crypto)… Keep the blueprint as small as a four-command, no-dependency CLI deserves." | product |
| Q19 | (gate 4) The conventions step wants a pinned formatter/linter; tally has "no dependencies" (Q1). Which tooling? | Option A: "Node only, no installed tools. The conventions script checks that files parse, package.json declares no dependencies, only built-in modules are imported, and the line limit. No ESLint or Prettier." | product (technical choice made by the user) |
| Q20 | (gate 4) Costed decision list D1–D6 from the blueprint review (G4-01..03, 06, 08–10): accept each recommendation, or name the ones to change. | "Accept all. D1 accept (a) to (f). D2 accept. D3 add (a) and (b) to the frozen script. D4 accept, record me as the decider on each. D5 accept. D6 record as a known limitation, no new behaviour. P2 and O1 go to the gate 6 decision list as you said." | product (user decisions D1–D6) |
| Q22 | (gate 6) Costed decision list F1–F6 from the gate-6 review (`docs/reviews/gate-6-review.md`, 2fd85761…; fresh session a9b148bf150b1fdff: 0 blockers, 10 advisories R6-001…R6-010) plus gate-5 advisories and the eval plan's Q-A…Q-E. | "Accept all. F1 known limitation. F2 known limitation. F3 accept. F4 your wording of my reason is right. F5 keep them. F6 accept A to E." Recorded in `docs/inputs/decisions-2026-10-27.md`. Also for gate 7: repo exists, empty and public, at https://github.com/ajpasco/pod-lab-stranger-20261027.git — do not create one; the user adds origin and pushes. Allowed commands only: sh, git, node, npm, ls, cat, head, tail, grep, find, mkdir, cp, mv, python3, docker, pod-works. | product (F1–F6) |
| Q23 | (gate 6) Review r2 has 0 blockers and 5 advisories (G6R2-001…005). Accept the plan now with them recorded as limitations, or allow one more plan-only correction (mockup r4, TECH-SPEC r6, eval-plan r3 reference fixes) and a narrow review in a new session first? | "A: run the correction pass and the narrow check. If that check is clean, take this as my acceptance of gate 6, with G6R2-005 recorded as the accepted mockup gap, and start gate 7 straight away without coming back to ask; come back only if the check finds something, or when you need me to run a command (init, push, protect, preview, approve)." | product (conditional acceptance of gate 6) |
| Q24 | (gate 7, G7-01) The gate's runner sets up no Node; run.sh refuses non-22. Run the suite inside a pinned Node 22 container as the invoking non-root user (A), fall back to the runner's tool cache (B), or other? | "A: run the suite inside the Node 22 container pinned by digest, as the calling user. I checked the stamped workflow myself and agree it sets up Python only. Make the two small edits, run the narrow re-check, and carry on through gate 7; come back when you need me to run a command." Recorded as G1 in `docs/inputs/decisions-2026-10-27.md`. | product (blueprint-change G1) |
| Q21 | (gate 4) Second costed decision list E1–E6 from the blueprint re-review. | "Accept all. E1 add the check. E2 confirm. E3 confirm as my exclusions. E4 accept with the check. E5 exempt app/test/ from that one check. E6 accept. Please close gate 4 on the re-review if it is clean and move straight to gate 5; the plan should be two stories at most, story 1 add and list, story 2 reset and remove, acceptance tests in Node's built-in test runner driving the CLI as a child process." | product (user decisions E1–E6; story split S1) |

Gate-4 defaults the orchestrator proposed to the user (with Q19's message) and that the blueprint records as **recorded defaults**, open to the user's override at blueprint review: Node 22 (installed v22.23.2); a single entry point plus a few small plain-function modules; tally.json as a JSON object of name → whole number; every write via a temporary file renamed into place (serves Q13/Q17); acceptance tests run `tally` as a child process with Node's built-in test runner (`node:test`), no dependencies.

User instruction with Q14, 2026-10-27: "we have now answered fourteen questions about a four-command
tool; please close out gate 2 with whatever is still truly material and move on." The orchestrator
judged nothing further material to writing the PRD; the one remaining behaviour question is carried
as O1 below, not asked.

### Applications of the recorded answers (not new decisions; the user was shown these at the close of gate 2)

- `reset`/`remove` when `tally.json` does not exist: no counter by that name exists, so exit 1 with a message on stderr (Q1).
- `add` when `tally.json` does not exist: the counter is created at 1 (Q1), which creates the file.
- `reset` keeps the counter, listed with value 0; `remove` takes it out of the list (Q1).
- `tally --help`, `tally -h` and the like are unknown commands: exit 2 (Q8). A name such as `-x` is a valid name (Q4).
- Every failure, exit 1 or 2, leaves stdout empty and `tally.json` unchanged (Q7, Q8, Q10, Q13, Q14).

`Kind` is `product` (the user answered), `default` (a recommended default the user accepted) or
`open` (deferred, still waiting).

## Open questions

| # | Question | Waiting on | Blocks |
|---|---|---|---|
| P2 | (from TECH-SPEC r1 §11) `add` on a counter at 9007199254740991: PRD silent. Orchestrator's recommendation: exit 1, message, file unchanged. | user | nothing before gate 6; one PRD criterion if accepted |
| O1 | Two tally commands run at the same moment in the same directory may lose one update. Guard against it, or record it as an accepted limitation? Orchestrator's recommendation: accepted limitation (single-person terminal tool). Not asked at gate 2 per the user's instruction to close it; carried to the gate-6 decision list. | user | nothing before gate 6; at most one PRD non-functional line or limitation |

## Decisions

| # | Decision | Who decided | Where it is recorded |
|---|---|---|---|
| D1 | (a) whitespace = Unicode `White_Space` set; (b) messages one line starting `tally: `, wording the builder's; (c) damaged also covers a leading byte-order mark and values above 9007199254740991; a duplicate key is read last-wins, not damaged; (d) a write keeps the existing file's permission mode; (e) style: two-space indent, semicolons, double quotes; (f) no format-version field | the user (Q20) | TECH-SPEC r2 §7, §10, §13 |
| D2 | Limits: file ≤ 300 lines (checked by `check.mjs`); function ≤ 50 lines and cyclomatic complexity ≤ 10 (held by the fresh reader) | the user (Q20) | TECH-SPEC r2 §13 |
| D3 | `check.mjs` also checks (a) only `store.js` imports `node:fs`/file-system modules, and every `app/` module imports only from its own layer or below (§2); (b) no `process.env` anywhere under `app/`. Naming, comments, commits, formatting, function length/complexity stay with the fresh reader, as declined-as-tool (Q19) | the user (Q20) | TECH-SPEC r2 §13 |
| D4 | Accepted below-recommendation practices, each with the user as decider: no lock (subject to O1), no logs, no lockfile/audit (no dependencies), no `fsync` (a power cut mid-write may lose the last change but never damages the file), no schema version | the user (Q20) | TECH-SPEC r2 §12 |
| D5 | An unexpected internal error exits 1 with one `tally: …` line on stderr, no stack trace | the user (Q20) | TECH-SPEC r2 §7, §12 |
| E1 | `check.mjs` also refuses an empty `catch` block under `app/` | the user (Q21) | TECH-SPEC r3 §13 |
| E2 | A stored negative value is damaged | the user (Q21) | TECH-SPEC r3 §7 |
| E3 | Secrets, containers, timeouts, seed data, time and identifiers are excluded by the user | the user (Q21) | TECH-SPEC r3 §12 |
| E4 | Node 22.x; `eval/run.sh` refuses to run on another major version | the user (Q21) | TECH-SPEC r3 §6/§13 |
| E5 | `app/test/` is exempt from D3(a) only (file-system/layer-order check); every other check applies | the user (Q21) | TECH-SPEC r3 §13 |
| E6 | Stored `1.0` / `1e2` read as 1 / 100, not damaged | the user (Q21) | TECH-SPEC r3 §7 |
| S1 | Two stories: story 1 `add` and `list`; story 2 `reset` and `remove`; acceptance tests in `node:test` driving the CLI as a child process. Orchestrator's note: gate 5 requires disjoint file scope, so the blueprint gives each command its own module and story 1 owns everything shared | the user (Q21) | TECH-SPEC r3 §2, §9, §13; eval plan |
| D6 | A symlinked tally.json is replaced by a regular file on the first write; recorded as a known limitation, no new behaviour | the user (Q20) | TECH-SPEC r2 §7, §11 |

`Who decided` is the user, a recorded default, or a cited PRD clause — never the orchestrator.

## Findings

| ID | Severity | Resolution class | Status | Closed by |
|---|---|---|---|---|
| G3-01 | blocker | user-decision | open; orchestrator verified (PRD REQ-05 acc. 4 cites Q8/Q12, neither covers command case) | Q15 answer, then PRD r2 |
| G3-02 | blocker | plan-correction | open; verified (PRD §4 "expected shape" and "whitespace" undefined) | PRD r2: define in observable terms, defer exact shape/char set to blueprint by name |
| G3-03 | blocker | plan-correction | open; verified (PRD NFR-3 "Observable" line; MOCKUP T54) | PRD r2 drop the NFR-3 check (REQ-02 acc. 5 already covers it); mockup r2 drop T54 |
| G3-04 | blocker | plan-correction | open; follows G3-01 | mockup r2 after Q15 |
| G3-05 | advisory | plan-correction | open | mockup r2: unwritable cases for reset/remove |
| G3-06 | advisory | user-decision | open; orchestrator agrees it is a real ambiguity in Q13 for `list` (reads only) | to be asked as Q16 after Q15 |
| G3-07 | advisory | plan-correction | open; verified (PRD §1 examples and "Today they must…" not the user's words) | PRD r2: problem statement in the user's words only |
| G3-08 | advisory | plan-correction | open; verified (REQ-06 acc. 6 = REQ-01 acc. 10) | PRD r2: remove duplicate |
| G3-09 | advisory | — | no change needed (checker itself records the rubric is met) | — |
| G3-10 | advisory | plan-correction | open; verified (REQ-06 acc. 5 has no tally.json outcome) | PRD r2 |

| R2-01 | advisory | user-decision | open; orchestrator verified (PRD §4 "Unwritable" counts the directory only when the file is absent; Q13 names "read-only directory") — asked as Q17 because a PRD change after gate 4 would invalidate blueprint and evals | Q17 answer |
| R2-02 | advisory | plan-correction | open; verified (PRD §4 "whole-number value", "named counters" leave negative values and stored names with whitespace undecided) | carried to gate 4: the blueprint's exact layout must settle it, citing Q4/Q7; if it needs a product rule, back to the user |

| R3-01 | advisory | plan-correction | open; verified (MOCKUP coverage row "60 (file case only; see below)") — the precedence journey is shown; only the read-only-directory variant of REQ-06 acc. 6 lacks its own transcript | orchestrator recommends: accept as a disclosed mockup limitation (the eval plan will test the criterion); awaiting the user's acceptance of gate 3 |

| G4-01 | blocker | user-decision | verified (state lists 5 recorded defaults; TECH-SPEC §7/§10/§12/§13 label more as "recorded default") | Q20 decision list D1 |
| G4-02 | blocker | user-decision | verified (Q19 says "the line limit", no number; 50/10 and layering not in Q19) | Q20 D2 |
| G4-03 | blocker | user-decision | verified (TECH-SPEC §13 rows layering/errors/naming/comments/commits/formatting name no tool; configuration row's "imports check" cannot see `process.env`) | Q20 D3 |
| G4-04 | blocker | plan-correction | open | TECH-SPEC r2: every exclusion gets decider + return condition |
| G4-05 | blocker | plan-correction | verified (TECH-SPEC §4 REQ-02 acc. 6 uses read-only fixtures; P1 omits it) | TECH-SPEC r2 |
| G4-06 | advisory | plan-correction | verified (§7 "one line" vs §12 "with its stack") | Q20 D5, then r2 |
| G4-07 | advisory | plan-correction | open | r2: add eval/run.sh, conventions.sh, test location to the tree |
| G4-08 | advisory | user-decision (symlink) + plan-correction (wording) | open | Q20 D6; r2 |
| G4-09 | advisory | user-decision | open | Q20 D4 |
| G4-10 | advisory | user-decision | verified | Q20 D5 |
| G4-11 | advisory | — | note only | — |

| G4r2-01 | blocker | plan-correction | verified (TECH-SPEC r2 §5 line 141 "Name and argument count (REQ-01, REQ-03, REQ-04, REQ-06) … Exactly one argument"; no row for `list x`) | TECH-SPEC r3 |
| G4r2-02 | blocker | user-decision | verified (§13 Errors row cites Q19; Q19/D3 do not name errors) | Q21 E1 |
| G4r2-03 | advisory | user-decision | open (negative stored value) | Q21 E2 |
| G4r2-04 | advisory | user-decision | open (exclusions "inferred from Q1") | Q21 E3; code-point sort cite accepted as is — "by Unicode value" (Q11) is the code point |
| G4r2-05 | advisory | user-decision | open (Node "pinned" as a range, unchecked) | Q21 E4 |
| G4r2-06 / P4 | advisory | user-decision | open | Q21 E5 |
| P5 | advisory | user-decision | open | Q21 E6 |

Gate-4 re-review: `docs/reviews/gate-4-findings-r2.md`, fresh checker a2cfd73c9b50ea1b0 on TECH-SPEC r2 (drafter ab332104c2d6c68a0): 2 blockers, 4 advisories; G4-01,02,04–10 closed, G4-03 open in part (= G4r2-02), G4-11 n/a.

Gate-4 review: `docs/reviews/gate-4-findings.md`, fresh checker session a13722296c48ade49 on TECH-SPEC r1 (drafter a9d092c35b5967c92). Register: 60 rows vs PRD's 60 bullets (checker's count; matches the orchestrator's gate-3 count).

R2-01 closed by PRD r3 (Q17), confirmed by the r3 checker. R2-02 carried to gate 4.

Re-review (r3): `docs/reviews/gate-3-findings-r3.md`, fresh checker session a2d8082354ac7b0e1: 0 blockers, 1 advisory (R3-01). Orchestrator independently counted PRD r3 acceptance bullets per requirement from the file: 13, 10, 13, 13, 5, 6 (60), each under exactly one REQ heading, none outside; REQ-01…REQ-06 once each, no holes.

Re-review (r2): `docs/reviews/gate-3-findings-r2.md`, fresh checker session a77372cabdc31d654: 0 blockers; G3-01..08 and G3-10 closed, G3-09 n/a. Orchestrator verified the bullet counts it reported for REQ-01 (12), REQ-02 (10), REQ-05 (5), REQ-06 (6) against PRD r2, and the mockup coverage table rows for REQ-01.

Findings file: `docs/reviews/gate-3-findings.md`, checker session a200d18904d946bb3 (fresh, given only artifact paths, rubrics and the answers section). One PRD revision and one mockup revision will be dispatched together after Q15 and Q16 are answered.

## Corrections

| Review | Correction used | What changed | Re-review session |
|---|---|---|---|

One automatic plan-only correction per review, then a new review in a new session.

## Freeze

- **Frozen:** no
- **Pull request:** <number>, carrying `docs/` and `eval/` and nothing under `app/`
- **Head commit approved:** <full sha>, `pod/approval` = success, set by <the user's login, time>
- **Preview:** `pod/preview` = <success | failure> on <sha>; is that what the plan predicts?
- **Gate:** `pod-gate` = <conclusion> on that head commit
- **Merged into main:** <merge commit, time>
- **Read from GitHub by the orchestrator:** <date>

Nothing may be frozen before gate 6 passes, and only the user may freeze: the user runs
`pod-works approve <pr>`, and the orchestrator fills these lines from the pull request's statuses
and merge on GitHub, never from the user's word.
