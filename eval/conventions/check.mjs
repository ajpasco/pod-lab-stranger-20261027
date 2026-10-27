// The conventions step of tally's acceptance run (docs/eval-plan.md section 6; docs/TECH-SPEC.md
// section 13). Invoked as `node eval/conventions/check.mjs app` from the repository root.
//
// It reads no file under app/ for configuration: every limit and the import map are constants in
// this file, and the only other file it reads is eval/conventions/forbidden-in-app.txt. An absent
// or empty app/ has nothing to check and passes (PRACTICES section C rule 3).
//
// Checks, each reported as "<path>: <check>: <detail>":
//   parse          every .js/.mjs/.cjs file passes `node --check`; every .json file parses
//   dependencies   no package.json under app/ declares a non-empty dependency field
//   imports        every import is a `node:` built-in or a relative path inside app/
//   lines          every file is at most MAX_LINES lines (Q20, D2)
//   layering       only app/src/store.js imports the file system, and each module imports only as
//                  TECH-SPEC section 2 allows (Q20, D3a); app/test/ is exempt (Q21, E5)
//   process.env    process.env appears nowhere under app/ (Q20, D3b)
//   empty-catch    no empty catch block (Q21, E1)
//   forbidden      no file names a literal of forbidden-in-app.txt, matched case-sensitively (F6 A)

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { isBuiltin } from "node:module";
import path from "node:path";

const MAX_LINES = 300;
const JS_EXT = new Set([".js", ".mjs", ".cjs"]);
const DEPENDENCY_FIELDS = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies", "bundledDependencies", "bundleDependencies"];
const FS_SPECIFIERS = new Set(["node:fs", "fs", "node:fs/promises", "fs/promises"]);
const FS_ALLOWED = "src/store.js";
const EXEMPT_FROM_LAYERING = "test/";
const COMMANDS_PREFIX = "../src/commands/";
const FORBIDDEN_LIST = path.join(import.meta.dirname, "forbidden-in-app.txt");

// TECH-SPEC section 2, paths relative to app/. Layer 2 commands are matched by LAYER2_COMMANDS.
const LAYER3 = new Set(["src/names.js", "src/errors.js"]);
const LAYER2 = new Set(["src/usage.js", "src/store.js"]);
const LAYER2_COMMANDS = /^src\/commands\/[^/]+\.js$/u;
const BOUNDARY = "bin/tally.js";

function layerOf(rel) {
  if (rel === BOUNDARY) return 1;
  if (LAYER2.has(rel) || LAYER2_COMMANDS.test(rel)) return 2;
  if (LAYER3.has(rel)) return 3;
  return null;
}

// What each layer may import inside app/ (section 2, "May import").
const MAY_IMPORT = { 1: new Set([2, 3]), 2: new Set([3]), 3: new Set() };

// ---------------------------------------------------------------- a small JavaScript tokenizer

