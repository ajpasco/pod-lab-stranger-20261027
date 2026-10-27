// REQ-02: List the counters (story 1). Rows of docs/eval-plan.md section 5, one case per row.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DAMAGED, assertListing, assertRecorderWorks, assertUnchanged, assertUnchangedPerm, counters, damaged,
  describe, expectExit, expectNoNetwork, expectRefusal, guard, lines, listing, makePermState, sandbox,
  snapshot, tally, tallyWatched, writeFixture,
} from "./lib/harness.mjs";

const COFFEE3 = () => counters([["coffee", 3]]);
const BAB = () => counters([["b", 2], ["a", 1], ["B", 5]]);

function expectStdout(r, expected) {
  assert.equal(r.stdout, expected, `stdout ${JSON.stringify(r.stdout)}, expected exactly ${JSON.stringify(expected)} (${describe(r)})`);
}

test("T-REQ-02-P1 list prints coffee 3 as one line ending in a line feed", (t) => {
  const sb = sandbox(t);
  writeFixture(sb, COFFEE3());
  const r = tally(sb.work, ["list"]);
  expectExit(r, 0);
  expectStdout(r, "coffee 3\n");
});

test("T-REQ-02-P2 list prints b 2, a 1, B 5 as B 5, a 1, b 2, stderr empty", (t) => {
  const sb = sandbox(t);
  writeFixture(sb, BAB());
  const r = tally(sb.work, ["list"]);
  expectExit(r, 0);
  expectStdout(r, lines("B 5", "a 1", "b 2"));
  assert.equal(r.stderr, "", `expected stderr empty (${describe(r)})`);
});

test("T-REQ-02-P3 list prints a counter at 0 as coffee 0", (t) => {
  const sb = sandbox(t);
  writeFixture(sb, counters([["coffee", 0]]));
  const r = tally(sb.work, ["list"]);
  expectExit(r, 0);
  expectStdout(r, "coffee 0\n");
});

test("T-REQ-02-P4 list with no counters prints nothing, exit 0", (t) => {
  const sb = sandbox(t);
  writeFixture(sb, counters([]));
  const r = tally(sb.work, ["list"]);
  expectExit(r, 0);
  expectStdout(r, "");
});

test("T-REQ-02-P5 list with no tally.json prints nothing, exit 0, and creates no file", (t) => {
  const sb = sandbox(t);
  const before = snapshot(sb);
  const r = tally(sb.work, ["list"]);
  expectExit(r, 0);
  expectStdout(r, "");
  assertUnchanged(sb, before);
});

test("T-REQ-02-P6 after every successful list the file is unchanged", async (t) => {
  for (const [what, content] of [
    ["a file with counters", counters([["coffee", 3], ["tea", 2]])],
    ["a file with none", counters([])],
    ["no file", null],
  ]) {
    await t.test(what, (st) => {
      const sb = sandbox(st);
      if (content) writeFixture(sb, content);
      const before = snapshot(sb);
      const r = tally(sb.work, ["list"]);
      expectExit(r, 0);
      assertUnchanged(sb, before);
    });
  }
  for (const state of ["U-file", "U-dir"]) {
    await t.test(state, (st) => {
      const sb = sandbox(st);
      const before = makePermState(sb, state, COFFEE3());
      const r = tally(sb.work, ["list"]);
      expectExit(r, 0);
      assertUnchangedPerm(sb, before);
    });
  }
});

test("T-REQ-02-P7 list on an unwritable file (U-file, U-dir) prints the sorted counters, exit 0, file unchanged", async (t) => {
  for (const state of ["U-file", "U-dir"]) {
    await t.test(state, (st) => {
      const sb = sandbox(st);
      const before = makePermState(sb, state, BAB());
      const r = tally(sb.work, ["list"]);
      expectExit(r, 0);
      expectStdout(r, lines("B 5", "a 1", "b 2"));
      assertUnchangedPerm(sb, before);
    });
  }
});

test("T-REQ-02-N1 list x exits 2, refusal, file unchanged [X]", (t) => {
  const sb = sandbox(t);
  writeFixture(sb, COFFEE3());
  const before = snapshot(sb);
  const r = tally(sb.work, ["list", "x"]);
  expectExit(r, 2);
  expectRefusal(r);
  assertUnchanged(sb, before);
});

test("T-REQ-02-N2 list on each damaged file D1 to D14 exits 1, refusal, file unchanged [G list]", async (t) => {
  guard("list");
  for (const d of DAMAGED) {
    await t.test(`${d.id} ${d.what}`, (st) => {
      const sb = sandbox(st);
      writeFixture(sb, d.bytes);
      const before = snapshot(sb);
      const r = tally(sb.work, ["list"]);
      expectExit(r, 1);
      expectRefusal(r);
      assertUnchanged(sb, before);
    });
  }
});

test("T-REQ-02-N3 list on an unreadable tally.json (U-read) exits 1, refusal, file unchanged [G list]", (t) => {
  const sb = sandbox(t);
  const before = makePermState(sb, "U-read", COFFEE3());
  guard("list");
  const r = tally(sb.work, ["list"]);
  expectExit(r, 1);
  expectRefusal(r);
  assertUnchangedPerm(sb, before);
});

test("T-REQ-02-N4 list creates no file and stores nothing [R] [G list]", async (t) => {
  guard("list");
  for (const [what, content, out] of [
    ["a file with counters", counters([["coffee", 3], ["tea", 2]]), lines("coffee 3", "tea 2")],
    ["a file with none", counters([]), ""],
    ["no file", null, ""],
  ]) {
    await t.test(what, (st) => {
      const sb = sandbox(st);
      if (content) writeFixture(sb, content);
      const names = listing(sb.work);
      const before = snapshot(sb);
      const r = tally(sb.work, ["list"]);
      expectExit(r, 0);
      expectStdout(r, out);
      assertListing(sb, names);
      assertUnchanged(sb, before);
    });
  }
  for (const state of ["U-file", "U-dir"]) {
    await t.test(state, (st) => {
      const sb = sandbox(st);
      const before = makePermState(sb, state, COFFEE3());
      const names = listing(sb.work);
      const r = tally(sb.work, ["list"]);
      expectExit(r, 0);
      expectStdout(r, "coffee 3\n");
      assertUnchangedPerm(sb, before);
      assertListing(sb, names);
    });
  }
});

test("T-REQ-02-N5 list makes no network attempt, on success and on failure [R] [G list]", (t) => {
  guard("list");
  assertRecorderWorks(t);
  const ok = sandbox(t);
  writeFixture(ok, COFFEE3());
  const w1 = tallyWatched(t, ok.work, ["list"]);
  expectExit(w1.r, 0);
  expectStdout(w1.r, "coffee 3\n");
  expectNoNetwork(w1);
  const bad = sandbox(t);
  writeFixture(bad, damaged("D1").bytes);
  const w2 = tallyWatched(t, bad.work, ["list"]);
  expectExit(w2.r, 1);
  expectNoNetwork(w2);
});
