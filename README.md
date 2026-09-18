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
    trainers/             earlier standalone trainers
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

## License

MIT — see [LICENSE](LICENSE).
