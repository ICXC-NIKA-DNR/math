// Generates the 170 unit-circle cards. Values are computed numerically and
// mapped to exact rationalized LaTeX, so no value is hand-typed.
const ANG = [[0,1],[1,6],[1,4],[1,3],[1,2],[2,3],[3,4],[5,6],[1,1],[7,6],[5,4],[4,3],[3,2],[5,3],[7,4],[11,6]];
const th = ([p, q]) => (p * Math.PI) / q;
const rad = ([p, q]) => p === 0 ? "0" : q === 1 ? (p === 1 ? "\\pi" : `${p}\\pi`)
  : p === 1 ? `\\frac{\\pi}{${q}}` : `\\frac{${p}\\pi}{${q}}`;
const deg = ([p, q]) => `${Math.round((p * 180) / q)}^\\circ`;

const U = "\\text{undefined}";
const KNOWN = [[0,"0"],[0.5,"\\frac{1}{2}"],[Math.SQRT2/2,"\\frac{\\sqrt{2}}{2}"],[Math.sqrt(3)/2,"\\frac{\\sqrt{3}}{2}"],
  [1,"1"],[Math.sqrt(3)/3,"\\frac{\\sqrt{3}}{3}"],[Math.sqrt(3),"\\sqrt{3}"],[2,"2"],[Math.SQRT2,"\\sqrt{2}"],[2*Math.sqrt(3)/3,"\\frac{2\\sqrt{3}}{3}"]];
export function tex(v) {
  if (!isFinite(v) || Math.abs(v) > 1e6) return U;
  const k = KNOWN.find(([n]) => Math.abs(Math.abs(v) - n) < 1e-9);
  if (!k) throw new Error("unknown value " + v);
  return k[1] === "0" ? "0" : (v < 0 ? "-" : "") + k[1];
}
const neg = (t) => (t === "0" || t === U) ? t : t.startsWith("-") ? t.slice(1) : "-" + t;
const mag = (t) => t.startsWith("-") ? t.slice(1) : t;
const withSign = (t, m) => (m === "0" || m === U) ? m : t.startsWith("-") ? "-" + m : m;

const FN = {
  sin: (x) => Math.sin(x), cos: (x) => Math.cos(x), tan: (x) => Math.sin(x) / Math.cos(x),
  csc: (x) => 1 / Math.sin(x), sec: (x) => 1 / Math.cos(x), cot: (x) => Math.cos(x) / Math.sin(x),
};
const PARTNER = { sin: "cos", cos: "sin", tan: "cot", cot: "tan", sec: "csc", csc: "sec" };
const BASE = { csc: "sin", sec: "cos", cot: "tan" };
const S = { h: "\\frac{1}{2}", r2: "\\frac{\\sqrt{2}}{2}", r3: "\\frac{\\sqrt{3}}{2}", t3: "\\frac{\\sqrt{3}}{3}", q3: "\\sqrt{3}", c3: "\\frac{2\\sqrt{3}}{3}" };
const SWAP = {
  sin: { [S.h]: S.r3, [S.r3]: S.h, [S.r2]: S.r3, "0": "1", "1": "0" },
  tan: { [S.q3]: S.t3, [S.t3]: S.q3, "1": S.q3, "0": U, [U]: "0" },
  sec: { "2": S.c3, [S.c3]: "2", "\\sqrt{2}": "2", "1": U, [U]: "1" },
};
SWAP.cos = SWAP.sin; SWAP.cot = SWAP.tan; SWAP.csc = SWAP.sec;
const FILL = {
  sin: ["0", "1", "-1", S.h, "-" + S.h], tan: ["0", "1", "-1", S.q3, U], sec: ["1", "-1", "2", "-2", U],
};
FILL.cos = FILL.sin; FILL.cot = FILL.tan; FILL.csc = FILL.sec;

const pick3 = (ans, cands) => {
  const out = [];
  for (const c of cands) if (c != null && c !== ans && !out.includes(c)) { out.push(c); if (out.length === 3) break; }
  if (out.length < 3) throw new Error("not enough distractors for " + ans);
  return out;
};
const quadLevel = (i) => [0, 4, 8, 12].includes(i) ? 2 : i < 4 ? 1 : 3;
const val = (fn, i) => tex(FN[fn](th(ANG[i])));
const G = "Unit circle";

