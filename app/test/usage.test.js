import assert from "node:assert/strict";
import { test } from "node:test";
import { isUsageError } from "../src/errors.js";
import { parseUsage } from "../src/usage.js";

const refused = (args) => assert.throws(() => parseUsage(args), (err) => isUsageError(err));

test("a command that takes a name returns it as typed", () => {
  assert.deepEqual(parseUsage(["add", "Coffee"]), { command: "add", name: "Coffee" });
  assert.deepEqual(parseUsage(["reset", "-x"]), { command: "reset", name: "-x" });
  assert.deepEqual(parseUsage(["remove", "__proto__"]), { command: "remove", name: "__proto__" });
});

test("list takes no argument", () => {
  assert.deepEqual(parseUsage(["list"]), { command: "list", name: undefined });
  refused(["list", "x"]);
  refused(["list", ""]);
});

test("a missing or unknown command is refused", () => {
  for (const args of [[], ["frobnicate"], ["--help"], ["-h"], ["Add", "coffee"]]) refused(args);
});

test("a missing, empty, whitespace or extra name is refused for each command that takes one", () => {
  for (const command of ["add", "reset", "remove"]) {
    for (const rest of [[], [""], ["a b"], ["a\tb"], ["a b"], ["a　b"], ["a", "b"]]) refused([command, ...rest]);
  }
});

test("a usage message is one line even when the name holds a line break", () => {
  assert.throws(() => parseUsage(["add", "a\nb"]), (err) => isUsageError(err) && !err.message.includes("\n"));
});
