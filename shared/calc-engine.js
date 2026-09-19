/* shared/calc-engine.js — the computational foundation the calculus trainers share.
 *
 * Exact rational arithmetic, polynomials with rational exponents, the math
 * rendering vocabulary, and a typed-answer evaluator. Originally grown inside
 * Revolution Trainer; pulled out here because Arc Length and Surface Area do
 * the same job with a different integrand:
 *
 *     revolution   V = π ∫ R² dv          or  2π ∫ (radius)(height) dv
 *     arc length   L =   ∫ ds             ds = √(1 + [y′]²) dv
 *     surface      S = 2π ∫ (radius) ds
 *
 * so all three reduce to "build a polynomial, integrate it exactly, render it".
 *
 * Classic script — no modules, no build step. Sets window.CALC.
 */
"use strict";
(function (global) {

/* ============================ exact rational arithmetic ============================ */
function bgcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { const t = a % b; a = b; b = t; } return a; }

class F {
  constructor(n, d = 1n) {
    n = BigInt(n); d = BigInt(d);
    if (d === 0n) throw new Error("divide by zero");
    if (d < 0n) { n = -n; d = -d; }
    const g = bgcd(n, d) || 1n;
    this.n = n / g; this.d = d / g;
  }
  add(o) { return new F(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new F(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new F(this.n * o.n, this.d * o.d); }
  div(o) { return new F(this.n * o.d, this.d * o.n); }
  neg() { return new F(-this.n, this.d); }
  abs() { return this.n < 0n ? this.neg() : this; }
  isZero() { return this.n === 0n; }
  isNeg() { return this.n < 0n; }
  isInt() { return this.d === 1n; }
  cmp(o) { const l = this.n * o.d, r = o.n * this.d; return l < r ? -1 : l > r ? 1 : 0; }
  eq(o) { return this.n === o.n && this.d === o.d; }
  eqInt(k) { return this.d === 1n && this.n === BigInt(k); }
  num() { return Number(this.n) / Number(this.d); }
  toString() { return this.d === 1n ? String(this.n) : this.n + "/" + this.d; }
}
const f = (n, d = 1) => new F(BigInt(n), BigInt(d));
const ZERO = f(0), ONE = f(1), TWO = f(2), HALF = f(1, 2);

function isqrt(n) {                                  // exact integer square root, else null
  if (n < 0n) return null;
  if (n < 2n) return n;
  let x = n, y = (x + 1n) / 2n;
  while (y < x) { x = y; y = (x + n / x) / 2n; }
  return x * x === n ? x : null;
}
function fsqrt(q) {                                  // exact rational square root, else null
  if (q.isNeg()) return null;
  const sn = isqrt(q.n), sd = isqrt(q.d);
  return (sn === null || sd === null) ? null : new F(sn, sd);
}
function ratPow(base, e) {                           // exact only; null if irrational
  if (e.isZero()) return ONE;
  if (e.d === 1n) {
    let k = e.n;
    if (k < 0n) { if (base.isZero()) return null; return ratPow(new F(base.d, base.n), new F(-k, 1n)); }
    return new F(base.n ** k, base.d ** k);
  }
  if (e.d === 2n) {
    const r = fsqrt(base);
    return r === null ? null : ratPow(r, new F(e.n, 1n));
  }
  return null;
}

/* ============================ polynomials with rational exponents ============================
   A "poly" is an array of {c:F, e:F} terms — c·v^e. Rational exponents are what
   lets √x and 1/x² live in the same object as x³, which is exactly what arc
   length needs once the radical collapses.
================================================================================ */
const T = (c, e) => ({ c: (c instanceof F) ? c : f(c), e: (e instanceof F) ? e : f(e) });

function pnorm(p) {
  const m = new Map();
  for (const t of p) {
    const k = t.e.toString(), cur = m.get(k);
    if (cur) cur.c = cur.c.add(t.c); else m.set(k, { c: t.c, e: t.e });
  }
  return [...m.values()].filter(t => !t.c.isZero()).sort((a, b) => b.e.cmp(a.e));
}
const padd = (a, b) => pnorm([...a, ...b]);
const psub = (a, b) => pnorm([...a, ...b.map(t => ({ c: t.c.neg(), e: t.e }))]);
function pmul(a, b) { const o = []; for (const s of a) for (const t of b) o.push({ c: s.c.mul(t.c), e: s.e.add(t.e) }); return pnorm(o); }
const psq = a => pmul(a, a);
const pk = k => [T(k, 0)];
const pscale = (a, k) => pnorm(a.map(t => ({ c: t.c.mul(k instanceof F ? k : f(k)), e: t.e })));

/* derivative — needed to go from y to y′ inside a generator */
function pdiff(p) { return pnorm(p.filter(t => !t.e.isZero()).map(t => ({ c: t.c.mul(t.e), e: t.e.sub(ONE) }))); }

/* antiderivative. x^-1 integrates to a logarithm, so the result is split into a
   polynomial part and a log coefficient: ∫p = P + lg·ln v. */
function pintL(p) {
  const out = []; let lg = ZERO;
  for (const t of p) {
    if (t.e.eqInt(-1)) lg = lg.add(t.c);
    else { const e2 = t.e.add(ONE); out.push({ c: t.c.div(e2), e: e2 }); }
  }
  return { P: pnorm(out), lg: lg };
}
function pint(p) {                                   // plain antiderivative; throws on a log term
  const { P, lg } = pintL(p);
  if (!lg.isZero()) throw new Error("antiderivative contains a logarithm");
  return P;
}

function pev(p, x) {                                 // exact evaluation
  let s = ZERO;
  for (const t of p) {
    const v = ratPow(x, t.e);
    if (v === null) throw new Error("non-exact evaluation");
    s = s.add(t.c.mul(v));
  }
  return s;
}
function pevN(p, x) {                                // numeric evaluation, always works
  let s = 0;
  for (const t of p) s += t.c.num() * Math.pow(x, t.e.num());
  return s;
}
function pdef(p, a, b) { const I = pint(p); return pev(I, b).sub(pev(I, a)); }

/* definite integral that tolerates a log term:
   returns {rat, lg, lo, hi, value} with value = rat + lg·ln(hi/lo). */
function pdefL(p, a, b) {
  const { P, lg } = pintL(p);
  const rat = pev(P, b).sub(pev(P, a));
  const value = rat.num() + (lg.isZero() ? 0 : lg.num() * Math.log(b.num() / a.num()));
  return { rat: rat, lg: lg, lo: a, hi: b, value: value };
}
function pdefN(p, a, b) {                            // numeric fallback
  const { P, lg } = pintL(p);
  return pevN(P, b) - pevN(P, a) + (lg.isZero() ? 0 : lg.num() * Math.log(b / a));
}

/* ============================ rendering ============================ */
function fracHTML(a) {                               // a = non-negative F
  return a.d === 1n ? String(a.n)
    : '<span class="fr"><span>' + a.n + '</span><span>' + a.d + '</span></span>';
}
function expHTML(e) {
  const s = e.d === 1n ? String(e.n) : e.n + "/" + e.d;
  return s.replace("-", "−");
}
function varHTML(v, e) {
  if (e.isZero()) return "";
  if (e.eqInt(1)) return "<i>" + v + "</i>";
  return "<i>" + v + "</i><sup>" + expHTML(e) + "</sup>";
}
function fmtPoly(p, v) {
  if (p.length === 0) return "0";
  let out = "";
  p.forEach((t, i) => {
    const neg = t.c.isNeg(), a = neg ? t.c.neg() : t.c;
    out += i === 0 ? (neg ? "−" : "") : (neg ? " − " : " + ");
    const unit = a.d === 1n && a.n === 1n;
    if (unit && !t.e.isZero()) out += varHTML(v, t.e);
    else out += fracHTML(a) + varHTML(v, t.e);
  });
  return out;
}
function intHTML(lo, hi, body, v, pre) {
  return (pre || "") + '<span class="itg">∫</span><span class="lims"><span>' + hi + '</span><span>' + lo + '</span></span>'
    + body + " <i>d" + v + "</i>";
}
function fmtLim(x) { return x.isNeg() ? "−" + fracHTML(x.neg()) : fracHTML(x); }

/* q·sym as a single fraction — "8π/3", "−3/4", "√2/2". sym is HTML or "". */
function fmtCoef(q, sym) {
  if (q.isZero()) return "0";
  const neg = q.isNeg(), a = neg ? q.neg() : q;
  const unit = a.n === 1n && sym;
  const top = unit ? sym : (sym ? a.n + sym : String(a.n));
  const s = a.d === 1n ? top : '<span class="fr"><span>' + top + '</span><span>' + a.d + '</span></span>';
  return (neg ? "−" : "") + s;
}
const fmtExact = (q, pi) => fmtCoef(q, pi ? "π" : "");

/* a signed sum of coefficient·symbol pieces: terms([{q,sym},…]) */
function terms(list) {
  let out = "", first = true;
  for (const t of list) {
    if (!t || t.q.isZero()) continue;
    const neg = t.q.isNeg(), a = neg ? t.q.neg() : t.q;
    out += first ? (neg ? "−" : "") : (neg ? " − " : " + ");
    out += fmtCoef(a, t.sym || "");
    first = false;
  }
  return out || "0";
}

function mono(a, n, v) {                             // a·v^n
  if (n === 0) return String(a);
  const c = a === 1 ? "" : (a === -1 ? "−" : String(a));
  return c + varHTML(v, f(n));
}
const RAD = x => "√<span class=\"rad\">" + x + "</span>";
const SQ = x => "(" + x + ")<sup>2</sup>";
const POW32 = x => "(" + x + ")<sup>3/2</sup>";

/* ============================ random helpers ============================ */
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
function pickTwo(a) {                                // two distinct entries, in order
  const i = Math.floor(Math.random() * a.length);
  let j = Math.floor(Math.random() * (a.length - 1));
  if (j >= i) j++;
  return i < j ? [a[i], a[j]] : [a[j], a[i]];
}

/* Pythagorean slopes: m = p/q has √(1+m²) = r/q rational, which is what makes
   the arc length of a line — and therefore every cone and frustum — exact. */
const TRIPLES = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17],
                 [7, 24, 25], [24, 7, 25], [20, 21, 29], [9, 40, 41]];

/* ============================ the arc-length kernel ============================
   Everything below is shared by the Arc Length and Surface Area trainers.

   conj(a, p) builds the conjugate family — the reason arc-length problems in
   textbooks look the way they do. If

        y′ = a·v^p − (1/4a)·v^(−p)

   then the cross terms in 1 + [y′]² cancel to exactly +1/2, so

        1 + [y′]² = (a·v^p + (1/4a)·v^(−p))²

   and the radical disappears. ds is then an ordinary polynomial, which means
   ∫ds, ∫y·ds and ∫v·ds are all exactly integrable by the machinery above —
   arc length and both surface-area orientations, from one construction.
================================================================================ */
function conj(a, p) {
  const A = (a instanceof F) ? a : f(a);
  const P = (p instanceof F) ? p : f(p);
  const b = ONE.div(A.mul(f(4)));                    // the 1/(4a) partner
  const dy = pnorm([T(A, P), T(b.neg(), P.neg())]);  // y′
  const ds = pnorm([T(A, P), T(b, P.neg())]);        // √(1+[y′]²)
  const y = pintL(dy);                               // y itself (may carry a log)
  return { a: A, p: P, b: b, dy: dy, ds: ds, y: y.P, ylg: y.lg };
}

/* ============================ typed-answer evaluation ============================
   A small recursive-descent parser. Students type things like
       16pi/15 · sqrt(2)+ln(1+sqrt(2)) · (2/3)(8-1) · 3/4 + ln(2)/4 · sinh(1)
   Implicit multiplication binds tighter than division, so 1/2pi reads as
   1/(2π) — the way it is meant when a student writes it by hand.
================================================================================ */
const CONSTS = { pi: Math.PI, e: Math.E, tau: 2 * Math.PI, phi: (1 + Math.sqrt(5)) / 2 };
const FUNCS = {
  sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, exp: Math.exp,
  ln: Math.log, log: Math.log, log10: Math.log10, log2: Math.log2,
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  sec: x => 1 / Math.cos(x), csc: x => 1 / Math.sin(x), cot: x => 1 / Math.tan(x),
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
  asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh,
  arcsinh: Math.asinh, arccosh: Math.acosh, arctanh: Math.atanh
};

function tokenize(src) {
  const out = []; let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " ") { i++; continue; }
    if (c >= "0" && c <= "9" || c === ".") {
      let j = i; while (j < src.length && (src[j] >= "0" && src[j] <= "9" || src[j] === ".")) j++;
      const v = parseFloat(src.slice(i, j));
      if (!isFinite(v)) return null;
      out.push({ t: "num", v: v }); i = j; continue;
    }
    if (c >= "a" && c <= "z") {
      let j = i; while (j < src.length && src[j] >= "a" && src[j] <= "z") j++;
      out.push({ t: "name", v: src.slice(i, j) }); i = j; continue;
    }
    if ("+-*/^()".indexOf(c) >= 0) { out.push({ t: c }); i++; continue; }
    return null;
  }
  return out;
}