export function unitCircle() {
  const cards = [];
  const push = (c) => cards.push({ course: "precalc", group: G, ...c });

  // values + reciprocal
  for (const fn of ["sin", "cos", "tan", "csc", "sec", "cot"]) {
    ANG.forEach((a, i) => {
      const ans = val(fn, i), sw = SWAP[fn][mag(ans)];
      const cands = [BASE[fn] && val(BASE[fn], i), neg(ans), val(PARTNER[fn], i),
        sw && withSign(ans, sw), sw && neg(withSign(ans, sw)), neg(val(PARTNER[fn], i)), ...FILL[fn]];
      push({ family: BASE[fn] ? "reciprocal" : "values", level: BASE[fn] ? 3 : quadLevel(i),
        prompt: `\\${fn}\\left(${rad(a)}\\right)`, answer: ans, distractors: pick3(ans, cands),
        deg: { prompt: `\\${fn}\\left(${deg(a)}\\right)` } });
    });
  }

  // coordinates
  const pt = (x, y) => `\\left(${x}, ${y}\\right)`;
  ANG.forEach((a, i) => {
    const c = val("cos", i), s = val("sin", i), ans = pt(c, s);
    const cands = [pt(s, c), pt(neg(c), s), pt(c, neg(s)), pt(neg(c), neg(s)), pt(neg(s), c), pt(s, neg(c)), pt(neg(s), neg(c))];
    push({ family: "coordinates", level: quadLevel(i), prompt: `\\text{point at } \\theta=${rad(a)}`,
      answer: ans, distractors: pick3(ans, cands), deg: { prompt: `\\text{point at } \\theta=${deg(a)}` } });
  });

  // reverse coordinates
  const mags = (i) => [mag(val("cos", i)), mag(val("sin", i))];
  ANG.forEach((a, i) => {
    const [mc, ms] = mags(i);
    const same = ANG.map((_, j) => j).filter((j) => j !== i && mags(j)[0] === mc && mags(j)[1] === ms);
    const swapped = ANG.map((_, j) => j).filter((j) => mags(j)[0] === ms && mags(j)[1] === mc && j !== i);
    const order = [...same, ...swapped].slice(0, 3);
    push({ family: "reverse coordinates", level: quadLevel(i),
      prompt: `\\theta\\in[0,2\\pi) \\text{ at } ${pt(val("cos", i), val("sin", i))}`,
      answer: rad(a), distractors: order.map((j) => rad(ANG[j])),
      deg: { prompt: `\\theta\\in[0^\\circ,360^\\circ) \\text{ at } ${pt(val("cos", i), val("sin", i))}`,
        answer: deg(a), distractors: order.map((j) => deg(ANG[j])) } });
  });

  // reverse values: answer is the full solution set in [0, 2pi)
  const set = (idx, f) => `\\left\\{${idx.map((j) => f(ANG[j])).join(", ")}\\right\\}`;
  const solve = (fn, v) => ANG.map((_, j) => j).filter((j) => val(fn, j) === v);
  const V = ["0", "1", "-1", S.h, "-" + S.h, S.r2, "-" + S.r2, S.r3, "-" + S.r3];
  const jobs = [
    ...V.map((v) => ["sin", v]), ...V.map((v) => ["cos", v]),
    ...["0", "1", "-1", S.q3, "-" + S.q3, S.t3, "-" + S.t3, U].map((v) => ["tan", v]),
  ];
  for (const [fn, v] of jobs) {
    const sol = solve(fn, v);
    const key = (idx) => [...idx].sort((x, y) => x - y).join(",");
    const fam = ANG.map((_, j) => j).filter((j) => mag(val(fn, j)) === mag(v) && !sol.includes(j));
    const cands = [];
    const other = solve(PARTNER[fn], v); if (other.length) cands.push(other);
    for (const w of fam) { cands.push(sol.length > 1 ? [sol[0], w] : [w]); if (sol.length > 1) cands.push([w, sol[1]]); }
    const sw = SWAP[fn][mag(v)]; if (sw) { const s2 = solve(fn, withSign(v, sw)); if (s2.length) cands.push(s2); }
    for (const j of [0, 4, 8, 12]) cands.push([j]);
    const seen = new Set([key(sol)]), chosen = [];
    for (const c of cands) {
      if (!c) continue;
      const k = key(c); if (seen.has(k)) continue;
      seen.add(k); chosen.push([...c].sort((x, y) => x - y)); if (chosen.length === 3) break;
    }
    // interval-end trap: {0, 2pi} when 0 is a solution
    if (sol.includes(0) && sol.length > 1) chosen[2] = "end";
    const render = (f, full) => (c) => c === "end"
      ? `\\left\\{${f(ANG[0])}, ${full}\\right\\}` : set(c, f);
    const level = ["0", "1", "-1"].includes(v) ? 1 : v === U ? 2 : v.startsWith("-") ? 3 : 2;
    const lhs = v === U ? `\\${fn}\\theta \\text{ undefined}` : `\\${fn}\\theta=${v}`;
    push({ family: "reverse values", level,
      prompt: `${lhs},\\ \\theta\\in[0,2\\pi)`, answer: set(sol, rad),
      distractors: chosen.map(render(rad, "2\\pi")),
      deg: { prompt: `${lhs},\\ \\theta\\in[0^\\circ,360^\\circ)`, answer: set(sol, deg),
        distractors: chosen.map(render(deg, "360^\\circ")) } });
  }

  // placement (tap)
  ANG.forEach((a, i) => push({ family: "placement", level: quadLevel(i), kind: "tap", index: i,
    prompt: `\\text{tap } ${rad(a)}`, deg: { prompt: `\\text{tap } ${deg(a)}` } }));

  return cards;
}
export const ANGLES = ANG.map(th);
