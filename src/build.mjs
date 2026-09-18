// node build.mjs  ->  data/cards.json, review.html
// Fails loudly on: bad LaTeX, wrong distractor counts, duplicates, an equivalent
// form used as a distractor, or an antiderivative that doesn't differentiate back.
import fs from "node:fs";
import katex from "katex";
import { COURSES, pairs, integrals, recall } from "./data/source.mjs";
import { unitCircle } from "./data/unitcircle.mjs";

const split = (s) => (s ? s.split(";;").map((x) => x.trim()) : null);
const errors = [];
const cards = [];
const add = (c) => cards.push({ kind: "choice", ...c });

// ---------- numeric check: d/dx F == f ----------
const M = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, exp: Math.exp, ln: Math.log, sqrt: Math.sqrt, abs: Math.abs,
  asin: Math.asin, acos: Math.acos, atan: Math.atan, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh,
  sec: (x) => 1 / Math.cos(x), csc: (x) => 1 / Math.sin(x), cot: (x) => 1 / Math.tan(x),
  sech: (x) => 1 / Math.cosh(x), csch: (x) => 1 / Math.sinh(x), coth: (x) => 1 / Math.tanh(x),
  acot: (x) => Math.atan(1 / x), asec: (x) => Math.acos(1 / x), acsc: (x) => Math.asin(1 / x),
  asech: (x) => Math.acosh(1 / x), acsch: (x) => Math.asinh(1 / x), acoth: (x) => Math.atanh(1 / x),
};
const fnOf = (e) => new Function("M", "x", "a", "b", "n", `const {${Object.keys(M).join(",")}}=M; return (${e.replace(/^-(.*)$/, "-($1)")});`);
function checkNum(label, [Fe, fe], pts) {
  pts = pts || [0.4, 0.9, 2.1];
  const F = fnOf(Fe), f = fnOf(fe), P = [1.3, 0.7, 3], h = 1e-5;
  for (const x of pts) {
    const d = (F(M, x + h, ...P) - F(M, x - h, ...P)) / (2 * h), v = f(M, x, ...P);
    if (!isFinite(d) || Math.abs(d - v) > 1e-4 * Math.max(1, Math.abs(v))) {
      errors.push(`numeric: ${label} at x=${x}: F'=${d} f=${v}`); return;
    }
  }
}

// ---------- pairs -> derivative + integral cards ----------
for (const p of pairs) {
  const dg = p.g || "Derivatives", ig = p.g || "Integrals";
  const df = p.df || p.fam, inf = p.if || p.fam;
  checkNum(p.F, p.num, p.pts);
  if (!p.intOnly) add({ course: p.c, group: dg, family: df, level: p.L, note: p.note,
    prompt: `\\frac{d}{dx}\\left[${p.F}\\right]`, answer: p.f, distractors: split(p.dd) });
  if (!p.derivOnly) add({ course: p.c, group: ig, family: inf, level: p.L, note: p.note,
    prompt: `\\int ${p.intf || p.f}\\,dx`, answer: `${p.intF || p.F}+C`,
    distractors: split(p.id).map((d) => `${d}+C`) });
}
for (const q of integrals) {
  if (q.num) checkNum(q.F, q.num, q.pts);
  add({ course: q.c, group: q.g || "Integrals", family: q.fam, level: q.L, note: q.note,
    prompt: `\\int ${q.f}\\,dx`, answer: `${q.F}+C`, distractors: split(q.d).map((d) => `${d}+C`) });
}
for (const q of recall) {
  add({ course: q.c, group: q.g, family: q.fam, level: q.L, note: q.note, prompt: q.p, answer: q.a, distractors: split(q.d) });
  if (q.rd) add({ course: q.c, group: q.g, family: q.fam, level: q.L, note: q.note, reverse: true,
    prompt: `?=${q.a}`, answer: q.p, distractors: split(q.rd) });
}
for (const c of unitCircle()) cards.push({ kind: "choice", ...c });

// ---------- ids (stable: hash of content, not position) ----------
const hash = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
const norm = (s) => s.replace(/\\left|\\right|\\,|\\ |\s+/g, "");
for (const c of cards) {
  c.id = hash([c.course, c.prompt, c.note || "", c.answer ?? c.index].join("|"));
  if (c.note == null) delete c.note;
}

