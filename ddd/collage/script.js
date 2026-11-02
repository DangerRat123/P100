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
  const viewport = $('#viewport'), world = $('#world');
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
    s += `<text x="${W - 12}" y="${H - 10}" text-anchor="end" font-family="monospace" font-size="11" letter-spacing="2" fill="#8a8780">IMAGES/${pad2(i + 1)}.PNG</text>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>`);
  }

  /* ---------------- layout ---------------- */
  const n = DATA.length;
  const COLS = innerWidth < innerHeight ? 2 : Math.max(2, Math.round(Math.sqrt(n * 1.6)));   // 2 columns on upright screens
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
      const inRow = Math.min(COLS, n - row * COLS);          // centre a part-filled last row
      c.x = PAD + CELL_W * .175 + col * CELL_W + (COLS - inRow) * CELL_W / 2
          + (row % 2 ? 1 : -1) * CELL_W * .175 + (CELL_W - w) / 2 + R(-70, 70);
      c.y = PAD + row * CELL_H + 40 + R(-50, 50);
      c.r = R(-5, 5); c.s = R(.94, 1.06);
      c.el.style.zIndex = BASE_Z + Math.floor(rand() * n);
    });
    if (animate && !reduceMotion) { world.classList.add('flying'); setTimeout(() => world.classList.remove('flying'), 1300); }
    cards.forEach(setCard);
  }

  /* ---------------- fixed view: always shows every picture, centred ---------------- */
  const cam = { x: 0, y: 0, z: 1 };
  let vw = innerWidth, vh = innerHeight, current = null;
  const MARGIN = () => Math.max(28, Math.min(vw, vh) * .05);
  const portrait = () => matchMedia('(max-aspect-ratio: 1/1), (max-width: 760px)').matches;

  function render() {
    world.style.transform = `translate3d(${cam.x}px,${cam.y}px,0) scale(${cam.z})`;
    viewport.style.backgroundSize = '22px 22px';
    viewport.style.backgroundPosition = `${cam.x}px ${cam.y}px`;
  }
  // fit the collage (cards at their home positions) inside the screen
  function fitView() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    cards.forEach(c => {
      const w = c.el.offsetWidth * c.s, h = (c.el.offsetHeight || c.el.offsetWidth * .8) * c.s;
      const cx = c.hx + c.el.offsetWidth / 2, cy = c.hy + (c.el.offsetHeight || 300) / 2;
      minX = Math.min(minX, cx - w / 2); maxX = Math.max(maxX, cx + w / 2);
      minY = Math.min(minY, cy - h / 2); maxY = Math.max(maxY, cy + h / 2);
    });
    const m = MARGIN(), bw = maxX - minX, bh = maxY - minY;
    cam.z = Math.min((vw - m * 2) / bw, (vh - m * 2) / bh);
    cam.x = vw / 2 - (minX + maxX) / 2 * cam.z;
    cam.y = vh / 2 - (minY + maxY) / 2 * cam.z;
    render();
    if (current !== null) present(cards[current], false);
  }

  /* ---------------- selected picture comes to the middle ---------------- */
  const MOVE = 'left .9s cubic-bezier(.2,.8,.2,1), top .9s cubic-bezier(.2,.8,.2,1), transform .9s cubic-bezier(.2,.8,.2,1), opacity .6s, filter .6s';
  function glide(c, on) {
    c.el.style.transition = on && !reduceMotion ? MOVE : '';
    clearTimeout(c.tm);
    if (on) c.tm = setTimeout(() => { c.el.style.transition = ''; }, 950);
  }
  function present(c, animate = true) {      // centre + enlarge in the free space beside the panel
    const pw = portrait() ? 0 : panel.offsetWidth, ph = portrait() ? panel.offsetHeight : 0;
    const aw = vw - pw, ah = vh - ph;
    const w = c.el.offsetWidth, h = c.el.offsetHeight || w * .8;
    const s = Math.min(aw * .7 / (w * cam.z), ah * .74 / (h * cam.z));
    glide(c, animate);
    c.x = (aw / 2 - cam.x) / cam.z - w / 2;
    c.y = (ah / 2 - cam.y) / cam.z - h / 2;
    c.el.style.left = c.x + 'px'; c.el.style.top = c.y + 'px';
    c.el.style.setProperty('--s', s.toFixed(3));
  }
  function sendHome(c) {
    glide(c, true);
    c.x = c.hx; c.y = c.hy; setCard(c);
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
    if (i == null || !cards[i] || i === current) return;
    if (current !== null) { cards[current].el.classList.remove('active'); sendHome(cards[current]); }
    current = i;
    const c = cards[i];
    c.el.classList.add('active'); toTop(c);
    document.body.classList.add('has-active');
    fillPanel(i);
    panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false');
    present(c);
    hideHint();
  }
  function closePanel() {
    if (current === null) return;
    const c = cards[current];
    current = null;
    panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-active');
    c.el.classList.remove('active');
    sendHome(c);
  }
  const step = d => select(current === null ? (d > 0 ? 0 : n - 1) : (current + d + n) % n);

  /* ---------------- hint ---------------- */
  hint.textContent = S.hint || '';
  if (!S.hint) hint.style.display = 'none';
  let hintTimer = setTimeout(hideHint, 12000);
  function hideHint() { hint.classList.add('hide'); clearTimeout(hintTimer); }
  const showHint = () => hint.classList.remove('hide');

  /* ---------------- pointer: tap to select, drag to move a picture ---------------- */
  let mode = null, down = null, dragCard = null, last = null;
  viewport.style.cursor = 'default';

  viewport.addEventListener('pointerdown', e => {
    if (e.button > 0 || mode) return;
    try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
    const cardEl = e.target.closest('.card');
    dragCard = cardEl ? cards[+cardEl.dataset.i] : null;
    down = { x: e.clientX, y: e.clientY, id: e.pointerId };
    last = { x: e.clientX, y: e.clientY };
    mode = dragCard ? 'card-pending' : 'table';
  });

  viewport.addEventListener('pointermove', e => {
    if (!down || e.pointerId !== down.id) return;
    const dx = e.clientX - last.x, dy = e.clientY - last.y;
    last = { x: e.clientX, y: e.clientY };
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    if (mode === 'card-pending' && moved > 7 && dragCard.i !== current) {
      mode = 'card'; toTop(dragCard); dragCard.el.classList.add('lifted'); viewport.classList.add('dragging'); hideHint();
    }
    if (mode === 'card') {
      const c = dragCard, w = c.el.offsetWidth, h = c.el.offsetHeight;
      // keep it on screen
      const minX = -cam.x / cam.z - w * .3, maxX = (vw - cam.x) / cam.z - w * .7;
      const minY = -cam.y / cam.z - h * .3, maxY = (vh - cam.y) / cam.z - h * .7;
      c.x = clamp(c.x + dx / cam.z, minX, maxX);
      c.y = clamp(c.y + dy / cam.z, minY, maxY);
      c.r = clamp(c.r * .92 + dx * .18, -10, 10);
      setCard(c);
    }
  });

  function endPointer(e, cancelled) {
    if (!down || e.pointerId !== down.id) return;
    if (!cancelled && mode === 'card-pending') select(dragCard.i);
    else if (mode === 'card') {
      const c = dragCard;
      c.el.classList.remove('lifted');
      c.r = clamp(c.r * .4 + R(-2.5, 2.5), -6, 6);
      c.hx = c.x; c.hy = c.y;          // it stays where it was put down
      setCard(c);
    } else if (!cancelled && mode === 'table') closePanel();
    mode = null; down = null; dragCard = null;
    viewport.classList.remove('dragging');
  }
  viewport.addEventListener('pointerup', e => endPointer(e, false));
  viewport.addEventListener('pointercancel', e => endPointer(e, true));

  // no zooming: swallow wheel / trackpad pinch / Safari gestures
  viewport.addEventListener('wheel', e => e.preventDefault(), { passive: false });
  ['gesturestart', 'gesturechange'].forEach(ev => document.addEventListener(ev, e => e.preventDefault()));

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
    else if (e.key === 's') { closePanel(); reshuffle(Math.floor(Math.random() * 1e6)); }  // reshuffle
  });

  function reshuffle(seed) {
    scatter(seed, true);
    cards.forEach(c => { c.hx = c.x; c.hy = c.y; });
    setTimeout(fitView, 50);
  }

  /* ---------------- idle: reset, then quietly bring pictures forward one by one ---------------- */
  let idleTimer = null, tourTimer = null, tourIdx = 0;
  function wake() {
    clearTimeout(idleTimer); clearTimeout(tourTimer); tourTimer = null;
    cards.forEach(c => c.el.classList.remove('peek'));
    if (S.idleSeconds > 0) idleTimer = setTimeout(goIdle, S.idleSeconds * 1000);
  }
  function goIdle() {
    closePanel(); showHint();
    if (S.attractMode && !reduceMotion) tourTimer = setTimeout(tour, 4000);
  }
  function tour() {
    cards.forEach(c => c.el.classList.remove('peek'));
    cards[tourIdx++ % n].el.classList.add('peek');
    tourTimer = setTimeout(tour, 5000);
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, wake, { passive: true, capture: true }));

  /* ---------------- resize ---------------- */
  addEventListener('resize', () => { vw = innerWidth; vh = innerHeight; fitView(); });

  /* ---------------- go ---------------- */
  scatter(S.seed, false);
  cards.forEach(c => { c.hx = c.x; c.hy = c.y; });
  fitView();
  // refit as each picture loads and its height becomes known
  cards.forEach(c => c.el.querySelector('img').addEventListener('load', () => { if (current === null) fitView(); }));
  wake();
})();
