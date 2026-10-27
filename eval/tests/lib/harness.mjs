// Shared helpers for the acceptance tests of tally (docs/eval-plan.md, revision 5).
// This file is not a test file (it does not match *.test.mjs). It imports only Node built-ins and
// nothing from app/: tally is observed from outside its process, as `node app/bin/tally.js <args>`.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const REPO = path.resolve(import.meta.dirname, "..", "..", "..");
export const TALLY = path.join(REPO, "app", "bin", "tally.js");
export const NO_NETWORK = path.join(import.meta.dirname, "no-network.cjs");
export const FILE = "tally.json";

const RUN_TIMEOUT_MS = 30000;
const EXCERPT = 300;

// ---------------------------------------------------------------- temporary directories

function restoreModes(p) {
  let st;
  try {
    st = fs.lstatSync(p);
  } catch (err) {
    if (err.code === "ENOENT") return;
    throw err;
  }
  if (st.isSymbolicLink()) return;
  if (st.isDirectory()) {
    fs.chmodSync(p, 0o755);
    for (const name of fs.readdirSync(p)) restoreModes(path.join(p, name));
  } else {
    fs.chmodSync(p, 0o644);
  }
}

// A sandbox is a fresh parent directory (root) holding one working directory (work, named "w").
// The parent listing of section 1 is the listing of root; it must stay exactly ["w"].
export function makeSandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tally-eval-"));
  const work = path.join(root, "w");
  fs.mkdirSync(work);
  const sb = {
    root,
    work,
    file: path.join(work, FILE),
    restore() {
      restoreModes(root);
    },
    cleanup() {
      restoreModes(root);
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
  return sb;
}

// A sandbox removed after the test (or subtest) t, permissions restored first, also on failure.
export function sandbox(t) {
  const sb = makeSandbox();
  t.after(() => sb.cleanup());
  return sb;
}

// A scratch directory outside every sandbox (used for the network log).
export function scratchDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tally-eval-aux-"));
  t.after(() => {
    restoreModes(dir);
    fs.rmSync(dir, { recursive: true, force: true });
  });
  return dir;
}

// ---------------------------------------------------------------- fixtures

// Setup alone writes tally.json, in the layout of TECH-SPEC section 7 (a JSON object of name to
// whole number). Counters are given as an array of [name, value] pairs so the order is explicit.
export function counters(pairs) {
  const obj = {};
  for (const [name, value] of pairs) {
    Object.defineProperty(obj, name, { value, enumerable: true, configurable: true, writable: true });
  }
  return Buffer.from(JSON.stringify(obj), "utf8");
}

export function writeFixture(sb, content) {
  const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
  fs.writeFileSync(sb.file, bytes);
  return bytes;
}

const BOM = Buffer.from([0xef, 0xbb, 0xbf]);

// The damaged starting states of eval plan section 4 (TECH-SPEC section 7, "What counts as damaged").
// Where a single counter is damaged, a valid "coffee" 3 sits beside it, so a build that checks only
// the counter a command names does not pass.
export const DAMAGED = [
  { id: "D1", what: "text that is not JSON", bytes: Buffer.from("coffee 3, not json {", "utf8") },
  { id: "D2", what: "an empty file", bytes: Buffer.alloc(0) },
  { id: "D3", what: "a byte-order mark followed by an otherwise valid object", bytes: Buffer.concat([BOM, Buffer.from('{"coffee":3}', "utf8")]) },
  { id: "D4", what: "a top-level array", bytes: Buffer.from('[{"coffee":3}]', "utf8") },
  { id: "D5", what: "the top-level value null", bytes: Buffer.from("null", "utf8") },
  { id: "D6", what: "a counter whose value is a fraction (1.5)", bytes: Buffer.from('{"coffee":3,"tea":1.5}', "utf8") },
  { id: "D7", what: "a counter whose value is a string", bytes: Buffer.from('{"coffee":3,"tea":"2"}', "utf8") },
  { id: "D8", what: "a counter whose value is null", bytes: Buffer.from('{"coffee":3,"tea":null}', "utf8") },
  { id: "D9", what: "a counter whose value is negative", bytes: Buffer.from('{"coffee":3,"tea":-1}', "utf8") },
  { id: "D10", what: "a counter whose value is 9007199254740992", bytes: Buffer.from('{"coffee":3,"tea":9007199254740992}', "utf8") },
  { id: "D11", what: "a counter whose name is empty", bytes: Buffer.from('{"coffee":3,"":1}', "utf8") },
  { id: "D12", what: "a counter whose name contains a space", bytes: Buffer.from('{"coffee":3,"a b":1}', "utf8") },
  { id: "D13", what: "a counter whose value is a boolean", bytes: Buffer.from('{"coffee":3,"tea":true}', "utf8") },
  { id: "D14", what: "a counter whose value is an object", bytes: Buffer.from('{"coffee":3,"tea":{"n":2}}', "utf8") },
];

