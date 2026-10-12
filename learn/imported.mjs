// Renders a graph built in Desmos and brought over by the Convert applet.
//
// The workflow this closes: draw it in Desmos, run Calc.getState() in the
// console, paste into convert/#graph, press "Copy figure for Learn", and drop
// the JSON into a topic file. The spec is plain data — expressions and a
// window — so it stays editable afterwards by hand.

import { buildGraph } from "../shared/graph.mjs?v=5";
import { slider } from "../shared/plot.mjs?v=5";
import { figure } from "./ui.mjs";

/**
 * @param {object} spec  { viewport, expressions } — the Convert applet's output
 * @param {object} opts  { caption, height, controls } extra controls are
 *                       appended after the imported sliders
 */
export function importedFigure(spec, opts = {}) {
  const g = buildGraph({
    expressions: spec.expressions,
    viewport: spec.viewport,
    height: opts.height ?? 340,
    label: opts.caption ?? "imported graph",
  });
  g.redraw();

  // Every slider Desmos had comes across live, so the reader can still push on
  // the parameters the graph was built around.
  const controls = g.sliders.map((s) =>
    slider({
      label: s.name, min: s.min, max: s.max, step: s.step, value: s.value,
      format: (v) => (+v).toFixed(2),
      onInput: (v) => { g.scope[s.name] = v; g.redraw(); },
    }));

  const fig = figure({
    caption: opts.caption,
    svg: g.plot.svg,
    controls: [...controls, ...(opts.controls ?? [])],
  });

  // An expression that does not draw has to be visible on the page, not in the
  // console. A missing curve looks exactly like a correct figure to a reader,
  // and the importer's failures have all been silent ones — a graph that is
  // quietly incomplete is worse than one that admits it.
  if (g.problems.length) {
    const warn = document.createElement("div");
    warn.className = "fig-problem";
    warn.setAttribute("role", "status");
    const head = document.createElement("b");
    head.textContent = g.problems.length === 1
      ? "1 expression in this graph was not drawn:"
      : `${g.problems.length} expressions in this graph were not drawn:`;
    const list = document.createElement("ul");
    for (const p of g.problems) {
      const li = document.createElement("li");
      const code = document.createElement("code");
      code.textContent = p.latex;
      li.append(code, document.createTextNode(" — " + p.why));
      list.append(li);
    }
    warn.append(head, list);
    fig.append(warn);
    console.warn("imported graph: " + g.problems.length + " not drawn", g.problems);
  }

  return fig;
}
