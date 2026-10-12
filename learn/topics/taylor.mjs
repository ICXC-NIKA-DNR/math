import { Plot, slider, segmented, toggle, readout } from "../../shared/plot.mjs";
import { prose, note, figure, heading } from "../ui.mjs";

// Each entry supplies the function and the nth Taylor coefficient about 0, so
// the partial sum is built term by term rather than from a stored formula.
const FNS = {
  exp: {
    label: "eˣ", tex: "e^{x}", f: Math.exp,
    coef: (n) => 1 / fact(n),
    radius: Infinity, win: [-4.2, 4.2, -2, 12],
  },
  sin: {
    label: "sin x", tex: "\\sin x", f: Math.sin,
    coef: (n) => (n % 2 === 0 ? 0 : ((-1) ** ((n - 1) / 2)) / fact(n)),
    radius: Infinity, win: [-9, 9, -3.2, 3.2],
  },
  cos: {
    label: "cos x", tex: "\\cos x", f: Math.cos,
    coef: (n) => (n % 2 ? 0 : ((-1) ** (n / 2)) / fact(n)),
    radius: Infinity, win: [-9, 9, -3.2, 3.2],
  },
  geo: {
    label: "1/(1−x)", tex: "\\frac{1}{1-x}", f: (x) => 1 / (1 - x),
    coef: () => 1,
    radius: 1, win: [-2.4, 2.4, -3, 6],
  },
  log: {
    label: "ln(1+x)", tex: "\\ln(1+x)", f: (x) => Math.log(1 + x),
    coef: (n) => (n === 0 ? 0 : ((-1) ** (n + 1)) / n),
    radius: 1, win: [-2.2, 2.6, -3.4, 2.2],
  },
};

const fact = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };

export default {
  id: "taylor",
  course: "Series",
  title: "Taylor polynomials",

  build(root) {
    let key = "exp", deg = 1, showErr = false;

    const plot = new Plot({ height: 340, label: "a function and its Taylor polynomial" });
    const ro = readout({ at1: "Error inside", at2: "Error outside", r: "Radius" });

    const poly = (spec, n) => (x) => {
      let s = 0;
      for (let k = 0; k <= n; k++) {
        const c = spec.coef(k);
        if (c) s += c * x ** k;
      }
      return s;
    };

    const draw = () => {
      const spec = FNS[key];
      [plot.xmin, plot.xmax, plot.ymin, plot.ymax] = spec.win;
      plot.clear();
      plot.axes({ xLabel: "x", yLabel: "y" });

      const P = poly(spec, deg);

      // the interval of convergence, where there is one
      if (Number.isFinite(spec.radius)) {
        plot.rect(-spec.radius, plot.ymin, 2 * spec.radius, plot.ymax - plot.ymin, { class: "band" });
        for (const s of [-1, 1]) {
          plot.line(s * spec.radius, plot.ymin, s * spec.radius, plot.ymax, { class: "edge" });
        }
      }

      if (showErr) {
        plot.area((x) => spec.f(x), plot.xmin, plot.xmax, { under: P, class: "errband" });
      }

      plot.curve(spec.f, { class: "ghost" });
      plot.curve(P);
      plot.dot(0, spec.f(0), { class: "anchor" });

      // Sample relative to the radius, so the two columns always mean
      // "well inside" and "well outside" rather than two fixed points that
      // happen to be outside for every series with R = 1.
      const R = spec.radius;
      const xIn = Number.isFinite(R) ? R / 2 : 1;
      const xOut = Number.isFinite(R) ? R * 1.6 : 4;
      const err = (x) => Math.abs(P(x) - spec.f(x));
      const show = (e) => (!Number.isFinite(e) ? "—" : e < 1e-9 ? "0" : e.toExponential(2));
      const grade = (e) => (!Number.isFinite(e) ? "bad" : e < 1e-4 ? "good" : e < 0.5 ? "warn" : "bad");

      ro.label("at1", `Error at x = ${xIn}`);
      ro.label("at2", `Error at x = ${xOut}`);
      ro.set("at1", show(err(xIn)), grade(err(xIn)));
      ro.set("at2", show(err(xOut)), grade(err(xOut)));
      ro.set("r", Number.isFinite(R) ? `R = ${R}` : "R = ∞");
    };

    const degCtl = slider({
      label: "Degree n", min: 0, max: 24, step: 1, value: deg,
      onInput: (v) => { deg = v; draw(); },
    });

    root.append(
      prose(`A Taylor polynomial is the best polynomial of its degree near one point. Degree 1 is
        the tangent line. Degree 2 adds the right curvature. Each further term fixes one more
        derivative at the centre:`),
      prose(`$$P_n(x)=\\sum_{k=0}^{n}\\frac{f^{(k)}(0)}{k!}\\,x^{k}$$`),

      figure({
        caption: "The faint curve is the real function. Raise n and watch the match spread.",
        svg: plot.svg,
        readout: ro,
        controls: [
          segmented({
            label: "Function",
            options: Object.entries(FNS).map(([v, o]) => ({ value: v, label: o.label })),
            value: key,
            onPick: (v) => { key = v; draw(); },
          }),
          degCtl,
          toggle({ label: "Shade the error", value: showErr, onChange: (v) => { showErr = v; draw(); } }),
        ],
      }),

      heading("What to notice"),
      prose(`The agreement <strong>grows outward from the centre</strong>. It is always best at
        $x=0$ and decays as you move away — adding terms pushes the good region wider, it does not
        improve all of it evenly. That is why "near $a$" appears in every statement about Taylor
        series and is not a hedge.`),
      prose(`Switch to $\\sin x$ and raise $n$ one step at a time. Half the steps do nothing,
        because every even coefficient is zero — sine is odd, so only odd powers appear. Watching
        the picture freeze on even $n$ is a cleaner argument for that than checking the
        derivatives.`),

      heading("Where it stops working"),
      prose(`Now pick $\\frac{1}{1-x}$. The shaded band marks $|x|<1$. Inside it, cranking $n$
        drives the error to nothing. Outside it, cranking $n$ makes things <em>worse</em> — the
        polynomial runs away from the curve faster the more terms you add.`),
      note(`<b>The radius is set by the nearest singularity, even an invisible one.</b>
        $\\frac{1}{1-x}$ blows up at $x=1$, so $R=1$ is no surprise. But $\\frac{1}{1+x^{2}}$ is
        perfectly smooth on the whole real line and still has $R=1$ — because it blows up at
        $x=\\pm i$. The radius of convergence is a fact about the complex plane that leaks into
        the real one.`),
      prose(`$\\ln(1+x)$ is the borderline case worth staring at: $R=1$, and at the endpoint
        $x=1$ the series converges (to $\\ln 2$) while at $x=-1$ it diverges. Endpoints always
        have to be checked separately — the radius tells you nothing about them.`),
    );

    draw();
  },
};
