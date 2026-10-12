// Two-way translation between LaTeX and the plain typed syntax NOUS uses.
//
// Both directions go through one AST rather than trading regexes, because the
// hard cases are structural, not textual: turning `a/b/c` into nested \frac
// needs to know how the division associated, and turning \frac{\frac{a}{b}}{c}
// back into text needs to know where the parentheses have to go.
//
// This is a *syntactic* translator and deliberately not the numeric parser in
// src/integrals/latex.mjs. That one evaluates a known subset; this one has to
// carry things with no numeric value at all — \int, \sum, dx, domain
// restrictions — and must never silently drop what it does not understand.

// ───────────────────────── shared tables ─────────────────────────

// Functions that print as \name in LaTeX and name in plain text.
const FUNCS = new Set([
  "sin", "cos", "tan", "sec", "csc", "cot",
  "sinh", "cosh", "tanh", "sech", "csch", "coth",
  "arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot",
  "asin", "acos", "atan", "asinh", "acosh", "atanh",
  "ln", "log", "exp", "det", "deg", "gcd", "lcm", "max", "min", "mod",
]);

// Plain names that are a backslash command in LaTeX.
const GREEK = ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta",
  "theta", "iota", "kappa", "lambda", "mu", "nu", "xi", "rho", "sigma",
  "tau", "upsilon", "phi", "chi", "psi", "omega",
  "Gamma", "Delta", "Theta", "Lambda", "Xi", "Sigma", "Phi", "Psi", "Omega",
  "pi", "Pi", "infty", "partial", "nabla"];
const GREEK_SET = new Set(GREEK);

// Big operators: no numeric meaning, carried through as opaque names.
const BIGOPS = { int: "\\int", iint: "\\iint", iiint: "\\iiint", oint: "\\oint",
  sum: "\\sum", prod: "\\prod", lim: "\\lim" };

// The trailing space is not optional-but-nice: \le2x is legal LaTeX but reads
// as a typo, and a reader pasting it into a document wants the space there.
const RELS = { "<=": "\\le ", ">=": "\\ge ", "!=": "\\ne ", "~=": "\\approx ",
  "<": "<", ">": ">", "=": "=" };
const RELS_BACK = { "\\le": "<=", "\\leq": "<=", "\\ge": ">=", "\\geq": ">=",
  "\\ne": "!=", "\\neq": "!=", "\\approx": "~=" };

export class ConvertError extends Error {}
const fail = (m) => { throw new ConvertError(m); };

// ───────────────────────── plain → AST ─────────────────────────

function lexPlain(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c)) {
      const m = /^[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(src.slice(i));
      out.push({ k: "num", v: m[0] }); i += m[0].length; continue;
    }
    if (/[A-Za-z]/.test(c)) {
      const m = /^[A-Za-z]+(_\{?[A-Za-z0-9]+\}?)?/.exec(src.slice(i));
      // A big operator's underscore is its lower limit, not part of its name:
      // int_0^1 is three tokens, where R_oc is one.
      const base = /^[A-Za-z]+/.exec(m[0])[0];
      const take = BIGOPS[base] ? base : m[0];
      out.push({ k: "name", v: take }); i += take.length; continue;
    }
    if (c === "_") { out.push({ k: "_", v: "_" }); i++; continue; }
    const two = src.slice(i, i + 2);
    if (["<=", ">=", "!=", "~="].includes(two)) { out.push({ k: "rel", v: two }); i += 2; continue; }
    if ("<>=".includes(c)) { out.push({ k: "rel", v: c }); i++; continue; }
    if ("+-*/^(){}[],|".includes(c)) { out.push({ k: c, v: c }); i++; continue; }
    // unicode the user may have pasted
    if (c === "·" || c === "×") { out.push({ k: "*", v: "*" }); i++; continue; }
    if (c === "−") { out.push({ k: "-", v: "-" }); i++; continue; }
    if (c === "≤") { out.push({ k: "rel", v: "<=" }); i++; continue; }
    if (c === "≥") { out.push({ k: "rel", v: ">=" }); i++; continue; }
    if (c === "π") { out.push({ k: "name", v: "pi" }); i++; continue; }
    if (c === "θ") { out.push({ k: "name", v: "theta" }); i++; continue; }
    fail(`unexpected character ${JSON.stringify(c)} at position ${i}`);
  }
  return out;
}

