# Mockup: tally (revision 4)

Mockup of `docs/PRD.md` revision 4. It shows only journeys the PRD claims. It changes no behaviour
and adds none.

tally has no screen, so this mockup is a set of annotated terminal transcripts.

## How to read the transcripts

- `$` is the shell prompt. The text after it is what the person types.
- Lines starting `[stdout]` or `[stderr]` are annotations that say which stream the text after the
  tag appeared on. The tag is not printed.
- A command with no `[stdout]` line printed nothing on stdout. A command with no `[stderr]` line
  printed nothing on stderr.
- `<message on stderr>` is a placeholder. The PRD does not decide any error-message wording, so none
  is shown. Each placeholder stands for a message on stderr whose wording is undecided.
- `$ echo $?` shows the exit status. The number on the next line is the status the shell reports.
  It is the output of `echo`, not of tally.
- "Before" and "after" describe the contents of tally.json in words. They do not show its layout.
- Setup lines say what tally.json holds at the start. They are not typed commands. They do not use
  any command the PRD lacks.
- Every failure transcript satisfies the PRD definition of failure: nothing on stdout, a message on
  stderr, and tally.json left exactly as it was. That includes still not existing if it did not
  exist.
- Where a transcript says "damaged", tally.json is not valid JSON or not the expected shape. The
  PRD gives both the same outcome.
- Where a transcript says "unreadable", tally.json exists but tally cannot read it. Where it says
  "unwritable", tally cannot write tally.json: the file does not allow it, or the directory does not
  allow it. A directory that does not allow writing makes tally.json unwritable even when the file
  exists and itself allows writing. These are the PRD's two separate cases (unreadable and
  unwritable).
- Criterion numbers ("acceptance N") count the bullets under "Acceptance" in each requirement of
  PRD revision 4, from 1.

---

## REQ-01: Add to a counter

### Transcript 1: add creates a counter (REQ-01, acceptance 1)
Start: tally.json exists and holds no counter `coffee`.
```
$ tally add coffee
$ echo $?
0
```
Nothing is printed on stdout or stderr. Counters after: `coffee` exists with value 1.

### Transcript 2: add raises an existing counter (REQ-01, acceptance 2)
Start: `coffee` is at 3 and `tea` is at 2.
```
$ tally add coffee
$ echo $?
0
```
Counters after: `coffee` is at 4. `tea` is still at 2.

### Transcript 3: add with no tally.json (REQ-01, acceptance 3)
Start: no tally.json in the directory.
```
$ tally add coffee
$ echo $?
0
```
After: tally.json now exists and `coffee` is at 1.

### Transcript 4: names are case-sensitive on add (REQ-01, acceptance 4)
Start: `coffee` is at 3.
```
$ tally add Coffee
$ echo $?
0
```
Counters after: `coffee` is still at 3. A separate counter `Coffee` is at 1.

### Transcript 5: a name beginning with a dash is valid (REQ-01, acceptance 5)
Start: tally.json holds no counter `-x`.
```
$ tally add -x
$ echo $?
0
```
Counters after: `-x` exists at 1.

### Transcript 6: add with no name (REQ-01, acceptance 6)
Start: tally.json holds some counters.
```
$ tally add
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged.

### Transcript 7: add with an empty name (REQ-01, acceptance 7)
Start: tally.json holds some counters.
```
$ tally add ""
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged.

### Transcript 8: add with a name containing whitespace (REQ-01, acceptance 8)
Start: tally.json holds some counters.
```
$ tally add "a b"
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged.

### Transcript 9: add with an extra argument (REQ-01, acceptance 9)
Start: tally.json holds some counters, none named `a` or `b`.
```
$ tally add a b
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged. No counter `a` or `b` was created or changed.

### Transcript 10: add with a damaged tally.json (REQ-01, acceptance 10)
Start: tally.json is damaged.
```
$ tally add coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is byte-for-byte as it was.

### Transcript 11: add with an unreadable tally.json (REQ-01, acceptance 11)
Start: tally.json exists but cannot be read.
```
$ tally add coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is as it was.

