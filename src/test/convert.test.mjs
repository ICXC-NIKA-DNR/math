// Tests for the LaTeX <-> plain translator behind the Convert applet.
//
// The cases that matter are structural: whether a nested fraction keeps its
// grouping, whether -x^2 survives a round trip, whether a Desmos paste comes
// out as something NOUS can actually read.

import assert from "node:assert/strict";
import {
  parsePlain, parseLatex, toLatex, toPlain,
  latexToPlain, plainToLatex, readDesmos, convertGraph,
} from "../../convert/convert.mjs";

let pass = 0;
const eq = (got, want, what) => { assert.equal(got, want, what); pass++; };

// ── LaTeX → plain ────────────────────────────────────────────────
const L2P = [
  ["y=x^{2}", "y = x^2"],
  ["\\frac{1}{x}", "1/x"],
  ["\\frac{x+1}{x-1}", "(x+1)/(x-1)"],
  ["\\sqrt{x}", "sqrt(x)"],
  ["\\sqrt[3]{x}", "cbrt(x)"],
  ["\\sin\\left(x\\right)", "sin(x)"],
  ["\\sin x", "sin(x)"],
  ["2\\cdot 3", "2*3"],
  ["\\pi r^{2}", "pi·r^2"],
  ["\\left|x\\right|", "|x|"],
  ["x_{1}+x_{2}", "x_1+x_2"],
  ["\\ln\\left(x\\right)", "ln(x)"],
  ["\\frac{\\frac{a}{b}}{c}", "(a/b)/c"],
  ["y\\le 2x", "y <= 2x"],
  ["\\theta", "theta"],
  // the exponent gets brackets it did not have: e^-x^2 would re-read as (e^-x)^2
  ["e^{-x^{2}}", "e^(-x^2)"],
];
for (const [tex, plain] of L2P) {
  const r = latexToPlain(tex);
  assert.ok(r.ok, `failed to parse ${tex}: ${r.error}`);
  eq(r.out, plain, `${tex}  ->  ${plain}`);
}

// ── plain → LaTeX ────────────────────────────────────────────────
const P2L = [
  ["x^2", "x^{2}"],
  ["1/x", "\\frac{1}{x}"],
  ["(x+1)/(x-1)", "\\frac{x+1}{x-1}"],
  ["sqrt(x)", "\\sqrt{x}"],
  ["cbrt(x)", "\\sqrt[3]{x}"],
  ["sin(x)", "\\sin\\left(x\\right)"],
  ["pi*r^2", "\\pi\\cdot r^{2}"],
  ["|x|", "\\left|x\\right|"],
  ["x_1 + x_2", "x_{1}+x_{2}"],
  ["theta", "\\theta"],
  ["y <= 2x", "y\\le 2x"],
  ["int_0^1 x^2", "\\int_{0}^{1} x^{2}"],
  ["sum_1^n k", "\\sum_{1}^{n} k"],
];
for (const [plain, tex] of P2L) {
  const r = plainToLatex(plain);
  assert.ok(r.ok, `failed to parse ${plain}: ${r.error}`);
  eq(r.out, tex, `${plain}  ->  ${tex}`);
}

// ── precedence survives a round trip ─────────────────────────────
// -x^2 must stay -(x^2), and a/b/c must stay (a/b)/c, in both directions.
for (const src of ["-x^2", "a/b/c", "2^3^2", "1/(2*pi)", "(a+b)/(c+d)", "x^(1/2)"]) {
  const tex = plainToLatex(src);
  assert.ok(tex.ok, `plain->tex failed for ${src}: ${tex.error}`);
  const back = latexToPlain(tex.out);
  assert.ok(back.ok, `tex->plain failed for ${tex.out}: ${back.error}`);
  const again = plainToLatex(back.out);
  assert.ok(again.ok, `second pass failed for ${back.out}: ${again.error}`);
  eq(again.out, tex.out, `round trip stable: ${src}`);
}

// ── Desmos paste ─────────────────────────────────────────────────
const STATE = JSON.stringify({
  version: 11,
  graph: { viewport: { xmin: -10, ymin: -6, xmax: 10, ymax: 6 } },
  expressions: {
    list: [
      { type: "expression", id: "1", color: "#c74440", latex: "y=x^{2}" },
      { type: "expression", id: "2", color: "#2d70b3", latex: "a=3", slider: { min: "0", max: "10" } },
      { type: "text", id: "3", text: "a note" },
      { type: "folder", id: "4", title: "group" },
      { type: "expression", id: "5", latex: "" },
      { type: "expression", id: "6", latex: "y=a\\sin\\left(x\\right)", hidden: true },
    ],
  },
});

const rows = convertGraph(STATE);
eq(rows.length, 5, "blank expressions are dropped, everything else is kept");
eq(rows[0].plain, "y = x^2", "first expression converts");
eq(rows[1].slider.max, "10", "slider metadata survives");
eq(rows[2].kind, "text", "text rows are carried through");
eq(rows[3].kind, "folder", "folder rows are carried through");
eq(rows[4].plain, "y = a·sin(x)", "hidden expressions still convert");
eq(rows[4].hidden, true, "hidden flag survives");

// bare lines, not JSON
const lines = convertGraph("y=x^{2}\n\ny=\\sqrt{x}\n");
eq(lines.length, 2, "blank lines ignored in line mode");
eq(lines[1].plain, "y = sqrt(x)", "line mode converts");

// an opening brace that is not JSON must not be mistaken for a state object
eq(readDesmos("{x<0: -x, x}").length, 1, "a piecewise line is not JSON");

// ── failure is reported, never silent ────────────────────────────
const bad = latexToPlain("\\frobnicate{x}");
assert.equal(bad.ok, false, "an unknown command is reported");
assert.match(bad.error, /frobnicate/, "the error names the command");
eq(bad.out, "\\frobnicate{x}", "the original is handed back unchanged");
pass++;

console.log(`convert: ${pass} assertions passed`);
