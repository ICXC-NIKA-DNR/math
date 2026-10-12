# Math trainers

Static site of practice tools for precalculus through calculus. No backend, no
accounts: every trainer is a self-contained page, and progress lives in the
visitor's own browser.

    index.html            hub linking every trainer
    learn/                interactive topic pages — figures you push on
      index.html          page shell + styles
      app.mjs             hash router: learn/#riemann is a linkable topic
      ui.mjs              prose, notes, figure frames, KaTeX typesetting
      imported.mjs        renders a graph brought over from Desmos
      topics/*.mjs        one module per topic
    convert/              LaTeX <-> typed math, and Desmos graph import
      index.html          page shell + styles
      convert.mjs         the translator (pure, unit-tested)
      eval.mjs            AST -> numeric function, so imports can be drawn
      app.mjs             view layer + PNG/SVG export
    recall/               the Recall trainer (the new one)
      index.html          page shell + styles (the view's CSS variables)
      app.mjs             view layer: DOM, KaTeX, clock, localStorage
      engine.mjs          selection, filtering, sessions, scoring — no DOM
      cards.json          the 443-card bank (generated; do not hand-edit)
    trainers/             the standalone problem trainers
                          limits · derivatives · integrals · volumes
                          arcs · surfaces · centroids
                          (the old filenames are kept as redirect stubs)
    shared/               code more than one trainer uses
      calc-engine.js      exact rationals, polynomials, rendering, answer parsing
      scratchpad.js       the <scratch-pad> element (pannable, zoomable canvas)
      plot.mjs            the figure kernel (SVG, maths coordinates in)
      graph.mjs           draws a Desmos-style expression list with plot.mjs
    dist/                 one-file build of Recall, for hosts without sibling files
    src/                  sources and tooling for the card bank
      data/source.mjs     hand-written content: closure pairs + recall cards
      data/unitcircle.mjs generates the 170 unit-circle cards
      build.mjs           validates everything, writes ../recall/cards.json
      bundle.mjs          writes ../dist/recall-standalone.html
      review.html         plain listing of every card, for proofreading
      test/               engine tests
      integrals/          the Integration Bench bank and its checker
        bank/*.mjs        the authored problems, one file per technique
        latex.mjs         LaTeX -> numeric JS, for the subset the bank writes
        verify.mjs        differentiates every answer, compares to its integrand
        build.mjs         merges, cross-lists, verifies, splices into the page

## Working on it

    cd src && npm install
    npm run build            # rebuild cards.json + review.html (refuses on any error)
    npm run build:integrals  # rebuild the Integration Bench bank (add --write)
    npm test                 # engine tests + every bench antiderivative
    npm run bundle           # rebuild the one-file version

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

`calc-engine.js` exists because Volumes, Arcs, Surfaces and Centroids are the
same computation with a different integrand:

    volumes      V = π ∫ R² dv     or  2π ∫ (radius)(height) dv
    arcs         L =   ∫ ds            ds = √(1 + [y′]²) dv
    surfaces     S = 2π ∫ (radius) ds
    centroids    A = ∫(top − bot) dx · M_y = ∫x(top − bot) dx · M_x = ½∫(top² − bot²) dx

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

Every trainer starts with **nothing selected** — no techniques, no categories, no
card families. A first visit shows the empty state ("No problems match your
filters") until you turn something on, so the deck is something you choose
rather than something you switch off. Saved selections are taken literally,
empty included: a technique you turned off stays off across reloads, and one
added to the bank later stays off until you turn it on. Difficulty is not part
of this — it is single-select on most pages, where "nothing selected" has no
meaning.

**The engine is versioned in the URL** — `calc-engine.js?v=2`. Bump that query
on every page that loads it whenever the engine changes. Without it a visitor
who already has the old file cached gets it served from disk, and any page
using a newly added function dies on load with `… is not a function`. The pages
themselves are one file each, so only the shared script needs this.

Answers are graded numerically with a relative tolerance, so any equivalent form
passes: `17/12`, `1.41666`, `pi/6(17sqrt(17)-1)` and `2pi(15/8+ln(2)/2)` all
parse. Implicit multiplication by a bare number binds tighter than division
(`1/2pi` is `1/(2π)`) but a parenthesised group does not (`pi/6(…)` is
`(π/6)·(…)`), which is how the printed exact answers read.

## The Integration Bench bank

Integrals cannot be generated the way the other trainers generate problems, so
the bench carries a curated bank instead — 446 problems, **all indefinite**.
Definite integrals were removed deliberately: the point of the bench is finding
an antiderivative, and the `improper` and `multi` categories went with them,
since neither has an indefinite form.

The bank lives in the page, but it is **authored in `src/integrals/bank/`** and
spliced in by `build.mjs`. Edit the chunk files, not the page.

Every answer is checked by differentiating it numerically and comparing to its
integrand, reading the same LaTeX string the page renders — so a typo in what
ships is a failing test, not a wrong answer a student has to catch.
`src/integrals/latex.mjs` parses the subset the bank writes in; the build
refuses to write if any problem fails or cannot be parsed at all. This is how
`∫x²sin x dx` got caught with a sign error and `-x^2` got caught parsing as
`(-x)^2`.

A problem needing two techniques is filed under **both**, one difficulty harder
in the second: mark it `also:'usub'` and the build emits the copy, tagged
`xref`. Where a cross-listed copy collides with a problem the target category
already has, the better-written entry wins.

## Learn

`learn/` is the one part of the site that explains rather than drills. Each
topic is a module under `learn/topics/` exporting `{ id, course, title, blurb,
build(root) }`, listed on the index and routed by hash — `learn/#riemann` is a
link you can send someone mid-session.

Figures are hand-rolled SVG through `learn/plot.mjs`, not embedded Desmos.
Desmos would have been faster to build with, but it is a white-and-blue
calculator UI that cannot be themed to this palette, it puts a third-party
runtime on a static site, and a constrained figure teaches better than a
general calculator — the reader should be moving `n`, not editing the function.

A topic never names a colour or a pixel: it passes mathematical coordinates and
the kernel maps them, with every mark themed by CSS variable. Draggable handles
are keyboard-operable, because a figure that needs a mouse is a figure half the
readers cannot use.

## Convert

`convert/` does two jobs with one translator:

- **typed math → LaTeX**, rendered and downloadable as PNG or SVG, for dropping
  a worked line into notes or slides
- **a pasted Desmos graph → NOUS rows**, reading either the saved-state JSON
  (`Calc.getState()` in the browser console) or bare lines of LaTeX

### Desmos → a figure on this site

The point of the import is not the text, it is the picture. Paste a graph and
it is **drawn immediately**, in this site's palette, with every Desmos slider
still live. `convert/eval.mjs` compiles the AST to a numeric function over a
scope object, and `shared/graph.mjs` classifies each expression by shape and
draws it:

    y = f(x) / bare f(x)   explicit        sampled across the window
    x = f(y)               explicit in y   sampled down it
    r = f(theta)           polar           swept two turns
    (f(t), g(t))           parametric      swept over t
    (a, b) and [(a,b),…]   points          dots
    F(x,y) = 0             implicit        marching squares
    F(x,y) < 0             inequality      shaded cell by cell
    a = 3                  definition      becomes a slider

Compiling to a closure over a shared scope is what makes sliders cheap: moving
one writes a number and redraws, with no recompilation per frame.

**To put an imported graph in a Learn topic:** press *Copy figure for Learn*,
paste the JSON into a topic file, and render it with `importedFigure(spec)`
from `learn/imported.mjs`. `learn/topics/polar.mjs` is a worked example. The
spec is plain data — expressions and a window — so it stays editable by hand
afterwards.

Both text directions go through one AST in `convert/convert.mjs` rather than
trading regexes, because the hard cases are structural: `a/b/c` has to become the right
nested `\frac`, and `-x^2` must not come back as `(-x)^2`. The module is pure
and covered by `src/test/convert.test.mjs`, which includes round-trip stability
checks.

This is deliberately *not* the parser in `src/integrals/latex.mjs`. That one
evaluates a known subset numerically; this one translates a wider surface that
includes things with no numeric value at all (`\int`, `\sum`, `dx`, domain
restrictions) and must never silently drop what it cannot read.

The page loads MathJax — the only page that does — purely for its SVG output.
MathJax draws glyphs as paths, so the result rasterises to PNG with no font
dependency; KaTeX, which every other page uses, emits font-dependent HTML that
cannot be turned into an image cleanly.

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
