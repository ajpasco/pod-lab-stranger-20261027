// The command line to a command, checking the arguments of all four commands before anything
// touches tally.json (REQ-05, REQ-06).

import { usageError } from "./errors.js";
import { isValidName } from "./names.js";

const TAKES_A_NAME = new Set(["add", "reset", "remove"]);
const COMMANDS = ["add", "list", "reset", "remove"];
const COMMAND_LIST = "add, list, reset or remove";

// A name is quoted as JSON so that one holding a line break still makes a one-line message.
const quote = (text) => JSON.stringify(text);

function checkName(command, rest) {
  if (rest.length === 0) throw usageError(`${command} needs a name: tally ${command} <name>`);
  if (rest.length > 1) throw usageError(`${command} takes one name, but was given ${rest.length} arguments`);
  const [name] = rest;
  if (name === "") throw usageError("the name is empty");
  if (!isValidName(name)) throw usageError(`the name ${quote(name)} contains whitespace`);
  return name;
}

// Returns { command, name }; name is undefined for list.
export function parseUsage(args) {
  if (args.length === 0) throw usageError(`no command given; use ${COMMAND_LIST}`);
  const [command, ...rest] = args;
  if (!COMMANDS.includes(command)) throw usageError(`unknown command ${quote(command)}; use ${COMMAND_LIST}`);
  if (TAKES_A_NAME.has(command)) return { command, name: checkName(command, rest) };
  if (rest.length > 0) throw usageError(`list takes no arguments, but was given ${rest.length}`);
  return { command, name: undefined };
}
