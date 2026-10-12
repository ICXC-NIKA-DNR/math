import { Plot, slider, segmented, readout } from "../../shared/plot.mjs";
import { prose, note, figure, heading } from "../ui.mjs";

// Four integrands with known exact values, so the error readout is honest
// rather than a second numerical estimate dressed up as truth.
const FNS = {
  sq:   { label: "x²",      f: (x) => x * x,            F: (x) => x ** 3 / 3,        tex: "f(x)=x^{2}",       win: [0, 3, 0, 9.6] },
  sin:  { label: "sin x",   f: Math.sin,                F: (x) => -Math.cos(x),      tex: "f(x)=\\sin x",     win: [0, Math.PI, 0, 1.25] },
  root: { label: "√x",      f: Math.sqrt,               F: (x) => (2 / 3) * x ** 1.5, tex: "f(x)=\\sqrt{x}",  win: [0, 4, 0, 2.4] },
  recip:{ label: "1/x",     f: (x) => 1 / x,            F: Math.log,                 tex: "f(x)=\\tfrac{1}{x}", win: [1, 4, 0, 1.2] },
};

const RULES = {
  left:  { label: "Left",      at: (a, h, i) => a + i * h },
  right: { label: "Right",     at: (a, h, i) => a + (i + 1) * h },
  mid:   { label: "Midpoint",  at: (a, h, i) => a + (i + 0.5) * h },
  trap:  { label: "Trapezoid", at: null },
};

export default {
  id: "riemann",
  course: "Integrals",
  title: "Riemann sums",
  blurb: "Watch rectangles become an integral, and see why the midpoint rule beats both endpoints.",

  build(root) {
    let key = "sq", rule = "left", n = 6;

    const plot = new Plot({ height: 320, label: "Riemann sum approximation" });
    const ro = readout({ approx: "Approximation", exact: "Exact", err: "Error" });

    const draw = () => {
      const { f, F, win } = FNS[key];
      const [a, b] = win;
      plot.xmin = win[0] - (win[1] - win[0]) * 0.08;
      plot.xmax = win[1] + (win[1] - win[0]) * 0.08;
      plot.ymin = win[2] - (win[3] - win[2]) * 0.1;
      plot.ymax = win[3];
      plot.clear();
      plot.axes({ xLabel: "x", yLabel: "y" });

      const h = (b - a) / n;
      let sum = 0;

      if (rule === "trap") {
        for (let i = 0; i < n; i++) {
          const xl = a + i * h, xr = xl + h;
          sum += ((f(xl) + f(xr)) / 2) * h;
          const d = `M${plot.sx(xl)} ${plot.sy(0)} L${plot.sx(xl)} ${plot.sy(f(xl))} ` +
                    `L${plot.sx(xr)} ${plot.sy(f(xr))} L${plot.sx(xr)} ${plot.sy(0)} Z`;
          const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
          p.setAttribute("d", d);
          p.setAttribute("class", "box slice");
          plot.add("fill", p);
        }
      } else {
        for (let i = 0; i < n; i++) {
          const xs = RULES[rule].at(a, h, i);
          const y = f(xs);
          sum += y * h;
          plot.rect(a + i * h, 0, h, y, { class: "slice" });
          plot.dot(xs, y, { r: 2.6, class: "sample" });
        }
      }

      plot.curve(f, { from: plot.xmin, to: plot.xmax });

      const exact = F(b) - F(a);
      ro.set("approx", sum.toFixed(6));
      ro.set("exact", exact.toFixed(6));
      const err = sum - exact;
      ro.set("err", (err >= 0 ? "+" : "") + err.toFixed(6),
             Math.abs(err) < 1e-3 ? "good" : Math.abs(err) < 5e-2 ? "warn" : "bad");
    };

    const nCtl = slider({
      label: "Rectangles n", min: 1, max: 200, step: 1, value: n,
      onInput: (v) => { n = v; draw(); },
    });

    root.append(
      prose(`A definite integral is defined as a limit of sums. Slice $[a,b]$ into $n$ pieces
        of width $h=\\frac{b-a}{n}$, pick a height on each slice, add the areas, and let
        $n\\to\\infty$. The picture below <em>is</em> that definition — the only thing the
        slider changes is $n$.`),

      figure({
        caption: "Drag n upward and watch the error column collapse.",
        svg: plot.svg,
        readout: ro,
        controls: [
          segmented({
            label: "Integrand",
            options: Object.entries(FNS).map(([v, o]) => ({ value: v, label: o.label })),
            value: key,
            onPick: (v) => { key = v; draw(); },
          }),
          segmented({
            label: "Height taken at",
            options: Object.entries(RULES).map(([v, o]) => ({ value: v, label: o.label })),
            value: rule,
            onPick: (v) => { rule = v; draw(); },
          }),
          nCtl,
        ],
      }),

      heading("What to notice"),
      prose(`Put $n$ at 4 and step through the four rules. On a curve that bends one way the
        whole time, <strong>left and right bracket the answer</strong> — one is always too small,
        the other always too big, and the true value is trapped between them. That is not luck;
        it is monotonicity.`),
      prose(`Now compare <strong>Midpoint</strong> and <strong>Trapezoid</strong> at the same $n$.
        Midpoint usually wins, which surprises people — a single height per slice beating an
        average of two. The reason is visible in the picture: the midpoint rectangle cuts the
        curve twice, and the triangle it loses on one side is very nearly the triangle it gains
        on the other.`),
      note(`<b>Why n matters more than the rule.</b> Doubling $n$ halves the error for the
        endpoint rules, but quarters it for midpoint and trapezoid. That is the difference
        between first-order and second-order accuracy, and it is why nobody integrates
        numerically with left endpoints.`),

      heading("From sum to integral"),
      prose(`Writing the sum out, $\\sum_{i=1}^{n} f(x_i)\\,h$, and letting $h\\to0$ gives
        $\\int_a^b f(x)\\,dx$. The notation is a picture of the limit: $\\int$ is a stretched
        S for "sum", and $dx$ is what is left of the width $h$. Every integral you compute by
        antidifferentiation is shorthand for this process — the Fundamental Theorem is the
        reason you never have to do it this way.`),
    );

    draw();
  },
};
