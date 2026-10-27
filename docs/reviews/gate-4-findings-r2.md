# Gate 4 findings, round 2: tally technical blueprint (TECH-SPEC.md revision 2)

Rubric: `docs/orchestrator/rubrics/blueprint.md`. Upstream authority: PRD r3, MOCKUP r3 (not
reviewed). Deciders checked against PREPARATION-STATE "Questions asked, and the answers" (Q1 to Q20
and the gate-4 defaults paragraph), "Open questions" and "Decisions" (D1 to D6). Sections 12 and 13
judged against PRACTICES A, B, C. Independent review first; the status of G4-01..11 is at the end.

Verdict: **not clean. Two blockers, four advisories.** Revision 2 closes all of the earlier
blockers except one residue (R2-02 below). The register, traceability, production-readiness review
and layout are sound. The two remaining defects are small.

## Checker's verdict, in rubric order

**1. Does any requirement ID originate in the blueprint?** No. REQ-01 to REQ-06 are cited as the PRD
gave them. O1, P1 to P5, L1 and R-ids are not requirements.

**2. Requirements placed exactly once.** Section 3: REQ-06 boundary; REQ-05 `usage.js`; REQ-01 to
REQ-04 `counters.js`. `store.js` and the domain layer carry none of their own. No exceptions.

**3. Criteria with no register row.** None found. I counted the PRD r3 bullets under each
Acceptance heading: REQ-01 13, REQ-02 10, REQ-03 13, REQ-04 13, REQ-05 5, REQ-06 6 = 60. The register
has 13, 10, 13, 13, 5 and 6 rows = 60, in the PRD's order, each row's wording matching its bullet.
No row exists without a bullet.

**4. Register rows whose evidence is an agent's claim.** None found. Every row's evidence is the row
result line in the eval log written by `eval/run.sh`. No row uses human review, so the two-step rule
does not arise.

**5. Requirements accepting input with no failure behaviour.** Finding R2-01 (blocker): REQ-02's
extra-argument case in section 5.

**6. Shared objects with no concurrency answer.** None found. Section 8 answers for `tally.json`
(atomic rename, no lock, lost update possible). The decider is stated: the user, pending as O1.

**7. Decisions with no decider.** None that is a blocker. Every decision in section 10 names the user
(Q-number or D-number), a recorded default from the five that PREPARATION-STATE lists, or a PRD
clause. The "recorded default" label is now confined to those five (Node 22, one entry point and
plain functions, JSON object of name to whole number, rename write, `node:test` child processes).
Advisories R2-03 and R2-04 concern the strength of two cited deciders. P2, P5 and O1 are honestly
listed as open.

**8. Section A concerns with no line in section 12.** None found. Security 8, Reliability 8,
Observability 4 and Delivery and data 6 each have their own line; every exclusion names a decider
and a return condition.

**9. Concerns the stack brings beyond section A, with no line.** None found. Exit status and
streams, file mode, symbolic link, platform, interrupts and the client are answered.

**10. Section B conventions with no tool, version or configuration file.** Finding R2-02 (blocker):
the Errors row. The other no-tool rows are listed in the next item.

**11. Section B practices neither made concrete nor declined with a reason.** None found. Every
practice appears: Layering, Layout, Errors, Logging, Configuration, Dependencies, Types, Formatting
and lint, the builder's own tests, Naming, Comments, Commits, the client, plus Parsing, Forbidden
references and the secret, audit and container row.

