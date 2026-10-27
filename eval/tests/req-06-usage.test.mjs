// REQ-06: Check usage before touching the file (story 1). Rows of docs/eval-plan.md section 5, one
// case per row.
import { test } from "node:test";
import {
  D_SHORT, assertUnchanged, assertUnchangedPerm, counters, damaged, expectExit, expectRefusal, guard,
  makePermState, sandbox, snapshot, tally, writeFixture,
} from "./lib/harness.mjs";

const COFFEE3 = () => counters([["coffee", 3]]);

test("T-REQ-06-P1 a correctly used list and add coffee reach a damaged file: exit 1 and not 2 [G list] [G add]", async (t) => {
  guard("list");
  guard("add");
  for (const d of [damaged("D1"), damaged("D4")]) {
    for (const args of [["list"], ["add", "coffee"]]) {
      await t.test(`${d.id} ${args.join(" ")}`, (st) => {
        const sb = sandbox(st);
        writeFixture(sb, d.bytes);
        const before = snapshot(sb);
        const r = tally(sb.work, args);
        expectExit(r, 1);
        expectRefusal(r);
        assertUnchanged(sb, before);
      });
    }
  }
});

for (const [id, args, what] of [
  ["T-REQ-06-N1", ["add"], "add with no name"],
  ["T-REQ-06-N2", ["reset"], "reset with no name"],
  ["T-REQ-06-N3", ["remove", "a b"], 'remove "a b"'],
  ["T-REQ-06-N4", ["list", "x"], "list x"],
]) {
  test(`${id} ${what} on a damaged file (D-short) exits 2 and not 1, refusal, file unchanged [X]`, async (t) => {
    for (const d of D_SHORT) {
      await t.test(`${d.id} ${d.what}`, (st) => {
        const sb = sandbox(st);
        writeFixture(sb, d.bytes);
        const before = snapshot(sb);
        const r = tally(sb.work, args);
        expectExit(r, 2);
        expectRefusal(r);
        assertUnchanged(sb, before);
      });
    }
  });
}

test("T-REQ-06-N5 add a b on an unreadable tally.json (U-read) exits 2 and not 1, refusal, file unchanged [X]", (t) => {
  const sb = sandbox(t);
  const before = makePermState(sb, "U-read", COFFEE3());
  const r = tally(sb.work, ["add", "a", "b"]);
  expectExit(r, 2);
  expectRefusal(r);
  assertUnchangedPerm(sb, before);
});

test("T-REQ-06-N6 add a b on an unwritable tally.json (U-file, U-dir) exits 2 and not 1, refusal, file unchanged [X]", async (t) => {
  for (const state of ["U-file", "U-dir"]) {
    await t.test(state, (st) => {
      const sb = sandbox(st);
      const before = makePermState(sb, state, COFFEE3());
      const r = tally(sb.work, ["add", "a", "b"]);
      expectExit(r, 2);
      expectRefusal(r);
      assertUnchangedPerm(sb, before);
    });
  }
});
