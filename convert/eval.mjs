// AST -> numeric function, so a pasted Desmos expression can actually be drawn
// rather than only re-spelled.
//
// Compiles to a closure over a scope object, which is what makes sliders work:
// the graph holds one scope, a slider writes into it, and every curve that
// mentions that name redraws with the new value. No recompilation per frame.

import { parseLatex, parsePlain, ConvertError } from "./convert.mjs?v=3";

const F = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  sec: (x) => 1 / Math.cos(x), csc: (x) => 1 / Math.sin(x), cot: (x) => 1 / Math.tan(x),
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  sech: (x) => 1 / Math.cosh(x), csch: (x) => 1 / Math.sinh(x), coth: (x) => 1 / Math.tanh(x),
  arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  arcsec: (x) => Math.acos(1 / x), arccsc: (x) => Math.asin(1 / x), arccot: (x) => Math.atan(1 / x),
  asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh,
  arsinh: Math.asinh, arcosh: Math.acosh, artanh: Math.atanh,
  ln: Math.log, log: Math.log10, exp: Math.exp,
  sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs,
  floor: Math.floor, ceil: Math.ceil, round: Math.round, sign: Math.sign,
  min: Math.min, max: Math.max,
  mod: (a, b) => ((a % b) + b) % b,
  gcd: (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; },
  lcm: (a, b) => Math.abs(a * b) / (F.gcd(a, b) || 1),
};

const CONST = { pi: Math.PI, tau: 2 * Math.PI, e: Math.E, phi: (1 + Math.sqrt(5)) / 2,
  infty: Infinity };

export class EvalError extends Error {}
const bad = (m) => { throw new EvalError(m); };

/**
 * Compile a node to `(scope) => number`.
 * Unknown names resolve from the scope at call time, so a slider added later
 * still works and an undefined one yields NaN rather than throwing per sample.
 */
export function compile(n) {
  switch (n.t) {
    case "num": { const v = parseFloat(n.v); return () => v; }

    case "name": {
      const key = n.v;
      if (key in CONST) { const v = CONST[key]; return () => v; }
      return (s) => (key in s ? s[key] : NaN);
    }

    case "group": return compile(n.x);
    case "neg": { const x = compile(n.x); return (s) => -x(s); }
    case "abs": { const x = compile(n.x); return (s) => Math.abs(x(s)); }

    case "sqrt": {
      const x = compile(n.x);
      if (!n.n) return (s) => Math.sqrt(x(s));
      const k = compile(n.n);
      return (s) => {
        const v = x(s), r = k(s);
        // odd roots of negatives are real; Math.pow refuses them
        if (v < 0 && Math.abs(r % 2) === 1) return -Math.pow(-v, 1 / r);
        return Math.pow(v, 1 / r);
      };
    }

    case "pow": {
      const b = compile(n.b), e = compile(n.e);
      return (s) => {
        const B = b(s), E = e(s);
        if (B < 0 && Number.isInteger(E)) return Math.pow(B, E);
        return Math.pow(B, E);
      };
    }

    case "call": {
      const f = F[n.f] ?? bad(`no function called ${n.f}`);
      const args = n.args.map(compile);
      if (args.length === 1) { const a = args[0]; return (s) => f(a(s)); }
      return (s) => f(...args.map((a) => a(s)));
    }

    case "bin": {
      const l = compile(n.l), r = compile(n.r);
      switch (n.op) {
        case "+": return (s) => l(s) + r(s);
        case "-": return (s) => l(s) - r(s);
        case "*": case "·": return (s) => l(s) * r(s);
        case "/": return (s) => l(s) / r(s);
        default: bad(`cannot evaluate operator ${n.op}`);
      }
      break;
    }

    // A relation evaluates to its *residual*, left minus right. Zero means the
    // equation holds, and the sign says which side of it you are on — which is
    // exactly what a contour tracer and a region shader both need.
    case "rel": {
      const l = compile(n.l), r = compile(n.r);
      return (s) => l(s) - r(s);
    }

    case "sub": bad("subscripted names are not evaluated");
    case "bigop": bad(`${n.name} has no numeric value here`);
    default: bad(`cannot evaluate a ${n.t}`);
  }
}

/** Collect every free name an expression depends on. */
export function freeNames(n, into = new Set()) {
  if (!n || typeof n !== "object") return into;
  if (n.t === "name" && !(n.v in CONST)) into.add(n.v);
  for (const k of ["x", "l", "r", "b", "e", "n", "body", "sub", "sup"]) {
    if (n[k] && typeof n[k] === "object") freeNames(n[k], into);
  }
  for (const k of ["args", "items"]) {
    if (Array.isArray(n[k])) for (const c of n[k]) freeNames(c, into);
  }
  return into;
}

export { parseLatex, parsePlain, ConvertError };
