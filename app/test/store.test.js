import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { isCouldNotBeCarriedOut } from "../src/errors.js";
import { readCounters, writeCounters } from "../src/store.js";

// store.js works on tally.json in the current directory, so each test runs in a fresh one.
function inFreshDirectory(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tally-store-"));
  const previous = process.cwd();
  process.chdir(dir);
  t.after(() => {
    process.chdir(previous);
    fs.chmodSync(dir, 0o755);
    fs.rmSync(dir, { recursive: true, force: true });
  });
  return dir;
}

const refused = (fn) => assert.throws(fn, (err) => isCouldNotBeCarriedOut(err));

test("a missing file is no counters, and reading does not create it", (t) => {
  const dir = inFreshDirectory(t);
  assert.deepEqual([...readCounters()], []);
  assert.deepEqual(fs.readdirSync(dir), []);
});

test("written counters read back, __proto__ included, and nothing else is left", (t) => {
  const dir = inFreshDirectory(t);
  writeCounters(new Map([["coffee", 3], ["__proto__", 1]]));
  assert.deepEqual([...readCounters()], [["coffee", 3], ["__proto__", 1]]);
  assert.deepEqual(fs.readdirSync(dir), ["tally.json"]);
});

test("1.0 and 1e2 are whole numbers; a key written twice keeps the last value", (t) => {
  inFreshDirectory(t);
  fs.writeFileSync("tally.json", "{\"a\":1.0,\"b\":1e2,\"c\":1,\"c\":4}");
  assert.deepEqual([...readCounters()], [["a", 1], ["b", 100], ["c", 4]]);
});

test("each damaged layout is refused", (t) => {
  inFreshDirectory(t);
  const damaged = ["", "not json", "\uFEFF{}", "[]", "null", "3", "\"x\"", "true", "{\"a\":-1}", "{\"a\":1.5}",
    "{\"a\":\"1\"}", "{\"a\":null}", "{\"a\":false}", "{\"a\":{}}", "{\"a\":[]}", "{\"a\":9007199254740992}", "{\"\":1}",
    "{\"a\\u00a0b\":1}"];
  for (const text of damaged) {
    fs.writeFileSync("tally.json", text);
    refused(() => readCounters());
  }
  fs.writeFileSync("tally.json", "{\"a\":9007199254740991}");
  assert.deepEqual([...readCounters()], [["a", 9007199254740991]]);
});

test("a write keeps the existing file's permission mode", (t) => {
  inFreshDirectory(t);
  fs.writeFileSync("tally.json", "{}");
  fs.chmodSync("tally.json", 0o640);
  writeCounters(new Map([["a", 1]]));
  assert.equal(fs.statSync("tally.json").mode & 0o777, 0o640);
});

test("a file that does not allow writing is refused and left as it was", (t) => {
  if (process.getuid?.() === 0) return t.skip("root writes regardless of mode");
  const dir = inFreshDirectory(t);
  fs.writeFileSync("tally.json", "{\"a\":1}");
  fs.chmodSync("tally.json", 0o444);
  refused(() => writeCounters(new Map([["a", 2]])));
  assert.equal(fs.readFileSync("tally.json", "utf8"), "{\"a\":1}");
  assert.deepEqual(fs.readdirSync(dir), ["tally.json"]);
});

test("a directory that does not allow writing is refused and holds no temporary file", (t) => {
  if (process.getuid?.() === 0) return t.skip("root writes regardless of mode");
  const dir = inFreshDirectory(t);
  fs.chmodSync(dir, 0o555);
  refused(() => writeCounters(new Map([["a", 1]])));
  assert.deepEqual(fs.readdirSync(dir), []);
});