Rows that name no tool and are held by the fresh reader: Layout (function length and complexity),
Types, Formatting and lint, Naming, Comments, Commits. The rubric would list them. The user decided
each: Q19 ("Node only, no installed tools ... No ESLint or Prettier") and Q20 D3 ("Naming, comments,
commits, formatting, function length/complexity stay with the fresh reader"). The rubric says a
user's choice is authoritative and is not re-argued, so I do not count them as blockers. Types is
covered by Q19's "no installed tools". Errors is not named in Q19 or D3; see R2-02.

**12. Layout tree and size limits.** Both present. The tree has one line per folder (`app/`, `bin/`,
`src/`, `test/`, `eval/`, `tests/`, `conventions/`, `stories/`, `docs/`, `.github/`) and names
`run.sh` and `conventions.sh`. Limits: 300 lines per file (checked by `check.mjs`, constant
`MAX_LINES`), 50 lines per function and complexity 10 (fresh reader; the ESLint rules are named and
declined because Q19 declined ESLint). Decider: the user, D2.

## Blockers

### R2-01 (blocker, plan-correction): section 5 has no failure behaviour for REQ-02's argument rule, and its argument rule contradicts `list`
- Rubric: item 5, "requirements accepting input with no failure behaviour"; section 5 is required
  "per requirement that accepts input".
- Basis: the section 5 row reads "Name and argument count (REQ-01, REQ-03, REQ-04, REQ-06) ...
  Exactly one argument; non-empty; no whitespace". REQ-02 is absent from the row's list, and "exactly
  one argument" is false for `list`, which takes none (PRD §4 "Extra arguments"; REQ-02: `tally list
  x` exits 2). No section 5 row says what is validated, or what happens, for `list x`. The register
  row (REQ-02 acc. 8) and the order of work in section 7 do not replace section 5.
- Resolution: add REQ-02 and the zero-argument rule for `list` to section 5, with the exit 2 outcome.
  This adds no capability.

### R2-02 (blocker, user-decision): the Errors convention names no tool, and its cited decider does not cover it
- Rubric: "A convention that names no tool and no file is a wish, not a convention."
- Basis: section 13, Errors row: "no tool — declined as a tool by the user (Q19); held by the fresh
  reader", with the rule "no empty `catch`, no error turned into a default value ... thrown as
  `UsageError` ... or `CouldNotBeCarriedOut`". Q19 lists what the script checks (files parse, no
  dependencies, built-in imports only, line limit) and declines ESLint, Prettier and installed tools.
  It does not decline a check in the frozen Node script. D3 moves the layering and `process.env`
  checks into `check.mjs` and names Naming, comments, commits, formatting and function
  length/complexity as staying with the fresh reader; Errors is in neither list. "Declined as a tool
  by the user" is therefore not shown for Errors. The rule `no empty catch` is the sort of thing
  `check.mjs` could check, as D3 did for `process.env`.
- Resolution: the orchestrator brings it to the user with a recommendation, either (a) add a
  `check.mjs` check for an empty `catch` block, with its cost, or (b) the user confirms in words that
  Errors stays with the fresh reader.

## Advisories

### R2-03 (advisory, user-decision): "negative value is damaged" cites a PRD clause that its own carry-over calls undecided
- Basis: section 10: "Damaged: ... negative, non-whole or non-number value (R2-02) | PRD §4 'Counter'
  ('whole-number value', 'valid name') and 'Damaged tally.json'". PREPARATION-STATE finding R2-02:
  "'whole-number value', 'named counters' leave negative values and stored names with whitespace
  undecided ... the blueprint's exact layout must settle it, citing Q4/Q7; if it needs a product rule,
  back to the user." D1c names only the byte-order mark, the upper bound and duplicate keys. The
  blueprint was authorised to settle it, so this is not a blocker, but the phrase "the PRD's reading
  makes the first four items damaged" overstates the clause for a negative value.
- Resolution: reword so the decider is the drafter's reading under the R2-02 carry-over, and bring it
  to the user at gate 6 with P2 and P5. Refusing a negative value is the safe reading (exit 1, file
  untouched).

### R2-04 (advisory, user-decision): exclusions that rest on "inferred from Q1 'nothing else'"
- Basis: section 12: Secrets, Containers, Timeouts, Seed data, Time and identifiers. The preface says
  "the user did not name this concern; the drafter reads the user's words ... as excluding it. The
  user may overturn the reading at review." This is honest and meets the earlier G4-04 resolution,
  but the decider is an inference, not the user. Also "sort by code point" cites PRD §4 "by Unicode
  value", while Q11's own note says code point against UTF-16 code unit is a technical choice to
  record in the blueprint.
- Resolution: the orchestrator asks the user to confirm these readings in one line, or the blueprint
  keeps the preface as its record. No capability is added.

### R2-05 (advisory, plan-correction): "pinned version" is a range, and nothing checks it
- Basis: section 13: "Pinned version: Node 22 (installed v22.23.2), and `app/package.json` declares
  `"engines": {"node": ">=22 <23"}`". PRACTICES C asks for an exact version. `check.mjs` is not said
  to compare the running Node against anything, and `engines` is advisory in npm without
  `engine-strict`.
- Resolution: state the exact version as the pin and say whether `check.mjs` or `run.sh` verifies it.

### R2-06 (advisory, plan-correction): the scope of the frozen layering check over `app/test/` is open
- Basis: P4: "As written, the checks cover every `.js` file under `app/`, tests included." A builder's
  test that imports `../src/store.js` is in no layer of section 2, and a test using `node:fs` breaks
  D3a. Section 13 allows builder tests under `app/test/`. This is correctly recorded as an open point
  and blocks only the exact scope of `check.mjs`, so it is an advisory here. P3 (forbidden-references
  list completed by the eval plan) and P1 (14 permission rows need a non-root POSIX environment,
  confirmed at gate 7) are likewise properly recorded.
- Resolution: the user decides the scope with the eval plan, or the plan states that `app/test/` is
  excluded.

## Production-readiness defaults below the PRACTICES recommendation
All carry a recorded reason and a user decider, so none is a finding on its own. For the orchestrator's
costed list: no lock (D4, O1 pending); no logs, no request identity, no structured records (D4, Q1);
no stack trace for unexpected errors, below "logged once, with their stack" (D5); no lockfile or audit
(D4, no dependencies); no `fsync` (D4); no schema version (D1f, D4); no formatter, linter or type
checker (Q19); function length and complexity unchecked by a tool (D2, D3). Items P2 (overflow of
`add`) and O1 stay on the gate 6 list as the user said (Q20).

## Sections found clean
1 Profile and fit; 2 Layers; 3 Requirements by layer; 4 Verification register (60 of 60);
6 Configuration; 7 Data (apart from R2-03); 8 Concurrency; 9 Stories and integration;
10 Decisions (apart from R2-03, R2-04); 11 Open points; 12 Production-readiness review (apart from
R2-04); 13 Conventions (apart from R2-02, R2-05, R2-06).

## Status of the earlier findings (G4-01 to G4-11)

- **G4-01: closed.** Preface confines "recorded default" to the five listed in PREPARATION-STATE.
  The whitespace set, message wording, byte-order mark, upper bound, duplicate key, file mode, style
  and schema-version lines now cite D1a to D1f. The `1.0`/`1e2` case is open point P5, not a claimed
  decision. Residue: R2-03 (advisory).
- **G4-02: closed.** The 300, 50 and 10 limits cite Q20 D2; the layering rule cites D3a. Q19 is
  cited only for the line-limit check.
- **G4-03: still open in part.** Layering and Configuration now name `check.mjs` and a rule it
  enforces (D3a, D3b). Naming, comments, commits, formatting and function length/complexity are
  held by the fresh reader on the user's word (D3, Q19). The Errors row is not covered by either:
  R2-02.
- **G4-04: closed.** Every exclusion in section 12 now carries a decider and a return condition,
  including Shutdown, Health, Timeouts, Logs, Request identity, Metrics, Seed data, Time and
  identifiers, Schema evolution and Backups. Inferred deciders are flagged as such (R2-04, advisory).
- **G4-05: closed.** P1 lists 14 rows (3 + 3 + 3 + 3 + 2) and includes REQ-02 acc. 6; the register
  names that row "with permissions".
- **G4-06: closed.** Section 7 and section 12 agree: one `tally: ` line, no stack trace (D5).
- **G4-07: closed.** The tree names `eval/run.sh`, `eval/conventions.sh`, `eval/tests/`,
  `eval/conventions/`, `eval/stories/` and `.github/`.
- **G4-08: closed.** Section 2 says `store.js` "applies no command rule" and `names.js` holds the name
  rule; the symbolic-link behaviour is recorded as L1 (D6) and listed beyond section A.
- **G4-09: closed.** The below-recommendation defaults are recorded with the user as decider (D4, D5,
  Q19); costed in the list above.
- **G4-10: closed.** The unexpected-error exit status now cites D5, not a PRD clause.
- **G4-11: not applicable.** It was a note, not a defect. P2 and P3 remain properly open points.
