# Running it: Claude Code CLI, Codex CLI

[ORCHESTRATOR.md](ORCHESTRATOR.md) is the process and it does not change between runtimes. What
changes is how a role gets its own session and how the user is prompted. Nothing here requires a
service, a plugin or a network call; the state file and the rubrics are the whole machinery.

Two rules hold everywhere:

1. **A checker runs in a session that started for that task.** Not a new message in the drafting
   conversation. A fresh process, a fresh subagent, or a fresh terminal — whichever the runtime
   gives you.
2. **The state file is the memory.** If a session dies, the next one reads
   `PREPARATION-STATE.md` and continues. Nothing important lives only in a transcript.

## Claude Code CLI, on its own

The smallest setup, and the baseline Codex matches.

- Start it with the `pod-works-prepare` skill, `.claude/skills/pod-works-prepare/SKILL.md`, giving
  the project name, or with: *"Act as the preparation orchestrator. Follow
  `docs/orchestrator/ORCHESTRATOR.md`. The project is <name>."* The `prep-orchestrator` agent,
  `.claude/agents/prep-orchestrator.md`, is the same role as a subagent definition.
- The orchestrator session plays the orchestrator role only.
- Drafters and checkers are subagents, one per artifact, launched with the Agent tool using
  `.claude/agents/prep-drafter.md` and `.claude/agents/prep-checker.md`. A subagent gets its own
  context, which is what makes the checker's independence real.
- The orchestrator passes a checker only the artifact paths and the rubric path. It does not
  summarise the drafting discussion into the prompt; that is how independence gets lost.
- The user answers in the terminal, one question at a time.

No service and no server. A copy of `docs/orchestrator/`, the skill and the three
`.claude/agents/prep-*.md` files is enough to run the preparation in any repository.

### One harness limit worth knowing

A Claude Code subagent may be refused permission to write files ("Subagents should return findings
as text, not write report files"). A checker that hits it returns its review as text instead. The
orchestrator then transcribes that text into the findings file itself, says in the file's header
that it did so and why, and keeps its own verification and any reclassification in the state file
rather than mixing them into the checker's words. Independence is unaffected: the checker still ran
in its own session with only the artifacts and the rubrics. Do not work around it by giving the
checker a drafting role.

## Codex CLI

Codex has no subagent primitive, so a role boundary is a process boundary.

- Point Codex at the process from `AGENTS.md`:

  ```
  ## Preparation
  When asked to prepare an application, act as the preparation orchestrator and follow
  docs/orchestrator/ORCHESTRATOR.md. Keep PREPARATION-STATE.md updated after every step.
  ```

- A drafter is a separate non-interactive run whose prompt is the rubric plus the input paths:

  ```sh
  codex exec "Draft the PRD for <project>. Follow docs/orchestrator/rubrics/prd.md exactly.
  Inputs: PREPARATION-STATE.md (scope and answers only). Write docs/PRD.md. Write
  nothing else."
  ```

- A checker is another separate run, and it must not be the run that drafted:

  ```sh
  codex exec "Review docs/PRD.md against docs/orchestrator/rubrics/prd.md. Output the
  rubric's verdict section as findings.json. Change no file but findings.json."
  ```

- The interactive session stays the orchestrator: it asks the user, reads findings files, updates
  the state file, and decides whether a gate passed.

Same gates, same rubrics, same refusals. The only loss against Claude Code is convenience.

## Orca

Not built. The repository's own README lists an Orca backend as planned. Until it exists, Orca is
at most a place to open the same Claude Code or Codex sessions described above, under the same
two rules; it adds nothing to the process.

## Porting it to another repository

Today a founder's repository gets its two halves separately:

- **The gate**, from the command. `pod-works init`, run inside the repository, stamps the gate's
  workflow and script into `.github/` (and a sample `eval/` and `app/` into an empty repository).
  After the first push to GitHub, `pod-works protect` requires the `pod-gate` check on main and
  binds administrators to it. Both are the founder's acts; protect needs administrator rights.
- **The preparation**, by copying. Copy `docs/orchestrator/` and `.claude/` (the
  `pod-works-prepare` skill and the `prep-*.md` agents) into the repository. Add the `AGENTS.md`
  paragraph if the team uses Codex. Copy `STATE-TEMPLATE.md` to `docs/PREPARATION-STATE.md` and
  fill in the project name.

There is no `pod-works` verb that does the copying.
