// Draws a set of Desmos-style expressions onto the site's own plot kernel.
//
// This is what makes the round trip useful: build the graph in Desmos where it
// is quick, paste the state here, and get a figure in the site's palette that a
// Learn topic can embed and that still has live sliders.
//
// Each expression is classified by shape, because Desmos does the same and the
// shape is all you have:
//
//   y = f(x)            explicit        a curve sampled across the window
//   x = f(y)            explicit in y   sampled down the window
//   r = f(theta)        polar           swept through one or more turns
//   (f(t), g(t))        parametric      swept over t
//   (a, b)              point           a dot
//   F(x,y) = 0          implicit        marching squares over a grid
//   F(x,y) < 0          inequality      the same grid, shaded
//   a = 3               definition      a slider, not a curve
//   bare f(x)           explicit        Desmos treats a lone expression as y =

import { Plot } from "./plot.mjs";
import { compile, freeNames, parseLatex } from "../convert/eval.mjs?v=2";

/** Split a trailing `{…}` domain restriction off an expression. */
function splitRestriction(node) {
  // The parser leaves a restriction as juxtaposition with a brace group.
  if (node?.t === "bin" && node.op === "·" && node.r?.t === "brace") {
    return { body: node.l, conds: node.r.items };
  }
  return { body: node, conds: null };
}

/** Compile the conditions of a restriction into one predicate. */
function compileConds(conds) {
  if (!conds || !conds.length) return null;
  const parts = conds.map((c) => {
    if (c.t !== "rel") return null;
    // chained relations arrive nested: 0 < x < 5 is rel(rel(0<x) < 5)
    const tests = [];
    const walk = (n) => {
      if (n.t === "rel") {
        walk(n.l);
        const left = n.l.t === "rel" ? n.l.r : n.l;
        tests.push({ op: n.op, l: compile(left), r: compile(n.r) });
      }
    };
    walk(c);
    return (s) => tests.every(({ op, l, r }) => {
      const a = l(s), b = r(s);
      return op === "<" ? a < b : op === ">" ? a > b
        : op === "<=" ? a <= b : op === ">=" ? a >= b
        : op === "=" ? a === b : a !== b;
    });
  }).filter(Boolean);
  return parts.length ? (s) => parts.every((p) => p(s)) : null;
}

const nameOf = (n) => (n?.t === "name" ? n.v : null);

/**
 * Work out what a parsed expression is, and how to draw it.
 * Returns null for anything that is not a drawable curve (a definition).
 */
export function classify(node) {
  const { body, conds } = splitRestriction(node);
  const guard = compileConds(conds);

  if (body?.t === "rel") {
    const lhs = nameOf(body.l);
    const vars = freeNames(body);

    // a = 3, b = pi/2 — a value, which becomes a slider
    if (lhs && !["x", "y", "r"].includes(lhs) && body.op === "=" &&
        !freeNames(body.r).size) {
      return { kind: "define", name: lhs, value: compile(body.r)({}) };
    }

    if (body.op === "=") {
      if (lhs === "y" && !freeNames(body.r).has("y")) {
        return { kind: "explicit", of: "x", f: compile(body.r), guard, vars };
      }
      if (lhs === "x" && !freeNames(body.r).has("x")) {
        return { kind: "explicit", of: "y", f: compile(body.r), guard, vars };
      }
      if (lhs === "r") {
        return { kind: "polar", f: compile(body.r), guard, vars };
      }
      return { kind: "implicit", f: compile(body), guard, vars };
    }

    // an inequality shades the side where the residual has the right sign
    return { kind: "region", f: compile(body), op: body.op, guard, vars };
  }

  if (body?.t === "point") {
    const vars = freeNames(body);
    const [a, b] = body.items.map(compile);
    // a pair in t is a parametric curve; a pair of constants is a dot
    if (vars.has("t")) return { kind: "parametric", x: a, y: b, guard, vars };
    return { kind: "point", x: a, y: b, vars };
  }

  if (body?.t === "list") {
    return { kind: "points", items: body.items.map((it) =>
      it.t === "point" ? it.items.map(compile) : null).filter(Boolean) };
  }

  // a bare expression in x is Desmos shorthand for y = …
  const vars = freeNames(body);
  if (vars.has("x") || vars.size === 0) {
    return { kind: "explicit", of: "x", f: compile(body), guard, vars };
  }
  if (vars.has("theta")) return { kind: "polar", f: compile(body), guard, vars };
  return null;
}

// ───────────────────────── drawing ─────────────────────────

const SAMPLES = 600;
const GRID = 110;          // marching-squares resolution for implicit curves

