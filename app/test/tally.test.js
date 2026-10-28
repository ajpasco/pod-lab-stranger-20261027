import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const TALLY = fileURLToPath(new URL("../bin/tally.js", import.meta.url));

// The entry point is only seen whole as a process, so each test runs it in a fresh directory.
function freshDirectoryWith(t, counters) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tally-bin-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, "tally.json"), JSON.stringify(counters));
  return dir;
}

// Far more output than a pipe holds, so tally is still writing when the reader goes away.
function manyCounters() {
  const counters = {};
  for (let i = 0; i < 100000; i += 1) counters[`c${String(i).padStart(6, "0")}`] = i;
  return counters;
}

function runTally(cwd, args, stdout, onStdout) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [TALLY, ...args], { cwd, stdio: ["ignore", stdout, "pipe"] });
    let stderr = "";
    if (onStdout) onStdout(child.stdout);
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (status) => resolve({ status, stderr }));
  });
}

test("list into a reader that stops early is silent, exits 0 and leaves the file as it was", async (t) => {
  const dir = freshDirectoryWith(t, manyCounters());
  const before = fs.readFileSync(path.join(dir, "tally.json"));
  let first = "";
  const r = await runTally(dir, ["list"], "pipe", (out) => {
    out.setEncoding("utf8");
    out.once("data", (chunk) => {
      first = chunk;
      out.destroy();
    });
  });
  assert.ok(first.startsWith("c000000 0\n"));
  assert.equal(r.stderr, "");
  assert.equal(r.status, 0);
  assert.deepEqual(fs.readFileSync(path.join(dir, "tally.json")), before);
});

test("any other failure writing stdout is one tally line and exit 1", { skip: !fs.existsSync("/dev/full") }, async (t) => {
  const dir = freshDirectoryWith(t, { coffee: 3 });
  const full = fs.openSync("/dev/full", "w");
  t.after(() => fs.closeSync(full));
  const r = await runTally(dir, ["list"], full);
  assert.match(r.stderr, /^tally: [^\n]+\n$/u);
  assert.equal(r.status, 1);
});
