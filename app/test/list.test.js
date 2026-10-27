import assert from "node:assert/strict";
import { test } from "node:test";
import { run, writes } from "../src/commands/list.js";

test("list never writes", () => {
  assert.equal(writes, false);
});

test("list prints one name and value per line, by code point", () => {
  const counters = new Map([["b", 2], ["a", 1], ["B", 5], ["\u{1F600}", 1], ["�", 7]]);
  assert.equal(run(counters).output, "B 5\na 1\nb 2\n� 7\n\u{1F600} 1\n");
});

test("a shorter name sorts before a longer one it begins", () => {
  assert.equal(run(new Map([["ab", 1], ["a", 2]])).output, "a 2\nab 1\n");
});

test("no counters print nothing", () => {
  assert.equal(run(new Map()).output, "");
});