export function parsePlain(src) {
  const ts = lexPlain(src);
  let i = 0;
  // "|" both opens and closes, so juxtaposition has to know whether the next
  // bar is a closing one. Without this, |x| reads as |x| * (unterminated).
  let absDepth = 0;
  const peek = (o = 0) => ts[i + o];
  const eat = (k) => (peek() && peek().k === k ? ts[i++] : null);
  const need = (k) => eat(k) ?? fail(`expected ${k}`);

  // relation is the loosest level: a = b, 0 < x < 5
  function relation() {
    let l = expr();
    while (peek() && peek().k === "rel") {
      const op = ts[i++].v;
      l = { t: "rel", op, l, r: expr() };
    }
    return l;
  }

  function expr() {
    let l = term();
    for (;;) {
      if (eat("+")) l = { t: "bin", op: "+", l, r: term() };
      else if (eat("-")) l = { t: "bin", op: "-", l, r: term() };
      else break;
    }
    return l;
  }

  function term() {
    let l = unary();
    for (;;) {
      const t = peek();
      if (!t) break;
      if (t.k === "*") { i++; l = { t: "bin", op: "*", l, r: unary() }; continue; }
      if (t.k === "/") { i++; l = { t: "bin", op: "/", l, r: unary() }; continue; }
      // implicit multiplication: 2x, 3(x+1), x sin y
      if (t.k === "num" || t.k === "name" || t.k === "(" ||
          (t.k === "|" && absDepth === 0)) {
        l = { t: "bin", op: "·", l, r: unary() }; continue;
      }
      break;
    }
    return l;
  }

  function unary() {
    if (eat("-")) return { t: "neg", x: unary() };
    if (eat("+")) return unary();
    return power();
  }

  function power() {
    const b = atom();
    if (eat("^")) return { t: "pow", b, e: unary() };   // right-associative
    return b;
  }

  function atom() {
    const t = peek();
    if (!t) fail("expression ended early");

    if (t.k === "num") { i++; return { t: "num", v: t.v }; }

    if (t.k === "name") {
      i++;
      const name = t.v;
      if (name === "sqrt" && peek() && peek().k === "(") {
        return { t: "sqrt", x: group() };
      }
      if (name === "cbrt" && peek() && peek().k === "(") {
        return { t: "sqrt", x: group(), n: { t: "num", v: "3" } };
      }
      if (BIGOPS[name]) return bigop(name);
      if (FUNCS.has(name)) {
        // sin(x) or paren-less sin 2x
        if (peek() && peek().k === "(") return { t: "call", f: name, args: args() };
        return { t: "call", f: name, args: [unary()], bare: true };
      }
      return { t: "name", v: name };
    }

    if (t.k === "(") {
      // (a) groups; (a,b) is a point, and (f(t),g(t)) is a parametric curve
      need("(");
      const items = commas(")");
      need(")");
      return items.length === 1 ? { t: "group", x: items[0] } : { t: "point", items };
    }
    if (t.k === "[") { i++; const items = commas("]"); need("]"); return { t: "list", items }; }
    if (t.k === "{") { i++; const items = commas("}"); need("}"); return { t: "brace", items }; }
    if (t.k === "|") {
      i++; absDepth++;
      const x = relation();
      absDepth--; need("|");
      return { t: "abs", x };
    }
    fail(`unexpected ${t.v}`);
  }

  // \int_a^b, \sum_{k=0}^{n} — bounds written as int_0^1 f dx
  function bigop(name) {
    const node = { t: "bigop", name };
    if (eat("_")) node.sub = atom();
    if (eat("^")) node.sup = atom();
    node.body = peek() ? expr() : null;
    return node;
  }

  function group() { need("("); const x = relation(); need(")"); return x; }
  function args() {
    need("(");
    const a = commas(")");
    need(")");
    return a;
  }
  function commas(close) {
    const out = [];
    if (peek() && peek().k === close) return out;
    out.push(relation());
    while (eat(",")) out.push(relation());
    return out;
  }

  const node = relation();
  if (i < ts.length) fail(`trailing input at "${ts[i].v}"`);
  return node;
}

// ───────────────────────── LaTeX → AST ─────────────────────────

function lexTex(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "\\") {
      const m = /^\\([a-zA-Z]+)/.exec(src.slice(i));
      if (m) { out.push({ k: "cmd", v: m[1] }); i += m[0].length; continue; }
      out.push({ k: "esc", v: src[i + 1] }); i += 2; continue;
    }
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c)) {
      const m = /^[0-9]*\.?[0-9]+/.exec(src.slice(i));
      out.push({ k: "num", v: m[0] }); i += m[0].length; continue;
    }
    if (/[A-Za-z]/.test(c)) { out.push({ k: "name", v: c }); i++; continue; }
    if ("+-*/^_(){}[]|<>=,".includes(c)) { out.push({ k: c, v: c }); i++; continue; }
    fail(`unexpected character ${JSON.stringify(c)} in the LaTeX`);
  }
  return out;
}

