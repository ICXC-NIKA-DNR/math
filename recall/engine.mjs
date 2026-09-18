// Recall trainer engine. No DOM, no styling, no LaTeX rendering.
// A view imports this plus data/cards.json and owns everything visual.
//
// Tree:   course -> group -> family (leaf). Leaf key = "course/group/family".
// Filter: a leaf is in the pool when it is on; levels are per course, cumulative
//         (level L includes every card with level <= L).

export const LEVELS = { easy: 1, medium: 2, hard: 3 };
const TAU = 2 * Math.PI;
export const ANGLES = [0,1/6,1/4,1/3,1/2,2/3,3/4,5/6,1,7/6,5/4,4/3,3/2,5/3,7/4,11/6].map((k) => k * Math.PI);

const leafKey = (c) => `${c.course}/${c.group}/${c.family}`;

// ---------- tree ----------
export function buildTree(bank) {
  const root = { id: "", label: "All", children: [] };
  const find = (list, id, label) => {
    let n = list.find((x) => x.id === id);
    if (!n) list.push((n = { id, label, children: [], count: 0 }));
    return n;
  };
  for (const { id, label } of bank.courses) find(root.children, id, label);
  for (const c of bank.cards) {
    const course = find(root.children, c.course, c.course);
    const group = find(course.children, `${c.course}/${c.group}`, c.group);
    const leaf = find(group.children, leafKey(c), c.family);
    course.count++; group.count++; leaf.count++;
  }
  root.children = root.children.filter((n) => n.count);
  return root;
}

export function findNode(tree, id) {
  if (tree.id === id) return tree;
  for (const ch of tree.children) { const n = findNode(ch, id); if (n) return n; }
  return null;
}
export const leaves = (node) => node.children.length ? node.children.flatMap(leaves) : [node.id];

// ---------- selection state (plain object; views may persist it as JSON) ----------
// One level per leaf: 0 off, 1 easy, 2 medium, 3 hard. Levels are cumulative,
// so a leaf at 2 plays its level-1 and level-2 cards.
export const OFF = 0;

export function defaultState(tree) {
  return { levels: Object.fromEntries(leaves(tree).map((l) => [l, LEVELS.hard])), degrees: false };
}

// a node's level, or "mixed" when its leaves disagree
export function nodeLevel(state, tree, id) {
  const ls = leaves(findNode(tree, id)).map((l) => state.levels[l] ?? OFF);
  return ls.every((v) => v === ls[0]) ? ls[0] : "mixed";
}

export function setNodeLevel(state, tree, id, level) {
  const levels = { ...state.levels };
  for (const l of leaves(findNode(tree, id))) levels[l] = level;
  return { ...state, levels };
}

// tap: off -> easy -> medium -> hard -> off. A mixed node levels up to hard
// first, so one press makes a group uniform instead of silently flattening it.
export function cycle(state, tree, id) {
  const cur = nodeLevel(state, tree, id);
  return setNodeLevel(state, tree, id, cur === "mixed" ? LEVELS.hard : (cur + 1) % 4);
}

export const isOn = (state, tree, id) => leaves(findNode(tree, id)).some((l) => (state.levels[l] ?? OFF) > OFF);

export function isSoloed(state, tree, id) {
  const inside = new Set(leaves(findNode(tree, id)));
  const on = leaves(tree).filter((l) => (state.levels[l] ?? OFF) > OFF);
  return on.length > 0 && on.every((l) => inside.has(l));
}

// solo: if this node is already the only thing on, turn everything on at hard;
// otherwise silence everything else, keeping this node's own levels
export function solo(state, tree, id) {
  if (isSoloed(state, tree, id)) return setNodeLevel(state, tree, "", LEVELS.hard);
  const inside = new Set(leaves(findNode(tree, id)));
  const levels = Object.fromEntries(Object.entries(state.levels).map(([l, v]) => [l, inside.has(l) ? v : OFF]));
  if (![...inside].some((l) => levels[l] > OFF)) for (const l of inside) levels[l] = LEVELS.hard;
  return { ...state, levels };
}

export const setDegrees = (state, degrees) => ({ ...state, degrees });

export function pool(bank, state) {
  return bank.cards.filter((c) => c.level <= (state.levels[leafKey(c)] ?? OFF));
}

// ---------- angles ----------
export function snapAngle(theta) {
  const t = ((theta % TAU) + TAU) % TAU;
  let best = 0, bestD = Infinity;
  ANGLES.forEach((a, i) => {
    const d = Math.min(Math.abs(t - a), TAU - Math.abs(t - a));
    if (d < bestD) { bestD = d; best = i; }
  });
  return best;
}

// ---------- session ----------
// opts: { degrees, timeLimitMs (null = untimed), rng }
export function createSession(cards, opts = {}) {
  const { degrees = false, timeLimitMs = null, rng = Math.random } = opts;
  if (!cards.length) throw new Error("empty pool");
  const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  let bag = [], last = null, current = null;
  const stats = { answered: 0, correct: 0, score: 0, streak: 0, bestStreak: 0 };

  function next() {
    if (!bag.length) {
      bag = shuffle(cards);
      if (bag.length > 1 && bag[bag.length - 1] === last) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    const card = bag.pop(); last = card;
    const v = degrees && card.deg ? { ...card, ...card.deg } : card;
    if (card.kind === "tap") {
      current = { card, kind: "tap", prompt: v.prompt, note: card.note };
      return { id: card.id, kind: "tap", prompt: v.prompt, note: card.note };
    }
    const choices = shuffle([v.answer, ...v.distractors]);
    current = { card, kind: "choice", choices, correctIndex: choices.indexOf(v.answer) };
    return { id: card.id, kind: "choice", prompt: v.prompt, note: card.note, choices };
  }

  function score(correct, elapsedMs) {
    const timedOut = timeLimitMs != null && elapsedMs != null && elapsedMs > timeLimitMs;
    const ok = correct && !timedOut;
    stats.answered++;
    let points = 0;
    if (ok) {
      stats.correct++; stats.streak++; stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
      const speed = timeLimitMs ? 1 - Math.min(elapsedMs ?? 0, timeLimitMs) / (2 * timeLimitMs) : 1;
      points = Math.round(1000 * speed) + 100 * Math.min(stats.streak - 1, 5);
      stats.score += points;
    } else stats.streak = 0;
    return { correct: ok, timedOut, points, streak: stats.streak };
  }

  // choiceIndex null = no answer (timeout)
  function answer(choiceIndex, elapsedMs) {
    if (!current || current.kind !== "choice") throw new Error("no choice question active");
    const r = score(choiceIndex === current.correctIndex, elapsedMs);
    const out = { ...r, correctIndex: current.correctIndex };
    current = null; return out;
  }

  // theta in radians, standard position (counterclockwise from +x)
  function answerTap(theta, elapsedMs) {
    if (!current || current.kind !== "tap") throw new Error("no tap question active");
    const picked = theta == null ? -1 : snapAngle(theta);
    const r = score(picked === current.card.index, elapsedMs);
    const out = { ...r, pickedIndex: picked, correctIndex: current.card.index, correctTheta: ANGLES[current.card.index] };
    current = null; return out;
  }

  return { next, answer, answerTap, stats: () => ({ ...stats }) };
}
