import { Plot, slider, segmented, toggle, readout } from "../plot.mjs";
import { prose, note, figure, heading } from "../ui.mjs";

const FNS = {
  sq:  { label: "x²",    f: (x) => x * x,       d: (x) => 2 * x,          win: [-1, 3.2, -1.2, 6] },
  cub: { label: "x³−2x", f: (x) => x ** 3 - 2 * x, d: (x) => 3 * x * x - 2, win: [-2.2, 2.2, -3.2, 3.2] },
  sin: { label: "sin x", f: Math.sin,           d: Math.cos,              win: [-0.5, 6.4, -1.6, 1.6] },
  exp: { label: "eˣ",    f: Math.exp,           d: Math.exp,              win: [-2, 1.8, -0.6, 5] },
};

export default {
  id: "tangent",
  course: "Derivatives",
  title: "The derivative as a limit",
  blurb: "Slide the second point into the first and watch the secant become the tangent.",

  build(root) {
    let key = "sq", a = 1, h = 1.2, showTangent = true;

    const plot = new Plot({ height: 330, label: "Secant line approaching the tangent" });
    const ro = readout({ slope: "Secant slope", exact: "f′(a)", gap: "Difference" });
    let hCtl;

    const draw = () => {
      const { f, d, win } = FNS[key];
      [plot.xmin, plot.xmax, plot.ymin, plot.ymax] = win;
      plot.clear();
      plot.axes({ xLabel: "x", yLabel: "y" });

      const fa = f(a), fb = f(a + h);
      const secant = (fb - fa) / h;
      const exact = d(a);

      plot.curve(f);

      if (showTangent) plot.through(a, fa, exact, { class: "ghost" });
      plot.through(a, fa, secant, { class: "secant" });

      // the rise-over-run triangle, which is what the quotient literally is
      plot.line(a, fa, a + h, fa, { class: "run" });
      plot.line(a + h, fa, a + h, fb, { class: "rise" });
      plot.text(a + h / 2, fa, "h", { dy: 15, class: "small", anchor: "middle" });
      plot.text(a + h, (fa + fb) / 2, "Δy", { dx: 7, class: "small" });

      plot.dot(a, fa, { class: "anchor" });
      plot.grip(a + h, fb, {
        lo: plot.xmin + 0.05, hi: plot.xmax - 0.05,
        label: "second point",
        onMove: (x) => {
          let nh = x - a;
          if (Math.abs(nh) < 0.02) nh = nh < 0 ? -0.02 : 0.02;
          h = nh;
          hCtl.set(h.toFixed(2));
          draw();
        },
      });

      ro.set("slope", secant.toFixed(5));
      ro.set("exact", exact.toFixed(5));
      const gap = Math.abs(secant - exact);
      ro.set("gap", gap.toFixed(5), gap < 1e-3 ? "good" : gap < 0.2 ? "warn" : "bad");
    };

    hCtl = slider({
      label: "Separation h", min: -2, max: 2, step: 0.01, value: h,
      format: (v) => (+v).toFixed(2),
      onInput: (v) => { h = Math.abs(v) < 0.02 ? (v < 0 ? -0.02 : 0.02) : v; draw(); },
    });

    root.append(
      prose(`The slope of a curve at a point is not something you can measure directly — slope
        needs two points, and you have one. So take a second point $h$ away, measure the slope of
        the line through both, and then shrink $h$:`),
      prose(`$$f'(a)=\\lim_{h\\to 0}\\frac{f(a+h)-f(a)}{h}$$`),

      figure({
        caption: "Drag the open point, or scrub h. The faint line is the true tangent.",
        svg: plot.svg,
        readout: ro,
        controls: [
          segmented({
            label: "Function",
            options: Object.entries(FNS).map(([v, o]) => ({ value: v, label: o.label })),
            value: key,
            onPick: (v) => { key = v; a = v === "sin" ? 1 : v === "exp" ? 0 : 1; h = 1.2; hCtl.set(h); draw(); },
          }),
          hCtl,
          toggle({ label: "Show the true tangent", value: showTangent, onChange: (v) => { showTangent = v; draw(); } }),
        ],
      }),

      heading("What to notice"),
      prose(`Push $h$ toward zero from the right, then from the left. The secant swings, but it
        swings toward the <em>same</em> line from both sides. That agreement is the whole content
        of the limit existing — and when it fails, as at a corner, the derivative does not exist.`),
      prose(`Watch the difference column rather than the picture. At $h=1$ the secant slope is
        visibly wrong; at $h=0.1$ it is close; at $h=0.01$ it agrees to several decimals. The
        error shrinks in proportion to $h$, which is why the limit converges at all.`),
      note(`<b>The quotient is a fraction of two things that both vanish.</b> As $h\\to0$ the
        rise $\\Delta y$ and the run $h$ both go to zero, and $\\frac{0}{0}$ is meaningless. The
        ratio survives anyway because they vanish at the <em>same rate</em> — which is exactly
        what "differentiable" means.`),

      heading("Why the tangent is the best linear approximation"),
      prose(`Near $x=a$ the curve and its tangent are almost indistinguishable. That is the basis
        of linearisation, of Newton's method, and of the first term of every Taylor series:
        $f(x)\\approx f(a)+f'(a)(x-a)$. Set $h$ small and zoom in mentally — the curve looks
        straight, and the line it looks like is the tangent.`),
    );

    draw();
  },
};
