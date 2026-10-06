// LaTeX -> numeric JavaScript, for the subset the Integration Bench writes in.
//
// This exists so the bench can be checked against itself: every problem's
// answer is differentiated numerically and compared to its integrand, reading
// the same LaTeX string the page renders. A parallel machine-readable copy of
// each problem would drift from what ships; this cannot.
//
// The one genuinely ambiguous construct is a bare function argument. LaTeX
// writes \sin 2x for sin(2x) and \sin x\cos x for sin(x)cos(x), and nothing in
// the markup distinguishes them. The rule below: after a function, take a
// braced or parenthesised group whole, otherwise consume a run of simple atoms
// (numbers, variables, \pi) and stop at the first operator, delimiter or other
// function. That matches ordinary typesetting on everything the bank writes.

const FUNCS = {
  sin: "Math.sin", cos: "Math.cos", tan: "Math.tan",
  sec: "SEC", csc: "CSC", cot: "COT",
  arcsin: "Math.asin", arccos: "Math.acos", arctan: "Math.atan",
  arcsec: "ARCSEC", arccsc: "ARCCSC", arccot: "ARCCOT",
  sinh: "Math.sinh", cosh: "Math.cosh", tanh: "Math.tanh",
  sech: "SECH", csch: "CSCH", coth: "COTH",
  arsinh: "Math.asinh", arcosh: "Math.acosh", artanh: "Math.atanh",
  arcsinh: "Math.asinh", arccosh: "Math.acosh", arctanh: "Math.atanh",
  ln: "Math.log", log: "Math.log", exp: "Math.exp",
};

// \sin^{-1} and friends mean the inverse, not a reciprocal power.
const INVERSE_OF = {
  sin: "arcsin", cos: "arccos", tan: "arctan",
  sec: "arcsec", csc: "arccsc", cot: "arccot",
  sinh: "arsinh", cosh: "arcosh", tanh: "artanh",
};

export const RUNTIME = {
  SEC: (x) => 1 / Math.cos(x),
  CSC: (x) => 1 / Math.sin(x),
  COT: (x) => 1 / Math.tan(x),
  SECH: (x) => 1 / Math.cosh(x),
  CSCH: (x) => 1 / Math.sinh(x),
  COTH: (x) => 1 / Math.tanh(x),
  ARCSEC: (x) => Math.acos(1 / x),
  ARCCSC: (x) => Math.asin(1 / x),
  ARCCOT: (x) => Math.atan(1 / x),
};

class Fail extends Error {}
export function fail(msg) { throw new Fail(msg); }

// ---------- lexer ----------
// Produces atoms the parser can walk: macros, numbers, letters, delimiters.

function lex(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "\\") {
      const m = /^\\([a-zA-Z]+)/.exec(src.slice(i));
      if (m) { out.push({ k: "macro", v: m[1] }); i += m[0].length; continue; }
      // escaped punctuation: \, \! \; \: \{ \} \| and friends
      const p = src[i + 1];
      out.push(SEP.has(p) ? { k: "sep", v: p } : { k: "macro", v: p });
      i += 2; continue;
    }
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c)) {
      const m = /^[0-9]+(\.[0-9]+)?/.exec(src.slice(i));
      out.push({ k: "num", v: m[0] }); i += m[0].length; continue;
    }
    if (/[a-zA-Z]/.test(c)) { out.push({ k: "var", v: c }); i++; continue; }
    if ("+-*/^_(){}[]|".includes(c)) { out.push({ k: c, v: c }); i++; continue; }
    fail("unexpected character " + JSON.stringify(c));
  }
  return out;
}

// Spacing and sizing macros carry no meaning here. They are stripped textually
// before lexing rather than skipped during the parse: \right) must leave a bare
// ")" for the group reader, which a token-level skip cannot do.
const NOISE = /\\(?:quad|qquad|thinspace|negthinspace|displaystyle|textstyle|limits|nolimits|left|right|bigg?l|bigg?r|Bigg?l|Bigg?r|bigg?|Bigg?|mathstrut|strut)\b|\\(?= )/g;