export function parseLatex(src) {
  let absDepth = 0;
  // normalise the spacing and sizing noise before lexing
  const clean = src
    .replace(/\\(?:left|right|displaystyle|textstyle|limits|nolimits|!|,|;|:|\s)/g, " ")
    .replace(/\\operatorname\s*\{([a-zA-Z]+)\}/g, "\\$1")
    .replace(/\\(?:mathrm|mathit|text)\s*\{([a-zA-Z]+)\}/g, "$1");

  const ts = lexTex(clean);
  let i = 0;
  const peek = (o = 0) => ts[i + o];
  const eat = (k, v) => (peek() && peek().k === k && (v == null || peek().v === v) ? ts[i++] : null);
  const need = (k) => eat(k) ?? fail(`expected ${k} in the LaTeX`);

  function relation() {
    let l = expr();
    for (;;) {
      const t = peek();
      if (t && (t.k === "<" || t.k === ">" || t.k === "=")) {
        i++; l = { t: "rel", op: t.v, l, r: expr() }; continue;
      }
      if (t && t.k === "cmd" && RELS_BACK["\\" + t.v]) {
        i++; l = { t: "rel", op: RELS_BACK["\\" + t.v], l, r: expr() }; continue;
      }
      break;
    }
    return l;
  }

  function expr() {
    let l = term();
    for (;;) {
      if (eat("+")) l = { t: "bin", op: "+", l, r: term() };
      else if (eat("-")) l = { t: "bin", op: "-", l, r: term() };
      else break;
    }
    return l;
  }

  function term() {
    let l = unary();
    for (;;) {
      const t = peek();
      if (!t) break;
      if (t.k === "*") { i++; l = { t: "bin", op: "*", l, r: unary() }; continue; }
      if (t.k === "/") { i++; l = { t: "bin", op: "/", l, r: unary() }; continue; }
      if (t.k === "cmd" && (t.v === "cdot" || t.v === "times")) {
        i++; l = { t: "bin", op: "*", l, r: unary() }; continue;
      }
      if (["+", "-", ")", "}", "]", ",", "<", ">", "="].includes(t.k)) break;
      if (t.k === "|") { if (absDepth > 0) break; }
      if (t.k === "cmd" && RELS_BACK["\\" + t.v]) break;
      l = { t: "bin", op: "·", l, r: unary() };
    }
    return l;
  }

  function unary() {
    if (eat("-")) return { t: "neg", x: unary() };
    if (eat("+")) return unary();
    return power();
  }

  function power() {
    let b = atom();
    // a subscript binds to the name it follows: x_{1}
    if (eat("_")) b = { t: "sub", b, s: atom() };
    if (eat("^")) return { t: "pow", b, e: atom() };
    return b;
  }

  function braced() {
    if (eat("{")) { const x = relation(); need("}"); return x; }
    return atom();
  }

  function atom() {
    const t = peek();
    if (!t) fail("the LaTeX ended early");

    if (t.k === "num") { i++; return { t: "num", v: t.v }; }
    if (t.k === "name") { i++; return { t: "name", v: t.v }; }
    if (t.k === "(") {
      i++;
      const items = commas(")");
      need(")");
      return items.length === 1 ? { t: "group", x: items[0] } : { t: "point", items };
    }
    // Braces in LaTeX are pure grouping with no printed parentheses, so they
    // vanish into the tree — x^{2} must come back as x^2, not x^(2). The
    // printers re-add brackets from precedence where they are actually needed.
    if (t.k === "{") { i++; const x = relation(); need("}"); return x; }
    if (t.k === "[") { i++; const items = commas("]"); need("]"); return { t: "list", items }; }
    if (t.k === "|") {
      i++; absDepth++;
      const x = relation();
      absDepth--; need("|");
      return { t: "abs", x };
    }
    if (t.k === "esc") {
      i++;
      if (t.v === "{") { const items = commas("esc"); eatEsc("}"); return { t: "brace", items }; }
      if (t.v === "|") { const x = relation(); eatEsc("|"); return { t: "abs", x }; }
      return { t: "name", v: t.v };
    }
    if (t.k !== "cmd") fail(`unexpected ${t.v} in the LaTeX`);

    i++;
    const c = t.v;
    if (c === "frac" || c === "dfrac" || c === "tfrac") {
      return { t: "bin", op: "/", l: braced(), r: braced() };
    }
    if (c === "sqrt") {
      let n = null;
      if (eat("[")) { n = relation(); need("]"); }
      return { t: "sqrt", x: braced(), n };
    }
    if (BIGOPS[c]) {
      const node = { t: "bigop", name: c };
      if (eat("_")) node.sub = braced();
      if (eat("^")) node.sup = braced();
      node.body = peek() ? expr() : null;
      return node;
    }
    if (FUNCS.has(c)) {
      if (peek() && peek().k === "(") { i++; const a = commas(")"); need(")"); return { t: "call", f: c, args: a }; }
      return { t: "call", f: c, args: [unary()], bare: true };
    }
    if (GREEK_SET.has(c)) return { t: "name", v: c };
    fail(`unknown LaTeX command \\${c}`);
  }

  function eatEsc(v) { if (!(peek() && peek().k === "esc" && peek().v === v)) fail(`expected \\${v}`); i++; }
  function commas(close) {
    const out = [];
    const atClose = () => !peek() ||
      (close === "esc" ? peek().k === "esc" : peek().k === close);
    if (atClose()) return out;
    out.push(relation());
    while (eat(",")) out.push(relation());
    return out;
  }

  const node = relation();
  if (i < ts.length) fail(`trailing LaTeX at "${ts[i].v}"`);
  return node;
}

