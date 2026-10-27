import assert from "node:assert/strict";
import { test } from "node:test";
import { run, writes } from "../src/commands/reset.js";
import { isCouldNotBeCarriedOut } from "../src/errors.js";

test("reset writes", () => {
  assert.equal(writes, true);
});

test("reset sets an existing counter to 0 and keeps the others", () => {
  const before = new Map([["coffee", 3], ["tea", 2]]);
  const { counters, output } = run(before, "coffee");
  assert.deepEqual([...counters], [["coffee", 0], ["tea", 2]]);
  assert.equal(output, "");
  assert.equal(before.get("coffee"), 3, "the counters given are not changed in place");
});

test("reset of a missing counter could not be carried out, and names are case-sensitive", () => {
  const before = new Map([["coffee", 3]]);
  assert.throws(() => run(before, "Coffee"), isCouldNotBeCarriedOut);
  assert.throws(() => run(new Map(), "coffee"), isCouldNotBeCarriedOut);
  assert.equal(before.get("coffee"), 3);
});

test("a name such as __proto__ is an ordinary counter", () => {
  assert.deepEqual([...run(new Map([["__proto__", 5]]), "__proto__").counters], [["__proto__", 0]]);
  assert.throws(() => run(new Map(), "__proto__"), isCouldNotBeCarriedOut);
});
