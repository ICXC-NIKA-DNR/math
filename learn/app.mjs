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
  a.innerHTML =
    `<span class="tcourse">${t.course}</span>` +
    `<span class="tname"></span>` +
    `<span class="tblurb"></span>`;
  a.querySelector(".tname").textContent = t.title;
  a.querySelector(".tblurb").textContent = t.blurb;
  return a;
}

function renderIndex() {
  document.title = "Learn — interactive calculus";
  const view = $("#view");
  view.replaceChildren();
  view.className = "view index";
  $("#crumb").hidden = true;
  $("#h1").textContent = "Learn";

  const lede = document.createElement("p");
  lede.className = "lede";
  lede.textContent =
    "Topics you can push on. Every figure is live — drag the handles, move the sliders, " +
    "and watch which numbers move with them.";
  view.append(lede);

  for (const course of COURSES) {
    const inCourse = TOPICS.filter((t) => t.course === course);
    if (!inCourse.length) continue;
    const sec = document.createElement("section");
    const h = document.createElement("h2");
    h.className = "course";
    h.textContent = course;
    const grid = document.createElement("div");
    grid.className = "tgrid";
    grid.append(...inCourse.map(card));
    sec.append(h, grid);
    view.append(sec);
  }
}

function renderTopic(t) {
  document.title = `${t.title} — Learn`;
  const view = $("#view");
  view.replaceChildren();
  view.className = "view topic";
  $("#h1").textContent = t.title;

  const crumb = $("#crumb");
  crumb.hidden = false;
  crumb.textContent = t.course;

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

  // next/previous, so a tutoring session can walk the library in order
  const i = TOPICS.indexOf(t);
  const nav = document.createElement("nav");
  nav.className = "tnav";
  if (i > 0) nav.append(linkTo(TOPICS[i - 1], "← "));
  const spacer = document.createElement("span");
  spacer.className = "grow";
  nav.append(spacer);
  if (i < TOPICS.length - 1) nav.append(linkTo(TOPICS[i + 1], "", " →"));
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