// ───────────────────────── AST → LaTeX ─────────────────────────

const PREC = { rel: 0, "+": 1, "-": 1, "*": 2, "/": 2, "·": 2, neg: 3, pow: 4, atom: 5 };
const precOf = (n) =>
  n.t === "rel" ? 0 : n.t === "bin" ? PREC[n.op] : n.t === "neg" ? 3 : n.t === "pow" ? 4 : 5;

export function toLatex(n) {
  const wrap = (child, min) => {
    const s = toLatex(child);
    return precOf(child) < min ? `\\left(${s}\\right)` : s;
  };
  switch (n.t) {
    case "num": return n.v;
    case "name": {
      const [base, sub] = n.v.split("_");
      const head = GREEK_SET.has(base) ? "\\" + base : base;
      return sub ? `${head}_{${sub.replace(/[{}]/g, "")}}` : head;
    }
    case "sub": return `${toLatex(n.b)}_{${toLatex(n.s)}}`;
    case "neg": return `-${wrap(n.x, 3)}`;
    case "group": return `\\left(${toLatex(n.x)}\\right)`;
    case "point": return `\\left(${n.items.map((a) => toLatex(strip(a))).join(",")}\\right)`;
    // Bars, brackets, roots and braces group on their own, so a (…) the reader
    // wrote inside one is redundant once it is printed — strip it.
    case "abs": return `\\left|${toLatex(strip(n.x))}\\right|`;
    case "list": return `\\left[${n.items.map((a) => toLatex(strip(a))).join(",")}\\right]`;
    case "brace": return `\\left\\{${n.items.map((a) => toLatex(strip(a))).join(",")}\\right\\}`;
    case "sqrt": return n.n ? `\\sqrt[${toLatex(strip(n.n))}]{${toLatex(strip(n.x))}}`
                            : `\\sqrt{${toLatex(strip(n.x))}}`;
    case "pow": return `${wrap(n.b, 5)}^{${toLatex(strip(n.e))}}`;
    case "rel": return `${toLatex(n.l)}${RELS[n.op] ?? n.op}${toLatex(n.r)}`;
    case "call": {
      const f = FUNCS.has(n.f) ? "\\" + n.f : `\\operatorname{${n.f}}`;
      return `${f}\\left(${n.args.map((a) => toLatex(strip(a))).join(",")}\\right)`;
    }
    case "bigop": {
      let s = BIGOPS[n.name];
      if (n.sub) s += `_{${toLatex(strip(n.sub))}}`;
      if (n.sup) s += `^{${toLatex(strip(n.sup))}}`;
      return n.body ? `${s} ${toLatex(n.body)}` : s;
    }
    case "bin": {
      // division becomes \frac, which brackets its own operands
      if (n.op === "/") return `\\frac{${toLatex(strip(n.l))}}{${toLatex(strip(n.r))}}`;
      const op = n.op === "*" ? "\\cdot " : n.op === "·" ? "" : n.op;
      const p = PREC[n.op];
      return wrap(n.l, p) + op + wrap(n.r, n.op === "-" ? p + 1 : p);
    }
    default: fail(`cannot print node ${n.t}`);
  }
}

/** \frac supplies its own grouping, so a redundant (…) inside it is noise. */
const strip = (n) => (n.t === "group" ? n.x : n);

// ───────────────────────── AST → plain / NOUS ─────────────────────────

