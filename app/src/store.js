// Reads tally.json, checks that it has the stored layout of TECH-SPEC section 7, and writes it.
// The only module that touches the file system; it applies no command rule.

import { randomBytes } from "node:crypto";
import fs from "node:fs";
import { couldNotBeCarriedOut } from "./errors.js";
import { isValidName } from "./names.js";

const FILE = "tally.json";
const BOM = Buffer.from([0xef, 0xbb, 0xbf]);

const DAMAGED = `${FILE} is damaged`;

function cause(err) {
  return err.code ? `${err.code}: ${err.syscall ?? "access"} failed` : err.message;
}

function readBytes() {
  try {
    return fs.readFileSync(FILE);
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw couldNotBeCarriedOut(`cannot read ${FILE} (${cause(err)})`, err);
  }
}

function parse(bytes) {
  // JSON parsing in Node would reject a byte-order mark too, but the rule is the user's (Q20, D1c),
  // so it is checked by name rather than left to a side effect of the parser.
  if (bytes.subarray(0, BOM.length).equals(BOM)) throw couldNotBeCarriedOut(`${DAMAGED}: it starts with a byte-order mark`);
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch (err) {
    throw couldNotBeCarriedOut(`${DAMAGED}: it is not valid JSON`, err);
  }
}

function check(data) {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw couldNotBeCarriedOut(`${DAMAGED}: it does not hold an object of named counters`);
  }
  const counters = new Map();
  for (const [name, value] of Object.entries(data)) {
    if (!isValidName(name)) throw couldNotBeCarriedOut(`${DAMAGED}: it holds a counter whose name is empty or contains whitespace`);
    if (!Number.isSafeInteger(value) || value < 0) {
      throw couldNotBeCarriedOut(`${DAMAGED}: the counter ${JSON.stringify(name)} does not hold a whole number from 0 to ${Number.MAX_SAFE_INTEGER}`);
    }
    counters.set(name, value);
  }
  return counters;
}

// The checked counters as a Map; a missing file is no counters, and reading never creates it.
export function readCounters() {
  const bytes = readBytes();
  if (bytes === null) return new Map();
  return check(parse(bytes));
}

// The existing file's permission mode, or null if there is no file. A rename ignores the target's
// own permissions, so a file that does not allow writing is refused here.
function existingMode() {
  let mode;
  try {
    mode = fs.statSync(FILE).mode & 0o7777;
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw couldNotBeCarriedOut(`cannot write ${FILE} (${cause(err)})`, err);
  }
  try {
    fs.accessSync(FILE, fs.constants.W_OK);
  } catch (err) {
    throw couldNotBeCarriedOut(`cannot write ${FILE}: it does not allow writing (${cause(err)})`, err);
  }
  return mode;
}

// Exclusive create, so a temporary file of another process is never opened, and so never removed.
function createTemporary(tmp) {
  try {
    return fs.openSync(tmp, "wx");
  } catch (err) {
    throw couldNotBeCarriedOut(`cannot write ${FILE}: cannot create a file in this directory (${cause(err)})`, err);
  }
}

// Writes the counters to a temporary file in the same directory, then renames it over tally.json,
// so a reader never sees a half-written file. Any failure leaves tally.json as it was, or absent.
export function writeCounters(counters) {
  const mode = existingMode();
  const text = `${JSON.stringify(Object.fromEntries(counters))}\n`;
  const tmp = `.${FILE}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`;
  const fd = createTemporary(tmp);
  try {
    try {
      if (mode !== null) fs.fchmodSync(fd, mode);
      fs.writeFileSync(fd, text);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(tmp, FILE);
  } catch (err) {
    fs.rmSync(tmp, { force: true });
    throw couldNotBeCarriedOut(`cannot write ${FILE} (${cause(err)})`, err);
  }
}
