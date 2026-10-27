# Gate 4 findings: tally technical blueprint (TECH-SPEC.md revision 1)

Rubric: `docs/orchestrator/rubrics/blueprint.md`. Upstream authority: PRD r3, MOCKUP r3. Deciders
checked against PREPARATION-STATE "Questions asked, and the answers" (Q1 to Q19 and the gate-4
defaults paragraph) and "Open questions". Sections 12 and 13 judged against PRACTICES A, B, C.

Verdict: **not clean. Five blockers, six advisories.** The register is complete and the
traceability is sound. The defects are in who decided what (sections 7, 10, 12, 13) and in the
conventions that name no tool.

## Checker's verdict, in rubric order

**1. Does any requirement ID originate in the blueprint?** No. REQ-01 to REQ-06 are cited as the PRD
gave them. The ids O1, P1 to P3 are open points, not requirements. No finding.

**2. Requirements placed exactly once.** Section 3 places REQ-01 to REQ-04 in `counters.js`, REQ-05
in `usage.js`, REQ-06 in the boundary. No exceptions. `store.js` and the domain layer carry none of
their own, which is allowed.

**3. Criteria with no register row.** None found. Counted against the PRD's own bullets:
REQ-01 13, REQ-02 10, REQ-03 13, REQ-04 13, REQ-05 5, REQ-06 6 = 60. The register has 13, 10, 13, 13,
5 and 6 rows = 60, one per bullet, in the PRD's order. No row exists without a bullet.

**4. Register rows whose evidence is an agent's claim.** None found. Every row's evidence is the row
result line in the eval log written by `eval/run.sh`, which is inspectable afterwards. No row uses
human review, so the two-step review rule does not arise.

**5. Requirements accepting input with no failure behaviour.** None found. Section 5 gives missing,
malformed and unauthorized behaviour and a "never logged" column for the command, the name and
argument count, the contents of `tally.json`, and the write.

**6. Shared objects with no concurrency answer.** None found. Section 8 answers for `tally.json`
(atomic rename, no lock, lost update possible, pending O1). See advisory G4-09 on the recommendation.

**7. Decisions with no decider.** Findings G4-01 and G4-02 (blockers).

**8. Section A concerns with no line.** None found. Every concern has its own line in section 12.
Several lines are defective in content; see G4-04.

**9. Concerns the stack brings beyond section A, with no line.** None found. Section 12 lists exit
status and streams, file mode, platform, interrupts and the client. See advisory G4-08.

**10. Section B conventions with no tool, version or configuration file.** Finding G4-03 (blocker).

**11. Section B practices neither made concrete nor declined with a reason.** None found. All 14
appear: Layering, Layout, Errors, Logging, Configuration, Dependencies, Types, Formatting and lint,
the builder's own tests, Naming, Comments, Commits, the client (plus Parsing, Forbidden references,
and the secret/audit/container row). Logging and the client carry a reason. The rest are
"concrete" only in G4-03's sense.

**12. Layout tree and size limits.** Both are present. The tree is incomplete (advisory G4-07). The
limits' decider is wrong (G4-02).

## Blockers

### G4-01 (blocker, user-decision): "recorded default" is claimed for decisions the user was never shown
- Description: The blueprint opens by defining "Recorded default" as "a default the orchestrator
  proposed with Q19 and the user has not yet overridden". PREPARATION-STATE lists exactly five such
  defaults: Node 22; one entry point plus a few plain-function modules; `tally.json` as a JSON object
  of name to whole number; every write via a temporary file renamed into place; `node:test` child
  process tests. Section 10, section 7 and section 12 label further decisions "recorded default"
  that are not in that list, so their stated decider is not real. A decision cites a real decider or
  it has none.
- Basis, decisions labelled "recorded default" and absent from the list: the whitespace set (section
  10: "Whitespace is the Unicode `White_Space` set | recorded default"); message wording (section
  10: "one line starting `tally: `"); the strict damaged rule's detail (BOM is damaged, 9007199254740991
  upper bound, `1.0`/`1e2` read as whole numbers, duplicate key last-wins; section 7 "recorded
  default"); the file-mode rule (section 12: "recorded default"); the formatting style (section 13:
  "style content is a recorded default"); Start-up, Errors and Schema evolution (section 12:
  "recorded default"). Q18 only carries "R2-02 ... forward as you described"; it does not approve
  these specifics.
- Resolution: the orchestrator brings these to the user as defaults for approval, or the blueprint
  relabels them as the drafter's proposals pending the user. Neither is a new capability.

### G4-02 (blocker, user-decision): Q19 is cited as decider for limits and a layering rule it does not state
- Basis: Section 13: "A file under `app/` is at most 300 lines ... A function is at most 50 lines and
  has cyclomatic complexity at most 10 ... Decided by the user (Q19)." Layering row: "Decided by the
  user (Q19)". Q19 as recorded says only: "the conventions script checks that files parse,
  package.json declares no dependencies, only built-in modules are imported, and the line limit. No
  ESLint or Prettier." It gives no number for the line limit, no function-length or complexity limit,
  and no layering rule. The blueprint's "(the four checks of Q19 are the user's list)" is accurate
  for four checks, but 300, 50, 10 and the layering rule are the drafter's. The numbers are the
  PRACTICES recommendations and may well be accepted, but the decider cited is not supported.
- Resolution: bring 300/50/10 and the layering rule to the user as recommended defaults, or cite them
  as PRACTICES recommendations awaiting approval.

### G4-03 (blocker, user-decision): conventions that name no tool and no file under `eval/`
- Rubric: "A convention that names no tool and no file is a wish, not a convention, and is listed as
  a defect."
