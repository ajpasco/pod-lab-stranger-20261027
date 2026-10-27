# Increments: changing an application after it is built

[ORCHESTRATOR.md](ORCHESTRATOR.md) turns an idea into a contract and its acceptance tests: the tests
written from the requirements before the build and locked so the builders cannot change them.
[BUILD.md](BUILD.md) builds the stories those tests judge. This file covers what happens once that
first build has landed and the founder wants something more, something different, or something gone.
It is the step that decides whether this is a method or a one-shot tool.

An increment is a new feature, a changed behaviour, or a removed one. All three follow the same
route, and the route is short because the gate already enforces its order. Nothing here loosens a
rule from the other two documents; it only says which of them an increment re-runs, and how much.

## 1. What the gate already enforces

Three rules of `pod-gate`, the workflow that judges every pull request from main's copy of itself,
decide the shape of an increment:

- `eval/`, `docs/` and `.github/` are protected. A pull request that changes any of them needs the
  founder's approval, a commit status `pod/approval` on its exact head commit, which
  `pod-works approve <pr>` sets, arming auto-merge at the same time. A pull request that is not a
  story may change nothing else.
- A story branch `story/<n>` may change only what `eval/stories/<n>.txt` on main allows, plus its
  own handoff note.
- Every pull request is judged by main's whole set of acceptance tests, run against that pull
  request's `app/`.

Three consequences follow, and they are the point:

1. **The test and the code cannot land in one pull request.** A story may not touch the acceptance
   tests; a non-story may not touch the application. The standard is set first, every time.
2. **The contract changes only by the founder's hand.** No agent can widen the PRD, soften a row
   or grant itself a file.
3. **An increment cannot break an earlier feature unnoticed.** Every old row still runs.

## 2. What counts as an increment

- **An addition.** New criteria, new rows, a story that creates files or extends existing ones.
- **A change.** Criteria revised, rows revised, a story that alters behaviour already built.
- **A removal.** Criteria marked removed, rows retired, restraint rows added that assert the
  control, route or stored data is gone, and a story whose scope is the files that lose code.
- **A technical change with no behaviour change**, a library swap or a restructuring. The acceptance
  tests observe the application from outside its process, so the rows do not move. It is still a
  story, and a story needs a brief and a scope file under `eval/stories/`, so it still arrives as
  a packet the founder approves. The packet is two files.
- **A defect the acceptance tests missed.** If the application does something wrong and every row
  passes, a row is missing. That is an increment: the row first, then the fix story. A defect the
  acceptance tests catch cannot be on main; the gate refused it.

Not an increment: a change before the first build starts. That is an upstream change under
ORCHESTRATOR.md section 7, which returns the preparation to the earliest invalidated gate.

**What an increment costs depends on what it touches.** Internals are cheap: the acceptance tests do
not see them. The contract is expensive: the blueprint's section 12 pins the routes, the request and
response shapes, the locators and the on-screen strings, and every row that reads one of them is
rewritten when it changes. The orchestrator says which kind a request is before the founder
commits to it.

## 3. The packet

One pull request on a branch named for the change, `eval/<name>`, holding nothing under `app/`:

1. **The PRD amendment**, in `docs/PRD.md`. Numbered, dated, and naming who decided. A new
   criterion gets a new id. A changed criterion keeps its id and records the revision. A removed
   criterion is marked removed and never deleted. An id is never reused.
2. **The blueprint delta**, in `docs/TECH-SPEC.md`. Which layer the change lands in; which lines of
   the pinned contract change; a verification register row for every new or changed criterion
   naming the mechanism and the evidence; every technical choice the build needs; who decided
   each one. When the change needs a convention the Conventions section does not state, or
   changes a production-readiness decision, the delta says so, with who decided, and the
   conventions step under `eval/` gains or changes its tool in the same packet
   ([PRACTICES.md](PRACTICES.md)).
3. **The eval plan delta**, in `docs/eval-plan.md`. New rows, positive and negative, traced to
   their criterion and back; a restraint row wherever a surface gains or loses a control; changed
   rows revised in place with the revision recorded; retired rows listed by id; and for every new
   or changed row, its expected state against the current main, which the rehearsal checks.
4. **The rows as code**, under `eval/`, and the expected-id lists the runner reads updated to
   match, so that a missing or skipped row fails the acceptance tests.
5. **The story brief and scope**, `eval/stories/<n>.md` and `eval/stories/<n>.txt`. The number
   continues the sequence. The scope may include files an earlier story owned; the disjoint-scope
   rule of the blueprint's section 9 is for stories built in parallel, not for increments in
   sequence. The brief follows the shape the earlier briefs set: what exists and is not the
   builder's, the files it owns, the contract sections pinned, the acceptance tests and how to run
   them, the row ids it is graded on, and what done means.

