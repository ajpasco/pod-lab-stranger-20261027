// REQ-04: remove a counter, so it is no longer listed.

import { couldNotBeCarriedOut } from "../errors.js";

export const writes = true;

export function run(counters, name) {
  // The name is quoted as JSON so that one holding any character still makes a one-line message.
  if (!counters.has(name)) throw couldNotBeCarriedOut(`there is no counter ${JSON.stringify(name)} to remove`);
  const next = new Map(counters);
  next.delete(name);
  return { counters: next, output: "" };
}
