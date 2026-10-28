// REQ-02 acc. 11 (story 3, defect D-1): list into a reader that stops early. Row of
// docs/eval-plan.md section 5.
import { test } from "node:test";
import assert from "node:assert/strict";
import { assertUnchanged, counters, describe, expectExit, sandbox, snapshot, tallyClosedPipe, writeFixture } from "./lib/harness.mjs";

// Long enough that the output (about 1.4 MB) cannot fit a pipe's buffer, so tally is still writing
// when the reader goes away; names sort in index order, so the first line is known.
const MANY = 100000;
const LONG = () => counters(Array.from({ length: MANY }, (_, i) => [`c${String(i).padStart(6, "0")}`, i]));

test("T-REQ-02-P8 list into a reader that stops early prints nothing on stderr, exit 0, file unchanged", async (t) => {
  const sb = sandbox(t);
  writeFixture(sb, LONG());
  const before = snapshot(sb);
  const r = await tallyClosedPipe(sb.work, ["list"]);
  assert.ok(r.stdout.startsWith("c000000 0\n"), `expected the reader to get the first line, c000000 0 (${describe(r)})`);
  expectExit(r, 0);
  assert.equal(r.stderr, "", `expected stderr empty (${describe(r)})`);
  assertUnchanged(sb, before);
});