### Transcript 12: add with an unwritable tally.json file (REQ-01, acceptance 12, file case)
Start: tally.json exists and the file does not allow writing.
```
$ tally add coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is as it was.

### Transcript 13: add in an unwritable directory with no tally.json (REQ-01, acceptance 12, absent-file case)
Start: no tally.json in the directory, and the directory does not allow writing.
```
$ tally add coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json still does not exist.

### Transcript 14: add in an unwritable directory with an existing, writable tally.json (REQ-01, acceptance 13)
Start: tally.json exists and the file itself allows writing. The directory does not allow writing.
```
$ tally add coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is unchanged.

---

## REQ-02: List the counters

### Transcript 15: list prints every counter, sorted by name (REQ-02, acceptance 1, 2 and 6)
Start: `b` is at 2, `a` is at 1 and `B` is at 5.
```
$ tally list
[stdout] B 5
[stdout] a 1
[stdout] b 2
$ echo $?
0
```
Each line is the name, one space, then the value. Uppercase `B` comes before lowercase `a` because the
order is by Unicode value. Nothing appears on stderr. tally.json after is unchanged.

### Transcript 16: list with no counters (REQ-02, acceptance 4 and 6)
Start: tally.json exists and holds no counters.
```
$ tally list
$ echo $?
0
```
Nothing is printed on stdout. tally.json after is unchanged.

### Transcript 17: list with no tally.json (REQ-02, acceptance 5)
Start: no tally.json in the directory.
```
$ tally list
$ echo $?
0
```
Nothing is printed on stdout. After: tally.json still does not exist. List did not create it.

### Transcript 18: list with a readable but unwritable tally.json file (REQ-02, acceptance 7, read-only file)
Start: `b` is at 2, `a` is at 1 and `B` is at 5. The file can be read but does not allow writing.
```
$ tally list
[stdout] B 5
[stdout] a 1
[stdout] b 2
$ echo $?
0
```
The counters are printed as they would be otherwise, sorted by name. tally.json after is unchanged.

### Transcript 19: list with an existing tally.json in an unwritable directory (REQ-02, acceptance 7, read-only directory)
Start: `b` is at 2, `a` is at 1 and `B` is at 5. The file exists and can be read. The directory does not
allow writing.
```
$ tally list
[stdout] B 5
[stdout] a 1
[stdout] b 2
$ echo $?
0
```
The counters are printed as they would be otherwise, sorted by name. tally.json after is unchanged.
In this same situation `add`, `reset` and `remove` fail (Transcripts 14, 35 and 48); `list` does not.

### Transcript 20: list with an extra argument (REQ-02, acceptance 8)
Start: tally.json holds some counters.
```
$ tally list x
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged.

### Transcript 21: list with a damaged tally.json (REQ-02, acceptance 9)
Start: tally.json is damaged.
```
$ tally list
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is as it was.

### Transcript 22: list with an unreadable tally.json (REQ-02, acceptance 10)
Start: tally.json exists but cannot be read.
```
$ tally list
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is as it was.

The criterion "a reset counter is printed with value 0" (REQ-02, acceptance 3) is shown in
Transcript 24. The criterion "after any successful list, tally.json is unchanged" (REQ-02,
acceptance 6) is stated in Transcripts 15, 16, 17, 18, 19, 24 and 37.

---

## REQ-03: Reset a counter to zero

### Transcript 23: reset an existing counter (REQ-03, acceptance 1)
Start: `coffee` is at 3 and `tea` is at 2.
```
$ tally reset coffee
$ echo $?
0
```
Nothing is printed on stdout or stderr. Counters after: `coffee` is at 0. `tea` is still at 2.

### Transcript 24: a reset counter is listed with value 0 (REQ-03, acceptance 2; REQ-02, acceptance 3)
Start: the state left by Transcript 23.
```
$ tally list
[stdout] coffee 0
[stdout] tea 2
$ echo $?
0
```
The counter stays after the reset. tally.json after is unchanged.

### Transcript 25: reset a counter that does not exist (REQ-03, acceptance 3)
Start: tally.json holds counters but none named `coffee`.
```
$ tally reset coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is unchanged.

### Transcript 26: reset with no tally.json (REQ-03, acceptance 4)
Start: no tally.json in the directory.
```
$ tally reset coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json still does not exist.

