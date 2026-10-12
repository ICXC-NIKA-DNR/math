import { importedFigure } from "../imported.mjs";
import { prose, note, heading } from "../ui.mjs";

// This figure came over from Desmos through the Convert applet: the spec below
// is exactly what "Copy figure for Learn" produced, pasted in and then edited
// by hand to widen the slider range. That is the intended workflow — build it
// where building is quick, keep it as data here.
const ROSE = {
  viewport: { xmin: -4.2, xmax: 4.2, ymin: -3, ymax: 3 },
  expressions: [
    { latex: "r=a\\cos\\left(kt\\right)" },
    { latex: "a=3", slider: { min: "0.5", max: "4", step: "0.1" } },
    { latex: "k=4", slider: { min: "1", max: "8", step: "1" } },
  ],
};

const LIMACON = {
  viewport: { xmin: -3.4, xmax: 4.6, ymin: -3, ymax: 3 },
  expressions: [
    { latex: "r=b+\\cos\\left(t\\right)" },
    { latex: "b=0.6", slider: { min: "0", max: "2.5", step: "0.05" } },
  ],
};

export default {
  id: "polar",
  course: "Applications",
  title: "Polar curves",

  build(root) {
    root.append(
      prose(`A polar equation gives the distance from the origin as a function of the angle:
        sweep $\\theta$ once around and let $r$ rise and fall. Everything surprising about these
        curves comes from one thing — $r$ is allowed to go negative, which flips the point
        through the origin rather than leaving a gap.`),

      importedFigure(ROSE, {
        caption: "r = a·cos(kθ). Change k by one and count the petals.",
      }),

      heading("Why k decides the petal count"),
      prose(`Step $k$ through the whole numbers and count. At $k=3$ there are three petals; at
        $k=4$ there are eight. The rule is <strong>odd $k$ gives $k$ petals, even $k$ gives
        $2k$</strong>, and the reason is the negative radius.`),
      prose(`When $k$ is odd, the second half of the sweep retraces the first: the sign flip in
        $r$ and the half-turn in $\\theta$ cancel exactly. When $k$ is even they do not cancel,
        the second half lands in the gaps, and you get twice as many petals.`),
      note(`<b>Count petals by hand before trusting the picture.</b> A plotter sampling too
        coarsely will happily draw a rose with the wrong number of petals, and at large $k$ it is
        very hard to tell by eye. The parity rule is the check.`),

      heading("The limaçon, and where the inner loop comes from"),
      importedFigure(LIMACON, {
        caption: "r = b + cos θ. Watch what happens as b passes 1.",
      }),
      prose(`Drag $b$ down from $2.5$. Above $b=1$ the curve is a dimpled oval. At exactly $b=1$
        it becomes a cardioid, with a single sharp cusp at the origin. Below $b=1$ an inner loop
        appears — and that loop is precisely the stretch of $\\theta$ where $r$ has gone
        negative.`),
      note(`<b>$b=1$ is a genuine transition, not a drawing artefact.</b> It is the value at
        which $r=0$ first has a solution. Below it there is an interval of angles with $r<0$,
        and every one of those points gets reflected through the origin — which is the loop.`),
    );
  },
};
