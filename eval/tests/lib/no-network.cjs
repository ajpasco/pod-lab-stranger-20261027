"use strict";
// No-network preload (Decisions 2026-10-27, F6 D). Passed to the child process through
// NODE_OPTIONS="--require <this file>" by eval/tests/lib/harness.mjs. It records every network
// attempt (TCP and IPC connections, TLS, HTTP(S), HTTP/2, name lookups, datagram sockets, fetch,
// WebSocket, EventSource) as one line in the file named by EVAL_NET_LOG, then refuses the attempt by
// throwing. On load it writes `<log>.loaded`, so a test can tell the recorder really ran.

const fs = require("node:fs");
const LOG = process.env.EVAL_NET_LOG;

function record(kind, detail) {
  if (!LOG) return;
  let text;
  try {
    text = JSON.stringify(detail);
  } catch (err) {
    text = `(unprintable: ${err.message})`;
  }
  fs.appendFileSync(LOG, `${kind} ${text}\n`);
}

function blocked(kind) {
  const err = new Error(`network attempt refused by the acceptance tests: ${kind}`);
  err.code = "EVAL_NETWORK_BLOCKED";
  return err;
}

function wrap(obj, name, kind) {
  if (!obj || typeof obj[name] !== "function") return;
  const original = obj[name];
  const replacement = function (...args) {
    record(kind, args.filter((a) => typeof a !== "function").map((a) => (typeof a === "object" && a !== null ? Object.keys(a) : a)));
    throw blocked(kind);
  };
  Object.defineProperty(replacement, "name", { value: original.name });
  obj[name] = replacement;
}

if (LOG) fs.appendFileSync(`${LOG}.loaded`, `${process.pid}\n`);

const net = require("node:net");
wrap(net.Socket.prototype, "connect", "net.Socket.connect");
wrap(net, "connect", "net.connect");
wrap(net, "createConnection", "net.createConnection");

const tls = require("node:tls");
wrap(tls, "connect", "tls.connect");

for (const mod of ["node:http", "node:https"]) {
  const m = require(mod);
  wrap(m, "request", `${mod}.request`);
  wrap(m, "get", `${mod}.get`);
}
wrap(require("node:http2"), "connect", "http2.connect");

const DNS_METHODS = [
  "lookup", "lookupService", "resolve", "resolve4", "resolve6", "resolveAny", "resolveCaa",
  "resolveCname", "resolveMx", "resolveNaptr", "resolveNs", "resolvePtr", "resolveSoa",
  "resolveSrv", "resolveTxt", "reverse",
];
const dns = require("node:dns");
for (const target of [dns, dns.promises, dns.Resolver && dns.Resolver.prototype, dns.promises.Resolver && dns.promises.Resolver.prototype]) {
  for (const m of DNS_METHODS) wrap(target, m, `dns.${m}`);
}
const dnsPromises = require("node:dns/promises");
if (dnsPromises !== dns.promises) {
  for (const m of DNS_METHODS) wrap(dnsPromises, m, `dns/promises.${m}`);
}

const dgram = require("node:dgram");
wrap(dgram, "createSocket", "dgram.createSocket");
wrap(dgram.Socket.prototype, "send", "dgram.Socket.send");
wrap(dgram.Socket.prototype, "connect", "dgram.Socket.connect");
wrap(dgram.Socket.prototype, "bind", "dgram.Socket.bind");

for (const g of ["fetch"]) wrap(globalThis, g, g);
for (const g of ["WebSocket", "EventSource"]) {
  if (typeof globalThis[g] === "function") {
    const kind = g;
    globalThis[g] = function () {
      record(kind, Array.from(arguments).map(String));
      throw blocked(kind);
    };
  }
}

// ES modules importing named exports of the built-ins see the replacements too.
require("node:module").syncBuiltinESMExports();