export function toPlain(n) {
  const wrap = (child, min) => {
    const s = toPlain(child);
    return precOf(child) < min ? `(${s})` : s;
  };
  switch (n.t) {
    case "num": return n.v;
    case "name": return n.v;
    case "sub": return `${toPlain(n.b)}_${toPlain(n.s)}`;
    case "neg": return `-${wrap(n.x, 3)}`;
    case "group": return `(${toPlain(n.x)})`;
    case "point": return `(${n.items.map(toPlain).join(", ")})`;
    case "abs": return `|${toPlain(n.x)}|`;
    case "list": return `[${n.items.map(toPlain).join(", ")}]`;
    case "brace": return `{${n.items.map(toPlain).join(", ")}}`;
    case "sqrt":
      if (!n.n) return `sqrt(${toPlain(n.x)})`;
      if (n.n.t === "num" && n.n.v === "3") return `cbrt(${toPlain(n.x)})`;
      return `(${toPlain(n.x)})^(1/(${toPlain(n.n)}))`;
    case "pow": return `${wrap(n.b, 5)}^${wrap(n.e, 4)}`;   // ^ is right-associative
    case "rel": return `${toPlain(n.l)} ${n.op} ${toPlain(n.r)}`;
    case "call": return `${n.f}(${n.args.map(toPlain).join(", ")})`;
    case "bigop": {
      let s = n.name;
      if (n.sub) s += `_${wrap(n.sub, 5)}`;
      if (n.sup) s += `^${wrap(n.sup, 5)}`;
      return n.body ? `${s} ${toPlain(n.body)}` : s;
    }
    case "bin": {
      if (n.op === "·") {
        // Juxtaposition prints bare only where it cannot re-lex as one name:
        // 2x is safe, a·b is not, because "ab" would come back as a single
        // identifier rather than a product.
        const bare = n.l.t === "num" &&
          ["name", "call", "group", "abs", "sqrt", "pow", "list"].includes(n.r.t);
        return wrap(n.l, 2) + (bare ? "" : "·") + wrap(n.r, 2);
      }
      const p = PREC[n.op];
      const op = n.op === "*" ? "*" : n.op;
      const bump = n.op === "-" || n.op === "/" ? 1 : 0;
      return wrap(n.l, p + (n.op === "/" ? 1 : 0)) + op + wrap(n.r, p + bump);
    }
    default: fail(`cannot print node ${n.t}`);
  }
}

// ───────────────────────── Desmos input ─────────────────────────

/**
 * Pull a list of expressions out of whatever the user pasted: a full Desmos
 * state object, just its expression list, or plain lines of LaTeX.
 * Returns [{ latex, note }] — note carries sliders, folders and the like so
 * nothing is silently dropped.
 */
export function readDesmos(text) {
  const src = text.trim();
  if (!src) return [];

  if (src.startsWith("{") || src.startsWith("[")) {
    let data;
    try { data = JSON.parse(src); }
    catch { /* not JSON after all — fall through to line mode */ data = null; }
    if (data) {
      const list = Array.isArray(data) ? data
        : data?.expressions?.list ?? data?.list ?? null;
      if (Array.isArray(list)) {
        const out = [];
        for (const row of list) {
          if (row.type === "folder") { out.push({ kind: "folder", title: row.title ?? "" }); continue; }
          if (row.type === "text") { out.push({ kind: "text", note: row.text ?? "" }); continue; }
          if (typeof row.latex !== "string" || !row.latex.trim()) continue;
          out.push({
            kind: "expr",
            latex: row.latex,
            hidden: row.hidden === true,
            slider: row.slider && Object.keys(row.slider).length ? row.slider : null,
          });
        }
        return out;
      }
    }
  }

  // plain lines — one expression each, blank lines ignored
  return src.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    .map((latex) => ({ kind: "expr", latex }));
}

// ───────────────────────── top-level conversions ─────────────────────────

/** LaTeX in, plain/NOUS out. Never throws: a failure comes back as `error`. */
export function latexToPlain(latex) {
  try { return { ok: true, out: toPlain(parseLatex(latex)) }; }
  catch (e) { return { ok: false, error: e.message, out: latex }; }
}

/** Plain in, LaTeX out. Never throws. */
export function plainToLatex(plain) {
  try { return { ok: true, out: toLatex(parsePlain(plain)) }; }
  catch (e) { return { ok: false, error: e.message, out: plain }; }
}

/** Convert a whole pasted Desmos graph. */
export function convertGraph(text) {
  return readDesmos(text).map((row) => {
    if (row.kind !== "expr") return row;
    const r = latexToPlain(row.latex);
    return { ...row, plain: r.out, error: r.ok ? null : r.error };
  });
}