function evalNum(raw) {
  if (typeof raw !== "string") return null;
  let s = raw.toLowerCase().trim();
  if (!s) return null;
  s = s.replace(/π/g, "pi").replace(/√/g, "sqrt").replace(/÷/g, "/")
       .replace(/[×⋅·]/g, "*").replace(/[−–—]/g, "-")
       .replace(/\*\*/g, "^").replace(/[[{]/g, "(").replace(/[\]}]/g, ")")
       .replace(/,/g, "").replace(/²/g, "^2").replace(/³/g, "^3")
       .replace(/[=]/g, "");
  const ts = tokenize(s);
  if (!ts || !ts.length) return null;

  let i = 0;
  const fail = () => { throw new Error("parse"); };

  function atom() {
    const t = ts[i];
    if (!t) fail();
    if (t.t === "num") { i++; return t.v; }
    if (t.t === "(") { i++; const v = expr(); if (!ts[i] || ts[i].t !== ")") fail(); i++; return v; }
    if (t.t === "name") {
      const n = t.v; i++;
      if (Object.prototype.hasOwnProperty.call(CONSTS, n)) return CONSTS[n];
      if (Object.prototype.hasOwnProperty.call(FUNCS, n)) {
        // sin(2)^2 must square the sine, so a parenthesised argument stops here
        // and lets the caller's ^ bind outside it.
        const arg = (ts[i] && ts[i].t === "(") ? atom() : unary();
        return FUNCS[n](arg);
      }
      fail();
    }
    fail();
  }
  function power() {
    const b = atom();
    if (ts[i] && ts[i].t === "^") { i++; return Math.pow(b, unary()); }
    return b;
  }
  function unary() {
    if (ts[i] && ts[i].t === "-") { i++; return -unary(); }
    if (ts[i] && ts[i].t === "+") { i++; return unary(); }
    return power();
  }
  // Two kinds of implicit multiplication, deliberately at different strengths.
  // A bare number or constant binds tighter than division, so 1/2pi reads as
  // 1/(2π) the way it is meant by hand. A parenthesised group does not, so
  // pi/6(17sqrt(17)-1) reads as (π/6)·(…) — which is how the exact answers
  // these trainers print are laid out.
  function juxt() {
    let v = unary();
    for (;;) {
      const t = ts[i];
      if (t && (t.t === "num" || t.t === "name")) v *= unary();
      else break;
    }
    return v;
  }
  function term() {
    let v = juxt();
    for (;;) {
      const t = ts[i]; if (!t) break;
      if (t.t === "*") { i++; v *= juxt(); }
      else if (t.t === "/") { i++; v /= juxt(); }
      else if (t.t === "(") { v *= juxt(); }
      else break;
    }
    return v;
  }
  function expr() {
    let v = term();
    while (ts[i] && (ts[i].t === "+" || ts[i].t === "-")) {
      const op = ts[i].t; i++; const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }

  try {
    const v = expr();
    if (i !== ts.length) return null;
    return (typeof v === "number" && isFinite(v)) ? v : null;
  } catch (e) { return null; }
}

/* relative tolerance, so a typed decimal and an exact form both pass */
function sameNum(got, want, tol) {
  const t = tol || 1e-3;
  return Math.abs(got - want) <= t * Math.max(1, Math.abs(want));
}

global.CALC = {
  F: F, f: f, ZERO: ZERO, ONE: ONE, TWO: TWO, HALF: HALF,
  isqrt: isqrt, fsqrt: fsqrt, ratPow: ratPow,
  T: T, pnorm: pnorm, padd: padd, psub: psub, pmul: pmul, psq: psq, pk: pk,
  pscale: pscale, pdiff: pdiff, pint: pint, pintL: pintL,
  pev: pev, pevN: pevN, pdef: pdef, pdefL: pdefL, pdefN: pdefN,
  fracHTML: fracHTML, expHTML: expHTML, varHTML: varHTML, fmtPoly: fmtPoly,
  intHTML: intHTML, fmtLim: fmtLim, fmtCoef: fmtCoef, fmtExact: fmtExact,
  terms: terms, mono: mono, RAD: RAD, SQ: SQ, POW32: POW32,
  ri: ri, pick: pick, pickTwo: pickTwo, TRIPLES: TRIPLES,
  conj: conj, evalNum: evalNum, sameNum: sameNum
};

})(typeof window !== "undefined" ? window : globalThis);
