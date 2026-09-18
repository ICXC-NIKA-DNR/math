// View layer. Owns the DOM, KaTeX rendering, the clock and localStorage.
// All selection and scoring logic lives in engine.mjs.
import * as E from "./engine.mjs";

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, props = {}, kids = []) => {
  const n = Object.assign(document.createElement(tag), props);
  for (const k of [].concat(kids)) n.append(k);
  return n;
};
const tex = (s, big) => {
  const n = el("span");
  try { katex.render(s, n, { throwOnError: false, displayMode: !!big }); } catch { n.textContent = s; }
  return n;
};
const store = {
  keys: ["state", "opts", "misses"],
  get(k, fb) { try { return JSON.parse(localStorage.getItem("recall." + k)) ?? fb; } catch { return fb; } },
  set(k, v) { try { localStorage.setItem("recall." + k, JSON.stringify(v)); } catch { /* private mode */ } },
  clear() { try { this.keys.forEach(k => localStorage.removeItem("recall." + k)); } catch { /* private mode */ } },
};

// Reset-progress, the shared standard across the trainers.
document.getElementById("resetAll")?.addEventListener("click", () => {
  store.clear();
  location.reload();
});

let BANK, TREE, state, misses, session, opts, clock, asked, lastResult;

// ---------- setup screen ----------
const LEVEL_NAMES = ["off", "easy", "medium", "hard"];

function pill(node, level) {
  const b = el("button", { type: "button", className: "pill lv" + level });
  b.setAttribute("aria-pressed", String(level > 0));
  b.append(node.label, el("span", { className: "n", textContent: node.count }));
  b.onclick = () => { state = E.cycle(state, TREE, node.id); save(); drawSetup(); };
  return b;
}