export const D_SHORT = DAMAGED.filter((d) => ["D1", "D2", "D4"].includes(d.id));
export const damaged = (id) => DAMAGED.find((d) => d.id === id);

// ---------------------------------------------------------------- snapshots ("Unchanged")

export function snapshot(sb) {
  let st;
  try {
    st = fs.lstatSync(sb.file);
  } catch (err) {
    if (err.code === "ENOENT") return { exists: false };
    throw err;
  }
  return { exists: true, mode: st.mode & 0o7777, bytes: fs.readFileSync(sb.file) };
}

function exists(p) {
  try {
    fs.lstatSync(p);
    return true;
  } catch (err) {
    if (err.code === "ENOENT") return false;
    throw err;
  }
}

// Unchanged: the bytes of tally.json equal the bytes before the run, or it is still absent.
export function assertUnchanged(sb, before, what = "tally.json") {
  if (!before.exists) {
    assert.ok(!exists(sb.file), `${what}: expected tally.json still absent, but it exists now`);
    return;
  }
  assert.ok(exists(sb.file), `${what}: tally.json existed before the run and is gone after it`);
  const after = fs.readFileSync(sb.file);
  assert.ok(after.equals(before.bytes), `${what}: tally.json bytes changed: before ${JSON.stringify(before.bytes.toString("utf8"))}, after ${JSON.stringify(after.toString("utf8"))}`);
}

// Unchanged for the permission states: the mode is compared before permissions are restored, the
// bytes after (eval plan section 1).
export function assertUnchangedPerm(sb, before, what = "tally.json") {
  if (!before.exists) {
    assert.ok(!exists(sb.file), `${what}: expected tally.json still absent, but it exists now`);
    sb.restore();
    return;
  }
  assert.ok(exists(sb.file), `${what}: tally.json existed before the run and is gone after it`);
  const mode = fs.lstatSync(sb.file).mode & 0o7777;
  assert.equal(mode.toString(8), before.mode.toString(8), `${what}: tally.json mode changed`);
  sb.restore();
  const after = fs.readFileSync(sb.file);
  assert.ok(after.equals(before.bytes), `${what}: tally.json bytes changed: before ${JSON.stringify(before.bytes.toString("utf8"))}, after ${JSON.stringify(after.toString("utf8"))}`);
}

export function listing(dir) {
  return fs.readdirSync(dir).sort();
}

export function assertListing(sb, expected, what = "Dir listing") {
  assert.deepEqual(listing(sb.work), [...expected].sort(), `${what}: the working directory holds ${JSON.stringify(listing(sb.work))}, expected ${JSON.stringify(expected)}`);
}

export function assertParentListing(sb, what = "parent listing") {
  assert.deepEqual(listing(sb.root), ["w"], `${what}: the parent directory holds ${JSON.stringify(listing(sb.root))}, expected only the working directory`);
}

// ---------------------------------------------------------------- permission states (section 3)

export function assertNotRoot() {
  if (process.platform === "win32") assert.fail("P1 not met: the platform is Windows, which does not enforce POSIX modes");
  if (typeof process.getuid === "function" && process.getuid() === 0) {
    assert.fail("P1 not met: the process runs as root (uid 0), which reads and writes regardless of mode");
  }
}

// Makes one of U-read, U-file, U-dir, U-dirabsent; content is the fixture (ignored for
// U-dirabsent). Checks first that the OS really refuses the access (P1), and returns the snapshot
// taken before the run.
export function makePermState(sb, state, content) {
  assertNotRoot();
  if (state !== "U-dirabsent") writeFixture(sb, content);
  if (state === "U-read") fs.chmodSync(sb.file, 0o000);
  else if (state === "U-file") fs.chmodSync(sb.file, 0o444);
  else if (state === "U-dir") fs.chmodSync(sb.file, 0o644);
  else if (state !== "U-dirabsent") throw new Error(`unknown permission state ${state}`);
  const bytes = state === "U-dirabsent" ? null : Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
  if (state === "U-dir" || state === "U-dirabsent") fs.chmodSync(sb.work, 0o555);
  p1Refused(sb, state);
  if (state === "U-dirabsent") return { exists: false };
  return { exists: true, mode: fs.lstatSync(sb.file).mode & 0o7777, bytes };
}