### Transcript 27: reset is case-sensitive (REQ-03, acceptance 5)
Start: `coffee` is at 3.
```
$ tally reset Coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: `coffee` is still at 3.

### Transcript 28: reset with no name (REQ-03, acceptance 6)
Start: tally.json holds some counters.
```
$ tally reset
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged.

### Transcript 29: reset with an empty name (REQ-03, acceptance 7)
Start: tally.json holds some counters.
```
$ tally reset ""
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged.

### Transcript 30: reset with a name containing whitespace (REQ-03, acceptance 8)
Start: tally.json holds some counters.
```
$ tally reset "a b"
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged.

### Transcript 31: reset with an extra argument (REQ-03, acceptance 9)
Start: tally.json holds some counters.
```
$ tally reset a b
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged.

### Transcript 32: reset with a damaged tally.json (REQ-03, acceptance 10)
Start: tally.json is damaged.
```
$ tally reset coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is as it was.

### Transcript 33: reset with an unreadable tally.json (REQ-03, acceptance 11)
Start: tally.json exists but cannot be read.
```
$ tally reset coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is as it was.

### Transcript 34: reset with an unwritable tally.json file (REQ-03, acceptance 12)
Start: tally.json holds `coffee` and the file does not allow writing.
```
$ tally reset coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is as it was.

### Transcript 35: reset in an unwritable directory with an existing, writable tally.json (REQ-03, acceptance 13)
Start: tally.json holds `coffee` and the file itself allows writing. The directory does not allow
writing.
```
$ tally reset coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is unchanged.

---

## REQ-04: Remove a counter

### Transcript 36: remove an existing counter (REQ-04, acceptance 1)
Start: `coffee` is at 3 and `tea` is at 2.
```
$ tally remove coffee
$ echo $?
0
```
Nothing is printed on stdout or stderr. Counters after: there is no `coffee`. `tea` is still at 2.

### Transcript 37: a removed counter is not listed (REQ-04, acceptance 2)
Start: the state left by Transcript 36.
```
$ tally list
[stdout] tea 2
$ echo $?
0
```
No `coffee` line appears. tally.json after is unchanged.

### Transcript 38: remove a counter that does not exist (REQ-04, acceptance 3)
Start: tally.json holds counters but none named `coffee`.
```
$ tally remove coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is unchanged.

### Transcript 39: remove with no tally.json (REQ-04, acceptance 4)
Start: no tally.json in the directory.
```
$ tally remove coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json still does not exist.

### Transcript 40: remove is case-sensitive (REQ-04, acceptance 5)
Start: `coffee` is at 3.
```
$ tally remove Coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: `coffee` is still present at 3.

### Transcript 41: remove with no name (REQ-04, acceptance 6)
Start: tally.json holds some counters.
```
$ tally remove
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged.

### Transcript 42: remove with an empty name (REQ-04, acceptance 7)
Start: tally.json holds some counters.
```
$ tally remove ""
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged.

### Transcript 43: remove with a name containing whitespace (REQ-04, acceptance 8)
Start: tally.json holds some counters.
```
$ tally remove "a b"
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged.

### Transcript 44: remove with an extra argument (REQ-04, acceptance 9)
Start: tally.json holds some counters.
```
$ tally remove a b
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged.

### Transcript 45: remove with a damaged tally.json (REQ-04, acceptance 10)
Start: tally.json is damaged.
```
$ tally remove coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is as it was.

### Transcript 46: remove with an unreadable tally.json (REQ-04, acceptance 11)
Start: tally.json exists but cannot be read.
```
$ tally remove coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is as it was.

### Transcript 47: remove with an unwritable tally.json file (REQ-04, acceptance 12)
Start: tally.json holds `coffee` and the file does not allow writing.
```
$ tally remove coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is as it was.

### Transcript 48: remove in an unwritable directory with an existing, writable tally.json (REQ-04, acceptance 13)
Start: tally.json holds `coffee` and the file itself allows writing. The directory does not allow
writing.
```
$ tally remove coffee
[stderr] <message on stderr>
$ echo $?
1
```
After: tally.json is unchanged.

---

## REQ-05: Refuse a missing or unknown command

### Transcript 49: no command (REQ-05, acceptance 1)
Start: tally.json holds some counters.
```
$ tally
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged.