**Light, not rubric-free.** The three rubrics in `rubrics/` still apply to the parts of each
document the packet touches: both-direction coverage for every criterion it adds or changes,
business outcomes rather than technical choices in every row, a restraint row per changed
surface, and who-decided on every choice. One session drafts the packet. A different session,
with no sight of the drafting conversation, checks it against those rules and reads the diff of
every existing row, naming any row that became easier to pass. A row that became easier to pass
is not wrong by itself; it is a decision, and the packet names the decision that justifies it.

## 4. The rehearsal

Gate 7 in miniature, run before the pull request is opened, in a scratch directory shaped like
the gate's: main's `eval/` with the packet's changes, main's `app/` unchanged, no token in the
environment, `sh eval/run.sh`.

- **The new and changed rows fail against current main, for the stated reason.** A new row fails
  by absence; a changed row fails because the old behaviour is still there. A row that passes
  against the unchanged application is asserting nothing new, and a row that fails for another
  reason is a defective test.
- **They are satisfiable.** A throwaway implementation, written for the rehearsal and never
  committed, makes them pass. It is deleted, and `git status` on the branch shows nothing of it.
- **Every old row still passes** against the unchanged application, unless the packet retires it
  on purpose.

Once the pull request is open, the rehearsal on the runner is `pod-works preview <pr>`. It runs
the pull request's own `eval/` against main's `app/` on GitHub's runner, exactly as the gate will
run them after the merge, so a row that passes on a laptop and breaks on the runner is found
before the merge rather than by the next pull request, whose recovery is `pod-works repair`. It
proves the first and third points again where it matters: the new rows fail for the stated
reason, the old ones pass. A packet that lands rows before their story is expected to fail here;
the founder reads the tail for which rows failed and why. The result is the informational
`pod/preview` status on the head commit, set with the founder's login. The gate does not read it.

The evidence of all three runs goes in the pull request body: the commands, the exit codes, the
tail of each run, and the row counts. What could not be rehearsed is said plainly.

## 5. The founder's approval

The gate judges the packet with main's current acceptance tests against the unchanged application,
finds the scope correct for a non-story pull request, and reports "waiting for the founder", naming
the head commit. That is the gate working.

The founder reads the amendment, the diff of the rows, the rehearsal evidence and the brief, runs
`pod-works preview <pr>` and reads its result (a fail is expected for rows landed before their
story; the question is whether the right rows failed for the right reason), then runs
`pod-works approve <pr>`, which sets `pod/approval` on that commit and arms auto-merge. The
`status` trigger re-judges the pull request and, green, it merges with no second act. A new push is
a new commit with no status, so nothing stays approved after it changes.

What the founder is approving is the contract and the standard the builder will be judged by.
This is the increment's one human moment before the build, and it is the whole of the founder's
authority over what gets built. The orchestrator prepares it: the exact command, what the gate
will say, and what the founder is agreeing to, stated before the command is typed.

## 6. The red window

From the moment the packet merges until the story that satisfies it merges, main's acceptance tests
fail against main's own application. The new rows fail by design. In that window the gate refuses
every other pull request, including an eval-only correction, because main's acceptance tests are run
against the unchanged application and fail. This is the lab's finding, and it is the price of
landing the test before the code.

Rules for living with it:

- **One increment in flight at a time.** Start the story as soon as the packet merges.
- **Keep the packet and the story close in time.** A packet approved on Friday for a story on
  Monday leaves main refusing everything over the weekend.
- **If the packet itself is wrong**, a harness defect rather than a failing row, the recovery is
  `pod-works repair`: it pushes main with administrator enforcement lifted for that one push and
  binds it again on exit, and GitHub logs both. It is the founder's act, and the pull request it
  pushes is still the founder's to read.

The alternative, landing the amended test and its implementation together, is exactly what the
gate refuses, and section 1 says why. BUILD.md section 7 says the same from the build side: the
test lands before the code, every time, and the window is the design, not a gap.

## 7. The build

`pod-works build <n>` starts a builder in its own worktree on `story/<n>`, confined to the scope,
pushes its commits, opens the pull request, and has a fresh reader (`pod-works review`) read the
diff against the brief and the handoff. Clean, and auto-merge is armed: the gate runs all the
acceptance tests and the story merges on green with nobody clicking. Flagged, and the merge waits
for a person with the findings on the pull request. `pod-works wait <pr>` watches;
`pod-works fix <n>` sends a refusal back to the same builder. BUILD.md governs the orchestrator's
conduct here without change: the handoff is a claim, the check run and the merge are the evidence,
and a test the builder believes wrong goes in its handoff and is never edited.

## 8. Acceptance