const PUNCT_BEFORE_EXPR = new Set(["(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "<", ">", "~", "^", "=>"]);
const KEYWORDS_BEFORE_EXPR = new Set(["return", "typeof", "instanceof", "in", "of", "new", "delete", "void", "throw", "case", "do", "else", "yield", "await"]);

function tokenize(src) {
  const tokens = [];
  let i = 0;
  const n = src.length;
  const braceStack = [];
  const prevAllowsRegex = () => {
    const p = tokens[tokens.length - 1];
    if (!p) return true;
    if (p.type === "punct") return PUNCT_BEFORE_EXPR.has(p.value) || p.value.endsWith("=");
    if (p.type === "ident") return KEYWORDS_BEFORE_EXPR.has(p.value);
    return false;
  };
  const readTemplate = () => {
    // at a backtick or at the "}" closing a substitution; returns [cooked head text, ended]
    let text = "";
    while (i < n) {
      const c = src[i];
      if (c === "\\") { text += src.slice(i, i + 2); i += 2; continue; }
      if (c === "`") { i++; return [text, true]; }
      if (c === "$" && src[i + 1] === "{") { i += 2; braceStack.push("template"); return [text, false]; }
      text += c;
      i++;
    }
    return [text, true];
  };
  while (i < n) {
    const c = src[i];
    if (/\s/u.test(c)) { i++; continue; }
    if (c === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i++; continue; }
    if (c === "/" && src[i + 1] === "*") { const e = src.indexOf("*/", i + 2); i = e < 0 ? n : e + 2; continue; }
    if (c === "#" && i === 0 && src[1] === "!") { while (i < n && src[i] !== "\n") i++; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      let value = "";
      while (j < n && src[j] !== c && src[j] !== "\n") {
        if (src[j] === "\\") { value += src[j + 1] ?? ""; j += 2; continue; }
        value += src[j];
        j++;
      }
      tokens.push({ type: "string", value });
      i = j + 1;
      continue;
    }
    if (c === "`") {
      i++;
      const [text, ended] = readTemplate();
      tokens.push({ type: "template", value: text, complete: ended });
      continue;
    }
    if (c === "}" && braceStack.length && braceStack[braceStack.length - 1] === "template") {
      braceStack.pop();
      i++;
      readTemplate();
      tokens.push({ type: "template-tail", value: "" });
      continue;
    }
    if (c === "/" && prevAllowsRegex()) {
      let j = i + 1;
      let inClass = false;
      while (j < n && src[j] !== "\n") {
        if (src[j] === "\\") { j += 2; continue; }
        if (src[j] === "[") inClass = true;
        else if (src[j] === "]") inClass = false;
        else if (src[j] === "/" && !inClass) break;
        j++;
      }
      j++;
      while (j < n && /[a-z]/iu.test(src[j])) j++;
      tokens.push({ type: "regex", value: src.slice(i, j) });
      i = j;
      continue;
    }
    if (/[A-Za-z_$\u0080-￿]/u.test(c)) {
      let j = i + 1;
      while (j < n && /[A-Za-z0-9_$\u0080-￿]/u.test(src[j])) j++;
      tokens.push({ type: "ident", value: src.slice(i, j) });
      i = j;
      continue;
    }
    if (/[0-9]/u.test(c)) {
      let j = i + 1;
      while (j < n && /[0-9A-Za-z_.]/u.test(src[j])) j++;
      tokens.push({ type: "number", value: src.slice(i, j) });
      i = j;
      continue;
    }
    if (c === "=" && src[i + 1] === ">") { tokens.push({ type: "punct", value: "=>" }); i += 2; continue; }
    if (c === "?" && src[i + 1] === ".") { tokens.push({ type: "punct", value: "?." }); i += 2; continue; }
    if (c === "{") braceStack.push("brace");
    if (c === "}" && braceStack.length) braceStack.pop();
    tokens.push({ type: "punct", value: c });
    i++;
  }
  return tokens;
}

// ---------------------------------------------------------------- import extraction

// Returns [{ spec, dynamic, prefixOnly, line }]; spec null for a dynamic import whose specifier is
// not a literal.
function findImports(tokens) {
  const found = [];
  for (let k = 0; k < tokens.length; k++) {
    const tok = tokens[k];
    const prev = tokens[k - 1];
    const next = tokens[k + 1];
    const afterDot = prev && prev.type === "punct" && (prev.value === "." || prev.value === "?.");
    if (tok.type !== "ident" || afterDot) continue;
    if (tok.value === "import" && next && next.type === "punct" && next.value === "(") {
      const arg = tokens[k + 2];
      const close = tokens[k + 3];
      const closes = close && close.type === "punct" && (close.value === ")" || close.value === ",");
      if (arg && arg.type === "string" && closes) found.push({ spec: arg.value, dynamic: true, prefixOnly: false });
      else if (arg && arg.type === "template" && arg.complete && closes) found.push({ spec: arg.value, dynamic: true, prefixOnly: false });
      else if (arg && (arg.type === "template" || arg.type === "string")) found.push({ spec: arg.value, dynamic: true, prefixOnly: true });
      else found.push({ spec: null, dynamic: true, prefixOnly: false });
    } else if (tok.value === "import" && next && next.type === "string") {
      found.push({ spec: next.value, dynamic: false, prefixOnly: false });
    } else if (tok.value === "from" && next && next.type === "string") {
      found.push({ spec: next.value, dynamic: false, prefixOnly: false });
    } else if (tok.value === "require" && next && next.type === "punct" && next.value === "(") {
      const arg = tokens[k + 2];
      if (arg && arg.type === "string") found.push({ spec: arg.value, dynamic: false, prefixOnly: false });
      else found.push({ spec: null, dynamic: true, prefixOnly: false });
    }
  }
  return found;
}

function emptyCatches(tokens) {
  let count = 0;
  for (let k = 0; k < tokens.length; k++) {
    const tok = tokens[k];
    const prev = tokens[k - 1];
    if (tok.type !== "ident" || tok.value !== "catch") continue;
    if (prev && prev.type === "punct" && (prev.value === "." || prev.value === "?.")) continue;
    let j = k + 1;
    if (tokens[j] && tokens[j].value === "(" && tokens[j].type === "punct") {
      let depth = 0;
      for (; j < tokens.length; j++) {
        if (tokens[j].type !== "punct") continue;
        if (tokens[j].value === "(") depth++;
        else if (tokens[j].value === ")" && --depth === 0) break;
      }
      j++;
    }
    if (tokens[j] && tokens[j].value === "{" && tokens[j + 1] && tokens[j + 1].value === "}") count++;
  }
  return count;
}

// ---------------------------------------------------------------- walking app/

function walk(dir, base, out) {
  for (const name of fs.readdirSync(dir).sort()) {
    const abs = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    const st = fs.lstatSync(abs);
    if (st.isDirectory()) walk(abs, rel, out);
    else out.push({ abs, rel, symlink: st.isSymbolicLink() });
  }
  return out;
}

function countLines(text) {
  if (text === "") return 0;
  const parts = text.split("\n");
  return text.endsWith("\n") ? parts.length - 1 : parts.length;
}

function main() {
  const target = process.argv[2] ?? "app";
  const appDir = path.resolve(target);
  const show = (rel) => `${target.replace(/\/+$/u, "")}/${rel}`;
  if (!fs.existsSync(appDir)) {
    console.log(`conventions: ${target}/ is absent: nothing to check, passes (PRACTICES C rule 3)`);
    return 0;
  }
  const files = walk(appDir, "", []);
  if (files.length === 0) {
    console.log(`conventions: ${target}/ is empty: nothing to check, passes (PRACTICES C rule 3)`);
    return 0;
  }
  const forbidden = fs.readFileSync(FORBIDDEN_LIST, "utf8").split("\n").map((l) => l.replace(/\r$/u, "")).filter((l) => l !== "");
  const problems = [];
  const report = (rel, check, detail) => problems.push(`${show(rel)}: ${check}: ${detail}`);

  for (const f of files) {
    if (f.symlink) {
      report(f.rel, "layout", "a symbolic link; files under app/ must be regular files");
      continue;
    }
    const text = fs.readFileSync(f.abs, "utf8");
    const ext = path.extname(f.rel);

    const lineCount = countLines(text);
    if (lineCount > MAX_LINES) report(f.rel, "lines", `${lineCount} lines, the limit is ${MAX_LINES}`);

    for (const literal of forbidden) {
      if (text.includes(literal) || f.rel.includes(literal)) report(f.rel, "forbidden", `names the forbidden text "${literal}"`);
    }

    if (/process\s*(\.\s*env\b|\?\.\s*env\b|\[\s*["'`]env["'`]\s*\])/u.test(text) || /\{[^}]*\benv\b[^}]*\}\s*=\s*process\b/u.test(text) || /\benv\b[^;]*from\s*["']node:process["']/u.test(text)) {
      report(f.rel, "process.env", "reads the environment; nothing under app/ may (Q20, D3b)");
    }

    if (ext === ".json") {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        report(f.rel, "parse", `not valid JSON: ${err.message}`);
      }
      if (path.basename(f.rel) === "package.json" && parsed && typeof parsed === "object") {
        for (const field of DEPENDENCY_FIELDS) {
          const v = parsed[field];
          if (v === undefined) continue;
          const empty = (Array.isArray(v) && v.length === 0) || (v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);
          if (!empty) report(f.rel, "dependencies", `declares "${field}"; tally has no dependencies`);
        }
      }
      continue;
    }
    if (!JS_EXT.has(ext)) continue;

    const chk = spawnSync(process.execPath, ["--check", f.abs], { encoding: "utf8" });
    if (chk.status !== 0) report(f.rel, "parse", `node --check failed: ${(chk.stderr || "").trim().split("\n").slice(0, 5).join(" | ")}`);

    const tokens = tokenize(text);
    const empties = emptyCatches(tokens);
    if (empties > 0) report(f.rel, "empty-catch", `${empties} empty catch block(s) (Q21, E1)`);

    const exempt = f.rel.startsWith(EXEMPT_FROM_LAYERING);
    const myLayer = layerOf(f.rel);
    for (const imp of findImports(tokens)) {
      if (imp.spec === null) {
        report(f.rel, "imports", "an import or require whose specifier is not a literal; it cannot be checked");
        continue;
      }
      if (imp.prefixOnly) {
        if (f.rel === BOUNDARY && imp.spec.startsWith(COMMANDS_PREFIX) && !imp.spec.slice(COMMANDS_PREFIX.length).includes("/")) continue;
        report(f.rel, "imports", `a dynamic import of a computed specifier beginning "${imp.spec}"; only bin/tally.js may import a computed specifier, and only one beginning "${COMMANDS_PREFIX}"`);
        continue;
      }
      const spec = imp.spec;
      if (spec.startsWith("node:")) {
        if (!isBuiltin(spec)) report(f.rel, "imports", `"${spec}" is not a Node built-in`);
        if (FS_SPECIFIERS.has(spec) && !exempt && f.rel !== FS_ALLOWED) report(f.rel, "layering", `imports "${spec}"; only app/${FS_ALLOWED} touches the file system (Q20, D3a)`);
        continue;
      }
      if (!spec.startsWith("./") && !spec.startsWith("../")) {
        report(f.rel, "imports", `"${spec}" is neither a node: built-in nor a relative path`);
        if (FS_SPECIFIERS.has(spec) && !exempt && f.rel !== FS_ALLOWED) report(f.rel, "layering", `imports "${spec}"; only app/${FS_ALLOWED} touches the file system (Q20, D3a)`);
        continue;
      }
      const targetAbs = path.resolve(path.dirname(f.abs), spec.split("?")[0]);
      const targetRel = path.relative(appDir, targetAbs).split(path.sep).join("/");
      if (targetRel.startsWith("..") || path.isAbsolute(targetRel)) {
        report(f.rel, "imports", `"${spec}" leaves app/`);
        continue;
      }
      if (exempt) continue;
      const theirLayer = layerOf(targetRel);
      if (myLayer === null) report(f.rel, "layering", `imports app/${targetRel}, but this file is not a module of TECH-SPEC section 2 and may import nothing in app/`);
      else if (theirLayer === null) report(f.rel, "layering", `imports app/${targetRel}, which is not a module of TECH-SPEC section 2`);
      else if (!MAY_IMPORT[myLayer].has(theirLayer)) report(f.rel, "layering", `layer ${myLayer} imports app/${targetRel} (layer ${theirLayer}); section 2 does not allow it`);
    }
  }

  for (const p of problems) console.log(`conventions: ${p}`);
  console.log(`conventions: ${files.length} file(s) under ${target}/ checked, ${problems.length} problem(s)`);
  return problems.length === 0 ? 0 : 1;
}

process.exitCode = main();
