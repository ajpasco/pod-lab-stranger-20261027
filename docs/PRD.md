# PRD: tally

Source answers are cited as (Q1) to (Q17) and refer to the recorded answers in the preparation
record. Q1 is the confirmed scope in the user's own words; Q2 confirms the restatement of it.

## 1. Problem statement

The person with this problem is the user themselves "and anyone like me who wants to count things
from a terminal without setting anything up" (Q1).

## 2. The product

tally is "a small command-line tool, written in Node.js with no dependencies, that keeps named
counters in a JSON file called tally.json in the current directory" (Q1). It lets a person do four
things: add to a counter, list all counters, reset one counter to zero, and remove a counter (Q1).
"That is the whole product: no web, no database, no server, nothing else" (Q1).

## 3. Users and roles

There is one role: **the person at the terminal**. They run `tally` in a directory (Q1).

- May: run `tally add <name>`, `tally list`, `tally reset <name>` and `tally remove <name>` (Q1).
- May not: there are no prohibitions beyond the input-failure cases. Each of those is stated as an
  acceptance criterion under the requirement that accepts the input (REQ-01 to REQ-06). There is no
  second role, no sign-in and no permission levels (Q1).

## 4. Definitions

- **Command**: the first argument after `tally`. The commands are `add`, `list`, `reset` and
  `remove`. Command names are case-sensitive, so `Add` is not `add` (Q1, Q15).
- **Unknown command**: a first argument that is not exactly one of the four commands, including
  `--help`, `-h` and a command written in a different letter case such as `Add` (Q8, Q15;
  application of Q8 recorded at gate 2).
- **Counter**: a name together with a whole-number value, kept in tally.json (Q1).
- **Value**: the number a counter currently holds. A counter created by `add` has value 1; `reset`
  sets it to 0 (Q1).
- **Name**: the text a person gives to say which counter a command is about. Names are stored
  exactly as typed and are case-sensitive, so `coffee` and `Coffee` are two counters (Q12).
- **Whitespace**: whitespace characters. The exact set of characters is a technical choice recorded
  in the blueprint; criteria use an ordinary space as the example (Q4).
- **Valid name**: any non-empty text that contains no whitespace. A text such as `-x` is a valid name
  (Q4; application of Q4 recorded at gate 2).
- **Missing name**: a command that needs a name is given none, or is given an empty or
  whitespace-containing name. These three are treated identically (Q1, Q5).
- **tally.json**: the file in the current directory in which the counters are kept (Q1).
- **Current directory**: the directory the person is in when they run tally (Q1).
- **Damaged tally.json**: tally.json exists but is not valid JSON, or is valid JSON that does not
  hold named counters each with a whole-number value (Q7). The exact stored layout is a technical
  choice recorded in the blueprint; this PRD does not state one.
- **Unreadable tally.json**: tally.json exists but tally cannot read it, for example for lack of
  permission (Q13).
- **Unwritable tally.json**: tally cannot write tally.json, because the file does not allow writing
  or because the current directory does not allow writing, for example for lack of permission or
  because it is read-only. A read-only directory makes tally.json unwritable even when tally.json
  exists and the file itself allows writing; when tally.json does not exist, a directory that does
  not allow writing makes it unwritable too (Q13, Q16, Q17).
- **Usage error**: the person used tally wrongly: a missing name, extra arguments, no command or an
  unknown command (Q1, Q5, Q8, Q10, Q15). Exit status 2 always means a usage error (Q8, Q13).
- **Could not be carried out**: the command was used correctly but cannot be completed: tally.json
  is damaged or unreadable (any command); tally.json is unwritable (`add`, `reset` and `remove`
  only; `list` only reads and is not affected, Q16); or `reset` or `remove` names a counter that does
  not exist. Exit status 1 always means this (Q1, Q7, Q13, Q16, Q17).
- **Success**: the command completes. Exit status 0 (Q9, Q6, Q16).
- **Failure**: any usage error or could-not-be-carried-out outcome. Every failure prints nothing on
  stdout, prints a message on stderr, and leaves tally.json exactly as it was; "as it was" includes
  not existing, if it did not exist (Q7, Q8, Q10, Q13, Q14; applications recorded at gate 2).
