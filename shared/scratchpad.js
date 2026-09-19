/* <scratch-pad> — a window onto an endless sheet of graph paper.
 *
 * Scratch paper for working a problem out on one device. The element is a
 * fixed-size viewport; the paper underneath is unbounded and zoomable.
 *
 *   one finger / mouse / stylus ....... draw
 *   two fingers ....................... pan and pinch-zoom
 *   two-finger trackpad scroll ........ pan
 *   ctrl/⌘ + scroll, or pinch ......... zoom about the cursor
 *   − / + buttons ..................... zoom about the centre
 *
 *   <script src="../shared/scratchpad.js" defer></script>
 *   <scratch-pad accent="#EBD9A8" height="330"></scratch-pad>
 *
 * Attributes: accent (pen colour), height (viewport px, default 330).
 *
 * Shadow DOM keeps its styles from colliding with whatever page hosts it,
 * which matters here: the five trainers share no CSS.
 */
(function () {
  'use strict';
  if (customElements.get('scratch-pad')) return;

  const GRID = 26;            // paper ruling, world units
  const MAJOR = 5;            // every Nth line is heavier
  const MAX_STROKES = 4000;
  const MIN_SCALE = 0.25, MAX_SCALE = 5;

  const CSS = `
:host{ display:block; --sp-accent:#E8E8E8; }
.wrap{
  border:1px solid var(--sp-rule,#242424); border-radius:6px;
  background:var(--sp-panel,#111); overflow:hidden;
  font:13px/1.4 ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:var(--sp-dim,#A0A0A0);
}
.bar{
  display:flex; align-items:center; gap:7px; flex-wrap:wrap;
  padding:9px 12px; border-bottom:1px solid var(--sp-rule2,#1E1E1E);
  background:var(--sp-panel2,#141414);
}
.ttl{ font-size:10.5px; letter-spacing:.11em; text-transform:uppercase;
  color:var(--sp-faint,#666); margin-right:2px; }
.sp{ flex:1 }
.zoom{ display:flex; align-items:center; gap:4px; }
.zoom .pct{ font-family:ui-monospace,Menlo,Consolas,monospace; font-size:11px;
  color:var(--sp-faint,#666); min-width:38px; text-align:center;
  font-variant-numeric:tabular-nums; }
button{
  font:inherit; font-size:12px; padding:5px 10px; border-radius:5px; cursor:pointer;
  border:1px solid var(--sp-rule,#242424); background:transparent;
  color:var(--sp-dim,#A0A0A0); transition:color .15s,border-color .15s,background .15s;
}
button:hover:enabled{ color:var(--sp-tx,#F4F4F4); border-color:var(--sp-accent); }
button:disabled{ opacity:.32; cursor:not-allowed; }
button.on{ border-color:var(--sp-accent); color:var(--sp-accent);
  background:color-mix(in srgb, var(--sp-accent) 12%, transparent); }
button.sq{ padding:5px 9px; font-family:ui-monospace,Menlo,Consolas,monospace; }
.stage{ position:relative; }
canvas{ display:block; width:100%; touch-action:none; cursor:crosshair;
  -webkit-user-select:none; user-select:none; }
canvas.gesture{ cursor:grabbing; }
.stage::after{ content:""; position:absolute; inset:0; pointer-events:none;
  box-shadow:inset 0 0 22px rgba(0,0,0,.55); }
.recenter{
  position:absolute; right:10px; bottom:10px; z-index:2;
  opacity:0; transform:translateY(4px); transition:opacity .18s, transform .18s;
  background:rgba(0,0,0,.72); backdrop-filter:blur(3px); pointer-events:none;
}
.recenter.show{ opacity:1; transform:none; pointer-events:auto; }
@media (prefers-reduced-motion:reduce){ .recenter{ transition:none } }
`;

  class ScratchPad extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;

      const accent = this.getAttribute('accent') || '#E8E8E8';
      const height = parseInt(this.getAttribute('height'), 10) || 330;

      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
        <style>${CSS}</style>
        <div class="wrap" style="--sp-accent:${accent}">
          <div class="bar">
            <span class="ttl">Scratch paper</span>
            <button id="pen" class="on" title="Draw">Pen</button>
            <button id="era" title="Erase">Eraser</button>
            <span class="sp"></span>
            <span class="zoom">
              <button id="zout" class="sq" title="Zoom out">&minus;</button>
              <span class="pct" id="pct">100%</span>
              <button id="zin" class="sq" title="Zoom in">+</button>
            </span>
            <button id="undo" title="Undo (Ctrl+Z)" disabled>Undo</button>
            <button id="redo" title="Redo (Ctrl+Shift+Z)" disabled>Redo</button>
            <button id="clear" title="Clear the sheet" disabled>Clear</button>
          </div>
          <div class="stage">
            <canvas id="c" style="height:${height}px"></canvas>
            <button id="recenter" class="recenter" title="Back to the middle at 100%">Recenter</button>
          </div>
        </div>`;

      this._c = root.getElementById('c');
      this._ctx = this._c.getContext('2d');
      this._accent = accent;
      this._strokes = [];
      this._undone = [];
      this._live = null;
      this._off = { x: 0, y: 0 };   // world coord at the viewport's top-left
      this._scale = 1;
      this._tool = 'pen';
      this._dpr = 1;
      this._pointers = new Map();   // active pointers, for multi-touch gestures
      this._gesture = null;         // {dist, mid} from the previous move

      this._wire(root);
      this._fit();
      this._ro = new ResizeObserver(() => this._fit());
      this._ro.observe(this._c);
    }

    disconnectedCallback() {
      this._ro && this._ro.disconnect();
      if (this._raf) cancelAnimationFrame(this._raf);
      document.removeEventListener('keydown', this._hot);
    }

    /* ---------- geometry ---------- */
    _fit() {
      const dpr = window.devicePixelRatio || 1;
      const r = this._c.getBoundingClientRect();
      if (!r.width) return;
      this._dpr = dpr;
      this._c.width = Math.round(r.width * dpr);
      this._c.height = Math.round(r.height * dpr);
      this._w = r.width; this._h = r.height;
      this._draw();
    }
    _local(ev) {
      const r = this._c.getBoundingClientRect();
      return { x: ev.clientX - r.left, y: ev.clientY - r.top };
    }
    _toWorld(ev) {
      const p = this._local(ev);
      return { x: p.x / this._scale + this._off.x, y: p.y / this._scale + this._off.y };
    }
    /** Zoom so the world point under (sx,sy) stays under (sx,sy). */
    _zoomAt(sx, sy, next) {
      next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
      if (next === this._scale) return;
      const wx = sx / this._scale + this._off.x;
      const wy = sy / this._scale + this._off.y;
      this._scale = next;
      this._off.x = wx - sx / next;
      this._off.y = wy - sy / next;
      this._draw();
    }
    _zoomCentre(mult) {
      this._zoomAt(this._w / 2, this._h / 2, this._scale * mult);
    }

    /* ---------- painting ---------- */
    _draw() {
      const ctx = this._ctx, dpr = this._dpr, w = this._w, h = this._h, k = this._scale;
      if (!w) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0C0C0C';
      ctx.fillRect(0, 0, w, h);

      // ruling — drawn in screen space from world positions, so lines stay
      // 1px crisp at any zoom. Step widens when zoomed out so it never turns
      // into a solid wash.
      let step = GRID;
      while (step * k < 7) step *= MAJOR;
      const left = this._off.x, top = this._off.y;
      const right = left + w / k, bottom = top + h / k;
      const x0 = Math.floor(left / step) * step, y0 = Math.floor(top / step) * step;
      ctx.lineWidth = 1;
      for (let x = x0; x <= right; x += step) {
        const major = Math.round(x / step) % MAJOR === 0;
        ctx.strokeStyle = major ? 'rgba(150,160,185,.14)' : 'rgba(150,160,185,.06)';
        const sx = Math.round((x - left) * k) + .5;
        ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, h); ctx.stroke();
      }
      for (let y = y0; y <= bottom; y += step) {
        const major = Math.round(y / step) % MAJOR === 0;
        ctx.strokeStyle = major ? 'rgba(150,160,185,.14)' : 'rgba(150,160,185,.06)';
        const sy = Math.round((y - top) * k) + .5;
        ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(w, sy); ctx.stroke();
      }

      // origin marker, so Recenter means something
      const ox = (0 - left) * k, oy = (0 - top) * k;
      ctx.strokeStyle = 'rgba(150,160,185,.22)';
      ctx.beginPath();
      ctx.moveTo(ox - 7, oy); ctx.lineTo(ox + 7, oy);
      ctx.moveTo(ox, oy - 7); ctx.lineTo(ox, oy + 7);
      ctx.stroke();

      // ink, in world space
      ctx.save();
      ctx.scale(k, k);
      ctx.translate(-left, -top);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const all = this._live ? this._strokes.concat([this._live]) : this._strokes;
      for (const s of all) {
        if (s.pts.length < 2) {
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(s.pts[0].x, s.pts[0].y, s.width / 2, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
        ctx.strokeStyle = s.color; ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(s.pts[0].x, s.pts[0].y);
        for (let i = 1; i < s.pts.length; i++) ctx.lineTo(s.pts[i].x, s.pts[i].y);
        ctx.stroke();
      }
      ctx.restore();

      this.shadowRoot.getElementById('pct').textContent = Math.round(k * 100) + '%';
      const moved = Math.abs(this._off.x) > 40 || Math.abs(this._off.y) > 40
                 || Math.abs(k - 1) > 0.01;
      this.shadowRoot.getElementById('recenter').classList.toggle('show', moved);
    }

    _sync() {
      const r = this.shadowRoot;
      r.getElementById('undo').disabled = !this._strokes.length;
      r.getElementById('redo').disabled = !this._undone.length;
      r.getElementById('clear').disabled = !this._strokes.length;
    }

    /* ---------- gestures ---------- */
    _twoFinger() {
      const pts = [...this._pointers.values()];
      const dx = pts[0].x - pts[1].x, dy = pts[0].y - pts[1].y;
      return {
        dist: Math.hypot(dx, dy) || 1,
        mid: { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 },
      };
    }
    /** Pointer moves arrive one at a time, so reading the pair mid-update
     *  measures a distance that is briefly wrong and makes a straight pan
     *  drift in zoom. Coalescing to one update per frame pairs both fingers'
     *  latest positions; the deadzone absorbs what is left. */
    _scheduleGesture() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => {
        this._raf = null;
        if (this._pointers.size < 2) return;
        const now = this._twoFinger(), prev = this._gesture;
        if (prev) {
          const ratio = now.dist / prev.dist;
          if (Math.abs(ratio - 1) > 0.004) {
            this._zoomAt(prev.mid.x, prev.mid.y, this._scale * ratio);
          }
          this._off.x -= (now.mid.x - prev.mid.x) / this._scale;
          this._off.y -= (now.mid.y - prev.mid.y) / this._scale;
          this._draw();
        }
        this._gesture = now;
      });
    }

    /** A second finger means this was never a stroke — drop it, don't commit. */
    _abandonStroke() {
      if (!this._live) return;
      this._live = null;
      this._draw();
    }

    /* ---------- input ---------- */
    _wire(root) {
      const c = this._c;

      c.addEventListener('wheel', (e) => {
        e.preventDefault();
        const p = this._local(e);
        if (e.ctrlKey || e.metaKey) {
          // trackpad pinch and ctrl+wheel both arrive here
          this._zoomAt(p.x, p.y, this._scale * Math.exp(-e.deltaY * 0.01));
        } else {
          this._off.x += e.deltaX / this._scale;
          this._off.y += e.deltaY / this._scale;
          this._draw();
        }
      }, { passive: false });

      c.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        c.setPointerCapture(e.pointerId);
        this._pointers.set(e.pointerId, this._local(e));

        if (this._pointers.size >= 2) {
          this._abandonStroke();              // the line-between-fingers bug
          this._gesture = this._twoFinger();
          c.classList.add('gesture');
          return;
        }
        const p = this._toWorld(e);
        this._live = {
          pts: [p],
          color: this._tool === 'era' ? '#0C0C0C' : this._accent,
          // keep the nib a constant size on screen whatever the zoom
          width: (this._tool === 'era' ? 16 : 2) / this._scale,
        };
        this._draw();
      });

      c.addEventListener('pointermove', (e) => {
        if (!this._pointers.has(e.pointerId)) return;
        this._pointers.set(e.pointerId, this._local(e));

        if (this._pointers.size >= 2) { this._scheduleGesture(); return; }
        if (!this._live) return;
        const p = this._toWorld(e);
        const last = this._live.pts[this._live.pts.length - 1];
        if (Math.hypot(p.x - last.x, p.y - last.y) * this._scale < 1.1) return;
        this._live.pts.push(p);
        this._draw();
      });

      const lift = (e) => {
        this._pointers.delete(e.pointerId);
        if (this._pointers.size < 2) {
          this._gesture = null;
          c.classList.remove('gesture');
        }
        // only commit when the last pointer leaves, and only if it was a stroke
        if (this._pointers.size === 0 && this._live) {
          if (this._strokes.length < MAX_STROKES) this._strokes.push(this._live);
          this._live = null;
          this._undone.length = 0;
          this._sync(); this._draw();
        }
      };
      c.addEventListener('pointerup', lift);
      c.addEventListener('pointercancel', lift);

      const on = (id, fn) => root.getElementById(id).addEventListener('click', fn);
      on('pen', () => this._setTool('pen'));
      on('era', () => this._setTool('era'));
      on('zin', () => this._zoomCentre(1.25));
      on('zout', () => this._zoomCentre(1 / 1.25));
      on('undo', () => this.undo());
      on('redo', () => this.redo());
      on('clear', () => this.clear());
      on('recenter', () => {
        this._off.x = this._off.y = 0; this._scale = 1; this._draw();
      });

      // scoped to hover so the trainers' own single-key shortcuts still work
      this._hot = (e) => {
        if (!this.matches(':hover')) return;
        const k = e.key.toLowerCase();
        if ((e.ctrlKey || e.metaKey) && k === 'z') {
          e.preventDefault(); e.shiftKey ? this.redo() : this.undo();
        }
      };
      document.addEventListener('keydown', this._hot);
      this._sync();
    }

    _setTool(t) {
      this._tool = t;
      this.shadowRoot.getElementById('pen').classList.toggle('on', t === 'pen');
      this.shadowRoot.getElementById('era').classList.toggle('on', t === 'era');
    }

    /* ---------- public ---------- */
    undo() { if (this._strokes.length) { this._undone.push(this._strokes.pop()); this._sync(); this._draw(); } }
    redo() { if (this._undone.length) { this._strokes.push(this._undone.pop()); this._sync(); this._draw(); } }
    clear() {
      if (!this._strokes.length) return;
      this._undone = this._strokes.slice().reverse().concat(this._undone);
      this._strokes = [];
      this._sync(); this._draw();
    }
  }

  customElements.define('scratch-pad', ScratchPad);
})();
