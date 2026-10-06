// Checks every problem in the Integration Bench by differentiating its stated
// answer and comparing to its integrand. Reads the live page, so what is
// checked is exactly what ships.
//
//   node src/integrals/verify.mjs            # check trainers/integrals.html
//   node src/integrals/verify.mjs file.mjs   # check a bank module instead
//
// Exits non-zero on any mismatch. A problem the checker cannot parse is
// reported separately from one it can parse and finds wrong — the first is a
// gap in the checker, the second is a bad answer.

import { readFileSync } from "node:fs";
import { compile, integrandOf, antiderivativeOf } from "./latex.mjs";

/** Extract the BANK array literal from the trainer page and evaluate it. */
export function bankFromPage(path) {
  const lines = readFileSync(path, "utf8").split("\n");
  const start = lines.findIndex((l) => l.startsWith("const BANK = ["));
  if (start < 0) throw new Error("no BANK literal in " + path);
  const end = lines.findIndex((l, i) => i > start && l.trim() === "];");
  if (end < 0) throw new Error("unterminated BANK literal in " + path);
  const src = lines.slice(start, end + 1).join("\n");
  return { bank: new Function(src + "; return BANK;")(), start: start + 1, end: end + 1 };
}

// Five-point stencil: error is O(h^4), so h=1e-3 gives ~12 good digits on
// well-scaled functions and leaves room for round-off.
function deriv(f, x, h) {
  return (-f(x + 2 * h) + 8 * f(x + h) - 8 * f(x - h) + f(x - 2 * h)) / (12 * h);
}

const ok = (v) => Number.isFinite(v);

/**
 * Compare F' to f at a spread of sample points.
 * Returns { checked, worst } or { error } when nothing could be sampled.
 */
export function compare(fTex, FTex, opts = {}) {
  const f = compile(integrandOf(fTex));
  const F = compile(antiderivativeOf(FTex));
  const pts = opts.points || defaultPoints();
  const tol = opts.tol ?? 2e-5;
  let checked = 0, worst = 0, worstAt = null;

  for (const x of pts) {
    let want, coarse, fine;
    try {
      want = f(x);
      coarse = deriv(F, x, 2e-3);
      fine = deriv(F, x, 1e-3);
    } catch { continue; }
    if (!ok(want) || !ok(coarse) || !ok(fine)) continue;

    // A sample point straddling a pole is the checker's problem, not the
    // answer's: tan x near pi/2, ln|3x-4| near 4/3. The stencil is O(h^4), so
    // halving h must barely move the estimate. When it moves a lot the point is
    // unusable and gets dropped rather than counted as a failure.
    const stable = Math.max(1, Math.abs(fine));
    if (Math.abs(coarse - fine) / stable > 1e-6) continue;

    const scale = Math.max(1, Math.abs(want), Math.abs(fine));
    const rel = Math.abs(want - fine) / scale;
    checked++;
    if (rel > worst) { worst = rel; worstAt = x; }
  }
  if (checked < 4) return { error: "only " + checked + " usable sample points" };
  return { checked, worst, worstAt, pass: worst <= tol };
}

function defaultPoints() {
  // Deterministic, irrational-ish spread: avoids landing on 0, 1, pi/2 and the
  // other places textbook integrands blow up. Both signs, both sides of 1.
  // The large values matter: sqrt(x^2 - 9) is only real past 3, and an answer
  // valid only out there needs enough points out there to be checked at all.
  const base = [0.3137, 0.4271, 0.5839, 0.7193, 0.8627, 1.1359, 1.3471,
                1.6283, 1.9137, 2.3719, 2.8431, 3.4127, 4.1379, 5.2713,
                6.9137, 8.3271, 11.4273];
  return [...base, ...base.map((v) => -v)];
}

export function verifyBank(bank, { verbose = false } = {}) {
  const bad = [], unparsed = [];
  let passed = 0;
  bank.forEach((p, i) => {
    const label = `#${i} [${p.tech} d${p.d}] ${p.t}`;
    let r;
    try { r = compare(p.t, p.a); }
    catch (e) { unparsed.push({ i, label, why: e.message, a: p.a }); return; }
    if (r.error) { unparsed.push({ i, label, why: r.error, a: p.a }); return; }
    if (!r.pass) bad.push({ i, label, a: p.a, worst: r.worst, at: r.worstAt });
    else { passed++; if (verbose) console.log("ok  " + label); }
  });
  return { passed, bad, unparsed, total: bank.length };
}

function report(res) {
  console.log(`\n${res.passed}/${res.total} verified`);
  if (res.unparsed.length) {
    console.log(`\n${res.unparsed.length} not checkable (parser gap, not necessarily wrong):`);
    for (const u of res.unparsed) console.log(`  ${u.label}\n      = ${u.a}\n      ${u.why}`);
  }
  if (res.bad.length) {
    console.log(`\n${res.bad.length} WRONG:`);
    for (const b of res.bad)
      console.log(`  ${b.label}\n      = ${b.a}\n      rel err ${b.worst.toExponential(2)} at x=${b.at}`);
  }
  return res.bad.length === 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv[2];
  let bank;
  if (!arg || arg.endsWith(".html")) {
    bank = bankFromPage(arg || new URL("../../trainers/integrals.html", import.meta.url).pathname).bank;
  } else {
    bank = (await import(new URL(arg, `file://${process.cwd()}/`).href)).default;
  }
  const res = verifyBank(bank, { verbose: process.argv.includes("-v") });
  process.exit(report(res) ? 0 : 1);
}