- **Sorted by name**: plain character order, by Unicode value (Q11).
- **Extra arguments**: more arguments after the command than the command takes. `add`, `reset` and
  `remove` take one (the name); `list` takes none (Q10).

## 5. Functional requirements

### REQ-01: Add to a counter

**User**: the person at the terminal (Q1).

**Flow**
1. The person runs `tally add <name>` (Q1).
2. If a counter with that name exists, its value goes up by 1. If not, a counter with that name is
   created with value 1 (Q1). If tally.json did not exist it is created (Q1; application recorded at
   gate 2).

**Acceptance**
- With no counter `coffee`, `tally add coffee` prints nothing on stdout or stderr, exits 0, and
  tally.json afterwards contains counter `coffee` with value 1 (Q1, Q9).
- With `coffee` at 3, `tally add coffee` prints nothing, exits 0, and tally.json afterwards has
  `coffee` at 4 and every other counter with the value it had before (Q1, Q9).
- With no tally.json in the directory, `tally add coffee` exits 0, prints nothing, and tally.json
  now exists with `coffee` at 1 (Q1, Q9).
- With `coffee` at 3, `tally add Coffee` exits 0 and tally.json afterwards has `coffee` at 3 and
  `Coffee` at 1 (Q12).
- `tally add -x` exits 0 and tally.json afterwards has counter `-x` at 1 (Q4).
- `tally add` with no name exits 2, prints a message on stderr and nothing on stdout, and
  tally.json is unchanged (Q1, Q5).
- `tally add ""` (empty name) exits 2, prints a message on stderr and nothing on stdout, and
  tally.json is unchanged (Q5).
- `tally add "a b"` (name containing a space, an example of whitespace) exits 2, prints a message on
  stderr and nothing on stdout, and tally.json is unchanged (Q4, Q5).
- `tally add a b` (extra argument) exits 2, prints a message on stderr and nothing on stdout, and
  tally.json is unchanged, with no counter `a` or `b` created or changed (Q10).
- With a damaged tally.json, `tally add coffee` exits 1, prints a message on stderr and nothing on
  stdout, and tally.json is byte-for-byte as it was (Q7).
- With an unreadable tally.json, `tally add coffee` exits 1, prints a message on stderr and nothing
  on stdout, and tally.json is as it was (Q13).
- With an existing tally.json that does not allow writing, or with no tally.json in a directory that
  does not allow writing, `tally add coffee` exits 1, prints a message on stderr and nothing on
  stdout, and tally.json is as it was (or still absent if it was absent) (Q13, Q16).
- With an existing tally.json that itself allows writing, in a directory that does not allow
  writing, `tally add coffee` exits 1, prints a message on stderr and nothing on stdout, and
  tally.json is unchanged (Q13, Q17).

### REQ-02: List the counters

**User**: the person at the terminal (Q1).

**Flow**
1. The person runs `tally list` (Q1).
2. tally prints every counter on stdout, one per line, sorted by name (Q1, Q11).

**Acceptance**
- Each printed line is the name, one space, then the value, for example `coffee 3` (Q3).
- With counters `b` at 2, `a` at 1 and `B` at 5, `tally list` prints exactly the three lines
  `B 5`, `a 1`, `b 2` in that order (character order by Unicode value, so uppercase before
  lowercase), exits 0, and prints nothing on stderr (Q1, Q3, Q11, Q12).
- A counter that has been reset is printed with value 0, for example `coffee 0` (Q1; application
  recorded at gate 2).
- With no counters in tally.json, `tally list` prints nothing on stdout, exits 0 (Q6).
- With no tally.json in the directory, `tally list` prints nothing on stdout, exits 0, and does not
  create tally.json (Q6).
- After any successful `tally list`, tally.json is unchanged (Q1).
- With a tally.json that can be read but not written (a read-only file or directory), `tally list`
  prints the counters as it would otherwise, sorted by name, exits 0, and tally.json is unchanged.
  This holds for a file that does not allow writing and for an existing file in a directory that does
  not allow writing; Q17 makes the directory case a failure for `add`, `reset` and `remove` only
  (Q16, Q17).
