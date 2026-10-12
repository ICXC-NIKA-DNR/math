// The figure kernel every Learn topic draws with.
//
// SVG rather than canvas: it scales without blurring, every mark is a real
// element the page's CSS can theme, and a draggable handle is just an element
// with a pointer listener. Figures inherit the page's accent through CSS
// variables, so a topic never hard-codes a colour.
//
// Coordinates are mathematical — you pass x and y in the function's own units
// and the plot maps them to pixels. Nothing in a topic file should ever touch
// a pixel.

const NS = "http://www.w3.org/2000/svg";

const svgEl = (tag, attrs = {}) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
  return n;
};

export class Plot {
  /**
   * @param {object} o
   *   xmin,xmax,ymin,ymax — the visible window in function units
   *   height              — drawing height in px (width is fluid)
   *   pad                 — inner margin in px, room for tick labels
   */
  constructor(o = {}) {
    this.xmin = o.xmin ?? -1; this.xmax = o.xmax ?? 1;
    this.ymin = o.ymin ?? -1; this.ymax = o.ymax ?? 1;
    this.w = o.width ?? 720; this.h = o.height ?? 300;
    this.pad = o.pad ?? 28;

    this.svg = svgEl("svg", {
      viewBox: `0 0 ${this.w} ${this.h}`,
      class: "fig",
      preserveAspectRatio: "xMidYMid meet",
      role: "img",
    });
    if (o.label) {
      const t = svgEl("title");
      t.textContent = o.label;
      this.svg.append(t);
    }
    this.layers = {};
    for (const name of ["grid", "fill", "curve", "mark", "handle", "text"]) {
      this.layers[name] = svgEl("g", { class: "layer-" + name });
      this.svg.append(this.layers[name]);
    }
  }

  // ---- coordinate transforms ----
  sx(x) {
    const t = (x - this.xmin) / (this.xmax - this.xmin);
    return this.pad + t * (this.w - 2 * this.pad);
  }
  sy(y) {
    const t = (y - this.ymin) / (this.ymax - this.ymin);
    return this.h - this.pad - t * (this.h - 2 * this.pad);
  }
  /** pixels back to function units — for drag handles */
  ux(px) {
    const t = (px - this.pad) / (this.w - 2 * this.pad);
    return this.xmin + t * (this.xmax - this.xmin);
  }
  uy(py) {
    const t = (this.h - this.pad - py) / (this.h - 2 * this.pad);
    return this.ymin + t * (this.ymax - this.ymin);
  }

  clear(...layers) {
    const names = layers.length ? layers : Object.keys(this.layers);
    for (const n of names) this.layers[n].replaceChildren();
    return this;
  }

  add(layer, node) { this.layers[layer].append(node); return node; }

  // ---- axes ----
  axes({ xStep, yStep, xLabel, yLabel, numbers = true } = {}) {
    const g = this.layers.grid;
    const x0 = Math.max(this.xmin, Math.min(this.xmax, 0));
    const y0 = Math.max(this.ymin, Math.min(this.ymax, 0));

    g.append(svgEl("line", {
      x1: this.sx(this.xmin), y1: this.sy(y0), x2: this.sx(this.xmax), y2: this.sy(y0),
      class: "axis",
    }));
    g.append(svgEl("line", {
      x1: this.sx(x0), y1: this.sy(this.ymin), x2: this.sx(x0), y2: this.sy(this.ymax),
      class: "axis",
    }));

    const xs = xStep ?? niceStep(this.xmax - this.xmin);
    const ys = yStep ?? niceStep(this.ymax - this.ymin);
    for (let x = Math.ceil(this.xmin / xs) * xs; x <= this.xmax + 1e-9; x += xs) {
      if (Math.abs(x) < 1e-9) continue;
      g.append(svgEl("line", {
        x1: this.sx(x), y1: this.sy(y0) - 3, x2: this.sx(x), y2: this.sy(y0) + 3, class: "tick",
      }));
      if (numbers) this.text(x, y0, fmt(x), { dy: 14, class: "ticknum", anchor: "middle" });
    }
    for (let y = Math.ceil(this.ymin / ys) * ys; y <= this.ymax + 1e-9; y += ys) {
      if (Math.abs(y) < 1e-9) continue;
      g.append(svgEl("line", {
        x1: this.sx(x0) - 3, y1: this.sy(y), x2: this.sx(x0) + 3, y2: this.sy(y), class: "tick",
      }));
      if (numbers) this.text(x0, y, fmt(y), { dx: -7, dy: 4, class: "ticknum", anchor: "end" });
    }
    if (xLabel) this.text(this.xmax, y0, xLabel, { dx: -2, dy: -8, class: "axlabel", anchor: "end" });
    if (yLabel) this.text(x0, this.ymax, yLabel, { dx: 8, dy: 10, class: "axlabel", anchor: "start" });
    return this;
  }

