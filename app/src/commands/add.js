// REQ-01: add to a counter, creating it at 1 if it does not exist.

export const writes = true;

export function run(counters, name) {
  const next = new Map(counters);
  next.set(name, (counters.get(name) ?? 0) + 1);
  return { counters: next, output: "" };
}