function p1Refused(sb, state) {
  if (state === "U-read" || state === "U-file") {
    const flag = state === "U-read" ? "r" : "r+";
    let fd = null;
    try {
      fd = fs.openSync(sb.file, flag);
    } catch (err) {
      if (err.code === "EACCES" || err.code === "EPERM") return;
      throw err;
    }
    fs.closeSync(fd);
    assert.fail(`P1 not met: opening a file of mode ${state === "U-read" ? "000 for reading" : "444 for writing"} was not refused`);
  }
  const scratch = path.join(sb.work, ".p1-scratch");
  try {
    fs.writeFileSync(scratch, "", { flag: "wx" });
  } catch (err) {
    if (err.code === "EACCES" || err.code === "EPERM" || err.code === "EROFS") return;
    throw err;
  }
  fs.rmSync(scratch, { force: true });
  assert.fail("P1 not met: creating a file in a directory of mode 555 was not refused");
}

// ---------------------------------------------------------------- running tally

function childEnv(extra = {}) {
  const env = {};
  for (const key of ["PATH", "HOME", "LANG", "TMPDIR"]) {
    if (process.env[key] !== undefined) env[key] = process.env[key];
  }
  return { ...env, ...extra };
}

// Runs `node app/bin/tally.js <args>` with cwd as the current directory; no shell, args an array.
export function tally(cwd, args, opts = {}) {
  const r = spawnSync(process.execPath, [TALLY, ...args], {
    cwd,
    env: childEnv(opts.env),
    encoding: "utf8",
    timeout: RUN_TIMEOUT_MS,
    killSignal: "SIGKILL",
  });
  if (r.error && r.error.code !== "ETIMEDOUT") throw r.error;
  return { args, status: r.status, signal: r.signal, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

const excerpt = (s) => JSON.stringify(s.length > EXCERPT ? s.slice(0, EXCERPT) + "..." : s);

export function describe(r) {
  const how = r.status === null ? `killed by ${r.signal}` : `exit ${r.status}`;
  return `tally ${JSON.stringify(r.args)}: ${how}; stdout ${excerpt(r.stdout)}; stderr ${excerpt(r.stderr)}`;
}

export function expectExit(r, code) {
  if (r.status !== code) {
    const got = r.status === null ? `killed by ${r.signal}` : `exit ${r.status}`;
    assert.fail(`${got}, expected ${code} (${describe(r)})`);
  }
}

// Silent: stdout and stderr both empty.
export function expectSilent(r) {
  assert.equal(r.stdout, "", `expected stdout empty (${describe(r)})`);
  assert.equal(r.stderr, "", `expected stderr empty (${describe(r)})`);
}

// Refusal: stdout empty and stderr holds at least one non-whitespace character. Wording never asserted.
export function expectRefusal(r) {
  assert.equal(r.stdout, "", `expected stdout empty on a refusal (${describe(r)})`);
  assert.ok(/\S/u.test(r.stderr), `expected a message on stderr on a refusal (${describe(r)})`);
}

// The text `list` prints for these lines: each line ends in a line feed (Decisions 2026-10-27, F5).
export const lines = (...ls) => ls.map((l) => l + "\n").join("");

// Readback: `tally list` in the same directory; its exit must be 0 and its stdout is returned.
export function readback(cwd) {
  const r = tally(cwd, ["list"]);
  if (r.status !== 0) assert.fail(`Readback by list: exit ${r.status}, expected 0 (${describe(r)})`);
  return r.stdout;
}

export function expectReadback(cwd, expected) {
  const out = readback(cwd);
  assert.equal(out, expected, `Readback by list: stdout ${JSON.stringify(out)}, expected exactly ${JSON.stringify(expected)}`);
}

// Sorting by Unicode code point (TECH-SPEC section 7, "Order"), to build an expected Readback.
export function byCodePoint(a, b) {
  const ca = Array.from(a, (c) => c.codePointAt(0));
  const cb = Array.from(b, (c) => c.codePointAt(0));
  for (let i = 0; i < Math.min(ca.length, cb.length); i++) {
    if (ca[i] !== cb[i]) return ca[i] - cb[i];
  }
  return ca.length - cb.length;
}

export function listText(map) {
  return [...map.entries()].sort(([a], [b]) => byCodePoint(a, b)).map(([n, v]) => `${n} ${v}\n`).join("");
}

// ---------------------------------------------------------------- Rule G (guards)

// Runs the command under test successfully in a separate, clean directory; fails with
// `GUARD <command> not implemented (exit <n>)` otherwise.
export function guard(command) {
  const sb = makeSandbox();
  try {
    const fail = (r, extra = "") => assert.fail(`GUARD ${command} not implemented (exit ${r.status === null ? r.signal : r.status})${extra}`);
    const rb = (expected) => {
      const r = tally(sb.work, ["list"]);
      if (r.status !== 0 || r.stdout !== expected) {
        assert.fail(`GUARD ${command} not implemented (exit 0; Readback by list gave exit ${r.status} and stdout ${JSON.stringify(r.stdout)}, expected ${JSON.stringify(expected)})`);
      }
    };
    if (command === "add") {
      const r = tally(sb.work, ["add", "probe"]);
      if (r.status !== 0) fail(r);
      rb("probe 1\n");
    } else if (command === "list") {
      writeFixture(sb, counters([["probe", 1]]));
      const r = tally(sb.work, ["list"]);
      if (r.status !== 0) fail(r);
      if (r.stdout !== "probe 1\n") fail(r, `: stdout ${JSON.stringify(r.stdout)}, expected "probe 1\\n"`);
    } else if (command === "reset") {
      writeFixture(sb, counters([["probe", 1]]));
      const r = tally(sb.work, ["reset", "probe"]);
      if (r.status !== 0) fail(r);
      rb("probe 0\n");
    } else if (command === "remove") {
      writeFixture(sb, counters([["probe", 1]]));
      const r = tally(sb.work, ["remove", "probe"]);
      if (r.status !== 0) fail(r);
      rb("");
    } else {
      throw new Error(`no guard for ${command}`);
    }
  } finally {
    sb.cleanup();
  }
}

// ---------------------------------------------------------------- network observation (F6 D)

// Runs tally with the no-network preload passed through NODE_OPTIONS. Returns the run, whether the
// preload loaded in the child, and every network attempt it recorded.
export function tallyWatched(t, cwd, args) {
  const dir = scratchDir(t);
  const log = path.join(dir, "net.log");
  const r = tally(cwd, args, { env: { NODE_OPTIONS: `--require "${NO_NETWORK}"`, EVAL_NET_LOG: log } });
  const loaded = fs.existsSync(log + ".loaded");
  const attempts = fs.existsSync(log) ? fs.readFileSync(log, "utf8").split("\n").filter(Boolean) : [];
  return { r, loaded, attempts };
}

export function expectNoNetwork(w) {
  assert.ok(w.loaded, `the network recorder did not load in the child process (${describe(w.r)})`);
  assert.deepEqual(w.attempts, [], `network attempts were recorded: ${w.attempts.join("; ")}`);
}

// Positive control: the recorder does record attempts of a child that makes them.
export function assertRecorderWorks(t) {
  const dir = scratchDir(t);
  const log = path.join(dir, "net.log");
  const code = [
    'const net = require("node:net"); const dns = require("node:dns");',
    'try { net.connect(9, "127.0.0.1").on("error", () => {}); } catch (e) { void e; }',
    'try { dns.lookup("example.invalid", () => {}); } catch (e) { void e; }',
    'try { require("node:dgram").createSocket("udp4"); } catch (e) { void e; }',
    'Promise.resolve().then(() => fetch("http://127.0.0.1:9/")).catch(() => {});',
  ].join("\n");
  const r = spawnSync(process.execPath, ["-e", code], {
    cwd: dir,
    env: childEnv({ NODE_OPTIONS: `--require "${NO_NETWORK}"`, EVAL_NET_LOG: log }),
    encoding: "utf8",
    timeout: RUN_TIMEOUT_MS,
  });
  const attempts = fs.existsSync(log) ? fs.readFileSync(log, "utf8").split("\n").filter(Boolean) : [];
  assert.ok(attempts.length >= 4, `the network recorder failed its control run: ${attempts.length} attempts recorded, expected at least 4 (exit ${r.status}, stderr ${excerpt(r.stderr ?? "")})`);
}