  // ---- marks ----
  /**
   * Sample f across the window and stroke it. Breaks the path at any point
   * that is not finite or shoots outside the window, so a pole leaves a gap
   * rather than a vertical line pretending to be part of the curve.
   */
  curve(f, o = {}) {
    const n = o.samples ?? 480;
    const lo = o.from ?? this.xmin, hi = o.to ?? this.xmax;
    const guard = (this.ymax - this.ymin) * 12;
    let d = "", pen = false;
    for (let i = 0; i <= n; i++) {
      const x = lo + (hi - lo) * (i / n);
      const y = f(x);
      if (!Number.isFinite(y) || Math.abs(y) > guard) { pen = false; continue; }
      const px = this.sx(x).toFixed(2), py = this.sy(y).toFixed(2);
      d += (pen ? "L" : "M") + px + " " + py + " ";
      pen = true;
    }
    return this.add(o.layer ?? "curve", svgEl("path", { d, class: "curve " + (o.class ?? ""), fill: "none" }));
  }

  /** The region between f and the x-axis (or between f and g) over [a,b]. */
  area(f, a, b, o = {}) {
    const n = o.samples ?? 240;
    const base = o.under ?? ((x) => 0);
    let d = "";
    for (let i = 0; i <= n; i++) {
      const x = a + (b - a) * (i / n);
      d += (i ? "L" : "M") + this.sx(x).toFixed(2) + " " + this.sy(f(x)).toFixed(2) + " ";
    }
    for (let i = n; i >= 0; i--) {
      const x = a + (b - a) * (i / n);
      d += "L" + this.sx(x).toFixed(2) + " " + this.sy(base(x)).toFixed(2) + " ";
    }
    return this.add(o.layer ?? "fill", svgEl("path", { d: d + "Z", class: "area " + (o.class ?? "") }));
  }

  rect(x, y, w, h, o = {}) {
    const px = this.sx(Math.min(x, x + w)), py = this.sy(Math.max(y, y + h));
    return this.add(o.layer ?? "fill", svgEl("rect", {
      x: px, y: py,
      width: Math.abs(this.sx(x + w) - this.sx(x)),
      height: Math.abs(this.sy(y + h) - this.sy(y)),
      class: "box " + (o.class ?? ""),
    }));
  }

  line(x1, y1, x2, y2, o = {}) {
    return this.add(o.layer ?? "mark", svgEl("line", {
      x1: this.sx(x1), y1: this.sy(y1), x2: this.sx(x2), y2: this.sy(y2),
      class: "seg " + (o.class ?? ""),
    }));
  }

  /** A straight line given by slope and a point, drawn right across the window. */
  through(x0, y0, slope, o = {}) {
    return this.line(this.xmin, y0 + slope * (this.xmin - x0),
                     this.xmax, y0 + slope * (this.xmax - x0), o);
  }

  dot(x, y, o = {}) {
    return this.add(o.layer ?? "mark", svgEl("circle", {
      cx: this.sx(x), cy: this.sy(y), r: o.r ?? 4.5, class: "dot " + (o.class ?? ""),
    }));
  }

  ellipse(x, y, rx, ry, o = {}) {
    return this.add(o.layer ?? "fill", svgEl("ellipse", {
      cx: this.sx(x), cy: this.sy(y),
      rx: Math.abs(this.sx(this.xmin + rx) - this.sx(this.xmin)),
      ry: Math.abs(this.sy(this.ymin + ry) - this.sy(this.ymin)),
      class: "ell " + (o.class ?? ""),
    }));
  }

  text(x, y, str, o = {}) {
    const t = svgEl("text", {
      x: this.sx(x) + (o.dx ?? 0), y: this.sy(y) + (o.dy ?? 0),
      class: "lab " + (o.class ?? ""), "text-anchor": o.anchor ?? "start",
    });
    t.textContent = str;
    return this.add(o.layer ?? "text", t);
  }