### Transcript 50: unknown command (REQ-05, acceptance 2)
Start: tally.json holds some counters.
```
$ tally frobnicate
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged.

### Transcript 51: `--help` is an unknown command (REQ-05, acceptance 3)
Start: tally.json holds some counters.
```
$ tally --help
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged. Nothing is on stdout, so no help text appears.

### Transcript 52: `-h` is an unknown command (REQ-05, acceptance 3)
Start: tally.json holds some counters.
```
$ tally -h
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged. Nothing is on stdout, so no help text appears.

### Transcript 53: `Add` in a different letter case is an unknown command (REQ-05, acceptance 4; Q15, decided)
Command names are case-sensitive, so `Add` is not `add` (Q15, decided).

Start: tally.json holds some counters.
```
$ tally Add coffee
[stderr] <message on stderr>
$ echo $?
2
```
After: tally.json is unchanged.

### Transcript 54: unknown command with a damaged tally.json (REQ-05, acceptance 5)
Start: tally.json is damaged.
```
$ tally frobnicate
[stderr] <message on stderr>
$ echo $?
2
```
The status is 2, not 1. After: tally.json is as it was.

---

## REQ-06: Check usage before touching the file

### Transcript 55: missing name with a damaged tally.json (REQ-06, acceptance 1)
Start: tally.json is damaged.
```
$ tally add
[stderr] <message on stderr>
$ echo $?
2
```
The status is 2, not 1. After: tally.json is byte-for-byte as it was.

### Transcript 56: reset with no name and a damaged tally.json (REQ-06, acceptance 2)
Start: tally.json is damaged.
```
$ tally reset
[stderr] <message on stderr>
$ echo $?
2
```
The status is 2, not 1. After: tally.json is as it was.

### Transcript 57: remove with a whitespace name and a damaged tally.json (REQ-06, acceptance 3)
Start: tally.json is damaged.
```
$ tally remove "a b"
[stderr] <message on stderr>
$ echo $?
2
```
The status is 2, not 1. After: tally.json is as it was.

### Transcript 58: list with an extra argument and a damaged tally.json (REQ-06, acceptance 4)
Start: tally.json is damaged.
```
$ tally list x
[stderr] <message on stderr>
$ echo $?
2
```
The status is 2, not 1. After: tally.json is as it was.

### Transcript 59: add with an extra argument and an unreadable tally.json (REQ-06, acceptance 5)
Start: tally.json exists but cannot be read.
```
$ tally add a b
[stderr] <message on stderr>
$ echo $?
2
```
The status is 2, not 1. After: tally.json is as it was.

### Transcript 60: add with an extra argument and an unwritable tally.json (REQ-06, acceptance 6)
Start: tally.json exists and the file does not allow writing.
```
$ tally add a b
[stderr] <message on stderr>
$ echo $?
2
```
The status is 2, not 1. After: tally.json is as it was.

---

## Coverage table

| REQ ID and criterion | Transcript |
|---|---|
| REQ-01, 1 | 1 |
| REQ-01, 2 | 2 |
| REQ-01, 3 | 3 |
| REQ-01, 4 | 4 |
| REQ-01, 5 | 5 |
| REQ-01, 6 | 6 |
| REQ-01, 7 | 7 |
| REQ-01, 8 | 8 |
| REQ-01, 9 | 9 |
| REQ-01, 10 | 10 |
| REQ-01, 11 | 11 |
| REQ-01, 12 | 12 (file), 13 (directory, file absent) |
| REQ-01, 13 | 14 |
| REQ-02, 1 | 15 |
| REQ-02, 2 | 15 |
| REQ-02, 3 | 24 |
| REQ-02, 4 | 16 |
| REQ-02, 5 | 17 |
| REQ-02, 6 | 15, 16, 17, 18, 19, 24, 37 |
| REQ-02, 7 | 18 (read-only file), 19 (read-only directory) |
| REQ-02, 8 | 20 |
| REQ-02, 9 | 21 |
| REQ-02, 10 | 22 |
| REQ-03, 1 | 23 |
| REQ-03, 2 | 24 |
| REQ-03, 3 | 25 |
| REQ-03, 4 | 26 |
| REQ-03, 5 | 27 |
| REQ-03, 6 | 28 |
| REQ-03, 7 | 29 |
| REQ-03, 8 | 30 |
| REQ-03, 9 | 31 |
| REQ-03, 10 | 32 |
| REQ-03, 11 | 33 |
| REQ-03, 12 | 34 |
| REQ-03, 13 | 35 |
| REQ-04, 1 | 36 |
| REQ-04, 2 | 37 |
| REQ-04, 3 | 38 |
| REQ-04, 4 | 39 |
| REQ-04, 5 | 40 |
| REQ-04, 6 | 41 |
| REQ-04, 7 | 42 |
| REQ-04, 8 | 43 |
| REQ-04, 9 | 44 |
| REQ-04, 10 | 45 |
| REQ-04, 11 | 46 |
| REQ-04, 12 | 47 |
| REQ-04, 13 | 48 |
| REQ-05, 1 | 49 |
| REQ-05, 2 | 50 |
| REQ-05, 3 | 51 (`--help`), 52 (`-h`) |
| REQ-05, 4 | 53 (Q15, decided) |
| REQ-05, 5 | 54 |
| REQ-06, 1 | 55 |
| REQ-06, 2 | 56 |
| REQ-06, 3 | 57 |
| REQ-06, 4 | 58 |
| REQ-06, 5 | 59 |
| REQ-06, 6 | 60 (file case only; see below) |

## Criteria not fully demonstrated

- **Error wording.** The PRD does not decide it. Every failure shows `<message on stderr>`. The
  mockup shows that a message appears and which stream carries it, not what it says.
- **"Byte-for-byte as it was" (REQ-01 acceptance 10, REQ-06 acceptance 1).** A transcript of tally's
  own output cannot prove that no byte changed. The mockup states the outcome in words. Verifying it
  is for the eval plan.
- **Both kinds of "damaged".** The PRD defines damaged as not valid JSON or valid JSON that does not
  hold named counters each with a whole-number value. The transcripts say "damaged" and do not
  separate the two kinds. The PRD gives them one outcome.
- **How a file or directory comes to be unreadable or unwritable.** The PRD gives lack of permission
  and read-only as examples and does not fix the cause. The transcripts state only that tally cannot
  read or cannot write, and show no setup command.
- **Unwritable directory with no tally.json, for `reset` and `remove`.** The PRD has no such
  criterion for REQ-03 or REQ-04. With no tally.json, these two commands fail with exit 1 because
  no such counter exists (Transcripts 26 and 39), so a separate unwritable-directory transcript
  would not show a different outcome. Only `add` (Transcript 13) reaches the absent-file directory
  case. The directory case for an existing, writable tally.json is shown for all three commands
  (Transcripts 14, 35 and 48).
- **REQ-06 acceptance 6, directory case.** The criterion says "unwritable tally.json", which under
  PRD revision 4 includes a directory that does not allow writing. Transcript 60 shows the file case
  only. The PRD gives one outcome for every unwritable case, and no separate transcript is added for
  the directory case.
- **Whitespace beyond the space.** The PRD records the exact character set in the blueprint and
  uses an ordinary space as its example. The transcripts use a space only.
- **Stderr on a successful `list` of an unwritable file or directory (Transcripts 18 and 19).** The
  PRD says `list` prints the counters "as it would otherwise". The transcripts show nothing on
  stderr, as for any other successful `list`.
- **Known limitation O1** (two commands at the same moment). The user decided it is a known
  limitation (Decisions 2026-10-27, F1; PRD section 8). It is not an open question. It has no
  criterion and no journey, so the mockup shows nothing for it.
- **NFR-1, NFR-2, NFR-3 and NFR-4** (Node.js, no dependencies, tally.json in the current directory,
  no web, database or server). They have no observable criterion in the PRD, so no transcript is
  shown for them.