- `tally list x` (extra argument) exits 2, prints a message on stderr and nothing on stdout, and
  tally.json is unchanged (Q10).
- With a damaged tally.json, `tally list` exits 1, prints a message on stderr and nothing on stdout,
  and tally.json is as it was (Q7).
- With an unreadable tally.json, `tally list` exits 1, prints a message on stderr and nothing on
  stdout, and tally.json is as it was (Q13).

### REQ-03: Reset a counter to zero

**User**: the person at the terminal (Q1).

**Flow**
1. The person runs `tally reset <name>` (Q1).
2. The named counter's value becomes 0 and the counter stays (Q1; application recorded at gate 2).

**Acceptance**
- With `coffee` at 3 and `tea` at 2, `tally reset coffee` prints nothing on stdout or stderr, exits
  0, and tally.json afterwards has `coffee` at 0 and `tea` at 2 (Q1, Q9).
- After that reset, `tally list` includes the line `coffee 0` (Q1).
- With no counter `coffee`, `tally reset coffee` exits 1, prints a message on stderr and nothing on
  stdout, and tally.json is unchanged (Q1).
- With no tally.json in the directory, `tally reset coffee` exits 1, prints a message on stderr and
  nothing on stdout, and tally.json still does not exist (Q1; application recorded at gate 2).
- With `coffee` at 3, `tally reset Coffee` exits 1 (no such counter), and `coffee` is still at 3
  (Q12).
- `tally reset` with no name exits 2, prints a message on stderr and nothing on stdout, and
  tally.json is unchanged (Q1, Q5).
- `tally reset ""` exits 2, prints a message on stderr and nothing on stdout, and tally.json is
  unchanged (Q5).
- `tally reset "a b"` exits 2, prints a message on stderr and nothing on stdout, and tally.json is
  unchanged (Q4, Q5).
- `tally reset a b` exits 2, prints a message on stderr and nothing on stdout, and tally.json is
  unchanged (Q10).
- With a damaged tally.json, `tally reset coffee` exits 1, prints a message on stderr and nothing on
  stdout, and tally.json is as it was (Q7).
- With an unreadable tally.json, `tally reset coffee` exits 1, prints a message on stderr and
  nothing on stdout, and tally.json is as it was (Q13).
- With an existing tally.json that does not allow writing, `tally reset coffee` exits 1, prints a
  message on stderr and nothing on stdout, and tally.json is as it was (Q13, Q16).
- With an existing tally.json that itself allows writing and that holds `coffee`, in a directory that
  does not allow writing, `tally reset coffee` exits 1, prints a message on stderr and nothing on
  stdout, and tally.json is unchanged (Q13, Q17).

### REQ-04: Remove a counter

**User**: the person at the terminal (Q1).

**Flow**
1. The person runs `tally remove <name>` (Q1).
2. The named counter is deleted and no longer appears in the list (Q1; application recorded at
   gate 2).

**Acceptance**
- With `coffee` at 3 and `tea` at 2, `tally remove coffee` prints nothing on stdout or stderr, exits
  0, and tally.json afterwards has no counter `coffee` and `tea` still at 2 (Q1, Q9).
- After that removal, `tally list` does not include any `coffee` line (Q1).
- With no counter `coffee`, `tally remove coffee` exits 1, prints a message on stderr and nothing on
  stdout, and tally.json is unchanged (Q1).
- With no tally.json in the directory, `tally remove coffee` exits 1, prints a message on stderr and
  nothing on stdout, and tally.json still does not exist (Q1; application recorded at gate 2).
- With `coffee` at 3, `tally remove Coffee` exits 1 (no such counter), and `coffee` is still present
  at 3 (Q12).
- `tally remove` with no name exits 2, prints a message on stderr and nothing on stdout, and
  tally.json is unchanged (Q1, Q5).
- `tally remove ""` exits 2, prints a message on stderr and nothing on stdout, and tally.json is
  unchanged (Q5).
- `tally remove "a b"` exits 2, prints a message on stderr and nothing on stdout, and tally.json is
  unchanged (Q4, Q5).
