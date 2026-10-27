// The two failure kinds of PRD section 4. They are plain errors marked by name rather than classes,
// because the conventions allow no classes; bin/tally.js maps each kind to its exit status.

export const USAGE_ERROR = "UsageError";
export const COULD_NOT_BE_CARRIED_OUT = "CouldNotBeCarriedOut";

function failure(kind, message, cause) {
  const err = new Error(message, cause === undefined ? undefined : { cause });
  err.name = kind;
  return err;
}

// The person used tally wrongly; exit 2.
export function usageError(message) {
  return failure(USAGE_ERROR, message);
}

// Correctly used, but tally.json does not allow the command to complete; exit 1.
export function couldNotBeCarriedOut(message, cause) {
  return failure(COULD_NOT_BE_CARRIED_OUT, message, cause);
}

export function isUsageError(err) {
  return err instanceof Error && err.name === USAGE_ERROR;
}

export function isCouldNotBeCarriedOut(err) {
  return err instanceof Error && err.name === COULD_NOT_BE_CARRIED_OUT;
}
