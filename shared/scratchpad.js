/* <scratch-pad> — a window onto an endless sheet of graph paper.
 *
 * Scratch paper for working a problem out on one device. The element is a
 * fixed-size viewport; the paper underneath is unbounded. Two-finger scroll
 * (or a mouse wheel) pans the sheet, dragging draws on it.
 *
 *   <script src="../shared/scratchpad.js" defer></script>
 *   <scratch-pad accent="#EBD9A8" height="330"></scratch-pad>
 *
 * Attributes
 *   accent   pen colour and UI highlight; defaults to a soft white
 *   height   viewport height in px (default 330)
 *
 * Shadow DOM keeps its styles from colliding with whatever page hosts it,
 * which matters here: the five trainers share no CSS.
 */
(function () {
  'use strict';
  if (customElements.get('scratch-pad')) return;

  const GRID = 26;          // paper ruling, in world units
  const MAJOR = 5;          // every Nth line is a heavier rule
  const MAX_STROKES = 4000; // generous; guards runaway memory

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
.ttl{
  font-size:10.5px; letter-spacing:.11em; text-transform:uppercase;
  color:var(--sp-faint,#666); margin-right:2px;
}
.sp{flex:1}
button{
  font:inherit; font-size:12px; padding:5px 10px; border-radius:5px; cursor:pointer;
  border:1px solid var(--sp-rule,#242424); background:transparent;
  color:var(--sp-dim,#A0A0A0); transition:color .15s,border-color .15s,background .15s;
}
button:hover:enabled{ color:var(--sp-tx,#F4F4F4); border-color:var(--sp-accent); }
button:disabled{ opacity:.32; cursor:not-allowed; }
button.on{ border-color:var(--sp-accent); color:var(--sp-accent);
  background:color-mix(in srgb, var(--sp-accent) 12%, transparent); }
button.ghost{ border-color:transparent; }
.hint{ font-size:11px; color:var(--sp-faint,#666); }
.stage{ position:relative; }
canvas{ display:block; width:100%; touch-action:none; cursor:crosshair; }
canvas.panning{ cursor:grabbing; }
/* the viewport edge — makes it read as a window onto something larger */
.stage::after{
  content:""; position:absolute; inset:0; pointer-events:none;
  box-shadow:inset 0 0 22px rgba(0,0,0,.55);
}
.recenter{
  position:absolute; right:10px; bottom:10px; z-index:2;
  opacity:0; transform:translateY(4px); transition:opacity .18s, transform .18s;
  background:rgba(0,0,0,.72); backdrop-filter:blur(3px);
}
.recenter.show{ opacity:1; transform:none; }
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
            <button id="undo" title="Undo (Ctrl+Z)" disabled>Undo</button>
            <button id="redo" title="Redo (Ctrl+Shift+Z)" disabled>Redo</button>
            <button id="clear" title="Clear the sheet" disabled>Clear</button>
          </div>
          <div class="stage">
            <canvas id="c" style="height:${height}px"></canvas>
            <button id="recenter" class="recenter" title="Back to the middle">Recenter</button>
          </div>
        </div>`;

      this._c = root.getElementById('c');
      this._ctx = this._c.getContext('2d');
      this._accent = accent;
      this._strokes = [];      // committed strokes, in world coordinates
      this._undone = [];       // redo stack
      this._live = null;       // stroke in progress
      this._off = { x: 0, y: 0 };   // world coord at the viewport's top-left
      this._tool = 'pen';
      this._dpr = 1;

      this._wire(root);
      this._fit();
      // keep the bitmap in step with layout changes and zoom
      this._ro = new ResizeObserver(() => this._fit());
      this._ro.observe(this._c);
    }

    disconnectedCallback() { this._ro && this._ro.disconnect(); }

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
    _toWorld(ev) {
      const r = this._c.getBoundingClientRect();
      return { x: ev.clientX - r.left + this._off.x, y: ev.clientY - r.top + this._off.y };
    }

    /* ---------- painting ---------- */
    _draw() {
      const ctx = this._ctx, dpr = this._dpr, w = this._w, h = this._h;
      if (!w) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // paper
      ctx.fillStyle = '#0C0C0C';
      ctx.fillRect(0, 0, w, h);

      // ruling, drawn in world space so panning is visible
      const ox = this._off.x, oy = this._off.y;
      const x0 = Math.floor(ox / GRID) * GRID, y0 = Math.floor(oy / GRID) * GRID;
      ctx.lineWidth = 1;
      for (let x = x0; x < ox + w + GRID; x += GRID) {
        const major = Math.round(x / GRID) % MAJOR === 0;
        ctx.strokeStyle = major ? 'rgba(150,160,185,.14)' : 'rgba(150,160,185,.06)';
        ctx.beginPath();
        ctx.moveTo(Math.round(x - ox) + .5, 0);
        ctx.lineTo(Math.round(x - ox) + .5, h);
        ctx.stroke();
      }
      for (let y = y0; y < oy + h + GRID; y += GRID) {
        const major = Math.round(y / GRID) % MAJOR === 0;
        ctx.strokeStyle = major ? 'rgba(150,160,185,.14)' : 'rgba(150,160,185,.06)';
        ctx.beginPath();
        ctx.moveTo(0, Math.round(y - oy) + .5);
        ctx.lineTo(w, Math.round(y - oy) + .5);
        ctx.stroke();
      }

      // the origin, so "recenter" means something
      ctx.strokeStyle = 'rgba(150,160,185,.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-ox - 7, -oy); ctx.lineTo(-ox + 7, -oy);
      ctx.moveTo(-ox, -oy - 7); ctx.lineTo(-ox, -oy + 7);
      ctx.stroke();

      // ink
      ctx.save();
      ctx.translate(-ox, -oy);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const all = this._live ? this._strokes.concat([this._live]) : this._strokes;
      for (const s of all) {
        if (s.pts.length < 2) {
          // a tap should still leave a dot
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

      const away = Math.abs(ox) > 40 || Math.abs(oy) > 40;
      this.shadowRoot.getElementById('recenter').classList.toggle('show', away);
    }

    _sync() {
      const r = this.shadowRoot;
      r.getElementById('undo').disabled = !this._strokes.length;
      r.getElementById('redo').disabled = !this._undone.length;
      r.getElementById('clear').disabled = !this._strokes.length;
    }

    /* ---------- input ---------- */
    _wire(root) {
      const c = this._c;

      // two-finger scroll / wheel pans the sheet
      c.addEventListener('wheel', (e) => {
        e.preventDefault();
        this._off.x += e.deltaX;
        this._off.y += e.deltaY;
        this._draw();
      }, { passive: false });

      c.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        c.setPointerCapture(e.pointerId);
        const p = this._toWorld(e);
        this._live = {
          pts: [p],
          color: this._tool === 'era' ? '#0C0C0C' : this._accent,
          width: this._tool === 'era' ? 16 : 2,
        };
        this._draw();
      });
      c.addEventListener('pointermove', (e) => {
        if (!this._live) return;
        const p = this._toWorld(e);
        const last = this._live.pts[this._live.pts.length - 1];
        if (Math.hypot(p.x - last.x, p.y - last.y) < 1.1) return;  // thin out
        this._live.pts.push(p);
        this._draw();
      });
      const end = () => {
        if (!this._live) return;
        if (this._strokes.length < MAX_STROKES) this._strokes.push(this._live);
        this._live = null;
        this._undone.length = 0;   // a new mark forks the history
        this._sync(); this._draw();
      };
      c.addEventListener('pointerup', end);
      c.addEventListener('pointercancel', end);
      c.addEventListener('pointerleave', end);

      const on = (id, fn) => root.getElementById(id).addEventListener('click', fn);
      on('pen', () => this._setTool('pen'));
      on('era', () => this._setTool('era'));
      on('undo', () => this.undo());
      on('redo', () => this.redo());
      on('clear', () => this.clear());
      on('recenter', () => { this._off.x = this._off.y = 0; this._draw(); });

      // Ctrl/Cmd+Z / Ctrl+Shift+Z, but only while the pad has the pointer,
      // so the trainers' own single-key shortcuts keep working.
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
