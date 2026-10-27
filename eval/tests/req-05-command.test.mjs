// REQ-05: Refuse a missing or unknown command (story 1). Rows of docs/eval-plan.md section 5, one
// case per row.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  D_SHORT, assertListing, assertUnchanged, counters, describe, expectExit, expectReadback, expectRefusal,
  lines, sandbox, snapshot, tally, writeFixture,
} from "./lib/harness.mjs";

const COFFEE3 = () => counters([["coffee", 3]]);

function refusedUnchanged(t, args) {
  const sb = sandbox(t);
  writeFixture(sb, COFFEE3());
  const before = snapshot(sb);
  const r = tally(sb.work, args);
  expectExit(r, 2);
  expectRefusal(r);
  assertUnchanged(sb, before);
  return sb;
}

test("T-REQ-05-P1 add coffee and list are not refused as unknown commands: each exits 0", (t) => {
  const sb = sandbox(t);
  writeFixture(sb, COFFEE3());
  expectExit(tally(sb.work, ["add", "coffee"]), 0);
  expectExit(tally(sb.work, ["list"]), 0);
});

test("T-REQ-05-N1 tally with no command exits 2, refusal, file unchanged [X]", (t) => {
  refusedUnchanged(t, []);
});

test("T-REQ-05-N2 frobnicate exits 2, refusal, file unchanged [X]", (t) => {
  refusedUnchanged(t, ["frobnicate"]);
});

test("T-REQ-05-N3 --help and -h each exit 2, no help text on stdout, stderr non-empty, file unchanged [X]", async (t) => {
  for (const arg of ["--help", "-h"]) {
    await t.test(arg, (st) => {
      const sb = sandbox(st);
      writeFixture(sb, COFFEE3());
      const before = snapshot(sb);
      const r = tally(sb.work, [arg]);
      expectExit(r, 2);
      assert.equal(r.stdout, "", `expected stdout empty (${describe(r)})`);
      assert.ok(/\S/u.test(r.stderr), `expected stderr non-empty (${describe(r)})`);
      assertUnchanged(sb, before);
    });
  }
});

test("T-REQ-05-N4 Add coffee exits 2, refusal, file unchanged, no counter created [X]", (t) => {
  const sb = refusedUnchanged(t, ["Add", "coffee"]);
  expectReadback(sb.work, lines("coffee 3"));
});

test("T-REQ-05-N5 frobnicate on a damaged file (D-short) exits 2 and not 1, bytes unchanged [X]", async (t) => {
  for (const d of D_SHORT) {
    await t.test(`${d.id} ${d.what}`, (st) => {
      const sb = sandbox(st);
      writeFixture(sb, d.bytes);
      const before = snapshot(sb);
      const r = tally(sb.work, ["frobnicate"]);
      expectExit(r, 2);
      assert.ok(/\S/u.test(r.stderr), `expected stderr non-empty (${describe(r)})`);
      assertUnchanged(sb, before);
    });
  }
});

test("T-REQ-05-N6 a refused command stores nothing and creates no file [R] [X]", (t) => {
  const sb = sandbox(t);
  for (const args of [[], ["frobnicate"], ["--help"], ["-h"], ["Add", "coffee"]]) {
    const r = tally(sb.work, args);
    expectExit(r, 2);
    assert.equal(r.stdout, "", `expected stdout empty (${describe(r)})`);
    assertListing(sb, [], `Dir listing after tally ${JSON.stringify(args)}`);
  }
});