// ---------- validation ----------
const courseIds = COURSES.map(([id]) => id);
const ids = new Set();
const byPrompt = new Map();
for (const c of cards) {
  const tag = `[${c.course}/${c.group}/${c.family}] ${c.prompt}`;
  if (!courseIds.includes(c.course)) errors.push(`bad course: ${tag}`);
  if (![1, 2, 3].includes(c.level)) errors.push(`bad level: ${tag}`);
  if (ids.has(c.id)) errors.push(`duplicate card: ${tag}`); ids.add(c.id);
  const strings = [c.prompt, c.answer, c.note, ...(c.distractors || []), c.deg?.prompt, c.deg?.answer, ...(c.deg?.distractors || [])];
  for (const s of strings.filter((x) => x != null)) {
    try { katex.renderToString(s, { throwOnError: true }); } catch (e) { errors.push(`latex: ${tag} :: ${s} :: ${e.message}`); }
  }
  if (c.kind === "tap") continue;
  for (const [ans, ds] of [[c.answer, c.distractors], c.deg?.distractors ? [c.deg.answer, c.deg.distractors] : null].filter(Boolean)) {
    if (!ds || ds.length !== 3) errors.push(`need 3 distractors: ${tag}`);
    const n = ds.map(norm);
    if (new Set(n).size !== n.length) errors.push(`repeated distractor: ${tag}`);
    if (n.includes(norm(ans))) errors.push(`answer among distractors: ${tag}`);
  }
  // cards whose note is a condition on the parameter (odd/even) ask different questions;
  // domain notes (|x|<1 vs |x|>1) share an integrand, so they stay grouped
  const k = norm(c.prompt) + (c.note && !/[<>]/.test(c.note) ? "|" + norm(c.note) : "");
  byPrompt.set(k, [...(byPrompt.get(k) || []), c]);
}
// equivalent-form rule: cards sharing a prompt never use each other's answers as distractors
for (const group of byPrompt.values()) {
  if (group.length < 2) continue;
  const answers = group.map((c) => norm(c.answer));
  for (const c of group) for (const d of c.distractors || [])
    if (answers.includes(norm(d))) errors.push(`equivalent form as distractor: ${c.prompt} :: ${d}`);
}

if (errors.length) { console.error(errors.join("\n")); process.exit(1); }

// ---------- emit ----------
const out = { version: 1, courses: COURSES.map(([id, label]) => ({ id, label })), cards };
fs.writeFileSync("../recall/cards.json", JSON.stringify(out, null, 1));

const count = (f) => cards.filter(f).length;
console.log(`cards: ${cards.length}`);
for (const [id, label] of COURSES) console.log(`  ${label}: ${count((c) => c.course === id)}`);

// review page: plain listing for spot-checking content (not the trainer design)
const esc = (s) => JSON.stringify(out).replace(/</g, "\\u003c");
fs.writeFileSync("review.html", `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Card bank review</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>
<style>body{font:14px system-ui,sans-serif;max-width:1000px;margin:auto;padding:16px}
table{border-collapse:collapse;width:100%}td{border-top:1px solid #ddd;padding:6px;vertical-align:top}
.ok{color:#15803d}.no{color:#888}h2{margin-top:32px}h3{margin:18px 0 4px;color:#555}.m{font-size:12px;color:#777}
label{margin-right:12px}</style></head><body>
<h1>Card bank review</h1><p class="m">${cards.length} cards. Answer in green, distractors grey. L = level (1 easy, 2 medium, 3 hard).</p>
<p><label><input type="checkbox" id="deg"> degrees</label></p><div id="out"></div>
<script>const DATA=${esc()};
function draw(){const deg=document.getElementById('deg').checked;const o=document.getElementById('out');o.innerHTML='';
const k=(s)=>{const e=document.createElement('span');katex.render(s,e,{throwOnError:false});return e};
for(const course of DATA.courses){const cs=DATA.cards.filter(c=>c.course===course.id);if(!cs.length)continue;
const h=document.createElement('h2');h.textContent=course.label+' ('+cs.length+')';o.append(h);
const groups=[...new Set(cs.map(c=>c.group+' / '+c.family))];
for(const g of groups){const h3=document.createElement('h3');h3.textContent=g;o.append(h3);const t=document.createElement('table');
for(const c of cs.filter(c=>c.group+' / '+c.family===g)){const v=deg&&c.deg?{...c,...c.deg}:c;const tr=t.insertRow();
const a=tr.insertCell();a.append(k(v.prompt));if(c.note){a.append(' ');a.append(k('('+c.note+')'))}
const b=tr.insertCell();b.className='ok';b.append(c.kind==='tap'?'tap position #'+c.index:k(v.answer));
const d=tr.insertCell();d.className='no';(v.distractors||[]).forEach(x=>{d.append(k(x));d.append('   ')});
const m=tr.insertCell();m.className='m';m.textContent='L'+c.level+(c.reverse?' rev':'')}
o.append(t)}}}
document.getElementById('deg').onchange=draw;draw();</script></body></html>`);
