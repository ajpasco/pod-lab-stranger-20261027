#!/usr/bin/env node
// The entry point: runs the order of work of TECH-SPEC section 7 and maps every failure to one
// "tally: ..." line on stderr and an exit status.

import { isCouldNotBeCarriedOut, isUsageError } from "../src/errors.js";
import { readCounters, writeCounters } from "../src/store.js";
import { parseUsage } from "../src/usage.js";

async function main(args) {
  const { command, name } = parseUsage(args);
  // The command has been accepted as one of the four names by parseUsage, so input never reaches
  // the path.
  const rule = await import(`../src/commands/${command}.js`);
  const counters = readCounters();
  const result = rule.run(counters, name);
  if (rule.writes) writeCounters(result.counters);
  if (result.output !== "") process.stdout.write(result.output);
}

function exitStatusOf(err) {
  if (isUsageError(err)) return 2;
  return 1;
}

// One line, never a stack trace (Q20, D5); an unexpected error is said to be one.
function messageOf(err) {
  const known = isUsageError(err) || isCouldNotBeCarriedOut(err);
  const text = err instanceof Error ? err.message : String(err);
  const line = text.split(/\r?\n/u)[0];
  return known ? line : `unexpected error: ${line}`;
}

try {
  await main(process.argv.slice(2));
} catch (err) {
  process.stderr.write(`tally: ${messageOf(err)}\n`);
  process.exitCode = exitStatusOf(err);
}