function drawExplicit(plot, item, scope, cls) {
  const along = item.of === "x";
  const lo = along ? plot.xmin : plot.ymin;
  const hi = along ? plot.xmax : plot.ymax;
  const other = along ? plot.ymax - plot.ymin : plot.xmax - plot.xmin;
  let d = "", pen = false;
  for (let i = 0; i <= SAMPLES; i++) {
    const u = lo + (hi - lo) * (i / SAMPLES);
    const s = { ...scope, [along ? "x" : "y"]: u };
    if (item.guard && !item.guard(s)) { pen = false; continue; }
    const v = item.f(s);
    if (!Number.isFinite(v) || Math.abs(v) > other * 40) { pen = false; continue; }
    const px = along ? plot.sx(u) : plot.sx(v);
    const py = along ? plot.sy(v) : plot.sy(u);
    d += (pen ? "L" : "M") + px.toFixed(2) + " " + py.toFixed(2) + " ";
    pen = true;
  }
  addPath(plot, d, cls);
}

function drawPolar(plot, item, scope, cls) {
  // One full turn unless a restriction says otherwise; petal curves need more,
  // so sweep two turns and let duplicate points overdraw harmlessly.
  const turns = 2, steps = SAMPLES * turns;
  let d = "", pen = false;
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * turns * Math.PI * 2;
    const s = { ...scope, theta: th, t: th };
    if (item.guard && !item.guard(s)) { pen = false; continue; }
    const r = item.f(s);
    if (!Number.isFinite(r)) { pen = false; continue; }
    const px = plot.sx(r * Math.cos(th)), py = plot.sy(r * Math.sin(th));
    d += (pen ? "L" : "M") + px.toFixed(2) + " " + py.toFixed(2) + " ";
    pen = true;
  }
  addPath(plot, d, cls);
}

function drawParametric(plot, item, scope, cls) {
  const lo = item.tmin ?? 0, hi = item.tmax ?? 1;
  let d = "", pen = false;
  for (let i = 0; i <= SAMPLES; i++) {
    const t = lo + (hi - lo) * (i / SAMPLES);
    const s = { ...scope, t };
    if (item.guard && !item.guard(s)) { pen = false; continue; }
    const X = item.x(s), Y = item.y(s);
    if (!Number.isFinite(X) || !Number.isFinite(Y)) { pen = false; continue; }
    d += (pen ? "L" : "M") + plot.sx(X).toFixed(2) + " " + plot.sy(Y).toFixed(2) + " ";
    pen = true;
  }
  addPath(plot, d, cls);
}

/**
 * Implicit curves by marching squares: sample the residual on a grid and draw
 * the zero contour cell by cell. Crude but honest — it finds every branch,
 * including the ones a solver would miss, and degrades to a rough outline
 * rather than a wrong curve.
 */
function drawImplicit(plot, item, scope, cls) {
  const { xmin, xmax, ymin, ymax } = plot;
  const dx = (xmax - xmin) / GRID, dy = (ymax - ymin) / GRID;
  const val = [];
  for (let j = 0; j <= GRID; j++) {
    val[j] = [];
    for (let i = 0; i <= GRID; i++) {
      const s = { ...scope, x: xmin + i * dx, y: ymin + j * dy };
      val[j][i] = item.guard && !item.guard(s) ? NaN : item.f(s);
    }
  }
  const lerp = (a, b, va, vb) => a + ((b - a) * (0 - va)) / (vb - va);
  let d = "";
  for (let j = 0; j < GRID; j++) {
    for (let i = 0; i < GRID; i++) {
      const x0 = xmin + i * dx, x1 = x0 + dx;
      const y0 = ymin + j * dy, y1 = y0 + dy;
      const v = [val[j][i], val[j][i + 1], val[j + 1][i + 1], val[j + 1][i]];
      if (v.some((n) => !Number.isFinite(n))) continue;
      const pts = [];
      const edge = [[x0, y0, x1, y0, 0, 1], [x1, y0, x1, y1, 1, 2],
                    [x1, y1, x0, y1, 2, 3], [x0, y1, x0, y0, 3, 0]];
      for (const [ax, ay, bx, by, a, b] of edge) {
        if ((v[a] < 0) === (v[b] < 0)) continue;
        pts.push(ax === bx ? [ax, lerp(ay, by, v[a], v[b])]
                           : [lerp(ax, bx, v[a], v[b]), ay]);
      }
      for (let k = 0; k + 1 < pts.length; k += 2) {
        d += `M${plot.sx(pts[k][0]).toFixed(2)} ${plot.sy(pts[k][1]).toFixed(2)} ` +
             `L${plot.sx(pts[k + 1][0]).toFixed(2)} ${plot.sy(pts[k + 1][1]).toFixed(2)} `;
      }
    }
  }
  addPath(plot, d, cls);
}

