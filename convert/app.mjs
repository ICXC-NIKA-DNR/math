// The Convert page's view layer. All translation lives in convert.mjs, which
// is pure and unit-tested; this file only wires it to the DOM and handles the
// image export.

import { plainToLatex, convertGraph, readDesmos } from "./convert.mjs?v=2";
import { buildGraph } from "../shared/graph.mjs?v=2";
import { slider } from "../shared/plot.mjs?v=2";

const $ = (s) => document.querySelector(s);
const on = (el, ev, fn) => el.addEventListener(ev, fn);

// ───────────────────────── mode switch ─────────────────────────
const panes = { type: $("#pane-type"), graph: $("#pane-graph") };
const tabs = { type: $("#m-type"), graph: $("#m-graph") };
function setMode(m) {
  for (const k of Object.keys(panes)) {
    panes[k].classList.toggle("hidden", k !== m);
    tabs[k].setAttribute("aria-pressed", String(k === m));
  }
  location.hash = m === "graph" ? "#graph" : "";
}
on(tabs.type, "click", () => setMode("type"));
on(tabs.graph, "click", () => setMode("graph"));

// ───────────────────────── mode 1: type → LaTeX ─────────────────────────
const src = $("#src"), texOut = $("#tex"), preview = $("#preview"), errBox = $("#err-type");
let lastTex = "";
// Dark ink wants a white ground behind it; light ink is for dark slides and
// exports with no ground at all. The preview sits on whichever is chosen, so
// what you see is what the file contains.
let ink = "dark";
const INK = { dark: "#111111", light: "#F4F4F4" };

async function renderMath(tex) {
  preview.replaceChildren();
  if (!tex.trim()) return;
  if (!window.MathJax?.tex2svgPromise) {
    preview.textContent = "Loading the renderer…";
    return;
  }
  try {
    const node = await MathJax.tex2svgPromise(tex, { display: true });
    const svg = node.querySelector("svg");
    if (svg) {
      // MathJax paints with currentColor, so the ink has to be stated
      // explicitly or a downloaded file inherits nothing and renders black.
      svg.setAttribute("color", INK[ink]);
      preview.append(svg);
    }
  } catch (e) {
    preview.textContent = "Could not render that.";
    console.error(e);
  }
}

function update() {
  const r = plainToLatex(src.value);
  lastTex = r.ok ? r.out : "";
  texOut.textContent = r.ok ? r.out : "";
  errBox.textContent = src.value.trim() && !r.ok ? r.error : "";
  renderMath(lastTex);
  const none = !lastTex;
  for (const id of ["#dl-png", "#dl-svg", "#copy-png", "#copy-tex"]) $(id).disabled = none;
}
on(src, "input", update);

// ───────────────────────── image export ─────────────────────────

/**
 * The preview SVG, standalone: explicit size, its own ground, no page CSS.
 *
 * The size comes from MathJax's own ex measurements rather than from
 * getBoundingClientRect, which reports 0 whenever the element is not laid out
 * — a hidden tab, a background window — and would quietly export a 1x1 image.
 * Deriving it from the markup also makes the output independent of page zoom.
 */
const PX_PER_EX = 9;

function exportableSvg(scale = 1) {
  const live = preview.querySelector("svg");
  if (!live) return null;
  const svg = live.cloneNode(true);

  const ex = (attr) => {
    const m = /^([\d.]+)ex$/.exec(live.getAttribute(attr) || "");
    return m ? parseFloat(m[1]) * PX_PER_EX : null;
  };
  let w = ex("width"), h = ex("height");
  if (!w || !h) {
    // no ex units — fall back to the viewBox aspect at a fixed height
    const vb = (live.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
    if (vb.length === 4 && vb[3]) { h = 48; w = (48 * vb[2]) / vb[3]; }
    else { const box = live.getBoundingClientRect(); w = box.width || 200; h = box.height || 60; }
  }
  w = Math.max(1, Math.round(w * scale));
  h = Math.max(1, Math.round(h * scale));
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  if (ink === "dark") {
    // The ground has to be placed from the viewBox, not at 100%/100%.
    // MathJax hangs its glyphs off a negative y origin — viewBox="0 -1559 …" —
    // so a rect at (0,0) paints the empty half and leaves the maths
    // transparent, which is invisible here and black in anything that
    // flattens it.
    const vb = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    if (vb.length === 4 && vb.every(Number.isFinite)) {
      bg.setAttribute("x", vb[0]); bg.setAttribute("y", vb[1]);
      bg.setAttribute("width", vb[2]); bg.setAttribute("height", vb[3]);
    } else {
      bg.setAttribute("width", "100%"); bg.setAttribute("height", "100%");
    }
    bg.setAttribute("fill", "#ffffff");
    svg.insertBefore(bg, svg.firstChild);
  }
  return { markup: new XMLSerializer().serializeToString(svg), w, h };
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Rasterise the standalone SVG at 3x for a crisp paste into slides. */
function toPng() {
  const made = exportableSvg(3);
  if (!made) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = made.w; c.height = made.h;
      c.getContext("2d").drawImage(img, 0, 0, made.w, made.h);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas produced nothing"))), "image/png");
    };
    img.onerror = () => reject(new Error("the SVG would not load as an image"));
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(made.markup);
  });
}