function courseCard(course) {
  const lvl = E.nodeLevel(state, TREE, course.id);
  const head = el("div", { className: "chead" });
  const name = el("button", { type: "button", className: "cname" }, [
    el("span", { className: "serif", textContent: course.label }),
    el("span", { className: "chip", textContent: lvl === "mixed" ? "mixed" : LEVEL_NAMES[lvl] }),
    el("span", { className: "sub", textContent: `${E.pool(BANK, state).filter((c) => c.course === course.id).length} of ${course.count} cards` }),
  ]);
  name.onclick = () => { state = E.cycle(state, TREE, course.id); save(); drawSetup(); };
  const solo = el("button", { type: "button", className: "solo", title: "solo", innerHTML:
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"></circle></svg>' });
  solo.setAttribute("aria-label", "Solo " + course.label);
  solo.onclick = () => { state = E.solo(state, TREE, course.id); save(); drawSetup(); };
  head.append(name, solo);

  const pills = el("div", { className: "pills" });
  for (const group of course.children) {
    if (course.children.length > 1) pills.append(el("span", { className: "glab", textContent: group.label }));
    for (const leaf of group.children) pills.append(pill(leaf, E.nodeLevel(state, TREE, leaf.id)));
  }
  return el("div", { className: "card" + (E.isOn(state, TREE, course.id) ? "" : " off") }, [head, pills]);
}

function seg(label, on, fn) {
  const b = el("button", { type: "button", className: "seg" + (on ? " on" : ""), textContent: label });
  b.setAttribute("aria-pressed", String(on));
  b.onclick = fn;
  return b;
}

function drawSetup() {
  const root = $("#view");
  root.innerHTML = "";
  root.className = "setup";

  const left = el("div", { className: "col-left" }, [el("span", { className: "eyebrow", textContent: "What to drill" })]);
  for (const course of TREE.children) left.append(courseCard(course));

  const n = E.pool(BANK, state).length;
  const on = E.leaves(TREE).filter((l) => state.levels[l] > 0).length;
  const right = el("div", { className: "col-right" });
  right.append(el("div", { className: "deck" }, [
    el("span", { className: "eyebrow", textContent: "In the deck" }),
    el("div", { className: "big", textContent: n }),
    el("div", { className: "sub", textContent: `cards · ${on} families on` }),
  ]));

  const legend = el("div", { className: "legend" }, [el("span", { className: "eyebrow", textContent: "Tap a family to cycle" })]);
  [["off", "skipped"], ["easy", "table basics"], ["medium", "+ less common"], ["hard", "+ everything"]].forEach(([name, note], i) => {
    legend.append(el("div", { className: "lrow" }, [
      el("span", { className: "sw lv" + i }), el("span", { className: "lname lv" + i + "-t", textContent: name }),
      el("span", { className: "note", textContent: note }),
    ]));
  });
  legend.append(el("p", { className: "note", textContent: "Each level includes the ones above it, so hard is the whole family. Tapping a course name cycles all of its families together." }));
  right.append(el("div", { className: "rule" }), legend, el("div", { className: "rule" }));

  right.append(el("div", { className: "settings" }, [
    el("div", { className: "srow" }, [el("span", { className: "sub", textContent: "Angles" }), el("div", { className: "segs" }, [
      seg("radians", !state.degrees, () => { state = E.setDegrees(state, false); save(); drawSetup(); }),
      seg("degrees", state.degrees, () => { state = E.setDegrees(state, true); save(); drawSetup(); })])]),
    el("div", { className: "srow" }, [el("span", { className: "sub", textContent: "Timer" }), el("div", { className: "segs" }, [
      seg("20 s", opts.timed, () => { opts.timed = true; save(); drawSetup(); }),
      seg("off", !opts.timed, () => { opts.timed = false; save(); drawSetup(); })])]),
  ]));

  const foot = el("div", { className: "foot" });
  if (misses.length) {
    const m = el("button", { type: "button", className: "misses" }, [
      el("span", { className: "dot" }),
      el("span", { className: "grow" }, [`Drill your ${misses.length} misses`]),
    ]);
    m.onclick = () => start(BANK.cards.filter((c) => misses.includes(c.id)));
    foot.append(m);
  }
  const go = el("button", { type: "button", className: "start", textContent: n ? "Start" : "Nothing selected", disabled: !n });
  go.onclick = () => start(E.pool(BANK, state));
  foot.append(go);
  right.append(foot);

  root.append(left, right);
}

// ---------- session ----------
const LIMIT = 20000;

function start(cards) {
  if (!cards.length) return;
  session = E.createSession(cards, { degrees: state.degrees, timeLimitMs: opts.timed ? LIMIT : null });
  asked = [];
  drawQuestion();
}

function stopClock() { clearInterval(clock); clock = null; }

function drawQuestion() {
  stopClock();
  const q = session.next();
  const card = BANK.cards.find((c) => c.id === q.id);
  asked.push(card);
  const t0 = performance.now();
  const root = $("#view");
  root.innerHTML = "";
  root.className = "session";

  const s = session.stats();
  root.append(el("div", { className: "topbar" }, [
    el("span", { className: "sub", textContent: `card ${s.answered + 1}` }),
    el("span", { className: "sub" }, [`score `, el("b", { textContent: s.score.toLocaleString() })]),
    el("span", { className: "streak", textContent: s.streak ? `streak ${s.streak}` : "" }),
    el("span", { className: "grow" }),
    el("span", { className: "tag", textContent: `${card.course} · ${card.family}` }),
    el("button", { type: "button", className: "link", textContent: "end session", onclick: () => { stopClock(); drawResults(); } }),
  ]));

  const timer = el("div", { className: "timer" }, [el("i")]);
  const stage = el("div", { className: "stage" }, [timer]);
  const prompt = el("div", { className: "prompt" }, [tex(q.prompt, true)]);
  if (q.note) prompt.append(el("span", { className: "note" }, [tex(q.note)]));
  stage.append(prompt);

  const feedback = el("div", { className: "feedback" });
  const finish = (r, mine) => {
    stopClock();
    if (!r.correct) { if (!misses.includes(card.id)) misses.push(card.id); }
    else { const i = misses.indexOf(card.id); if (i > -1) misses.splice(i, 1); }
    store.set("misses", misses);
    lastResult = r;
    feedback.className = "feedback show " + (r.correct ? "ok" : "no");
    const line = el("div", { className: "grow" }, [
      el("div", { className: "verdict", textContent: r.correct ? `Correct · +${r.points}` : r.timedOut ? "Out of time" : "Not that one" }),
    ]);
    if (!r.correct) line.append(el("div", { className: "answer" }, [q.kind === "tap" ? document.createTextNode(mine) : tex(q.choices[r.correctIndex])]));
    const next = el("button", { type: "button", className: "start", textContent: "Next" });
    next.onclick = drawQuestion;
    feedback.append(el("span", { className: "badge", textContent: r.correct ? "✓" : "✕" }), line, next);
    next.focus();
  };

  if (q.kind === "tap") {
    stage.append(circleInput((theta) => {
      const r = session.answerTap(theta, performance.now() - t0);
      const a = E.ANGLES[r.correctIndex];
      drawMarks(stage, r);
      finish(r, `the angle sits at ${(a / Math.PI).toFixed(2)}π`);
    }));
  } else {
    const grid = el("div", { className: "choices" });
    q.choices.forEach((c, i) => {
      const b = el("button", { type: "button", className: "choice" }, [tex(c)]);
      b.onclick = () => {
        if (!session) return;
        const r = session.answer(i, performance.now() - t0);
        grid.querySelectorAll("button").forEach((x, j) => {
          x.disabled = true;
          if (j === r.correctIndex) x.classList.add("right");
          else if (j === i && !r.correct) x.classList.add("wrong");
        });
        finish(r);
      };
      grid.append(b);
    });
    stage.append(grid, el("div", { className: "note", textContent: "press 1 – 4 to answer" }));
    document.onkeydown = (e) => {
      const i = "1234".indexOf(e.key);
      if (i > -1) grid.children[i]?.click();
      if (e.key === "Enter") $(".feedback.show .start")?.click();
    };
  }

  root.append(stage, feedback);

  if (opts.timed) {
    const bar = timer.firstChild;
    clock = setInterval(() => {
      const left = 1 - (performance.now() - t0) / LIMIT;
      bar.style.width = Math.max(0, left * 100) + "%";
      if (left <= 0) {
        stopClock();
        if (q.kind === "tap") { const r = session.answerTap(null, LIMIT + 1); drawMarks(stage, r); finish(r, "out of time"); }
        else { const r = session.answer(-1, LIMIT + 1); finish(r); }
      }
    }, 50);
  } else timer.style.visibility = "hidden";
}

const SVGNS = "http://www.w3.org/2000/svg";
const svgEl = (t, attrs) => { const n = document.createElementNS(SVGNS, t); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };

function circleInput(onPick) {
  const svg = svgEl("svg", { viewBox: "0 0 520 520", class: "circle", "aria-label": "Unit circle: tap where the angle lands" });
  svg.append(
    svgEl("line", { x1: 22, y1: 260, x2: 498, y2: 260, class: "axis" }),
    svgEl("line", { x1: 260, y1: 22, x2: 260, y2: 498, class: "axis" }),
    svgEl("circle", { cx: 260, cy: 260, r: 200, class: "ring" }),
  );
  svg.onclick = (e) => {
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 520 - 260;
    const y = 260 - ((e.clientY - r.top) / r.height) * 520;
    if (!svg.dataset.done) { svg.dataset.done = "1"; onPick(Math.atan2(y, x)); }
  };
  return svg;
}

function drawMarks(stage, r) {
  const svg = stage.querySelector("svg.circle");
  const pt = (theta) => [260 + 200 * Math.cos(theta), 260 - 200 * Math.sin(theta)];
  const [cx, cy] = pt(r.correctTheta);
  svg.append(svgEl("line", { x1: 260, y1: 260, x2: cx, y2: cy, class: "ray" }), svgEl("circle", { cx, cy, r: 9, class: "hit" }));
  if (r.pickedIndex > -1 && r.pickedIndex !== r.correctIndex) {
    const [px, py] = pt(E.ANGLES[r.pickedIndex]);
    svg.append(svgEl("circle", { cx: px, cy: py, r: 9, class: "miss" }));
  }
}

// ---------- results ----------
function drawResults() {
  document.onkeydown = null;
  const s = session.stats();
  const wrong = asked.filter((c) => misses.includes(c.id));
  const root = $("#view");
  root.innerHTML = "";
  root.className = "results";

  root.append(el("div", { className: "rhead" }, [
    el("div", {}, [el("span", { className: "eyebrow", textContent: "Session over" }),
      el("h1", { className: "serif", textContent: `${s.correct} of ${s.answered} correct` })]),
    el("div", { className: "stats" }, [
      el("div", {}, [el("div", { className: "big2", textContent: s.score.toLocaleString() }), el("div", { className: "note", textContent: "points" })]),
      el("div", {}, [el("div", { className: "big2", textContent: s.bestStreak }), el("div", { className: "note", textContent: "best streak" })]),
    ]),
  ]));

  const list = el("div", { className: "missed" });
  if (!wrong.length) list.append(el("p", { className: "note", textContent: "Nothing missed." }));
  for (const c of wrong.slice(0, 8)) {
    const v = state.degrees && c.deg ? { ...c, ...c.deg } : c;
    list.append(el("div", { className: "mrow" }, [
      el("div", { className: "mq" }, [tex(v.prompt)]),
      el("div", { className: "ma" }, [c.kind === "tap" ? document.createTextNode("tap card") : tex(v.answer)]),
      el("span", { className: "tag", textContent: `${c.course} · ${LEVEL_NAMES[c.level]}` }),
    ]));
  }

  const byFam = {};
  for (const c of asked) {
    const k = `${c.group} · ${c.family}`;
    byFam[k] = byFam[k] || { n: 0, ok: 0 };
    byFam[k].n++; if (!misses.includes(c.id)) byFam[k].ok++;
  }
  const bars = el("div", { className: "bars" });
  for (const [k, v] of Object.entries(byFam).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n)) {
    bars.append(el("div", {}, [
      el("div", { className: "brow" }, [el("span", { textContent: k }), el("span", { className: "note", textContent: `${v.ok}/${v.n}` })]),
      el("div", { className: "bar" }, [el("i", { style: `width:${(v.ok / v.n) * 100}%` })]),
    ]));
  }

  const again = el("button", { type: "button", className: "start", textContent: "Same deck again" });
  again.onclick = () => start(E.pool(BANK, state));
  const back = el("button", { type: "button", className: "link", textContent: "change the deck" });
  back.onclick = drawSetup;
  const actions = el("div", { className: "foot" });
  if (wrong.length) {
    const drill = el("button", { type: "button", className: "misses" }, [el("span", { className: "dot" }), el("span", { className: "grow", textContent: `Drill the ${wrong.length} missed` })]);
    drill.onclick = () => start(wrong);
    actions.append(drill);
  }
  actions.append(again, back);

  root.append(el("div", { className: "rcols" }, [
    el("div", { className: "col-left" }, [el("span", { className: "eyebrow", textContent: "Missed" }), list]),
    el("div", { className: "col-right" }, [el("span", { className: "eyebrow", textContent: "By family" }), bars, actions]),
  ]));
}

// ---------- boot ----------
function save() { store.set("state", state); store.set("opts", opts); }

export function boot(bank) {
  BANK = bank;
  TREE = E.buildTree(bank);
  const saved = store.get("state", null);
  state = saved && saved.levels ? saved : E.defaultState(TREE);
  for (const l of E.leaves(TREE)) if (state.levels[l] == null) state.levels[l] = E.LEVELS.hard;
  opts = store.get("opts", { timed: true });
  misses = store.get("misses", []).filter((id) => bank.cards.some((c) => c.id === id));
  drawSetup();
}
