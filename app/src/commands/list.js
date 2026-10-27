// REQ-02: list the counters, one "name value" line each, sorted by name.

import { compareNames } from "../names.js";

export const writes = false;

export function run(counters) {
  const output = [...counters.keys()]
    .sort(compareNames)
    .map((name) => `${name} ${counters.get(name)}\n`)
    .join("");
  return { counters, output };
}