on($("#dl-svg"), "click", () => {
  const made = exportableSvg();
  if (made) download(new Blob([made.markup], { type: "image/svg+xml" }), "math.svg");
});

on($("#dl-png"), "click", async () => {
  try { const b = await toPng(); if (b) download(b, "math.png"); }
  catch (e) { errBox.textContent = "PNG export failed: " + e.message; }
});

on($("#copy-png"), "click", async (ev) => {
  const btn = ev.currentTarget;
  const was = btn.textContent;
  try {
    const b = await toPng();
    await navigator.clipboard.write([new ClipboardItem({ "image/png": b })]);
    btn.textContent = "Copied";
  } catch {
    // Firefox has no image clipboard write; say so rather than failing silently
    btn.textContent = "Use Download";
  }
  setTimeout(() => { btn.textContent = was; }, 1400);
});

on($("#copy-tex"), "click", (ev) => copyText(lastTex, ev.currentTarget));

const inkSeg = $("#ink");
for (const b of inkSeg.querySelectorAll("button")) {
  on(b, "click", () => {
    ink = b.dataset.ink;
    preview.dataset.ink = ink;
    for (const o of inkSeg.querySelectorAll("button")) {
      o.setAttribute("aria-pressed", String(o.dataset.ink === ink));
    }
    renderMath(lastTex);
  });
}
preview.dataset.ink = ink;

async function copyText(text, btn) {
  const was = btn.textContent;
  try { await navigator.clipboard.writeText(text); btn.textContent = "copied"; }
  catch { btn.textContent = "copy failed"; }
  setTimeout(() => { btn.textContent = was; }, 1200);
}

// ───────────────────────── mode 2: Desmos → NOUS ─────────────────────────
const gsrc = $("#gsrc"), rowsBody = $("#rows");
let plainRows = [];

function renderGraph() {
  const rows = convertGraph(gsrc.value);
  rowsBody.replaceChildren();
  plainRows = [];

  if (!rows.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="2" style="color:var(--faint)">Nothing to convert yet.</td>`;
    rowsBody.append(tr);
    return;
  }

  for (const row of rows) {
    const tr = document.createElement("tr");
    if (row.kind === "folder") {
      tr.innerHTML = `<td colspan="2"><span class="tag">folder</span> </td>`;
      tr.querySelector("td").append(row.title || "(untitled)");
      plainRows.push(`// ${row.title || "folder"}`);
    } else if (row.kind === "text") {
      tr.innerHTML = `<td colspan="2"><span class="tag">note</span> </td>`;
      tr.querySelector("td").append(row.note);
      plainRows.push(`// ${row.note}`);
    } else {
      const a = document.createElement("td");
      a.textContent = row.latex;
      if (row.hidden) a.append(tag("hidden"));
      if (row.slider) a.append(tag("slider"));
      const b = document.createElement("td");
      b.className = row.error ? "bad" : "plain";
      b.textContent = row.error ? row.error : row.plain;
      tr.append(a, b);
      if (!row.error) plainRows.push(row.plain);
    }
    rowsBody.append(tr);
  }
}

function tag(text) {
  const s = document.createElement("span");
  s.className = "tag";
  s.textContent = text;
  return s;
}

