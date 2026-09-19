# Math trainers

Static site of practice tools for precalculus through calculus. No backend, no
accounts: every trainer is a self-contained page, and progress lives in the
visitor's own browser.

    index.html            hub linking every trainer
    recall/               the Recall trainer (the new one)
      index.html          page shell + styles (the view's CSS variables)
      app.mjs             view layer: DOM, KaTeX, clock, localStorage
      engine.mjs          selection, filtering, sessions, scoring — no DOM
      cards.json          the 443-card bank (generated; do not hand-edit)
    trainers/             the standalone problem trainers
                          limits · derivatives · integrals · volumes · arcs · surfaces
                          (the old filenames are kept as redirect stubs)
    shared/               code more than one trainer uses
      calc-engine.js      exact rationals, polynomials, rendering, answer parsing
      scratchpad.js       the <scratch-pad> element (pannable, zoomable canvas)
    dist/                 one-file build of Recall, for hosts without sibling files
    src/                  sources and tooling for the card bank
      data/source.mjs     hand-written content: closure pairs + recall cards
      data/unitcircle.mjs generates the 170 unit-circle cards
      build.mjs           validates everything, writes ../recall/cards.json
      bundle.mjs          writes ../dist/recall-standalone.html
      review.html         plain listing of every card, for proofreading
      test/               engine tests

## Working on it

    cd src && npm install
    npm run build      # rebuild cards.json + review.html (refuses on any error)
    npm test           # engine tests
    npm run bundle     # rebuild the one-file version

`npm run build` fails loudly rather than shipping a bad deck. It rejects: LaTeX
that will not parse, a card without exactly three distinct distractors, a
duplicate card, an equivalent form used as a distractor on a card with the same
prompt, and any antiderivative whose numerical derivative does not match its
integrand. Unit-circle values are computed, never typed.

## The calculus trainers

`trainers/*.html` are self-contained pages that generate problems rather than
store them, so the bank is effectively unbounded. They share `shared/`:
`scratchpad.js` gives every problem page the same scratch paper, and
`calc-engine.js` holds the arithmetic three of them are built on.

`calc-engine.js` exists because Revolution, Arc Length and Surface Area are the
same computation with a different integrand:

    revolution   V = π ∫ R² dv     or  2π ∫ (radius)(height) dv
    arc length   L =   ∫ ds            ds = √(1 + [y′]²) dv
    surface      S = 2π ∫ (radius) ds

So all three reduce to: build a polynomial with rational exponents, integrate it
exactly, render it. The module provides BigInt rational arithmetic, polynomials
in rational powers (`x^(3/2)` and `1/x²` live in one object), exact definite
integration including the `x⁻¹ → ln` case, the shared math-rendering vocabulary,
and the typed-answer parser.

It also provides `conj(a, p)`, the conjugate family — the reason textbook
arc-length curves all look like `x³/6 + 1/(2x)`. When

    y′ = a·xᵖ − (1/4a)·x⁻ᵖ

the cross terms in `1 + [y′]²` cancel to exactly +½, so the radicand is a
perfect square and `ds` is an ordinary polynomial. Arc Length integrates it;
Surface Area multiplies it by a radius first. One construction, both trainers,
both orientations.

Everything else — trig and hyperbolic substitution, parametric, polar — supplies
its own closed form, checked against numerical integration of the curve.

Answers are graded numerically with a relative tolerance, so any equivalent form
passes: `17/12`, `1.41666`, `pi/6(17sqrt(17)-1)` and `2pi(15/8+ln(2)/2)` all
parse. Implicit multiplication by a bare number binds tighter than division
(`1/2pi` is `1/(2π)`) but a parenthesised group does not (`pi/6(…)` is
`(π/6)·(…)`), which is how the printed exact answers read.

## The three layers

Data, engine and view are separate on purpose: a redesign replaces the view
only, and content edits touch `src/data/` plus a rebuild.

Card shape:

    { id, course, group, family, level (1-3), kind: "choice" | "tap",
      prompt, answer, distractors[3], note?, reverse?,
      deg?: { prompt, answer?, distractors? },   // degree-mode overrides
      index? }                                    // tap cards: angle index 0-15

`id` is a hash of the card's content, so reordering the source never resets
saved progress.

Engine API:

    buildTree(bank)                       course -> group -> family, with counts
    defaultState(tree)                    every family at hard, radians
    nodeLevel(state, tree, id)            0 off, 1 easy, 2 medium, 3 hard, or "mixed"
    cycle(state, tree, id)                off -> easy -> medium -> hard -> off; mixed -> hard
    setNodeLevel(state, tree, id, level)
    isOn / isSoloed / solo (state, tree, id)
    setDegrees(state, bool)
    pool(bank, state)
    createSession(cards, { degrees, timeLimitMs, rng })
      .next() .answer(i, ms) .answerTap(theta, ms) .stats()

Level lives on each family, not each course, and is cumulative: a family at
medium plays its easy and medium cards. Course and group nodes read their
families, so cycling a course moves all of them together.

## Content rules

Every card is a table form. Symbolic parameters (`a`, `n`) are allowed; specific
instances (sin 3x) are not. Derivative and integral cards are generated in pairs
from the same base fact, so no fact appears in one direction only. Where a table
lists two forms of one answer they become separate cards, and neither is ever a
distractor on the other. Answers are rationalized; inverse-secant forms use |x|.
Distractors are hand-written common mistakes, not random wrong answers.

## Deploying

The live site is served by GitHub Pages (Deploy from a branch: `main` / root),
so **a push to `main` redeploys it** — no build step, no Actions workflow.
Deploying is deliberately gated on a push, *not* on a commit: you can commit
work in progress freely without touching the live site, and it goes live only
when you push.

    # iterate: edit, then preview locally (modules need a real server)
    python3 -m http.server 8000        # from the repo root → http://localhost:8000/
    git commit -am "wip: recolour Recall"   # checkpoint — does NOT deploy

    # when you're happy, ship it:
    git ship        # alias for `git push origin main`; Pages redeploys in ~1 min

`git ship` is a local alias (`git config alias.ship …`); plain
`git push origin main` does the same. Hard-refresh if a change doesn't show —
Pages caches.

Design edits (e.g. a colour scheme) live in the CSS variables at the top of
`index.html` (hub), `recall/index.html` (Recall), and each `trainers/*.html`.
Every `var()` in those files must resolve in the same file — an undefined custom
property is *invalid at computed-value time* and paints transparent rather than
falling back to an earlier rule, which is how a page can silently turn white.
The one-file `dist/` build is a separate artifact and is not what the live site
serves. Content edits still go through `src/data/` + `npm run build` (see
above), which regenerates `recall/cards.json`.

## License

MIT — see [LICENSE](LICENSE).