// Thin spaces are not noise. \sec^2 x\,e^{\tan x} means sec^2(x) times
// e^{tan x}, and the \, is the only thing saying so: without it the bare
// argument run would swallow the e. They become a separator token that ends a
// function's argument and otherwise does nothing.
const SEP = new Set([",", "!", ";", ":", ">"]);

function clean(src) {
  return src.replace(NOISE, " ");
}

// ---------- parser ----------
// Grammar: expr -> term (('+'|'-') term)* ; term -> factor+ (implicit mult)
//          factor -> unary ('^' factor)? ; unary -> '-' unary | atom

function parse(tokens) {
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];

  function expr() {
    let s = term();
    for (;;) {
      const t = peek();
      if (!t) break;
      if (t.k === "+") { next(); s = `(${s}+${term()})`; }
      else if (t.k === "-") { next(); s = `(${s}-${term()})`; }
      else break;
    }
    return s;
  }

  // implicit multiplication: 2x, x\ln x, (x+1)(x-1)
  function term() {
    let s = factor();
    for (;;) {
      const t = peek();
      if (!t) break;
      if (t.k === "sep") { next(); continue; }   // spacing: no effect here
      if (t.k === "+" || t.k === "-" || t.k === ")" || t.k === "}" ||
          t.k === "]" || t.k === "|") break;
      if (t.k === "*") { next(); s = `(${s}*${factor()})`; continue; }
      if (t.k === "/") { next(); s = `(${s}/${factor()})`; continue; }
      if (t.k === "macro" && t.v === "cdot") { next(); s = `(${s}*${factor()})`; continue; }
      if (t.k === "macro" && t.v === "times") { next(); s = `(${s}*${factor()})`; continue; }
      s = `(${s}*${factor()})`;
    }
    return s;
  }

  // A leading minus binds LOOSER than the exponent: -x^2 is -(x^2), never
  // (-x)^2. Handling the sign here rather than under the power is the whole
  // difference, and it is silent — both parse, one is wrong by a sign.
  function factor() {
    while (peek() && peek().k === "sep") next();
    const t = peek();
    if (t && t.k === "-") { next(); return `(-${factor()})`; }
    if (t && t.k === "+") { next(); return factor(); }
    const base = atom();
    if (peek() && peek().k === "^") { next(); return `Math.pow(${base},${factor()})`; }
    return base;
  }


  // a braced/parenthesised group, read whole
  function group(open, close) {
    if (!peek() || peek().k !== open) fail("expected " + open);
    next();
    const s = expr();
    if (!peek() || peek().k !== close) fail("expected " + close);
    next();
    return s;
  }

  // the argument of \sin, \ln, … — see the note at the top of this file
  function funcArg() {
    // A space *before* the argument is kerning — \arcsin\!\frac{x}{2} tightens
    // the gap. A space *after* one has been read ends the run. Only the second
    // separates, so skip any that lead.
    while (peek() && peek().k === "sep") next();
    const t = peek();
    if (!t) fail("function with no argument");
    if (t.k === "{") return group("{", "}");
    if (t.k === "(") return group("(", ")");
    if (t.k === "|") return absGroup();
    if (t.k === "macro" && (t.v === "lvert" || t.v === "lVert")) return absGroup();
    // Bare run of simple atoms: \sin 2x is sin(2x), \sin x\cos x is not.
    // A \frac or \sqrt may only *start* the run (\sin\frac{x}{2}); once a
    // plain atom has been taken, one of those belongs to the next factor.
    let s = null;
    for (;;) {
      const u = peek();
      if (!u) break;
      if (u.k === "sep") break;
      const selfDelimiting = u.k === "macro" &&
        (u.v === "frac" || u.v === "tfrac" || u.v === "dfrac" || u.v === "sqrt");
      if (selfDelimiting) {
        if (s !== null) break;
        return factor();
      }
      if (!(u.k === "num" || u.k === "var" || (u.k === "macro" && u.v === "pi"))) break;
      const piece = factor();
      s = s === null ? piece : `(${s}*${piece})`;
    }
    if (s === null) fail("function with no argument");
    return s;
  }

  function absGroup() {
    const t = next();
    if (t.k !== "|" && !(t.k === "macro" && (t.v === "lvert" || t.v === "lVert")))
      fail("expected |");
    const s = expr();
    const c = peek();
    if (c && c.k === "|") next();
    else if (c && c.k === "macro" && (c.v === "rvert" || c.v === "rVert")) next();
    else fail("unclosed |");
    return `Math.abs(${s})`;
  }

  function atom() {
    const t = next();
    if (t.k === "num") return t.v;
    if (t.k === "var") {
      if (t.v === "e") return "Math.E";
      if (t.v === "C") fail("constant of integration left in");
      return t.v;
    }
    if (t.k === "(") { i--; return `(${group("(", ")")})`; }
    if (t.k === "{") { i--; return `(${group("{", "}")})`; }
    if (t.k === "[") { i--; return `(${group("[", "]")})`; }
    if (t.k === "|") { i--; return absGroup(); }
    if (t.k !== "macro") fail("unexpected token " + t.k);

    const m = t.v;
    if (m === "pi") return "Math.PI";
    if (m === "lvert" || m === "lVert") { i--; return absGroup(); }

    if (m === "frac" || m === "tfrac" || m === "dfrac") {
      const a = group("{", "}"), b = group("{", "}");
      return `((${a})/(${b}))`;
    }
    if (m === "sqrt") {
      if (peek() && peek().k === "[") {
        const n = group("[", "]");
        return `Math.pow(${group("{", "}")},1/(${n}))`;
      }
      return `Math.sqrt(${group("{", "}")})`;
    }
    if (m === "operatorname" || m === "mathrm" || m === "text") {
      // \operatorname{arsinh}(x) — read the name, then treat it as a function
      if (!peek() || peek().k !== "{") fail("expected { after \\" + m);
      next();
      let name = "";
      while (peek() && peek().k !== "}") name += next().v;
      if (!peek()) fail("unclosed \\" + m);
      next();
      return applyFunc(name);
    }
    if (FUNCS[m]) return applyFunc(m);

    fail("unknown macro \\" + m);
  }

  function applyFunc(name) {
    if (!FUNCS[name]) fail("unknown function " + name);
    let fn = name;
    let power = null;
    if (peek() && peek().k === "^") {
      next();
      const e = peek() && peek().k === "{" ? group("{", "}") : factor();
      // \sin^{-1} is the inverse; \sin^2 x is (sin x)^2
      if (/^\(?-\s*1\)?$/.test(e.replace(/\s/g, ""))) {
        if (!INVERSE_OF[name]) fail("no inverse known for " + name);
        fn = INVERSE_OF[name];
      } else power = e;
    }
    const arg = funcArg();
    const call = `${FUNCS[fn]}(${arg})`;
    return power === null ? call : `Math.pow(${call},${power})`;
  }

  const out = expr();
  if (i < tokens.length) fail("trailing input at token " + i + " (" + tokens[i].v + ")");
  return out;
}

