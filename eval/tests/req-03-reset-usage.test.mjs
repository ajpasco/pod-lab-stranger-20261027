// REQ-03: Reset a counter to zero, the usage rows T-REQ-03-N4 to N7, owned by story 1
// (docs/eval-plan.md section 9; freeze packet 1, Decisions 2026-10-27 G2). Rows of
// docs/eval-plan.md section 5, one case per row. They stop at the usage check with exit 2.
import { test } from "node:test";
import {
  assertUnchanged, counters, expectExit, expectRefusal, sandbox, snapshot, tally, writeFixture,
} from "./lib/harness.mjs";

const COFFEE3_TEA2 = () => counters([["coffee", 3], ["tea", 2]]);

for (const [id, args, what] of [
  ["T-REQ-03-N4", ["reset"], "reset with no name"],
  ["T-REQ-03-N5", ["reset", ""], 'reset ""'],
  ["T-REQ-03-N6", ["reset", "a b"], 'reset "a b"'],
  ["T-REQ-03-N7", ["reset", "a", "b"], "reset a b"],
]) {
  test(`${id} ${what} exits 2, refusal, file unchanged [X]`, (t) => {
    const sb = sandbox(t);
    writeFixture(sb, COFFEE3_TEA2());
    const before = snapshot(sb);
    const r = tally(sb.work, args);
    expectExit(r, 2);
    expectRefusal(r);
    assertUnchanged(sb, before);
  });
}