- `tally remove a b` exits 2, prints a message on stderr and nothing on stdout, and tally.json is
  unchanged (Q10).
- With a damaged tally.json, `tally remove coffee` exits 1, prints a message on stderr and nothing
  on stdout, and tally.json is as it was (Q7).
- With an unreadable tally.json, `tally remove coffee` exits 1, prints a message on stderr and
  nothing on stdout, and tally.json is as it was (Q13).
- With an existing tally.json that does not allow writing, `tally remove coffee` exits 1, prints a
  message on stderr and nothing on stdout, and tally.json is as it was (Q13, Q16).
- With an existing tally.json that itself allows writing and that holds `coffee`, in a directory that
  does not allow writing, `tally remove coffee` exits 1, prints a message on stderr and nothing on
  stdout, and tally.json is unchanged (Q13, Q17).

### REQ-05: Refuse a missing or unknown command

**User**: the person at the terminal (Q8).

**Flow**
1. The person runs `tally` with no command, or with a command other than `add`, `list`, `reset` or
   `remove` (Q1, Q8).
2. tally refuses (Q8).

**Acceptance**
- `tally` with no command exits 2, prints a message on stderr and nothing on stdout, and tally.json
  is unchanged (Q8).
- `tally frobnicate` (unknown command) exits 2, prints a message on stderr and nothing on stdout,
  and tally.json is unchanged (Q8).
- `tally --help` and `tally -h` are unknown commands: each exits 2, prints a message on stderr and
  nothing on stdout, and tally.json is unchanged (Q8; application recorded at gate 2).
- `tally Add coffee` (different letter case from `add`) is an unknown command: exits 2, prints a
  message on stderr and nothing on stdout, and tally.json is unchanged (Q8, Q15).
- With a damaged tally.json, `tally frobnicate` still exits 2, not 1 (Q14).

### REQ-06: Check usage before touching the file

**User**: the person at the terminal (Q14).

**Flow**
1. The person runs a command that is both used wrongly and, were it used correctly, could not be
   carried out because of tally.json (Q14).
2. tally reports the usage error and does not read or change tally.json (Q14).

**Acceptance**
- With a damaged tally.json, `tally add` (missing name) exits 2, not 1, prints a message on stderr
  and nothing on stdout, and tally.json is byte-for-byte as it was (Q14).
- With a damaged tally.json, `tally reset` exits 2, not 1, prints a message on stderr and nothing
  on stdout, and tally.json is as it was (Q14).
- With a damaged tally.json, `tally remove "a b"` exits 2, not 1, prints a message on stderr and
  nothing on stdout, and tally.json is as it was (Q14).
- With a damaged tally.json, `tally list x` exits 2, not 1, prints a message on stderr and nothing
  on stdout, and tally.json is as it was (Q10, Q14).
- With an unreadable tally.json, `tally add a b` exits 2, not 1, prints a message on stderr and
  nothing on stdout, and tally.json is as it was (Q10, Q13, Q14).
- With an unwritable tally.json, `tally add a b` exits 2, not 1, prints a message on stderr and
  nothing on stdout, and tally.json is as it was (Q10, Q13, Q14, Q16, Q17).

## 6. Non-functional requirements

Only those the user stated (Q1):

- **NFR-1**: tally is a command-line tool written in Node.js (Q1).
- **NFR-2**: tally has no dependencies (Q1).
- **NFR-3**: counters are kept in a file called tally.json in the current directory (Q1).
- **NFR-4**: no web interface, no database and no server (Q1).

The user has stated no performance, security, platform or other quality requirements, and none are
invented here.

## 7. Non-goals

Version one does not include a web interface, a database or a server, and "nothing else" (Q1).

## 8. Known limitations

These are decided by the user. Each has no guard, no acceptance criterion and no test.

- **Simultaneous commands** (Decisions 2026-10-27, F1): when two tally commands run at the same moment
  in the same directory, there is no lock. The later write wins and one update can be lost. The file
  is never left damaged. There is no guard, no criterion and no test.
- **Largest counter value** (Decisions 2026-10-27, F2): `add` on a counter already at
  9007199254740991 is a known limitation, with no new behaviour and no criterion. If it is reached,
  the value written is one the next read treats as damaged, so later commands refuse with exit 1
  until the file is fixed by hand. No data is removed.

