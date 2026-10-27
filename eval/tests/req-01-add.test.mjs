// REQ-01: Add to a counter (story 1). Rows of docs/eval-plan.md section 5, one case per row.
import { test } from "node:test";
import {
  DAMAGED, assertListing, assertParentListing, assertRecorderWorks, assertUnchanged, assertUnchangedPerm,
  counters, damaged, expectExit, expectNoNetwork, expectReadback, expectRefusal, expectSilent, guard,
  lines, makePermState, readback, sandbox, snapshot, tally, tallyWatched, writeFixture,
} from "./lib/harness.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";

const COFFEE3 = () => counters([["coffee", 3]]);

test("T-REQ-01-P1 add coffee beside tea 2 creates coffee at 1, silent, exit 0", (t) => {
  const sb = sandbox(t);
  writeFixture(sb, counters([["tea", 2]]));
  const r = tally(sb.work, ["add", "coffee"]);
  expectExit(r, 0);
  expectSilent(r);
  expectReadback(sb.work, lines("coffee 1", "tea 2"));
});

test("T-REQ-01-P2 add coffee raises coffee 3 to 4, every other counter as before", (t) => {
  const sb = sandbox(t);
  writeFixture(sb, counters([["coffee", 3], ["tea", 2], ["B", 5]]));
  const r = tally(sb.work, ["add", "coffee"]);
  expectExit(r, 0);
  expectSilent(r);
  expectReadback(sb.work, lines("B 5", "coffee 4", "tea 2"));
});

test("T-REQ-01-P3 add coffee with no tally.json creates it with coffee at 1", (t) => {
  const sb = sandbox(t);
  const r = tally(sb.work, ["add", "coffee"]);
  expectExit(r, 0);
  expectSilent(r);
  assert.ok(fs.existsSync(sb.file), "tally.json does not exist after add coffee");
  expectReadback(sb.work, lines("coffee 1"));
});

test("T-REQ-01-P4 add Coffee beside coffee 3 creates Coffee at 1 and leaves coffee at 3", (t) => {
  const sb = sandbox(t);
  writeFixture(sb, COFFEE3());
  const r = tally(sb.work, ["add", "Coffee"]);
  expectExit(r, 0);
  expectReadback(sb.work, lines("Coffee 1", "coffee 3"));
});

test("T-REQ-01-P5 add -x creates the counter -x at 1", (t) => {
  const sb = sandbox(t);
  writeFixture(sb, COFFEE3());
  const r = tally(sb.work, ["add", "-x"]);
  expectExit(r, 0);
  const out = readback(sb.work);
  assert.ok(out.split("\n").includes("-x 1"), `Readback by list: stdout ${JSON.stringify(out)} has no line "-x 1"`);
});

for (const [id, args, what] of [
  ["T-REQ-01-N1", ["add"], "add with no name"],
  ["T-REQ-01-N2", ["add", ""], 'add ""'],
  ["T-REQ-01-N3", ["add", "a b"], 'add "a b"'],
]) {
  test(`${id} ${what} exits 2, refusal, file unchanged [X]`, (t) => {
    const sb = sandbox(t);
    writeFixture(sb, COFFEE3());
    const before = snapshot(sb);
    const r = tally(sb.work, args);
    expectExit(r, 2);
    expectRefusal(r);
    assertUnchanged(sb, before);
  });
}

test("T-REQ-01-N4 add a b exits 2, refusal, file unchanged, no counter a or b [X]", (t) => {
  const sb = sandbox(t);
  writeFixture(sb, COFFEE3());
  const before = snapshot(sb);
  const r = tally(sb.work, ["add", "a", "b"]);
  expectExit(r, 2);
  expectRefusal(r);
  assertUnchanged(sb, before);
  expectReadback(sb.work, lines("coffee 3"));
});

test("T-REQ-01-N5 add coffee on each damaged file D1 to D14 exits 1, refusal, bytes unchanged [G add]", async (t) => {
  guard("add");
  for (const d of DAMAGED) {
    await t.test(`${d.id} ${d.what}`, (st) => {
      const sb = sandbox(st);
      writeFixture(sb, d.bytes);
      const before = snapshot(sb);
      const r = tally(sb.work, ["add", "coffee"]);
      expectExit(r, 1);
      expectRefusal(r);
      assertUnchanged(sb, before);
    });
  }
});

