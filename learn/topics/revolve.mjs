import { Plot, slider, segmented, readout } from "../plot.mjs";
import { prose, note, figure, heading, pair } from "../ui.mjs";

// y = sqrt(x) on [0,4], revolved about the x-axis. Chosen because disk and
// shell both work on it and give the same number, which is the point.
const f = Math.sqrt;
const A = 0, B = 4;

export default {
  id: "revolve",
  course: "Applications",
  title: "Disks versus shells",
  blurb: "The same solid, sliced two ways — and why the choice of slice is the whole problem.",

  build(root) {
    let method = "disk", t = 2.2;

    const flat = new Plot({ xmin: -0.6, xmax: 4.6, ymin: -2.4, ymax: 2.4, height: 270,
                            label: "the region and one representative slice" });
    const solid = new Plot({ xmin: -0.6, xmax: 4.6, ymin: -2.4, ymax: 2.4, height: 270,
                             label: "the piece that slice sweeps out" });
    const ro = readout({ slice: "Slice", vol: "Its volume", total: "Total volume" });

    const draw = () => {
      // ---- left: the region in the plane ----
      flat.clear();
      flat.axes({ xLabel: "x", yLabel: "y" });
      flat.area(f, A, B, { class: "region" });
      flat.area((x) => -f(x), A, B, { class: "region faint" });
      flat.curve(f, { from: A, to: B });
      flat.curve((x) => -f(x), { from: A, to: B, class: "ghost" });

      // ---- right: the swept piece ----
      solid.clear();
      solid.axes({ xLabel: "x", numbers: false });
      // the solid's silhouette
      solid.area(f, A, B, { class: "region faint" });
      solid.area((x) => -f(x), A, B, { class: "region faint" });
      solid.ellipse(B, 0, 0.26, f(B), { class: "cap" });

      if (method === "disk") {
        // a vertical slice sweeps a disk of radius f(t)
        const r = f(t);
        flat.line(t, -r, t, r, { class: "slicer" });
        flat.dot(t, r, { r: 3, class: "anchor" });
        flat.text(t, r, "r = f(x)", { dx: 6, dy: -6, class: "small" });

        solid.ellipse(t, 0, 0.26, r, { class: "disk" });
        solid.line(t, 0, t, r, { class: "slicer" });

        const dv = Math.PI * r * r;
        ro.set("slice", `vertical at x = ${t.toFixed(2)}`);
        ro.set("vol", `π·r²·dx = ${dv.toFixed(3)}·dx`);
        ro.set("total", `π∫₀⁴ x dx = 8π ≈ ${(8 * Math.PI).toFixed(3)}`);
      } else {
        // a horizontal slice sweeps a cylindrical shell of radius y
        const y = (t / B) * f(B);          // reuse the slider as a y-position
        const xLeft = y * y;               // x = y² is the curve, solved for x
        flat.line(xLeft, y, B, y, { class: "slicer" });
        flat.dot(xLeft, y, { r: 3, class: "anchor" });
        flat.text((xLeft + B) / 2, y, "height = 4 − y²", { dy: -7, class: "small", anchor: "middle" });

        solid.ellipse((xLeft + B) / 2, 0, (B - xLeft) / 2, y, { class: "shell" });
        solid.line(xLeft, y, B, y, { class: "slicer" });
        solid.line(xLeft, -y, B, -y, { class: "slicer" });

        const dv = 2 * Math.PI * y * (B - y * y);
        ro.set("slice", `horizontal at y = ${y.toFixed(2)}`);
        ro.set("vol", `2π·y·(4−y²)·dy = ${dv.toFixed(3)}·dy`);
        ro.set("total", `2π∫₀² y(4−y²) dy = 8π ≈ ${(8 * Math.PI).toFixed(3)}`);
      }
    };

    root.append(
      prose(`Revolve the region under $y=\\sqrt{x}$ from $0$ to $4$ about the $x$-axis. The solid
        is a horn lying on its side. There are two honest ways to cut it up, and they give the
        same number — but one of them is much less work, and knowing which <em>before</em> you
        start is the actual skill.`),

      figure({
        caption: "Left: the region, with one slice. Right: what that slice sweeps out.",
        svg: pair(flat.svg, solid.svg),
        readout: ro,
        controls: [
          segmented({
            label: "Slice",
            options: [
              { value: "disk", label: "⊥ to axis — disks" },
              { value: "shell", label: "∥ to axis — shells" },
            ],
            value: method,
            onPick: (v) => { method = v; draw(); },
          }),
          slider({
            label: "Slice position", min: 0.08, max: 3.95, step: 0.01, value: t,
            format: (v) => (+v).toFixed(2),
            onInput: (v) => { t = v; draw(); },
          }),
        ],
      }),

      heading("The one rule"),
      note(`<b>Perpendicular to the axis gives disks. Parallel to the axis gives shells.</b>
        That is the entire decision. Everything else — which variable you integrate in, what the
        limits are, whether you need to solve the curve for the other variable — follows from it.`),
      prose(`Slice <em>perpendicular</em> to the axis of revolution and the slice sweeps a flat
        disc: radius $f(x)$, thickness $dx$, volume $\\pi f(x)^2\\,dx$. Slice <em>parallel</em> to
        the axis and the slice sweeps a thin cylindrical can: radius $y$, height equal to the
        slice's length, thickness $dy$, volume $2\\pi y\\cdot(\\text{height})\\,dy$ — the
        can unrolled into a rectangle.`),

      heading("Why you would ever pick the harder one"),
      prose(`Here, disks win outright: $\\pi\\int_0^4 x\\,dx$ is one line. Shells force you to
        rewrite $y=\\sqrt{x}$ as $x=y^2$, work out the height $4-y^2$, and integrate in $y$.
        Same answer, three times the work.`),
      prose(`Flip the axis of revolution and the verdict flips with it. Revolve the <em>same</em>
        region about the $y$-axis instead and the perpendicular slices become horizontal — now
        you need $x=y^2$ anyway, and washers appear because the slices no longer reach the axis.
        Shells become the easy route. The geometry decides, not the method.`),
      note(`<b>The practical test.</b> Ask which slicing lets you read the radius and the height
        straight off the picture without solving the curve for anything. That is the one to use.
        If both require solving, pick the one whose integral you would rather do.`),
    );

    draw();
  },
};
