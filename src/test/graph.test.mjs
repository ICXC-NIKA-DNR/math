// Tests for the Desmos importer's classifier.
//
// Every bug these cover was silent: the graph still drew something, it was
// just the wrong thing, or nothing at all with no complaint. That is the
// failure mode worth a test — a thrown error would have been obvious.

import assert from "node:assert/strict";
import { parseLatex } from "../../convert/convert.mjs";
import { classify, asFunctionDef, inlineCalls } from "../../shared/graph.mjs";

let pass = 0;
const ok = (cond, what) => { assert.ok(cond, what); pass++; };
const eq = (got, want, what) => { assert.equal(got, want, what); pass++; };
const near = (got, want, what) => {
  assert.ok(Math.abs(got - want) < 1e-9, `${what}: got ${got}, want ${want}`); pass++;
};

const kindOf = (latex) => {
  const c = classify(parseLatex(latex));
  return c ? c.kind + (c.of ? ":" + c.of : "") : null;
};

// ── each shape is recognised ─────────────────────────────────────
const SHAPES = [
  [String.raw`y=x^{2}`, "explicit:x"],
  [String.raw`x^{2}`, "explicit:x"],                  // Desmos: a lone expression is y =
  [String.raw`x=y^{2}`, "explicit:y"],
  [String.raw`r=2+2\cos\left(t\right)`, "polar"],
  [String.raw`\left(\cos t,\sin t\right)`, "parametric"],
  [String.raw`\left(3,4\right)`, "point"],
  [String.raw`\left[\left(1,2\right),\left(3,4\right)\right]`, "points"],
  [String.raw`x^{2}+y^{2}=25`, "implicit"],
  [String.raw`y>x^{2}`, "region"],
  [String.raw`a=3`, "define"],
];
for (const [latex, want] of SHAPES) eq(kindOf(latex), want, latex);

// ── domain restrictions ──────────────────────────────────────────
// These never parsed at all: the closing \} of a restriction was read as
// another factor, so every restricted expression threw "expected \}".
{
  const c = classify(parseLatex(String.raw`y=x^{2}\left\{0<x<3\right\}`));
  eq(c.kind, "explicit", "a restricted expression still classifies");
  ok(c.guard, "and carries a guard");
  ok(c.guard({ x: 1 }), "inside the restriction");
  ok(!c.guard({ x: 5 }), "outside the restriction");
  ok(!c.guard({ x: -1 }), "below the restriction");
  near(c.f({ x: 2 }), 4, "the body is unaffected by the restriction");
}
{
  const c = classify(parseLatex(String.raw`x^{2}\left\{x>0\right\}`));
  ok(c.guard && c.guard({ x: 1 }) && !c.guard({ x: -1 }), "a bare restricted expression");
}

// ── parametric and polar ranges ──────────────────────────────────
// Without this the circle below drew the first radian only — a 57 degree arc
// presented as a closed curve.
{
  const c = classify(parseLatex(
    String.raw`\left(\cos t,\sin t\right)\left\{0<t<2\pi\right\}`));
  eq(c.kind, "parametric", "parametric with a range");
  near(c.tmin, 0, "lower bound");
  near(c.tmax, 2 * Math.PI, "upper bound");
}
{
  // written the other way round: t < 2pi and t > 0 as separate conditions
  const c = classify(parseLatex(
    String.raw`\left(t,t^{2}\right)\left\{t>1,t<4\right\}`));
  near(c.tmin, 1, "lower bound from a separate condition");
  near(c.tmax, 4, "upper bound from a separate condition");
}
{
  const c = classify(parseLatex(String.raw`\left(\cos t,\sin t\right)`));
  eq(c.tmin, undefined, "no restriction leaves the range unset");
  eq(c.tmax, undefined, "so the drawer can pick Desmos's default");
}
{
  const c = classify(parseLatex(String.raw`r=t\left\{0<t<4\pi\right\}`));
  near(c.tmax, 4 * Math.PI, "a polar range is read too");
}

// ── user-defined functions ───────────────────────────────────────
// The parser reads f(x) as a multiplication, so without inlining these
// compiled to "f times x" with f undefined: a blank curve and no complaint.
{
  const def = asFunctionDef(parseLatex(String.raw`f\left(x\right)=x^{2}+1`));
  ok(def, "f(x) = … is recognised as a definition");
  eq(def.name, "f", "its name");
  eq(def.param, "x", "its parameter");

  eq(asFunctionDef(parseLatex(String.raw`y=x^{2}`)), null, "y = … is not a definition");
  eq(asFunctionDef(parseLatex(String.raw`a=3`)), null, "a = 3 is not a definition");

  const defs = { f: def };
  const call = classify(inlineCalls(parseLatex(String.raw`y=f\left(x\right)`), defs));
  near(call.f({ x: 3 }), 10, "f(3) = 10");

  const nested = classify(inlineCalls(parseLatex(String.raw`y=f\left(2x\right)`), defs));
  near(nested.f({ x: 3 }), 37, "f(6) = 37 — the argument is substituted, not the name");

  const g = asFunctionDef(parseLatex(String.raw`g\left(t\right)=2t`));
  const both = { f: def, g };
  const comp = classify(inlineCalls(parseLatex(String.raw`y=g\left(f\left(x\right)\right)`), both));
  near(comp.f({ x: 2 }), 10, "g(f(2)) = g(5) = 10");
}

// ── sliders and residuals ────────────────────────────────────────
{
  const c = classify(parseLatex(String.raw`a=3`));
  eq(c.value, 3, "a definition carries its value");
}
{
  // an implicit curve evaluates to left minus right, so zero is the curve and
  // the sign says which side you are on
  const c = classify(parseLatex(String.raw`x^{2}+y^{2}=25`));
  near(c.f({ x: 3, y: 4 }), 0, "on the circle");
  ok(c.f({ x: 0, y: 0 }) < 0, "inside is negative");
  ok(c.f({ x: 9, y: 0 }) > 0, "outside is positive");
}
{
  const c = classify(parseLatex(String.raw`y>x^{2}`));
  eq(c.op, ">", "the inequality direction is kept");
  ok(c.f({ x: 0, y: 1 }) > 0, "a point above the parabola");
  ok(c.f({ x: 0, y: -1 }) < 0, "a point below it");
}

console.log(`graph: ${pass} assertions passed`);
