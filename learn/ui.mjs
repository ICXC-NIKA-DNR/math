// Page furniture for a topic: prose blocks, figure frames, pull-quotes.
// Figures and controls live in plot.mjs; this is everything around them.

/** Render every $…$ span inside a node with KaTeX, leaving the prose alone. */
export function typeset(root) {
  if (!window.katex) return;
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.parentElement.closest(".katex") ? NodeFilter.FILTER_REJECT
      : n.nodeValue.includes("$") ? NodeFilter.FILTER_ACCEPT
      : NodeFilter.FILTER_REJECT,
  });
  const targets = [];
  while (walk.nextNode()) targets.push(walk.currentNode);
  // $$…$$ is display math and must be tried first — matching single $ first
  // would consume the opening pair and leave stray dollars in the prose.
  const MATH = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  for (const node of targets) {
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of node.nodeValue.matchAll(MATH)) {
      if (m.index > last) frag.append(node.nodeValue.slice(last, m.index));
      const display = m[1] != null;
      const src = display ? m[1] : m[2];
      const span = document.createElement(display ? "div" : "span");
      if (display) span.className = "mathblock";
      try { katex.render(src, span, { throwOnError: false, displayMode: display }); }
      catch { span.textContent = src; }
      frag.append(span);
      last = m.index + m[0].length;
    }
    if (last < node.nodeValue.length) frag.append(node.nodeValue.slice(last));
    node.replaceWith(frag);
  }
}

const make = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

export const prose = (html) => make("div", "prose", html);
export const heading = (text) => make("h2", "sec", text);

/** The amber-rule callout the trainers use for "why this works". */
export const note = (html) => make("div", "note", html);

/**
 * A figure frame: the drawing, an optional control strip beneath it, and an
 * optional readout row. Caption first so a screen reader meets it before the
 * SVG.
 */
export function figure({ caption, svg, controls = [], readout: ro }) {
  const fig = make("figure", "fig-frame");
  if (caption) fig.append(make("figcaption", null, caption));
  fig.append(svg);
  if (ro) fig.append(ro);
  if (controls.length) {
    const strip = make("div", "ctl-strip");
    strip.append(...controls);
    fig.append(strip);
  }
  return fig;
}

/** Two figures side by side on wide screens, stacked on narrow ones. */
export function pair(a, b) {
  const row = make("div", "fig-pair");
  row.append(a, b);
  return row;
}