  /**
   * A point the reader can drag along the x-axis. `onMove` receives the new x
   * in function units, already clamped to [lo,hi].
   */
  grip(x, y, { lo, hi, onMove, label }) {
    const g = svgEl("g", { class: "grip", tabindex: "0", role: "slider",
      "aria-label": label ?? "draggable point",
      "aria-valuemin": lo, "aria-valuemax": hi, "aria-valuenow": x });
    g.append(svgEl("circle", { cx: this.sx(x), cy: this.sy(y), r: 13, class: "grip-hit" }));
    g.append(svgEl("circle", { cx: this.sx(x), cy: this.sy(y), r: 5.5, class: "grip-dot" }));
    this.add("handle", g);

    const move = (ev) => {
      const pt = this.svg.createSVGPoint();
      pt.x = ev.clientX; pt.y = ev.clientY;
      const local = pt.matrixTransform(this.svg.getScreenCTM().inverse());
      onMove(Math.max(lo, Math.min(hi, this.ux(local.x))));
    };
    g.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      g.setPointerCapture(ev.pointerId);
      const up = () => { g.removeEventListener("pointermove", move); };
      g.addEventListener("pointermove", move);
      g.addEventListener("pointerup", up, { once: true });
      g.addEventListener("pointercancel", up, { once: true });
    });
    // keyboard: the figure is useless to anyone not using a mouse without this
    g.addEventListener("keydown", (ev) => {
      const step = (hi - lo) / (ev.shiftKey ? 100 : 25);
      if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") { onMove(Math.max(lo, x - step)); ev.preventDefault(); }
      if (ev.key === "ArrowRight" || ev.key === "ArrowUp") { onMove(Math.min(hi, x + step)); ev.preventDefault(); }
      if (ev.key === "Home") { onMove(lo); ev.preventDefault(); }
      if (ev.key === "End") { onMove(hi); ev.preventDefault(); }
    });
    return g;
  }
}

// ---- number formatting for tick labels ----
function niceStep(span) {
  const raw = span / 8;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  return (norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10) * mag;
}
function fmt(v) {
  if (Math.abs(v) < 1e-9) return "0";
  const r = Math.round(v * 1e6) / 1e6;
  return Number.isInteger(r) ? String(r) : String(+r.toFixed(2));
}

// ---- controls, styled by the page ----

/** A labelled range input with a live value readout. */
export function slider({ label, min, max, step, value, format, onInput }) {
  const wrap = document.createElement("label");
  wrap.className = "ctl";
  const head = document.createElement("span");
  head.className = "ctl-head";
  const name = document.createElement("span");
  name.className = "ctl-name";
  name.textContent = label;
  const out = document.createElement("span");
  out.className = "ctl-val";
  const show = (v) => { out.textContent = format ? format(v) : String(v); };
  show(value);
  head.append(name, out);

  const input = document.createElement("input");
  Object.assign(input, { type: "range", min, max, step, value });
  input.addEventListener("input", () => {
    const v = +input.value;
    show(v);
    onInput(v);
  });
  wrap.append(head, input);
  wrap.set = (v) => { input.value = v; show(+v); };
  return wrap;
}

/** Segmented single-select, the same component the trainers' consoles use. */
export function segmented({ label, options, value, onPick }) {
  const wrap = document.createElement("div");
  wrap.className = "ctl";
  if (label) {
    const head = document.createElement("span");
    head.className = "ctl-head";
    head.innerHTML = `<span class="ctl-name">${label}</span>`;
    wrap.append(head);
  }
  const seg = document.createElement("div");
  seg.className = "seg";
  let cur = value;
  for (const o of options) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = o.label;
    b.setAttribute("aria-pressed", String(o.value === cur));
    b.onclick = () => {
      cur = o.value;
      [...seg.children].forEach((c, i) => c.setAttribute("aria-pressed", String(options[i].value === cur)));
      onPick(cur);
    };
    seg.append(b);
  }
  wrap.append(seg);
  return wrap;
}

/** A plain checkbox row for showing/hiding part of a figure. */
export function toggle({ label, value, onChange }) {
  const l = document.createElement("label");
  l.className = "toggle-row";
  const i = document.createElement("input");
  i.type = "checkbox";
  i.checked = !!value;
  i.addEventListener("change", () => onChange(i.checked));
  l.append(i, document.createTextNode(" " + label));
  return l;
}

/** The numeric readouts under a figure: a label and a value that updates. */
export function readout(items) {
  const row = document.createElement("div");
  row.className = "readout";
  const cells = {};
  for (const [key, label] of Object.entries(items)) {
    const c = document.createElement("div");
    c.className = "ro";
    c.innerHTML = `<span class="ro-lab"></span><span class="ro-val"></span>`;
    c.querySelector(".ro-lab").textContent = label;
    cells[key] = c.querySelector(".ro-val");
    row.append(c);
  }
  row.set = (key, text, cls) => {
    cells[key].textContent = text;
    cells[key].className = "ro-val " + (cls ?? "");
  };
  // Some figures change what they are measuring as you change the function,
  // so the label has to move with the value.
  row.label = (key, text) => {
    cells[key].parentElement.querySelector(".ro-lab").textContent = text;
  };
  return row;
}
