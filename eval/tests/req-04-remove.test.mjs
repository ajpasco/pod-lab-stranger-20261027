// REQ-04: Remove a counter (story 2, freeze packet 2). Rows of docs/eval-plan.md
// section 5, one case per row. N4 to N7 are story 1's, in req-04-remove-usage.test.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DAMAGED, assertListing, assertParentListing, assertRecorderWorks, assertUnchanged, assertUnchangedPerm,
  counters, damaged, describe, expectExit, expectNoNetwork, expectReadback, expectRefusal, expectSilent,
  guard, lines, listText, makePermState, sandbox, snapshot, tally, tallyWatched, writeFixture,
} from "./lib/harness.mjs";

const COFFEE3 = () => counters([["coffee", 3]]);
const COFFEE3_TEA2 = () => counters([["coffee", 3], ["tea", 2]]);

test("T-REQ-04-P1 remove coffee leaves only tea 2, silent, exit 0", (t) => {
  const sb = sandbox(t);
  writeFixture(sb, COFFEE3_TEA2());
  const r = tally(sb.work, ["remove", "coffee"]);
  expectExit(r, 0);
  expectSilent(r);
  expectReadback(sb.work, lines("tea 2"));
});

test("T-REQ-04-P2 after remove coffee, list has no line for coffee", (t) => {
  const sb = sandbox(t);
  writeFixture(sb, COFFEE3_TEA2());
  const r = tally(sb.work, ["remove", "coffee"]);
  expectExit(r, 0);
  const l = tally(sb.work, ["list"]);
  expectExit(l, 0);
  const coffeeLines = l.stdout.split("\n").filter((line) => line.split(" ")[0] === "coffee");
  assert.deepEqual(coffeeLines, [], `list stdout still has a line for coffee (${describe(l)})`);
});

test("T-REQ-04-N1 remove coffee with no counter coffee exits 1, refusal, file unchanged [G remove]", (t) => {
  guard("remove");
  const sb = sandbox(t);
  writeFixture(sb, counters([["tea", 2]]));
  const before = snapshot(sb);
  const r = tally(sb.work, ["remove", "coffee"]);
  expectExit(r, 1);
  expectRefusal(r);
  assertUnchanged(sb, before);
});

test("T-REQ-04-N2 remove coffee with no tally.json exits 1, refusal, file still absent [G remove]", (t) => {
  guard("remove");
  const sb = sandbox(t);
  const before = snapshot(sb);
  const r = tally(sb.work, ["remove", "coffee"]);
  expectExit(r, 1);
  expectRefusal(r);
  assertUnchanged(sb, before);
});

test("T-REQ-04-N3 remove Coffee beside coffee 3 exits 1, refusal, coffee still 3 [G remove]", (t) => {
  guard("remove");
  const sb = sandbox(t);
  writeFixture(sb, COFFEE3());
  const before = snapshot(sb);
  const r = tally(sb.work, ["remove", "Coffee"]);
  expectExit(r, 1);
  expectRefusal(r);
  assertUnchanged(sb, before);
  expectReadback(sb.work, lines("coffee 3"));
});

test("T-REQ-04-N8 remove coffee on each damaged file D1 to D14 exits 1, refusal, file unchanged [G remove]", async (t) => {
  guard("remove");
  for (const d of DAMAGED) {
    await t.test(`${d.id} ${d.what}`, (st) => {
      const sb = sandbox(st);
      writeFixture(sb, d.bytes);
      const before = snapshot(sb);
      const r = tally(sb.work, ["remove", "coffee"]);
      expectExit(r, 1);
      expectRefusal(r);
      assertUnchanged(sb, before);
    });
  }
});

for (const [id, state, what] of [
  ["T-REQ-04-N9", "U-read", "an unreadable tally.json (U-read)"],
  ["T-REQ-04-N10", "U-file", "a tally.json that does not allow writing (U-file)"],
  ["T-REQ-04-N11", "U-dir", "a writable tally.json in a directory that does not allow writing (U-dir)"],
]) {
  test(`${id} remove coffee on ${what} exits 1, refusal, file unchanged [G remove]`, (t) => {
    const sb = sandbox(t);
    const before = makePermState(sb, state, COFFEE3());
    guard("remove");
    const r = tally(sb.work, ["remove", "coffee"]);
    expectExit(r, 1);
    expectRefusal(r);
    assertUnchangedPerm(sb, before);
  });
}

test("T-REQ-04-N12 remove stores nothing but tally.json, after success and failure alike [R] [G remove]", async (t) => {
  guard("remove");
  for (const [what, content, args, code] of [
    ["a file holding coffee 3 and tea 2 (success)", COFFEE3_TEA2(), ["remove", "coffee"], 0],
    ["no coffee (failure)", counters([["tea", 2]]), ["remove", "coffee"], 1],
    ["a damaged file (D1)", damaged("D1").bytes, ["remove", "coffee"], 1],
    ["the usage error remove a b", COFFEE3_TEA2(), ["remove", "a", "b"], 2],
  ]) {
    await t.test(what, (st) => {
      const sb = sandbox(st);
      writeFixture(sb, content);
      const r = tally(sb.work, args);
      expectExit(r, code);
      assertListing(sb, ["tally.json"]);
    });
  }
  for (const state of ["U-file", "U-dir"]) {
    await t.test(state, (st) => {
      const sb = sandbox(st);
      makePermState(sb, state, COFFEE3());
      const r = tally(sb.work, ["remove", "coffee"]);
      expectExit(r, 1);
      sb.restore();
      assertListing(sb, ["tally.json"]);
    });
  }
});

test("T-REQ-04-N13 remove makes no network attempt, on success and on failure [R] [G remove]", (t) => {
  guard("remove");
  assertRecorderWorks(t);
  const ok = sandbox(t);
  writeFixture(ok, COFFEE3());
  const w1 = tallyWatched(t, ok.work, ["remove", "coffee"]);
  expectExit(w1.r, 0);
  expectNoNetwork(w1);
  const missing = sandbox(t);
  writeFixture(missing, COFFEE3());
  const w2 = tallyWatched(t, missing.work, ["remove", "tea"]);
  expectExit(w2.r, 1);
  expectNoNetwork(w2);
});

test("T-REQ-04-N14 a name is data: remove of path-like and object-property names [R] [G remove]", async (t) => {
  guard("remove");
  const NAMES = ["../x", "__proto__", "constructor", "a/b"];
  await t.test("remove each name created with add beside coffee 3", (st) => {
    const sb = sandbox(st);
    writeFixture(sb, COFFEE3());
    const model = new Map([["coffee", 3]]);
    for (const name of NAMES) {
      const r = tally(sb.work, ["add", name]);
      if (r.status !== 0) assert.fail(`setup: add ${name} failed (${describe(r)})`);
      model.set(name, 1);
    }
    expectReadback(sb.work, listText(model));
    for (const name of NAMES) {
      const r = tally(sb.work, ["remove", name]);
      expectExit(r, 0);
      expectSilent(r);
      model.delete(name);
      expectReadback(sb.work, listText(model));
      assertListing(sb, ["tally.json"]);
      assertParentListing(sb);
    }
  });
  for (const name of ["__proto__", "constructor", "toString"]) {
    await t.test(`remove ${name} on a file holding only coffee 3`, (st) => {
      const sb = sandbox(st);
      writeFixture(sb, COFFEE3());
      const before = snapshot(sb);
      const r = tally(sb.work, ["remove", name]);
      expectExit(r, 1);
      assertUnchanged(sb, before);
    });
  }
});
