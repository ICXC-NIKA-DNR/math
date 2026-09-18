// node test/engine.test.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import * as E from "../../recall/engine.mjs";

const bank = JSON.parse(fs.readFileSync(new URL("../../recall/cards.json", import.meta.url)));
const tree = E.buildTree(bank);
let s = E.defaultState(tree);

assert.equal(E.pool(bank, s).length, bank.cards.length, "default = every family at hard");

// per-family levels: identities easy, unit-circle values hard
s = E.setNodeLevel(s, tree, "precalc/Identities/pythagorean", E.LEVELS.easy);
const easyOnly = E.pool(bank, s).filter((c) => c.family === "pythagorean");
assert.ok(easyOnly.every((c) => c.level === 1) && easyOnly.length > 0, "cumulative: easy keeps level-1 only");
assert.ok(E.pool(bank, s).some((c) => c.family === "values" && c.level === 3), "other families untouched");

// cycle: off -> easy -> medium -> hard -> off, mixed levels up to hard
const id = "calc1/Derivatives/trig";
s = E.setNodeLevel(s, tree, id, E.OFF);
assert.equal(E.nodeLevel(s, tree, id), 0);
for (const want of [1, 2, 3, 0]) { s = E.cycle(s, tree, id); assert.equal(E.nodeLevel(s, tree, id), want); }
assert.equal(E.nodeLevel(s, tree, "precalc"), "mixed");
assert.equal(E.nodeLevel(E.cycle(s, tree, "precalc"), tree, "precalc"), E.LEVELS.hard, "mixed -> hard");

// a course header cycles all of its families together
let h = E.setNodeLevel(E.defaultState(tree), tree, "calc2", E.LEVELS.easy);
assert.equal(E.nodeLevel(h, tree, "calc2"), 1);
assert.equal(E.nodeLevel(E.cycle(h, tree, "calc2"), tree, "calc2"), 2);
assert.ok(E.pool(bank, h).filter((c) => c.course === "calc2").every((c) => c.level === 1));
assert.equal(E.nodeLevel(h, tree, "calc1"), 3, "other courses unaffected");

// solo keeps the soloed node's own levels, second press restores everything at hard
s = E.defaultState(tree);
s = E.setNodeLevel(s, tree, id, E.LEVELS.medium);
s = E.solo(s, tree, id);
assert.ok(E.isSoloed(s, tree, id));
assert.equal(E.nodeLevel(s, tree, id), E.LEVELS.medium, "solo does not raise the level");
assert.ok(E.pool(bank, s).every((c) => c.group === "Derivatives" && c.family === "trig" && c.level <= 2));
const all = E.solo(s, tree, id);
assert.equal(E.nodeLevel(all, tree, ""), E.LEVELS.hard, "second press = everything at hard");
assert.deepEqual(E.solo(s, tree, "calc2/Hyperbolic/inverse").levels["calc2/Hyperbolic/inverse"], 3, "solo an off node turns it on");

// soloing an off node, and all off = empty pool
s = E.setNodeLevel(E.defaultState(tree), tree, "", E.OFF);
assert.equal(E.pool(bank, s).length, 0);
assert.ok(!E.isOn(s, tree, ""));

// session: answers, degrees, tap snapping
let seed = 1; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const sess = E.createSession(E.pool(bank, E.defaultState(tree)), { degrees: true, timeLimitMs: 10000, rng });
for (let i = 0; i < 2000; i++) {
  const q = sess.next();
  if (q.kind === "tap") {
    const card = bank.cards.find((c) => c.id === q.id);
    assert.ok(/\^\\circ/.test(q.prompt));
    assert.ok(sess.answerTap(E.ANGLES[card.index] + 0.1, 2000).correct);
  } else {
    assert.equal(q.choices.length, 4);
    const card = bank.cards.find((c) => c.id === q.id);
    const ans = card.deg?.answer ?? card.answer;
    const r = sess.answer(q.choices.indexOf(ans), 2000);
    assert.ok(r.correct);
  }
}
assert.equal(sess.stats().correct, 2000);
assert.equal(E.snapAngle(-Math.PI / 2), 12);
assert.equal(E.snapAngle(2 * Math.PI - 0.01), 0);
const t = E.createSession(bank.cards.slice(0, 5), { timeLimitMs: 1000, rng });
const q = t.next(); if (q.kind === "choice") assert.ok(t.answer(0, 5000).timedOut);
console.log("engine tests passed");
