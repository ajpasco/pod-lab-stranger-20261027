// REQ-03: Reset a counter to zero (story 2, freeze packet 2). Rows of docs/eval-plan.md
// section 5, one case per row. N4 to N7 are story 1's, in req-03-reset-usage.test.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DAMAGED, assertListing, assertParentListing, assertRecorderWorks, assertUnchanged, assertUnchangedPerm,
  counters, damaged, describe, expectExit, expectNoNetwork, expectReadback, expectRefusal, expectSilent,
  guard, lines, listText, makePermState, sandbox, snapshot, tally, tallyWatched, writeFixture,
} from "./lib/harness.mjs";

const COFFEE3 = () => counters([["coffee", 3]]);
const COFFEE3_TEA2 = () => counters([["coffee", 3], ["tea", 2]]);

test("T-REQ-03-P1 reset coffee sets coffee 3 to 0, tea 2 as before, silent, exit 0", (t) => {
  const sb = sandbox(t);
  writeFixture(sb, COFFEE3_TEA2());
  const r = tally(sb.work, ["reset", "coffee"]);
  expectExit(r, 0);
  expectSilent(r);
  expectReadback(sb.work, lines("coffee 0", "tea 2"));
});

test("T-REQ-03-P2 after reset coffee, list includes the line coffee 0", (t) => {
  const sb = sandbox(t);
  writeFixture(sb, COFFEE3_TEA2());
  const r = tally(sb.work, ["reset", "coffee"]);
  expectExit(r, 0);
  const l = tally(sb.work, ["list"]);
  expectExit(l, 0);
  assert.ok(l.stdout.split("\n").includes("coffee 0"), `list stdout has no line "coffee 0" (${describe(l)})`);
});

test("T-REQ-03-N1 reset coffee with no counter coffee exits 1, refusal, file unchanged [G reset]", (t) => {
  guard("reset");
  const sb = sandbox(t);
  writeFixture(sb, counters([["tea", 2]]));
  const before = snapshot(sb);
  const r = tally(sb.work, ["reset", "coffee"]);
  expectExit(r, 1);
  expectRefusal(r);
  assertUnchanged(sb, before);
});

test("T-REQ-03-N2 reset coffee with no tally.json exits 1, refusal, file still absent [G reset]", (t) => {
  guard("reset");
  const sb = sandbox(t);
  const before = snapshot(sb);
  const r = tally(sb.work, ["reset", "coffee"]);
  expectExit(r, 1);
  expectRefusal(r);
  assertUnchanged(sb, before);
});

test("T-REQ-03-N3 reset Coffee beside coffee 3 exits 1, refusal, coffee still 3 [G reset]", (t) => {
  guard("reset");
  const sb = sandbox(t);
  writeFixture(sb, COFFEE3());
  const before = snapshot(sb);
  const r = tally(sb.work, ["reset", "Coffee"]);
  expectExit(r, 1);
  expectRefusal(r);
  assertUnchanged(sb, before);
  expectReadback(sb.work, lines("coffee 3"));
});

test("T-REQ-03-N8 reset coffee on each damaged file D1 to D14 exits 1, refusal, file unchanged [G reset]", async (t) => {
  guard("reset");
  for (const d of DAMAGED) {
    await t.test(`${d.id} ${d.what}`, (st) => {
      const sb = sandbox(st);
      writeFixture(sb, d.bytes);
      const before = snapshot(sb);
      const r = tally(sb.work, ["reset", "coffee"]);
      expectExit(r, 1);
      expectRefusal(r);
      assertUnchanged(sb, before);
    });
  }
});

for (const [id, state, what] of [
  ["T-REQ-03-N9", "U-read", "an unreadable tally.json (U-read)"],
  ["T-REQ-03-N10", "U-file", "a tally.json that does not allow writing (U-file)"],
  ["T-REQ-03-N11", "U-dir", "a writable tally.json in a directory that does not allow writing (U-dir)"],
]) {
  test(`${id} reset coffee on ${what} exits 1, refusal, file unchanged [G reset]`, (t) => {
    const sb = sandbox(t);
    const before = makePermState(sb, state, COFFEE3());
    guard("reset");
    const r = tally(sb.work, ["reset", "coffee"]);
    expectExit(r, 1);
    expectRefusal(r);
    assertUnchangedPerm(sb, before);
  });
}

test("T-REQ-03-N12 reset stores nothing but tally.json, after success and failure alike [R] [G reset]", async (t) => {
  guard("reset");
  for (const [what, content, args, code] of [
    ["a file holding coffee 3 (success)", COFFEE3(), ["reset", "coffee"], 0],
    ["no coffee (failure)", counters([["tea", 2]]), ["reset", "coffee"], 1],
    ["a damaged file (D1)", damaged("D1").bytes, ["reset", "coffee"], 1],
    ["the usage error reset a b", COFFEE3(), ["reset", "a", "b"], 2],
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
      const r = tally(sb.work, ["reset", "coffee"]);
      expectExit(r, 1);
      sb.restore();
      assertListing(sb, ["tally.json"]);
    });
  }
});

test("T-REQ-03-N13 reset makes no network attempt, on success and on failure [R] [G reset]", (t) => {
  guard("reset");
  assertRecorderWorks(t);
  const ok = sandbox(t);
  writeFixture(ok, COFFEE3());
  const w1 = tallyWatched(t, ok.work, ["reset", "coffee"]);
  expectExit(w1.r, 0);
  expectNoNetwork(w1);
  const missing = sandbox(t);
  writeFixture(missing, COFFEE3());
  const w2 = tallyWatched(t, missing.work, ["reset", "tea"]);
  expectExit(w2.r, 1);
  expectNoNetwork(w2);
});

test("T-REQ-03-N14 a name is data: reset of path-like and object-property names [R] [G reset]", async (t) => {
  guard("reset");
  const NAMES = ["../x", "__proto__", "constructor", "a/b"];
  await t.test("reset each name created with add beside coffee 3", (st) => {
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
      const r = tally(sb.work, ["reset", name]);
      expectExit(r, 0);
      expectSilent(r);
      model.set(name, 0);
      expectReadback(sb.work, listText(model));
      assertListing(sb, ["tally.json"]);
      assertParentListing(sb);
    }
  });
  for (const name of ["__proto__", "constructor", "toString"]) {
    await t.test(`reset ${name} on a file holding only coffee 3`, (st) => {
      const sb = sandbox(st);
      writeFixture(sb, COFFEE3());
      const before = snapshot(sb);
      const r = tally(sb.work, ["reset", name]);
      expectExit(r, 1);
      assertUnchanged(sb, before);
    });
  }
});