The gate proves the acceptance tests passed. The fresh reader proves nothing obviously foreign came
with it. Neither proves the founder got what they meant. The founder walks the feature on the merged
main, as the earlier plan's review rows had a person do: an agent's pre-review first, in a session
that did not build it, then the founder's own record, which is the evidence. There is no
`pod-works accept`; the approval console (`pod-works up`) records it as a dated note in
`docs/acceptance/`, a protected path the founder approves, naming the merge commit it was walked
on.

## 9. Defects: QA finds them, the founder decides which go in

QA is three things here: the rows, which run on every pull request; the release checks, once
they exist; and any session that drives the merged application looking for what the rows did
not imagine, an exploratory pass whose output is candidate rows and never findings alone.
Whichever finds a defect, the same record and the same decision follow.

**A defect record** is one file per defect, `docs/defects/D-<n>.md`, under a protected path. It
holds what was seen (the steps and the actual outcome); what the PRD requires, by criterion
label; the row that reproduces it, an existing row's id or the new row's id once written; a
severity in the founder's terms (wrong data, wrong refusal, wrong look, cosmetic); who found it
and when; and the founder's decision with its date: fix now, deferred, or not a defect, with the
reason. A defect without a row is a report, not a defect. The row is the reproduction, and
writing it is the first act.

**The heads-up.** Whoever writes the records never opens a story for them. They come to the
founder as one list, each with a recommendation (fix now, or defer) and its cost: the files the
fix touches, and whether the contract of blueprint section 12 moves. It is the same shape as a
gate-6 decision list. The founder decides in words, per defect. Nothing enters the pipeline on a
session's own judgement.

**Put in.** A defect the founder says to fix is the increment of section 2: its row is active in the
acceptance tests, the packet carries the row and a story whose scope is the files the fix touches,
the founder approves, the red window opens, the story lands, the row passes and stays.

**Deferred.** A failing row on main blocks every pull request, so a deferred defect cannot have its
row active. The row stays in the acceptance tests' files and runs on every pull request, but its id
is listed in `eval/deferred.txt` beside its defect id, and the row check reports it without failing
the acceptance tests. The plan check counts a deferred row as a row with a test. That list is the
backlog and the known-limitations list in one place, under a protected path, so adding to it takes
the founder's approval and nobody else's. Fixing a deferred defect later is the packet above plus
one line removed from the list. The acceptance record of section 8 names every deferred defect.

**Not a defect.** Recorded with the reason and closed. Its row, if one was written, is retired
under the plan's rule that an id is never reused.

## 10. The commands, exactly

| Step | Command | What it does |
|---|---|---|
| Open the packet | `git checkout -b eval/<name>` then `gh pr create` | a non-story pull request; the gate allows only protected paths |
| Preview it on the runner | `pod-works preview <pr>` | runs the pull request's own acceptance tests against main's `app/` on GitHub's runner; records `pod/preview` on the head, information only |
| Approve it | `pod-works approve <pr>` | sets `pod/approval` on the head commit and arms auto-merge; the gate re-judges and it merges on green |
| Build the story | `pod-works build <n>` | worktree, builder, push, pull request, fresh reader, auto-merge if clean |
| Watch | `pod-works wait <pr>` | until the gate has judged and, if it may, merged |
| Send a refusal back | `pod-works fix <n>` | the same builder session tries again inside its scope |
| See everything | `pod-works status` | every story, what it has, what it waits on |
| Recover broken acceptance tests on main | `pod-works repair` | one push with administrator enforcement lifted and re-bound; founder only |

## 11. Known limits

- **Nothing reads a packet the way `pod-works review` reads a story.** The checker in section 3 is a
  rule of this document, not a command, and the founder is the last line against a row quietly
  made easier. A fresh reader comparing the row diff against the eval plan is the natural fix.
- **The red window** of section 6 is a real constraint once more than one person is working.
- **`pod-works preview` is information, not a condition.** Nothing stops an approval with no
  preview, or after a failing one; the founder reading it is the check.
- **`pod-works defects` is not built.** The approval console (`pod-works up`) shows the records
  and the deferred list and records the founder's decisions, but `pod-works status` does not show
  them.
- **`pod-works prepare`, `pod-works freeze` and `pod-works accept` are not built.** The packet is
  drafted in a conversation, by the preparation skill, and the acceptance record is written from
  the approval console.
- **The cascade of ORCHESTRATOR.md section 7 is not mechanically enforced** once the documents
  live under `docs/`. The gate requires the founder's approval of the change; it does not check
  that the evals were re-derived from it. The orchestrator's state file is the record.
- **The approval is the founder's own token setting a status.** Anyone with that token can set it,
  the founder included, which is the drift-level authority the decisions log accepts for version
  one. A GitHub App that alone may set the gate is the hardening path.