for (const [id, state, what] of [
  ["T-REQ-01-N6", "U-read", "an unreadable tally.json (U-read)"],
  ["T-REQ-01-N7", "U-file", "a tally.json that does not allow writing (U-file)"],
  ["T-REQ-01-N9", "U-dir", "a writable tally.json in a directory that does not allow writing (U-dir)"],
]) {
  test(`${id} add coffee on ${what} exits 1, refusal, file unchanged [G add]`, (t) => {
    const sb = sandbox(t);
    const before = makePermState(sb, state, COFFEE3());
    guard("add");
    const r = tally(sb.work, ["add", "coffee"]);
    expectExit(r, 1);
    expectRefusal(r);
    assertUnchangedPerm(sb, before);
  });
}

test("T-REQ-01-N8 add coffee with no file in a directory that does not allow writing (U-dirabsent) exits 1, file still absent [G add]", (t) => {
  const sb = sandbox(t);
  const before = makePermState(sb, "U-dirabsent");
  guard("add");
  const r = tally(sb.work, ["add", "coffee"]);
  expectExit(r, 1);
  expectRefusal(r);
  assertUnchangedPerm(sb, before);
});

test("T-REQ-01-N10 add stores nothing but tally.json, after success and failure alike [R] [G add]", async (t) => {
  guard("add");
  const plain = [
    ["no file", null, ["add", "coffee"], 0, ["tally.json"]],
    ["a file holding coffee 3", COFFEE3(), ["add", "coffee"], 0, ["tally.json"]],
    ["a damaged file (D1)", damaged("D1").bytes, ["add", "coffee"], 1, ["tally.json"]],
    ["the usage error add a b", COFFEE3(), ["add", "a", "b"], 2, ["tally.json"]],
  ];
  for (const [what, content, args, code, expected] of plain) {
    await t.test(what, (st) => {
      const sb = sandbox(st);
      if (content) writeFixture(sb, content);
      const r = tally(sb.work, args);
      expectExit(r, code);
      assertListing(sb, expected);
    });
  }
  for (const [state, expected] of [["U-file", ["tally.json"]], ["U-dir", ["tally.json"]], ["U-dirabsent", []]]) {
    await t.test(state, (st) => {
      const sb = sandbox(st);
      makePermState(sb, state, COFFEE3());
      const r = tally(sb.work, ["add", "coffee"]);
      expectExit(r, 1);
      sb.restore();
      assertListing(sb, expected);
    });
  }
});

test("T-REQ-01-N11 add makes no network attempt, on success and on failure [R] [G add]", (t) => {
  guard("add");
  assertRecorderWorks(t);
  const ok = sandbox(t);
  writeFixture(ok, COFFEE3());
  const w1 = tallyWatched(t, ok.work, ["add", "coffee"]);
  expectExit(w1.r, 0);
  expectNoNetwork(w1);
  const bad = sandbox(t);
  writeFixture(bad, damaged("D1").bytes);
  const w2 = tallyWatched(t, bad.work, ["add", "coffee"]);
  expectExit(w2.r, 1);
  expectNoNetwork(w2);
});

test("T-REQ-01-N12 a name is data, never executed or used as a path [R]", async (t) => {
  for (const name of ["../x", "__proto__", "constructor", "a/b", "$HOME", "*"]) {
    await t.test(`add ${name}`, (st) => {
      const sb = sandbox(st);
      const r = tally(sb.work, ["add", name]);
      expectExit(r, 0);
      expectSilent(r);
      expectReadback(sb.work, lines(`${name} 1`));
      assertListing(sb, ["tally.json"]);
      assertParentListing(sb);
    });
  }
  await t.test("add __proto__ beside coffee 3", (st) => {
    const sb = sandbox(st);
    writeFixture(sb, COFFEE3());
    const r = tally(sb.work, ["add", "__proto__"]);
    expectExit(r, 0);
    expectReadback(sb.work, lines("__proto__ 1", "coffee 3"));
  });
});

test("T-REQ-01-N13 a successful add writes nothing to stdout or stderr [R]", async (t) => {
  const cases = [
    ["no file", null, [["add", "coffee"]]],
    ["a file holding other counters", counters([["tea", 2], ["B", 5]]), [["add", "coffee"]]],
    ["the same name added three times in a row", null, [["add", "coffee"], ["add", "coffee"], ["add", "coffee"]]],
    ["Coffee beside coffee", COFFEE3(), [["add", "Coffee"]]],
    ["-x", COFFEE3(), [["add", "-x"]]],
  ];
  for (const [what, content, runs] of cases) {
    await t.test(what, (st) => {
      const sb = sandbox(st);
      if (content) writeFixture(sb, content);
      for (const args of runs) {
        const r = tally(sb.work, args);
        expectExit(r, 0);
        expectSilent(r);
      }
    });
  }
});
