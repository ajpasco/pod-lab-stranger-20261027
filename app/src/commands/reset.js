// REQ-03: reset a counter to zero. The counter stays, so it is still listed, with value 0.

import { couldNotBeCarriedOut } from "../errors.js";

export const writes = true;

export function run(counters, name) {
  // The name is quoted as JSON so that one holding any character still makes a one-line message.
  if (!counters.has(name)) throw couldNotBeCarriedOut(`there is no counter ${JSON.stringify(name)} to reset`);
  const next = new Map(counters);
  next.set(name, 0);
  return { counters: next, output: "" };
}