/** Inequalities shade cell by cell on the same grid — no contour needed. */
function drawRegion(plot, item, scope, cls) {
  const { xmin, xmax, ymin, ymax } = plot;
  const N = 150;
  const dx = (xmax - xmin) / N, dy = (ymax - ymin) / N;
  const want = item.op === "<" || item.op === "<=" ? -1 : 1;
  const frag = document.createDocumentFragment();
  for (let j = 0; j < N; j++) {
    const y = ymin + (j + 0.5) * dy;
    let run = null;
    for (let i = 0; i <= N; i++) {
      const x = xmin + (i + 0.5) * dx;
      const s = { ...scope, x, y };
      const inside = i < N && (!item.guard || item.guard(s)) &&
        Number.isFinite(item.f(s)) && Math.sign(item.f(s)) === want;
      if (inside && run === null) run = i;
      if (!inside && run !== null) {
        const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        r.setAttribute("x", plot.sx(xmin + run * dx));
        r.setAttribute("y", plot.sy(y + dy / 2));
        r.setAttribute("width", Math.abs(plot.sx(xmin + i * dx) - plot.sx(xmin + run * dx)));
        r.setAttribute("height", Math.abs(plot.sy(0) - plot.sy(dy)));
        r.setAttribute("class", "graph-region " + cls);
        frag.append(r);
        run = null;
      }
    }
  }
  plot.layers.fill.append(frag);
}

function addPath(plot, d, cls) {
  if (!d) return;
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", d);
  p.setAttribute("fill", "none");
  p.setAttribute("class", "graph-curve " + cls);
  plot.layers.curve.append(p);
}

// Curves cycle through shades of the page accent rather than Desmos's colours,
// so an imported graph looks like it belongs here.
const SHADES = ["c1", "c2", "c3", "c4"];

/**
 * Build a figure from a list of expressions.
 *
 * @param {object} spec  { expressions: [{latex}|{plain}], viewport, sliders }
 * @returns {{ plot: Plot, sliders: Array, redraw: Function, problems: Array }}
 */
export function buildGraph(spec) {
  const vp = spec.viewport ?? { xmin: -10, xmax: 10, ymin: -6.5, ymax: 6.5 };
  const plot = new Plot({
    xmin: vp.xmin, xmax: vp.xmax, ymin: vp.ymin, ymax: vp.ymax,
    height: spec.height ?? 360,
    label: spec.label ?? "imported graph",
  });

  const scope = {};
  const items = [];
  const sliders = [];
  const problems = [];

  spec.expressions.forEach((e, idx) => {
    if (e.hidden) return;
    let node;
    try { node = parseLatex(e.latex); }
    catch (err) { problems.push({ latex: e.latex, why: err.message }); return; }

    let item;
    try { item = classify(node); }
    catch (err) { problems.push({ latex: e.latex, why: err.message }); return; }
    if (!item) { problems.push({ latex: e.latex, why: "not something that can be drawn" }); return; }

    if (item.kind === "define") {
      scope[item.name] = item.value;
      const sl = e.slider ?? {};
      sliders.push({
        name: item.name,
        value: item.value,
        min: sl.min != null ? parseFloat(sl.min) : item.value - 5,
        max: sl.max != null ? parseFloat(sl.max) : item.value + 5,
        step: sl.step != null ? parseFloat(sl.step) : 0.01,
      });
      return;
    }
    item.cls = SHADES[items.length % SHADES.length];
    items.push(item);
  });

  function redraw() {
    plot.clear();
    plot.axes({ xLabel: "x", yLabel: "y" });
    for (const item of items) {
      switch (item.kind) {
        case "explicit": drawExplicit(plot, item, scope, item.cls); break;
        case "polar": drawPolar(plot, item, scope, item.cls); break;
        case "parametric": drawParametric(plot, item, scope, item.cls); break;
        case "implicit": drawImplicit(plot, item, scope, item.cls); break;
        case "region": drawRegion(plot, item, scope, item.cls); break;
        case "point": plot.dot(item.x(scope), item.y(scope), { class: "graph-dot " + item.cls }); break;
        case "points": for (const [a, b] of item.items) {
          plot.dot(a(scope), b(scope), { class: "graph-dot " + item.cls });
        } break;
      }
    }
  }

  return { plot, sliders, scope, redraw, problems, count: items.length };
}
