// Renders a graph built in Desmos and brought over by the Convert applet.
//
// The workflow this closes: draw it in Desmos, run Calc.getState() in the
// console, paste into convert/#graph, press "Copy figure for Learn", and drop
// the JSON into a topic file. The spec is plain data — expressions and a
// window — so it stays editable afterwards by hand.

import { buildGraph } from "../shared/graph.mjs?v=3";
import { slider } from "../shared/plot.mjs?v=3";
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

  if (g.problems.length) {
    console.warn("imported graph: " + g.problems.length + " expression(s) not drawn",
                 g.problems);
  }

  return figure({
    caption: opts.caption,
    svg: g.plot.svg,
    controls: [...controls, ...(opts.controls ?? [])],
  });
}
