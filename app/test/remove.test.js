import assert from "node:assert/strict";
import { test } from "node:test";
import { run, writes } from "../src/commands/remove.js";
import { isCouldNotBeCarriedOut } from "../src/errors.js";

test("remove writes", () => {
  assert.equal(writes, true);
});

test("remove deletes an existing counter and keeps the others", () => {
  const before = new Map([["coffee", 3], ["tea", 2]]);
  const { counters, output } = run(before, "coffee");
  assert.deepEqual([...counters], [["tea", 2]]);
  assert.equal(output, "");
  assert.equal(before.get("coffee"), 3, "the counters given are not changed in place");
});

test("remove of a missing counter could not be carried out, and names are case-sensitive", () => {
  const before = new Map([["coffee", 3]]);
  assert.throws(() => run(before, "Coffee"), isCouldNotBeCarriedOut);
  assert.throws(() => run(new Map(), "coffee"), isCouldNotBeCarriedOut);
  assert.equal(before.get("coffee"), 3);
});

test("a name such as __proto__ is an ordinary counter", () => {
  assert.deepEqual([...run(new Map([["__proto__", 5]]), "__proto__").counters], []);
  assert.throws(() => run(new Map(), "__proto__"), isCouldNotBeCarriedOut);
});