## 9. Open questions

None are open. O1 was decided as a known limitation (Decisions 2026-10-27, F1) and is stated in
section 8.

## 10. Change list

| Revision | Date | Source | Change |
|---|---|---|---|
| 1 | 2026-10-27 | Gate-2 answers Q1 to Q14, including "Applications of the recorded answers" | First draft. Requirements REQ-01 to REQ-06 assigned. Open question O1 recorded. User's words: "tally is a small command-line tool ... That is the whole product: no web, no database, no server, nothing else." (Q1); "Yes, that restatement matches what I meant exactly. Nothing to correct." (Q2). |
| 2 | 2026-10-27 | Gate-3 findings (`docs/reviews/gate-3-findings.md`); answers Q15 and Q16 | Closes G3-01, G3-02, G3-03, G3-06, G3-07, G3-08 and G3-10. G3-01: command names are case-sensitive, Q15 added to the definitions (Command, Unknown command, Usage error) and cited by REQ-05. G3-02: "Damaged tally.json" and "Whitespace" defined observably; exact layout and character set deferred to the blueprint. G3-03: the "Observable" check removed from NFR-3. G3-06: "Unusable" split into "Unreadable" and "Unwritable"; unreadable fails every command with exit 1, unwritable fails `add`, `reset` and `remove` with exit 1, and `list` on a readable but unwritable file succeeds (new REQ-02 criterion); separate unreadable and unwritable criteria in REQ-01, REQ-03, REQ-04 and REQ-06; REQ-06's precedence criteria remain consistent (usage error, exit 2, still wins). G3-07: problem statement reduced to the user's words (Q1). G3-08: REQ-06's last criterion removed as a duplicate of REQ-01's damaged-file case; REQ-05's damaged-file criterion kept, as REQ-06 has no criterion for an unknown command. G3-10: REQ-06's `tally add a b` criterion states its tally.json outcome. G3-04, G3-05 and G3-09 need no PRD change. User's words, Q15: "command names are case-sensitive; 'tally Add coffee' is an unknown command, exit 2." Q16: "list succeeds on a file it can read but not write. Only add, reset and remove fail on a file they cannot write." |
| 3 | 2026-10-27 | Gate-3 re-review findings (`docs/reviews/gate-3-findings-r2.md`); answer Q17 | Closes R2-01. The definition of "Unwritable tally.json" now counts a directory that does not allow writing even when tally.json exists and the file itself allows writing (Q13, Q17); "Could not be carried out" cites Q17. One criterion added each to REQ-01, REQ-03 and REQ-04 for that case: `tally add coffee`, `tally reset coffee` (with `coffee` present) and `tally remove coffee` (with `coffee` present) exit 1, print a message on stderr and nothing on stdout, and leave tally.json unchanged. The existing unwritable criteria in REQ-01, REQ-03 and REQ-04 are narrowed to the file case (and, for REQ-01, the absent-file case) so each criterion covers one case. REQ-02's read-only-directory `list` criterion (Q16) still holds and now cites Q17; REQ-06's unwritable criterion cites Q17 and is unchanged in behaviour. R2-02 needs no PRD change and is carried to the blueprint. User's words, Q17: "they fail, exit 1, message on stderr, file unchanged. A read-only directory is a failure as Q13 said." |
| 4 | 2026-10-27 | Gate-6 decisions (`docs/inputs/decisions-2026-10-27.md`); Decisions 2026-10-27, F1 and F2 | Narrow revision; no requirement, criterion or ID changes and no new behaviour. F1: open question O1 (simultaneous commands) is decided as a known limitation and removed from the open questions, which now state that none are open; new section "Known limitations" added after Non-goals and states F1. F2: the limitation on `add` at 9007199254740991 is added to that section, with its consequence (the written value is treated as damaged on the next read, later commands refuse with exit 1 until the file is fixed by hand, no data is removed). Sections after Non-goals renumbered: Known limitations is 8, Open questions 9, Change list 10. User's words: "Accept all. F1 known limitation. F2 known limitation." |
