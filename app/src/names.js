// What a valid name is, and the order names are listed in (TECH-SPEC section 7).

const WHITE_SPACE = /\p{White_Space}/u;

export function isValidName(name) {
  return typeof name === "string" && name !== "" && !WHITE_SPACE.test(name);
}

// By Unicode code point, not UTF-16 code unit, so a character outside the Basic Multilingual Plane
// sorts after every character inside it.
export function compareNames(a, b) {
  const ia = a[Symbol.iterator]();
  const ib = b[Symbol.iterator]();
  for (;;) {
    const ca = ia.next();
    const cb = ib.next();
    if (ca.done || cb.done) return (ca.done ? 0 : 1) - (cb.done ? 0 : 1);
    const diff = ca.value.codePointAt(0) - cb.value.codePointAt(0);
    if (diff !== 0) return diff;
  }
}
