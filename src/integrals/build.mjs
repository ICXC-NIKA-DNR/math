// Rebuilds the Integration Bench problem bank inside trainers/integrals.html.
//
//   node src/integrals/build.mjs           # check only, report what would change
//   node src/integrals/build.mjs --write   # splice the new bank into the page
//
// What it does, in order:
//   1. reads the bank currently in the page
//   2. drops every definite integral and every problem in a retired category
//   3. merges the authored chunks in src/integrals/bank/
//   4. expands `also:` cross-listings — a problem needing two techniques is
//      filed under both, one difficulty harder in the second
//   5. refuses to write if any problem fails verification or any pair collides
//
// Refusing on a failed check is the point. A wrong antiderivative is worse
// than a missing one: the student trusts it.

import { readFileSync, writeFileSync } from "node:fs";
import { verifyBank, bankFromPage } from "./verify.mjs";

const PAGE = new URL("../../trainers/integrals.html", import.meta.url).pathname;

// The bench's categories after the definite-integral cull. `improper` and
// `multi` are gone: both are definite by definition, so neither survives a
// bench that is indefinite-only.
const TECHS = ["power", "usub", "parts", "trigint", "trigsub", "partial", "clever"];

const CHUNKS = ["power", "usub", "parts", "trigint", "trigsub", "partial", "clever"];

/** A prompt is definite if it carries limits or is a multiple integral. */
const isDefinite = (t) =>
  /\\int\s*_|\\int\s*\\limits|\\i{2,3}nt|\\oint|\\infty|_\{[^}]*\}\^/.test(t);

async function loadChunks() {
  const out = [];
  for (const name of CHUNKS) {
    const mod = await import(new URL(`./bank/${name}.mjs`, import.meta.url).href);
    for (const p of mod.default) {
      if (p.tech !== name) throw new Error(`${name}.mjs holds a '${p.tech}' problem: ${p.t}`);
      out.push(p);
    }
  }
  return out;
}

/** A problem needing two techniques is filed under both, harder the second time. */
function expandCrossListings(bank) {
  const extra = [];
  for (const p of bank) {
    if (!p.also) continue;
    if (!TECHS.includes(p.also)) throw new Error(`unknown cross-list target '${p.also}': ${p.t}`);
    if (p.also === p.tech) throw new Error(`cross-listed to its own category: ${p.t}`);
    const { also, ...rest } = p;
    extra.push({ ...rest, tech: also, d: Math.min(4, p.d + 1), xref: p.tech });
  }
  return extra;
}

// The same prompt in two different categories is the point of cross-listing.
// The same prompt twice in ONE category is a duplicate: the bench would offer
// it twice out of the same pool.
//
// Collisions arise two ways — an authored problem repeating one already in the
// page, and a cross-listed copy landing where the target category already has
// that problem. Both resolve the same way: keep the better-written entry, and
// prefer a real entry over a cross-listed copy of it.
const normalise = (t) =>
  t.replace(/\s+/g, "").replace(/\\,|\\!|\\;|\\left|\\right|[{}]/g, "");
const weight = (p) =>
  (p.xref ? 0 : 1000) + (p.h || "").length +
  (p.s || []).join("").length + (p.w || "").length;

function dedupe(bank) {
  const best = new Map(), dropped = [];
  for (const p of bank) {
    const key = p.tech + " " + normalise(p.t);
    const held = best.get(key);
    if (!held) { best.set(key, p); continue; }
    if (weight(p) > weight(held)) { best.set(key, p); dropped.push(held); }
    else dropped.push(p);
  }
  return { kept: [...best.values()], dropped };
}

function emit(bank) {
  const esc = (s) => "'" + s.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  const lines = ["const BANK = ["];
  let lastTech = null;
  for (const p of bank) {
    if (p.tech !== lastTech) {
      lastTech = p.tech;
      lines.push("", `/* ── ${p.tech.toUpperCase()} ${"─".repeat(Math.max(2, 48 - p.tech.length))} */`);
    }
    const head = `{tech:'${p.tech}',d:${p.d},t:${esc(p.t)},a:${esc(p.a)}` +
      (p.xref ? `,xref:'${p.xref}'` : "") + ",";
    const parts = [head];
    if (p.h) parts.push(` h:${esc(p.h)},`);
    if (p.s) parts.push(` s:[${p.s.map(esc).join(",")}]` + (p.w ? "," : "}," ));
    if (p.w) parts.push(` w:${esc(p.w)}},`);
    if (!p.s && !p.w) parts[parts.length - 1] = parts[parts.length - 1].replace(/,$/, "},");
    lines.push(parts.join("\n"));
  }
  lines.push("", "];");
  return lines.join("\n");
}