// ───────────────────────── the drawn graph ─────────────────────────
// Everything above turns the paste into text. This turns it into a picture, in
// this site's palette, with the sliders still live — which is the whole point
// of building the graph in Desmos and bringing it here.

const gstage = $("#gstage"), gsliders = $("#gsliders"),
      gerr = $("#gerr"), gcount = $("#gcount");
let figSpec = null;

function drawImported() {
  gstage.replaceChildren();
  gsliders.replaceChildren();
  gerr.textContent = "";
  gcount.textContent = "";
  figSpec = null;

  const rows = readDesmos(gsrc.value).filter((r) => r.kind === "expr");
  if (!rows.length) return;

  const viewport = viewportOf(gsrc.value);
  let g;
  try { g = buildGraph({ expressions: rows, viewport }); }
  catch (e) { gerr.textContent = "Could not build the graph: " + e.message; return; }

  gstage.append(g.plot.svg);
  g.redraw();

  for (const s of g.sliders) {
    gsliders.append(slider({
      label: s.name, min: s.min, max: s.max, step: s.step, value: s.value,
      format: (v) => (+v).toFixed(2),
      onInput: (v) => { g.scope[s.name] = v; g.redraw(); },
    }));
  }

  gcount.textContent = `${g.count} drawn` +
    (g.sliders.length ? `, ${g.sliders.length} slider${g.sliders.length > 1 ? "s" : ""}` : "");
  if (g.problems.length) {
    gerr.textContent = g.problems.length + " not drawn: " +
      g.problems.map((p) => `${p.latex} (${p.why})`).join("; ");
  }

  // the figure a Learn topic would embed — expressions and window, nothing else
  figSpec = {
    viewport,
    expressions: rows.map((r) => ({
      latex: r.latex,
      ...(r.hidden ? { hidden: true } : {}),
      ...(r.slider ? { slider: r.slider } : {}),
    })),
  };
}

/** Desmos stores the window in graph.viewport; fall back to its default. */
function viewportOf(text) {
  try {
    const d = JSON.parse(text);
    const v = d?.graph?.viewport;
    if (v && ["xmin", "xmax", "ymin", "ymax"].every((k) => Number.isFinite(v[k]))) {
      return { xmin: v.xmin, xmax: v.xmax, ymin: v.ymin, ymax: v.ymax };
    }
  } catch { /* lines, not JSON */ }
  return { xmin: -10, xmax: 10, ymin: -6.5, ymax: 6.5 };
}

on($("#save-fig"), "click", (ev) => {
  if (!figSpec) return;
  copyText(JSON.stringify(figSpec, null, 2), ev.currentTarget);
});

on($("#dl-fig"), "click", () => {
  if (!figSpec) return;
  download(new Blob([JSON.stringify(figSpec, null, 2)], { type: "application/json" }),
           "graph.json");
});

on(gsrc, "input", renderGraph);
on(gsrc, "input", drawImported);
on($("#copy-rows"), "click", (ev) => copyText(plainRows.join("\n"), ev.currentTarget));

on($("#demo"), "click", () => {
  gsrc.value = JSON.stringify({
    version: 11,
    graph: { viewport: { xmin: -10, ymin: -6, xmax: 10, ymax: 6 } },
    expressions: {
      list: [
        { type: "expression", id: "1", latex: "y=a\\sin\\left(bx\\right)" },
        { type: "expression", id: "2", latex: "a=2", slider: { min: "0", max: "5" } },
        { type: "expression", id: "3", latex: "b=\\frac{\\pi}{2}" },
        { type: "text", id: "4", text: "amplitude and frequency" },
        { type: "expression", id: "5", latex: "x^{2}+y^{2}=25" },
        { type: "expression", id: "6", latex: "y\\ge\\sqrt{x}" },
      ],
    },
  }, null, 1);
  // one event, so every listener on the textarea runs — table and graph alike
  gsrc.dispatchEvent(new Event("input"));
});

// ───────────────────────── boot ─────────────────────────
if (location.hash === "#graph") setMode("graph");
update();
renderGraph();
drawImported();
// MathJax finishes loading after this module runs; redraw once it is ready
addEventListener("load", () => { if (lastTex) renderMath(lastTex); });
