import assert from "node:assert/strict";
import { test } from "node:test";
import { run, writes } from "../src/commands/add.js";

test("add writes", () => {
  assert.equal(writes, true);
});

test("add creates a missing counter at 1 and raises an existing one by 1", () => {
  const before = new Map([["coffee", 3], ["tea", 2]]);
  const { counters, output } = run(before, "coffee");
  assert.deepEqual([...run(counters, "Coffee").counters], [["coffee", 4], ["tea", 2], ["Coffee", 1]]);
  assert.equal(output, "");
  assert.equal(before.get("coffee"), 3, "the counters given are not changed in place");
});

test("a name such as __proto__ is an ordinary counter", () => {
  assert.deepEqual([...run(new Map(), "__proto__").counters], [["__proto__", 1]]);
});