- Basis, section 13 rows with tool "none; held by the fresh reader": Layering, Errors, Formatting
  and lint, Naming, Comments, Commits; the Types row ("none"); and the function length and
  complexity limits ("no tool here can count either"). The Configuration row names `check.mjs`'s
  "imports check" as its tool, but its rule is "No `process.env`", and an imports check does not
  detect `process.env`; Q19's list does not include that check either.
- Q19 declined installed tools and a formatter or linter. It did not decline a check in
  `check.mjs`, which is Node itself. Several of these rules (no empty `catch`, no `process.env`,
  `node:fs` not imported in `counters.js`, function length, no `TODO`) could be checked by the same
  frozen Node script within Q19. Whether to extend `check.mjs` or keep them as fresh-reader judgement
  is the user's choice, with a cost.
- Resolution: the orchestrator lists these as a costed decision with a recommendation.

### G4-04 (blocker, plan-correction): section 12 exclusions without a real decider or a return condition
- Rubric: "excluded with who excluded it and what would bring it back"; "Exclusion is a decision and
  has a decider."
- Basis, lines that name no return condition: Shutdown, Health, Timeouts ("excluded; tally makes no
  outbound call (Q1)"), Logs, Request identity, Metrics and alerting, Seed data, Time and identifiers
  ("excluded; tally stores neither (Q1)"). Lines whose decider is not the user or a cited clause:
  Schema evolution ("excluded, recorded default", see G4-01), Backups and retention ("excluded because
  the PRD states no requirement", with no decider named), Timeouts and Time and identifiers
  ("excluded;" with no "by"). Several Q1 citations rest on the single phrase "nothing else"
  (Containers, Secrets, Logs). That is a reasonable reading but is the drafter's inference.
- Resolution: add the decider and the return condition to each line. Where the decider is an
  inference from "nothing else", say so.

### G4-05 (blocker, plan-correction): open point P1 omits a permission-dependent row
- Basis: P1 lists "REQ-01 acc. 11 to 13, REQ-02 acc. 7 and 10, REQ-03 acc. 11 to 13, REQ-04 acc. 11 to
  13, REQ-06 acc. 5 and 6" (13 rows) as needing a build environment where `chmod` is honoured. The
  register row for REQ-02 acc. 6 is "Child-process test over the success fixtures of REQ-02 (with
  counters, none, no file, read-only file, read-only directory)", which needs the same chmod
  fixtures but uses the plain mechanism name. That is a 14th row. Under root it would pass vacuously
  for those fixtures, and P1's "the tests detect this" is only described for "with permissions"
  rows.
- Resolution: add REQ-02 acc. 6 to P1 and name it "with permissions" in the register.

## Advisories

### G4-06 (advisory, plan-correction): messages and the unexpected-error stack disagree
- Basis: Section 7: "Messages go to stderr as one line beginning `tally: `". Section 12 Errors: "an
  unexpected error is printed once with its stack". A stack is several lines. Say which.

### G4-07 (advisory, plan-correction): the layout tree omits `eval/` files the document itself names
- Basis: the tree shows `eval/conventions/` and `eval/stories/` only. Sections 4 and 13 name
  `eval/run.sh`, `eval/conventions.sh` and the acceptance tests, and section 9 names `.github/`. PRACTICES B
  asks for one line per folder, so the acceptance-test location should appear.

### G4-08 (advisory, plan-correction): store.js "never decides" but validates
- Basis: Section 2 and the Layering row say "`store.js` never decides". Sections 7 and 12 have the store
  enforce "invariants ... on read" (damaged layout, valid names, integer range). Validating is
  deciding. State where the damaged-layout rule lives (probably `names.js` plus a checking function
  that `store.js` calls), or relax the sentence. Also the file replacement through rename replaces a
  symbolic link `tally.json` with a regular file; the blueprint says nothing about it, and the
  concern could be listed under "beyond section A".

### G4-09 (advisory, user-decision): defaults below the PRACTICES recommendation, for costing
Reported so the orchestrator can bring them to the user. Each has a reason given, except where noted.
- Shared objects: PRACTICES recommends the decision be enforced in the store (a lock). The design has
  no lock; the reason is O1, pending the user. Cost of a lock: a lock file or `flock`-style code
  and a PRD line; the PRD recommends accepting the limitation.
- Logs, request identity and metrics: unstructured stderr line only. Reason: Q1, no server.
- Dependencies: no lockfile and no audit. Reason: no dependencies (NFR-2) and Q19.
- Backups and durability: no `fsync`; power loss not covered. Reason: the PRD states no figure.
- Schema evolution: no version field. Reason: "recorded default" only (see G4-01).
- Types, formatting and lint: no tool. Reason: Q19 (see G4-03 for the part Q19 does not cover).

### G4-10 (advisory, plan-correction): unexpected-error exit status cites a PRD clause that does not cover it
- Basis: section 10 cites PRD §4 "Failure" for "an unexpected error is a failure with exit 1". The
  PRD defines exit 1 as "Could not be carried out" and exit 2 as usage; an unforeseen bug is neither
  by the PRD's words. This is the drafter's reasoned choice and should read "recorded default" once
  G4-01 is settled, not a PRD clause.

### G4-11 (advisory, plan-correction): P2 is correctly an open point
No defect. P2 (add on a counter at the largest whole number) and P3 are properly recorded as open and
add no capability. Noted so the orchestrator takes P2 to the user with the PRD change request.

## Sections found clean
1 Profile and fit; 2 Layers (one-way, stated); 3 Requirements by layer; 4 Verification register
(60 of 60); 5 Security controls; 6 Configuration; 8 Concurrency (answered; see G4-09); 9 Stories and
integration; 11 Open points apart from G4-05.