// ---------- public API ----------

/** Strip the integral sign and differential, leaving the integrand. */
export function integrandOf(tex) {
  let s = tex;
  // \int \frac{dx}{…} — a bare differential as the whole numerator means 1
  s = s.replace(/\\[td]?frac\s*\{\s*(?:\\[,!;:])?\s*d\s*[a-zA-Z]\s*\}/, "\\frac{1}");
  s = s.replace(/^\s*\\int\s*/, "");
  // The differential itself, wherever it sits: at the end of the expression, or
  // at the end of a \frac numerator as in \int \frac{x\,dx}{\sqrt{x+4}-2}.
  s = s.replace(/(?:\\[,!;:]|\s)*\\mathrm\{d\}\s*[a-zA-Z]\s*(?=\}|$)/, "");
  s = s.replace(/(?:\\[,!;:]|\s)*\bd\s*[a-zA-Z]\s*(?=\}|$)/, "");
  return s.trim();
}

/** Strip the +C from an antiderivative. */
export function antiderivativeOf(tex) {
  return tex.replace(/\s*[+\-]\s*C\s*$/, "").trim();
}

/** Compile a LaTeX expression in one variable to a JS function. */
export function compile(tex, varName = "x") {
  const js = parse(lex(clean(tex)));
  const keys = Object.keys(RUNTIME);
  const fn = new Function(...keys, varName, `"use strict"; return (${js});`);
  return (x) => fn(...keys.map((k) => RUNTIME[k]), x);
}

export { Fail };
