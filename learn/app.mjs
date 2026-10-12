// Learn — a small library of interactive topic pages.
//
// Routing is the URL hash, so every topic is linkable: send a student
// learn/#riemann and they land on that page. No hash means the library index.

import { typeset } from "./ui.mjs";

const MODULES = ["riemann", "tangent", "revolve", "taylor"];

// Course order on the index, matching the way the trainers are grouped.
const COURSES = ["Limits", "Derivatives", "Integrals", "Applications", "Series"];

const $ = (s) => document.querySelector(s);
let TOPICS = [];

async function load() {
  const mods = await Promise.all(
    MODULES.map((n) => import(`./topics/${n}.mjs`).then((m) => m.default)),
  );
  TOPICS = mods;
}

function card(t) {
  const a = document.createElement("a");
  a.className = "tcard";
  a.href = "#" + t.id;
  const name = document.createElement("span");
  name.className = "tname";
  name.textContent = t.title;
  a.append(name);
  return a;
}

function renderIndex() {
  document.title = "Learn — interactive calculus";
  const view = $("#view");
  view.replaceChildren();
  view.className = "view index";
  $("#h1").textContent = "Learn";

  const lede = document.createElement("p");
  lede.className = "lede";
  lede.textContent = "Topics you can push on.";
  view.append(lede);

  // Course is still what sets the order — easier before harder — it just is
  // not printed. The index is a list of names and nothing else.
  const grid = document.createElement("div");
  grid.className = "tgrid";
  grid.append(...ordered().map(card));
  view.append(grid);
}

const ordered = () =>
  COURSES.flatMap((course) => TOPICS.filter((t) => t.course === course));

function renderTopic(t) {
  document.title = `${t.title} — Learn`;
  const view = $("#view");
  view.replaceChildren();
  view.className = "view topic";
  $("#h1").textContent = t.title;

  try {
    t.build(view);
  } catch (err) {
    const p = document.createElement("div");
    p.className = "prose";
    p.textContent = "This figure failed to load. " + err.message;
    view.append(p);
    console.error(err);
  }
  typeset(view);

  // next/previous follows the index order, so a tutoring session can walk the
  // library front to back
  const seq = ordered();
  const i = seq.indexOf(t);
  const nav = document.createElement("nav");
  nav.className = "tnav";
  if (i > 0) nav.append(linkTo(seq[i - 1], "← "));
  const spacer = document.createElement("span");
  spacer.className = "grow";
  nav.append(spacer);
  if (i < seq.length - 1) nav.append(linkTo(seq[i + 1], "", " →"));
  view.append(nav);
}

function linkTo(t, pre = "", post = "") {
  const a = document.createElement("a");
  a.className = "tlink";
  a.href = "#" + t.id;
  a.textContent = pre + t.title + post;
  return a;
}

function route() {
  const id = location.hash.replace(/^#/, "");
  const t = TOPICS.find((x) => x.id === id);
  if (t) renderTopic(t); else renderIndex();
  window.scrollTo(0, 0);
}

addEventListener("hashchange", route);

export async function boot() {
  await load();
  route();
}
