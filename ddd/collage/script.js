/* Collage explorer – no libraries, no build step. Edit data.js, not this file. */
(() => {
  'use strict';

  const DATA = window.BUILDINGS || [];
  const S = Object.assign({
    title: 'Collage', seed: 7, idleSeconds: 90, attractMode: true, colourOnTouch: true,
    hint: 'Drag — Tap — Move',
    captions: ['fig.', 'plan', 'elevation', '1:200'], notes: ['facade', 'entrance']
  }, window.SETTINGS || {});

  const $ = s => document.querySelector(s);
  const viewport = $('#viewport'), world = $('#world'), back = $('#back');
  const panel = $('#panel'), hint = $('#hint');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.title = S.title;
  if (!S.colourOnTouch) document.body.classList.add('mono');

  /* ---------------- helpers ---------------- */
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  let rand = mulberry32(S.seed);
  const R = (a, b) => a + rand() * (b - a);
  const pick = arr => arr[Math.floor(rand() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pad2 = k => String(k).padStart(2, '0');

  // subtly uneven (torn or hand-cut) outline as a CSS polygon
  function edge(edges = 'trbl', amp = 1, step = 3) {
    const has = e => edges.includes(e), pts = [];
    for (let x = 0; x <= 100; x += step) pts.push([x, has('t') ? R(0, amp) : 0]);
    for (let y = step; y <= 100; y += step) pts.push([has('r') ? 100 - R(0, amp) : 100, y]);
    for (let x = 100 - step; x >= 0; x -= step) pts.push([x, has('b') ? 100 - R(0, amp) : 100]);
    for (let y = 100 - step; y > 0; y -= step) pts.push([has('l') ? R(0, amp) : 0, y]);
    return 'polygon(' + pts.map(p => p[0].toFixed(2) + '% ' + p[1].toFixed(2) + '%').join(',') + ')';
  }
  // a hand-cut quadrilateral: straight scissor cuts, slightly off-square
  const cut = (a = 1.6) => `polygon(${R(0, a)}% ${R(0, a)}%, ${100 - R(0, a)}% ${R(0, a)}%, ${100 - R(0, a)}% ${100 - R(0, a)}%, ${R(0, a)}% ${100 - R(0, a)}%)`;

  // pencil line-drawing stand-in for a missing image
  function placeholder(i) {
    const r = mulberry32(i * 131 + 7), W = 480, H = Math.round(320 + r() * 220), g = H - 30;
    const pencil = '#55534e';
    let s = `<rect width="${W}" height="${H}" fill="#efede7"/>`;
    // sky hatching
    for (let k = 0; k < 40; k++) { const y = r() * g * .5, x = r() * W; s += `<line x1="${x}" y1="${y}" x2="${x + 30 + r() * 40}" y2="${y - 18}" stroke="${pencil}" stroke-width=".4" opacity=".25"/>`; }
    let x = 20;
    while (x < W - 30) {
      const w = 50 + r() * 110, h = 90 + r() * (g - 110), top = g - h;
      s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="#f6f4ef" stroke="${pencil}" stroke-width="${(.8 + r()).toFixed(1)}"/>`;
      if (r() > .6) s += `<path d="M${x - 4} ${top} L${x + w / 2} ${top - 20 - r() * 40} L${x + w + 4} ${top}" fill="none" stroke="${pencil}" stroke-width="1"/>`;
      const cols = Math.max(2, Math.floor(w / 18)), rows = Math.floor((h - 30) / 24);
      for (let rr = 0; rr < rows; rr++) for (let c = 0; c < cols; c++) {
        const wx = x + 8 + c * ((w - 16) / cols), wy = top + 14 + rr * 24;
        s += `<rect x="${wx}" y="${wy}" width="${(w - 16) / cols - 6}" height="13" fill="${r() > .7 ? '#c9c6be' : 'none'}" stroke="${pencil}" stroke-width=".6"/>`;
      }
      // side shading
      for (let k = 0; k < h; k += 4) s += `<line x1="${x + w - 10}" y1="${top + k}" x2="${x + w}" y2="${top + k + 6}" stroke="${pencil}" stroke-width=".4" opacity=".5"/>`;
      x += w + r() * 6 - 2;
    }
    s += `<line x1="0" y1="${g}" x2="${W}" y2="${g + 2}" stroke="${pencil}" stroke-width="1.4"/>`;
    s += `<text x="${W - 12}" y="${H - 10}" text-anchor="end" font-family="monospace" font-size="11" letter-spacing="2" fill="#8a8780">IMAGES/${pad2(i + 1)}.JPG</text>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>`);
  }

  /* ---------------- layout ---------------- */
  const n = DATA.length;
  const COLS = Math.max(2, Math.round(Math.sqrt(n * 1.6)));
  const ROWS = Math.ceil(n / COLS);
  const CELL_W = 520, CELL_H = 500, PAD = 160;
  const BOARD = { w: COLS * CELL_W + CELL_W * .35 + PAD * 2, h: ROWS * CELL_H + PAD * 2 };
  const VARIANTS = ['v-print', 'v-cut', 'v-plate', 'v-print', 'v-copy', 'v-cut'];
  const BASE_Z = 10, TRACE_Z = 5000;   // cards start under the tracing paper; touched ones come above it
  let zTop = TRACE_Z + 10;

  /* ---------------- build cards ---------------- */
  const cards = DATA.map((item, i) => {
    const el = document.createElement('figure');
    const variant = VARIANTS[(i * 5 + S.seed) % VARIANTS.length];
    el.className = 'card ' + variant;
    el.dataset.i = i; el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', item.title || `Building ${i + 1}`);
    const w = Math.round(R(340, 450) * (item.scale || 1) * (variant === 'v-plate' ? 1.1 : 1));
    el.style.width = w + 'px';

    const mount = document.createElement('div'); mount.className = 'mount';
    if (variant === 'v-cut') mount.style.setProperty('--clip', cut(1.4));
    if (variant === 'v-copy') mount.style.setProperty('--clip', edge('trbl', .8, 2));
    const img = document.createElement('img');
    img.alt = item.alt || item.title || ''; img.draggable = false; img.decoding = 'async';
    img.onerror = () => { img.onerror = null; img.src = placeholder(i); };
    img.src = item.image || placeholder(i);
    mount.appendChild(img);

    if (rand() < .3) {   // tracing paper laid over the lower part of the photo
      const v = document.createElement('div'); v.className = 'veil';
      v.style.setProperty('--vh', R(30, 55) + '%'); v.style.setProperty('--vr', R(-3, 3) + 'deg');
      mount.appendChild(v);
    }
    const cap = document.createElement('figcaption'); cap.className = 'cap';
    cap.innerHTML = `<span>${pad2(i + 1)}</span><span></span>`;
    cap.lastChild.textContent = item.title || '';
    mount.appendChild(cap);
    el.appendChild(mount);

    // fixings: tape, a pin, or a small cotton label
    const f = rand();
    if (f < .55) {
      const t = document.createElement('span'); t.className = 'tape';
      if (rand() < .5) { t.style.left = `calc(50% - 46px)`; t.style.top = '-12px'; t.style.transform = `rotate(${R(-4, 4)}deg)`; }
      else { t.style.left = '-28px'; t.style.top = '6px'; t.style.transform = `rotate(${R(-42, -30)}deg)`; }
      el.appendChild(t);
      if (rand() < .4) { const t2 = t.cloneNode(); t2.style.left = 'auto'; t2.style.right = '-28px'; t2.style.top = 'auto'; t2.style.bottom = '10px'; t2.style.transform = `rotate(${R(-45, -30)}deg)`; el.appendChild(t2); }
    } else if (f < .75) {
      const p = document.createElement('span'); p.className = 'pin';
      p.style.left = R(20, 80) + '%'; p.style.top = '-6px'; p.style.transform = `rotate(${R(-20, 20)}deg)`;
      el.appendChild(p);
    }
    if (variant === 'v-cut' || variant === 'v-copy' || rand() < .2) {
      const l = document.createElement('span'); l.className = 'label'; l.textContent = pad2(i + 1);
      l.style.setProperty('--lr', R(-4, 4) + 'deg');
      if (rand() < .5) { l.style.left = R(8, 30) + 'px'; l.style.bottom = '-12px'; } else { l.style.right = '-14px'; l.style.top = R(20, 60) + 'px'; }
      el.appendChild(l);
    }

    world.appendChild(el);
    return { el, i, x: 0, y: 0, r: 0, s: 1 };
  });

  function setCard(c) {
    c.el.style.left = c.x + 'px'; c.el.style.top = c.y + 'px';
    c.el.style.setProperty('--r', c.r.toFixed(2) + 'deg');
    c.el.style.setProperty('--s', c.s.toFixed(3));
  }
  const toTop = c => { c.el.style.zIndex = ++zTop; };

  function scatter(seed, animate) {
    rand = mulberry32(seed);
    const order = cards.map((_, k) => k).sort(() => rand() - .5);
    order.forEach((ci, k) => {
      const c = cards[ci], col = k % COLS, row = Math.floor(k / COLS), w = c.el.offsetWidth || 380;
      c.x = PAD + col * CELL_W + (row % 2 ? CELL_W * .35 : 0) + (CELL_W - w) / 2 + R(-70, 70);
      c.y = PAD + row * CELL_H + R(-50, 60);
      c.r = R(-5, 5); c.s = R(.94, 1.06);
      c.el.style.zIndex = BASE_Z + Math.floor(rand() * n);
    });
    if (animate && !reduceMotion) { world.classList.add('flying'); setTimeout(() => world.classList.remove('flying'), 1300); }
    cards.forEach(setCard);
  }

  /* ---------------- paper layers ---------------- */
  function scrap(layer, cls, x, y, w, h, rot, extra) {
    const d = document.createElement('div');
    d.className = 'scrap ' + cls;
    Object.assign(d.style, { left: x + 'px', top: y + 'px', transform: `rotate(${rot}deg)` });
    if (w) d.style.width = w + 'px';
    if (h) d.style.height = h + 'px';
    if (extra) extra(d);
    layer.appendChild(d);
    return d;
  }
  const svg = (w, h, body) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
  const ink = 'stroke:#7c7a74';

  function dimension(layer, x, y, len, rot, z) {   // architectural dimension line
    const label = (Math.round(R(24, 180)) * 100).toLocaleString('en-GB').replace(',', ' ');
    scrap(layer, 'dim', x, y, 0, 0, rot, d => {
      d.innerHTML = svg(len, 30,
        `<line x1="0" y1="15" x2="${len}" y2="15" style="${ink}" stroke-width=".8"/>` +
        `<line x1="0" y1="7" x2="0" y2="23" style="${ink}" stroke-width=".8"/><line x1="${len}" y1="7" x2="${len}" y2="23" style="${ink}" stroke-width=".8"/>` +
        `<line x1="-5" y1="20" x2="5" y2="10" style="${ink}" stroke-width="1"/><line x1="${len - 5}" y1="20" x2="${len + 5}" y2="10" style="${ink}" stroke-width="1"/>` +
        `<text x="${len / 2}" y="10" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1.5" fill="#7c7a74">${label}</text>`);
      if (z) d.style.zIndex = z;
    });
  }
  function cropMarks(layer, x, y, w, h) {
    const m = 18, o = 6;
    scrap(layer, 'crop', x, y, 0, 0, 0, d => {
      d.innerHTML = svg(w, h,
        [[0, 0, -1, -1], [w, 0, 1, -1], [0, h, -1, 1], [w, h, 1, 1]].map(([cx, cy, sx, sy]) =>
          `<line x1="${cx + sx * o}" y1="${cy}" x2="${cx + sx * (o + m)}" y2="${cy}" style="${ink}" stroke-width=".6"/>` +
          `<line x1="${cx}" y1="${cy + sy * o}" x2="${cx}" y2="${cy + sy * (o + m)}" style="${ink}" stroke-width=".6"/>`).join(''));
    });
  }

  function makePaper() {
    rand = mulberry32(S.seed * 31 + 5);
    // BACK (slow parallax): faint page furniture
    const BW = BOARD.w + 800, BH = BOARD.h + 700;
    for (let k = 0; k < 0; k++) {
      const x = R(-400, BW), y = R(-350, BH), t = pick(['sheet', 'sheet', 'grid', 'column', 'column', 'caption', 'dim', 'crop', 'big', 'grey', 'line']);
      if (t === 'sheet') scrap(back, 's-sheet', x, y, R(220, 520), R(280, 620), R(-6, 6), d => d.style.setProperty('--clip', rand() < .5 ? edge('trbl', .7, 2.5) : cut(1)));
      else if (t === 'grid') scrap(back, 's-grid', x, y, R(180, 360), R(200, 380), R(-5, 5), d => d.style.setProperty('--clip', cut(1.2)));
      else if (t === 'grey') scrap(back, 's-grey', x, y, R(120, 260), R(160, 300), R(-8, 8), d => d.style.setProperty('--clip', cut(2)));
      else if (t === 'column') { const cw = R(110, 170), cols = rand() < .5 ? 1 : 2; for (let c = 0; c < cols; c++) scrap(back, 's-column', x + c * (cw + 18), y, cw, Math.round(R(12, 26)) * 10, 0); }
      else if (t === 'caption') scrap(back, 's-caption', x, y, 0, 0, rand() < .25 ? -90 : 0, d => d.textContent = pick(S.captions));
      else if (t === 'dim') dimension(back, x, y, R(160, 420), rand() < .3 ? 90 : R(-2, 2));
      else if (t === 'crop') cropMarks(back, x, y, R(200, 420), R(240, 460));
      else if (t === 'big') scrap(back, 's-big', x, y, 0, 0, 0, d => d.textContent = pad2(Math.floor(R(1, 99))));
      else scrap(back, 'line', x, y, 0, 0, R(-3, 3), d => { const l = R(200, 700); d.innerHTML = svg(l, 2, `<line x1="0" y1="1" x2="${l}" y2="1" style="${ink}" stroke-width=".5"/>`); });
    }
    // MAIN layer, under cards: mounting sheets, grids, columns
    const sheets = Math.max(4, Math.round(n / 2));
    for (let k = 0; k < sheets; k++) {
      scrap(world, rand() < .7 ? 's-sheet' : 's-grid', R(PAD * .2, BOARD.w - 700), R(PAD * .2, BOARD.h - 600), R(460, 760), R(420, 640), R(-4, 4), d => {
        d.style.setProperty('--clip', rand() < .5 ? cut(.8) : edge('trbl', .5, 2)); d.style.zIndex = 1;
      });
    }
    for (let k = 0; k < Math.round(n * .7); k++) {
      const x = R(PAD, BOARD.w - PAD), y = R(PAD, BOARD.h - PAD), t = pick(['dim', 'column', 'note', 'caption']);
      if (t === 'dim') dimension(world, x, y, R(140, 360), rand() < .3 ? 90 : R(-3, 3), 2);
      else if (t === 'column') scrap(world, 's-column', x, y, R(100, 150), Math.round(R(10, 22)) * 10, 0, d => d.style.zIndex = 2);
      else if (t === 'note') scrap(world, 's-note', x, y, 0, 0, R(-6, 6), d => { d.textContent = pick(S.notes); d.style.zIndex = 2; });
      else scrap(world, 's-caption', x, y, 0, 0, 0, d => { d.textContent = pick(S.captions); d.style.zIndex = 2; });
    }
    // FRONT: tracing paper over parts of the collage, plus loose tape
    for (let k = 0; k < Math.max(2, Math.round(n / 5)); k++)
      scrap(world, 's-trace', R(PAD, BOARD.w - 600), R(PAD, BOARD.h - 500), R(260, 420), R(220, 380), R(-7, 7), d => { d.style.zIndex = TRACE_Z; d.style.clipPath = cut(1); });
    for (let k = 0; k < Math.round(n * .5); k++)
      scrap(world, 'tape', R(PAD, BOARD.w - PAD), R(PAD, BOARD.h - PAD), R(70, 120), 22, R(-50, 50), d => d.style.zIndex = TRACE_Z + 1);
  }

  /* ---------------- camera ---------------- */
  const cam = { x: 0, y: 0, z: 1 };
  let vw = innerWidth, vh = innerHeight, anim = null;
  const Z_MAX = 2.4;
  const zMin = () => Math.max(vw / BOARD.w, vh / BOARD.h);   // board always covers the screen
  const portrait = () => matchMedia('(max-aspect-ratio: 1/1), (max-width: 760px)').matches;
  let current = null;

  function render() {
    world.style.transform = `translate3d(${cam.x}px,${cam.y}px,0) scale(${cam.z})`;
    back.style.transform = `translate3d(${cam.x * .6}px,${cam.y * .6}px,0) scale(${.8 + cam.z * .2})`;
    viewport.style.backgroundSize = `${24 * cam.z}px ${24 * cam.z}px`;
    viewport.style.backgroundPosition = `${cam.x}px ${cam.y}px`;
  }
  // keep the paper filling the screen; while the panel is open allow room beside it
  function clampCam(c = cam) {
    c.z = clamp(c.z, zMin(), Z_MAX);
    const W = BOARD.w * c.z, H = BOARD.h * c.z;
    const open = current !== null;
    const ex = open && !portrait() ? panel.offsetWidth : 0, ey = open && portrait() ? panel.offsetHeight : 0;
    c.x = clamp(c.x, vw - W - ex, 0);
    c.y = clamp(c.y, vh - H - ey, 0);
    return c;
  }
  const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const cancelAnim = () => { if (anim) cancelAnimationFrame(anim); anim = null; };

  function flyTo(t, dur = 1200) {
    cancelAnim(); stopInertia();
    t = clampCam({ ...t });
    if (reduceMotion) { Object.assign(cam, t); render(); return; }
    const s = { ...cam }, sx = vw / 2, sy = vh / 2;
    const w0 = { x: (sx - s.x) / s.z, y: (sy - s.y) / s.z }, w1 = { x: (sx - t.x) / t.z, y: (sy - t.y) / t.z };
    const hop = clamp(Math.hypot(w1.x - w0.x, w1.y - w0.y) / 3000, 0, .3);
    const t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = ease(k);
      const z = (s.z + (t.z - s.z) * e) * (1 - hop * Math.sin(Math.PI * e));
      const wx = w0.x + (w1.x - w0.x) * e, wy = w0.y + (w1.y - w0.y) * e;
      cam.z = z; cam.x = sx - wx * z; cam.y = sy - wy * z;
      clampCam(); render();
      anim = k < 1 ? requestAnimationFrame(step) : null;
    };
    anim = requestAnimationFrame(step);
  }

  function overview(dur = 1400) {   // the widest view – still edge to edge
    const z = zMin() * 1.04;
    flyTo({ z, x: (vw - BOARD.w * z) / 2, y: (vh - BOARD.h * z) / 2 }, dur);
  }

  function focusCard(c, zoomFactor = 1, dur = 1200) {
    const w = c.el.offsetWidth * c.s, h = c.el.offsetHeight * c.s;
    const cx = c.x + c.el.offsetWidth / 2, cy = c.y + c.el.offsetHeight / 2;
    const pw = portrait() ? 0 : panel.offsetWidth, ph = portrait() ? panel.offsetHeight : 0;
    const aw = vw - pw, ah = vh - ph;
    const z = Math.min(aw * .6 / w, ah * .68 / h, Z_MAX) * zoomFactor;
    flyTo({ z, x: aw / 2 - cx * z, y: ah / 2 - cy * z }, dur);
  }

  /* ---------------- panel ---------------- */
  function fillPanel(i) {
    const item = DATA[i];
    panel.querySelector('.p-num').textContent = `${pad2(i + 1)} / ${pad2(n)}`;
    panel.querySelector('.p-title').textContent = item.title || '';
    const facts = panel.querySelector('.p-facts'); facts.innerHTML = '';
    Object.entries(item.facts || {}).forEach(([k, v]) => {
      if (!v) return;
      const dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = k; dd.textContent = v; facts.append(dt, dd);
    });
    facts.style.display = facts.children.length ? '' : 'none';
    const body = panel.querySelector('.p-body'); body.innerHTML = '';
    [].concat(item.text || []).forEach(t => { const p = document.createElement('p'); p.textContent = t; body.appendChild(p); });
    panel.querySelector('.p-credit').textContent = item.credit || '';
    panel.querySelector('.panel-inner').scrollTop = 0;
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
  }

  function select(i) {
    if (i == null || !cards[i]) return;
    current = i;
    cards.forEach(c => c.el.classList.toggle('active', c.i === i));
    toTop(cards[i]);
    document.body.classList.add('has-active');
    fillPanel(i);
    panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false');
    focusCard(cards[i]);
    hideHint();
  }
  function closePanel() {
    if (current === null) return;
    current = null;
    panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-active');
    cards.forEach(c => c.el.classList.remove('active'));
    flyTo({ ...cam }, 700);   // ease back inside the paper's edges
  }
  const step = d => select(current === null ? (d > 0 ? 0 : n - 1) : (current + d + n) % n);

  /* ---------------- hint ---------------- */
  hint.textContent = S.hint || '';
  if (!S.hint) hint.style.display = 'none';
  let hintTimer = setTimeout(hideHint, 12000);
  function hideHint() { hint.classList.add('hide'); clearTimeout(hintTimer); }
  const showHint = () => hint.classList.remove('hide');

  /* ---------------- pointer: pan / move cards / pinch ---------------- */
  const pointers = new Map();
  let mode = null, down = null, dragCard = null, moves = [], pinch = null, inertia = null;
  function stopInertia() { if (inertia) cancelAnimationFrame(inertia); inertia = null; }

  viewport.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    cancelAnim(); stopInertia();
    try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      if (dragCard && mode === 'card') dropCard(dragCard);
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), m: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, cam: { ...cam } };
      mode = 'pinch'; return;
    }
    if (pointers.size > 2) return;
    const cardEl = e.target.closest('.card');
    dragCard = cardEl ? cards[+cardEl.dataset.i] : null;
    down = { x: e.clientX, y: e.clientY };
    mode = dragCard ? 'card-pending' : 'pan-pending';
    moves = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
  });

  viewport.addEventListener('pointermove', e => {
    const p = pointers.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (mode === 'pinch' && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const z = clamp(pinch.cam.z * d / pinch.d, zMin(), Z_MAX);
      const wx = (pinch.m.x - pinch.cam.x) / pinch.cam.z, wy = (pinch.m.y - pinch.cam.y) / pinch.cam.z;
      cam.z = z; cam.x = m.x - wx * z; cam.y = m.y - wy * z; clampCam(); render();
      return;
    }
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    if (mode === 'pan-pending' && moved > 5) { mode = 'pan'; viewport.classList.add('dragging'); hideHint(); }
    if (mode === 'card-pending' && moved > 7) { mode = 'card'; liftCard(dragCard); hideHint(); }
    if (mode === 'pan') {
      cam.x += dx; cam.y += dy; clampCam(); render();
      moves.push({ x: e.clientX, y: e.clientY, t: performance.now() }); if (moves.length > 6) moves.shift();
    } else if (mode === 'card') {
      const c = dragCard;
      c.x = clamp(c.x + dx / cam.z, 0, BOARD.w - c.el.offsetWidth);
      c.y = clamp(c.y + dy / cam.z, 0, BOARD.h - c.el.offsetHeight);
      c.r = clamp(c.r * .92 + dx * .18, -10, 10);   // a little sway, like paper in the hand
      setCard(c);
    }
  });

  function endPointer(e, cancelled) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (mode === 'pinch') { if (pointers.size === 0) mode = null; return; }
    if (!cancelled && mode === 'card-pending') select(dragCard.i);
    else if (mode === 'card') dropCard(dragCard);
    else if (mode === 'pan') fling();
    else if (!cancelled && mode === 'pan-pending') closePanel();
    mode = null; down = null; dragCard = null;
    viewport.classList.remove('dragging');
  }
  viewport.addEventListener('pointerup', e => endPointer(e, false));
  viewport.addEventListener('pointercancel', e => endPointer(e, true));

  function liftCard(c) { toTop(c); c.el.classList.add('lifted'); }
  function dropCard(c) { c.el.classList.remove('lifted'); c.r = clamp(c.r * .4 + R(-2.5, 2.5), -6, 6); setCard(c); }

  function fling() {
    const now = performance.now(), recent = moves.filter(m => now - m.t < 100);
    if (recent.length < 2) return;
    const a = recent[0], b = recent[recent.length - 1], dt = Math.max(16, b.t - a.t);
    let vx = (b.x - a.x) / dt * 16, vy = (b.y - a.y) / dt * 16;
    const tick = () => {
      vx *= .94; vy *= .94;
      cam.x += vx; cam.y += vy; clampCam(); render();
      inertia = Math.hypot(vx, vy) > .3 ? requestAnimationFrame(tick) : null;
    };
    inertia = requestAnimationFrame(tick);
  }

  /* ---------------- wheel ---------------- */
  viewport.addEventListener('wheel', e => {
    e.preventDefault(); cancelAnim(); stopInertia(); hideHint();
    if (!e.ctrlKey && Math.abs(e.deltaX) > 0) { cam.x -= e.deltaX; cam.y -= e.deltaY; clampCam(); render(); return; }
    const k = e.deltaMode === 1 ? 40 : 1;
    const z = clamp(cam.z * Math.exp(-e.deltaY * k * (e.ctrlKey ? .01 : .0016)), zMin(), Z_MAX);
    cam.x = e.clientX - (e.clientX - cam.x) * (z / cam.z);
    cam.y = e.clientY - (e.clientY - cam.y) * (z / cam.z);
    cam.z = z; clampCam(); render();
  }, { passive: false });

  /* ---------------- panel controls & keys ---------------- */
  $('#pPrev').onclick = () => step(-1);
  $('#pNext').onclick = () => step(1);
  $('#close').onclick = closePanel;

  world.addEventListener('keydown', e => {
    const el = e.target.closest('.card');
    if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(+el.dataset.i); }
  });
  window.addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('.card') && (e.key === 'Enter' || e.key === ' ')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
    else if (e.key === 'Escape') closePanel();
    else if (e.key === 'o') { closePanel(); overview(); }                                   // overview
    else if (e.key === 's') { closePanel(); scatter(Math.floor(Math.random() * 1e6), true); } // reshuffle
  });

  /* ---------------- idle / attract mode ---------------- */
  let idleTimer = null, tourTimer = null, tourIdx = 0;
  function wake() {
    clearTimeout(idleTimer); clearTimeout(tourTimer); tourTimer = null;
    cards.forEach(c => c.el.classList.remove('peek'));
    if (S.idleSeconds > 0) idleTimer = setTimeout(goIdle, S.idleSeconds * 1000);
  }
  function goIdle() {
    closePanel(); overview(2200); showHint();
    if (S.attractMode && !reduceMotion) tourTimer = setTimeout(tour, 6000);
  }
  function tour() {
    cards.forEach(c => c.el.classList.remove('peek'));
    const c = cards[tourIdx++ % n];
    if (tourIdx % 4 === 0) overview(3500);
    else { c.el.classList.add('peek'); focusCard(c, .6, 4200); }
    tourTimer = setTimeout(tour, 8000);
  }
  ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, wake, { passive: true, capture: true }));

  /* ---------------- resize ---------------- */
  addEventListener('resize', () => {
    vw = innerWidth; vh = innerHeight;
    if (current !== null) focusCard(cards[current], 1, 300); else { clampCam(); render(); }
  });

  /* ---------------- go ---------------- */
  makePaper();
  scatter(S.seed, false);
  cam.z = zMin() * 1.04; cam.x = (vw - BOARD.w * cam.z) / 2; cam.y = (vh - BOARD.h * cam.z) / 2;
  clampCam(); render();
  wake();
})();