function splice(src, block) {
  const lines = src.split("\n");
  const start = lines.findIndex((l) => l.startsWith("const BANK = ["));
  const end = lines.findIndex((l, i) => i > start && l.trim() === "];");
  if (start < 0 || end < 0) throw new Error("no BANK literal found in the page");
  return [...lines.slice(0, start), block, ...lines.slice(end + 1)].join("\n");
}

/**
 * Drop improper/multi from the TECHS list the console builds its checkboxes
 * from. Scoped to that one array on purpose: the cheat sheet further down the
 * page has entries with the same `{id:'improper'` shape, and a file-wide
 * replace decapitates them and leaves their bodies behind as stray syntax.
 */
function pruneTechList(src) {
  const open = src.indexOf("const TECHS = [");
  if (open < 0) throw new Error("no TECHS array in the page");
  const close = src.indexOf("];", open);
  const before = src.slice(0, open);
  const block = src.slice(open, close);
  const after = src.slice(close);
  const pruned = block
    .replace(/^\s*\{id:'(improper|multi)'.*\n/gm, "")
    .replace(/,\s*$/, "\n");
  return before + pruned + after;
}

// ---------- run ----------
const page = readFileSync(PAGE, "utf8");
const existing = bankFromPage(PAGE).bank;

const keptOld = existing.filter((p) => TECHS.includes(p.tech) && !isDefinite(p.t));
const droppedDefinite = existing.filter((p) => isDefinite(p.t));
const droppedCategory = existing.filter((p) => !TECHS.includes(p.tech) && !isDefinite(p.t));

const authored = await loadChunks();
const merged = [...keptOld, ...authored];
const cross = expandCrossListings(merged);
const all = [...merged, ...cross].map(({ also, ...p }) => p);

const order = Object.fromEntries(TECHS.map((t, i) => [t, i]));
all.sort((a, b) => (order[a.tech] - order[b.tech]) || (a.d - b.d));

const { kept: final, dropped: dupes } = dedupe(all);
final.sort((a, b) => (order[a.tech] - order[b.tech]) || (a.d - b.d));
const res = verifyBank(final);

console.log(`existing bank            ${existing.length}`);
console.log(`  dropped (definite)     ${droppedDefinite.length}`);
console.log(`  dropped (category)     ${droppedCategory.length}`);
console.log(`  kept                   ${keptOld.length}`);
console.log(`authored new             ${authored.length}`);
console.log(`cross-listed copies      ${cross.length}`);
console.log(`  duplicates merged      ${dupes.length}`);
console.log(`final bank               ${final.length}`);
console.log();
for (const t of TECHS) {
  const inT = final.filter((p) => p.tech === t);
  const byD = [1, 2, 3, 4].map((d) => inT.filter((p) => p.d === d).length);
  console.log(`  ${t.padEnd(9)} ${String(inT.length).padStart(3)}   d1-d4: ${byD.join("/")}`);
}
console.log();
console.log(`verified ${res.passed}/${res.total}`);

let ok = true;
if (res.bad.length) {
  ok = false;
  console.log(`\n${res.bad.length} WRONG:`);
  for (const b of res.bad) console.log(`  ${b.label}\n      = ${b.a}\n      rel err ${b.worst.toExponential(2)}`);
}
if (res.unparsed.length) {
  ok = false;
  console.log(`\n${res.unparsed.length} unverifiable — every shipped problem must be checkable:`);
  for (const u of res.unparsed) console.log(`  ${u.label}\n      ${u.why}`);
}

if (!ok) {
  console.log("\nnot written: fix the problems above first");
  process.exit(1);
}

if (process.argv.includes("--write")) {
  writeFileSync(PAGE, pruneTechList(splice(page, emit(final))));
  console.log("\nwritten to trainers/integrals.html");
} else {
  console.log("\nall checks pass — rerun with --write to splice it in");
}
