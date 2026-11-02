/* Collage explorer – no libraries, no build step. Edit data.js, not this file. */
(() => {
  'use strict';

  const DATA = window.BUILDINGS || [];
  const S = Object.assign({
    title: 'Building Collage', seed: 7, idleSeconds: 90, attractMode: true,
    words: ['SITE', 'PLAN', 'N\u00b0', 'fig.', '1:200']
  }, window.SETTINGS || {});

  const $ = s => document.querySelector(s);
  const viewport = $('#viewport'), world = $('#world'), back = $('#back');
  const panel = $('#panel'), hint = $('#hint');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- helpers ---------------- */
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  let rand = mulberry32(S.seed);
  const R = (a, b) => a + rand() * (b - a);
  const pick = arr => arr[Math.floor(rand() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const COLORS = ['var(--red)', 'var(--blue)', 'var(--yellow)', 'var(--pink)', 'var(--kraft)', 'var(--green)'];
  const FONTS = ['var(--font-display)', 'var(--font-type)', "'Archivo Black', sans-serif", "'Rubik Mono One', sans-serif", 'var(--font-body)'];

  // jagged "torn paper" outline as a CSS polygon (percent coordinates)
  function torn(edges = 'trbl', amp = 1.8, step = 3) {
    const has = e => edges.includes(e), pts = [];
    for (let x = 0; x <= 100; x += step) pts.push([x, has('t') ? R(0, amp) : 0]);
    for (let y = step; y <= 100; y += step) pts.push([has('r') ? 100 - R(0, amp) : 100, y]);
    for (let x = 100 - step; x >= 0; x -= step) pts.push([x, has('b') ? 100 - R(0, amp) : 100]);
    for (let y = 100 - step; y > 0; y -= step) pts.push([has('l') ? R(0, amp) : 0, y]);
    return 'polygon(' + pts.map(p => p[0].toFixed(2) + '% ' + p[1].toFixed(2) + '%').join(',') + ')';
  }

  // drawn stand-in for a missing image
  function placeholder(i) {
    const cols = ['#e2482b', '#2e55c9', '#f3c531', '#f1b3aa', '#c8a273', '#4f8a5b'];
    const bg = cols[i % cols.length], r = mulberry32(i * 97 + 11);
    const H = Math.round(260 + r() * 160), ground = H - 26;
    let s = '', x = 14;
    while (x < 386) {
      const w = 34 + r() * 74, h = 70 + r() * (ground - 60);
      s += `<rect x="${x}" y="${ground - h}" width="${w}" height="${h}" fill="#1c1a17" opacity="${(.7 + r() * .3).toFixed(2)}"/>`;
      for (let wy = ground - h + 12; wy < ground - 14; wy += 18)
        for (let wx = x + 7; wx < x + w - 10; wx += 14) if (r() > .4) s += `<rect x="${wx}" y="${wy}" width="6" height="9" fill="${bg}"/>`;
      x += w + r() * 12;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="${H}" viewBox="0 0 400 ${H}"><rect width="400" height="${H}" fill="${bg}"/>${s}<rect y="${ground}" width="400" height="26" fill="#1c1a17"/><text x="10" y="${H - 8}" font-family="monospace" font-size="12" fill="${bg}">add images/${String(i + 1).padStart(2, '0')}.jpg</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ---------------- title ---------------- */
  (function ransom() {
    const el = $('#title'); el.setAttribute('aria-label', S.title); document.title = S.title;
    [...S.title].forEach(ch => {
      const sp = document.createElement('span');
      if (ch === ' ') { sp.className = 'space'; el.appendChild(sp); return; }
      sp.textContent = ch; sp.setAttribute('aria-hidden', 'true');
      sp.style.fontFamily = pick(FONTS);
      const bg = rand() < .25 ? 'var(--paper-2)' : pick(COLORS.concat(['var(--ink)']));
      sp.style.background = bg;
      sp.style.color = bg === 'var(--ink)' || bg === 'var(--blue)' || bg === 'var(--red)' || bg === 'var(--green)' ? 'var(--paper-2)' : 'var(--ink)';
      sp.style.transform = `rotate(${R(-8, 8)}deg) translateY(${R(-3, 3)}px)`;
      sp.style.clipPath = torn('trbl', 4, 12);
      el.appendChild(sp);
    });
  })();

  /* ---------------- build cards ---------------- */
  const n = DATA.length;
  const COLS = Math.max(2, Math.round(Math.sqrt(n * 1.7)));
  const ROWS = Math.ceil(n / COLS);
  const CELL_W = 500, CELL_H = 470, PAD = 260;
  const BOARD = { w: COLS * CELL_W + PAD * 2 + CELL_W * .3, h: ROWS * CELL_H + PAD * 2 };
  const VARIANTS = ['v-plain', 'v-torn', 'v-cutout', 'v-duo', 'v-plain', 'v-torn'];
  let zTop = 10;

  const cards = DATA.map((item, i) => {
    const el = document.createElement('figure');
    el.className = 'card ' + VARIANTS[(i * 5 + S.seed) % VARIANTS.length];
    el.dataset.i = i; el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', item.title || `Building ${i + 1}`);
    const w = Math.round(R(270, 370) * (item.scale || 1));
    el.style.width = w + 'px';

    const paper = document.createElement('div'); paper.className = 'paper';
    if (!el.classList.contains('v-plain')) paper.style.setProperty('--clip', torn('trbl', 2.2, 2.5));
    if (el.classList.contains('v-duo')) el.style.setProperty('--tint', pick(['var(--yellow)', 'var(--pink)', 'var(--blue)', 'var(--kraft)']));
    const img = document.createElement('img');
    img.alt = item.alt || item.title || ''; img.draggable = false; img.decoding = 'async';
    img.onerror = () => { img.onerror = null; img.src = placeholder(i); };
    img.src = item.image || placeholder(i);
    paper.appendChild(img); el.appendChild(paper);

    const tag = document.createElement('figcaption'); tag.className = 'tag';
    tag.textContent = String(i + 1).padStart(2, '0') + ' \u2014 ' + (item.title || '');
    el.appendChild(tag);
    if (rand() < .35) { const st = document.createElement('span'); st.className = 'sticker'; st.textContent = i + 1; st.style.background = pick(['var(--red)', 'var(--blue)', 'var(--green)']); el.appendChild(st); }

    // 1–2 bits of tape
    const corners = [['-14px', '-10px', -35], ['-14px', 'auto', 35, '-10px'], ['auto', '-10px', 30, null, '-12px'], ['50%', null, R(-6, 6)]];
    const t = document.createElement('span'); t.className = 'tape';
    const c = pick(corners);
    if (c[0] === '50%') { t.style.left = 'calc(50% - 48px)'; t.style.top = '-14px'; }
    else { t.style.top = c[0]; if (c[1] !== null) t.style.left = c[1]; if (c[3]) t.style.right = c[3]; if (c[4]) { t.style.bottom = c[4]; t.style.top = 'auto'; } }
    t.style.transform = `rotate(${c[2]}deg)`;
    el.appendChild(t);

    world.appendChild(el);
    return { el, i, x: 0, y: 0, r: 0, s: 1 };
  });

  function setCard(c) {
    c.el.style.left = c.x + 'px'; c.el.style.top = c.y + 'px';
    c.el.style.setProperty('--r', c.r.toFixed(2) + 'deg');
    c.el.style.setProperty('--s', c.s.toFixed(3));
  }
  function toTop(c) { c.el.style.zIndex = ++zTop; }

  function scatter(seed, animate) {
    rand = mulberry32(seed);
    const order = cards.map((_, k) => k).sort(() => rand() - .5);
    order.forEach((ci, k) => {
      const c = cards[ci], col = k % COLS, row = Math.floor(k / COLS), w = c.el.offsetWidth || 320;
      c.x = PAD + col * CELL_W + (row % 2 ? CELL_W * .3 : 0) + (CELL_W - w) / 2 + R(-80, 80);
      c.y = PAD + row * CELL_H + R(-70, 70);
      c.r = R(-9, 9); c.s = R(.92, 1.08);
      c.el.style.zIndex = 10 + Math.floor(rand() * n);
    });
    zTop = 10 + n;
    if (animate && !reduceMotion) { world.classList.add('flying'); setTimeout(() => world.classList.remove('flying'), 1100); }
    cards.forEach(setCard);
  }

  /* ---------------- decoration ---------------- */
  function scrap(layer, cls, x, y, w, h, extra) {
    const d = document.createElement('div');
    d.className = 'scrap ' + cls;
    Object.assign(d.style, { left: x + 'px', top: y + 'px', transform: `rotate(${R(-30, 30)}deg)` });
    if (w) d.style.width = w + 'px';
    if (h) d.style.height = h + 'px';
    if (extra) extra(d);
    layer.appendChild(d);
    return d;
  }
  function makeDecor() {
    rand = mulberry32(S.seed * 31 + 5);
    // back layer – drifts slower than the cards (parallax)
    const BW = BOARD.w + 900, BH = BOARD.h + 700;
    for (let k = 0; k < 46; k++) {
      const x = R(-500, BW), y = R(-400, BH), type = pick(['paper', 'paper', 'circle', 'ring', 'strip', 'dots', 'grid', 'lined', 'word', 'scribble']);
      if (type === 'paper') scrap(back, 's-paper', x, y, R(120, 340), R(90, 300), d => { d.style.background = pick(COLORS); d.style.opacity = R(.45, .85); d.style.setProperty('--clip', torn('trbl', 3, 5)); });
      else if (type === 'circle') { const s = R(60, 220); scrap(back, 's-circle', x, y, s, s, d => { d.style.background = pick(COLORS); d.style.opacity = R(.5, .9); }); }
      else if (type === 'ring') { const s = R(80, 260); scrap(back, 's-ring', x, y, s, s, d => { d.style.opacity = R(.25, .6); }); }
      else if (type === 'strip') scrap(back, 's-strip', x, y, R(220, 600), 0, d => { d.style.background = pick(COLORS); d.style.setProperty('--clip', torn('lr', 6, 25)); });
      else if (type === 'dots') scrap(back, 's-dots', x, y, R(120, 300), R(100, 260), d => { d.style.setProperty('--dot', pick(['var(--ink)', 'var(--red)', 'var(--blue)'])); if (rand() < .5) d.style.borderRadius = '50%'; });
      else if (type === 'grid') scrap(back, 's-grid', x, y, R(160, 320), R(140, 300), d => d.style.setProperty('--clip', torn('trbl', 2.5, 4)));
      else if (type === 'lined') scrap(back, 's-lined', x, y, R(160, 280), R(180, 300), d => d.style.setProperty('--clip', torn('t', 4, 4)));
      else if (type === 'word') scrap(back, 's-word', x, y, 0, 0, d => {
        d.textContent = pick(S.words); d.style.fontFamily = pick(FONTS);
        const bg = rand() < .4 ? 'transparent' : pick(COLORS.concat(['var(--ink)']));
        d.style.background = bg; d.style.color = bg === 'var(--ink)' ? 'var(--paper-2)' : 'var(--ink)';
        d.style.fontSize = R(22, 58) + 'px';
      });
      else scrap(back, 's-scribble', x, y, 0, 0, d => {
        let p = `M ${R(0, 40)} ${R(20, 80)}`;
        for (let j = 0; j < 5; j++) p += ` Q ${R(0, 220)} ${R(0, 110)} ${R(0, 220)} ${R(0, 110)}`;
        d.innerHTML = `<svg width="220" height="110"><path d="${p}" fill="none" style="stroke:${pick(['var(--ink)', 'var(--red)', 'var(--blue)'])}" stroke-width="${R(2, 5).toFixed(1)}" stroke-linecap="round"/></svg>`;
      });
    }
    // big sheets in the main layer, under the cards
    for (let k = 0; k < Math.max(3, Math.round(n / 3)); k++) {
      scrap(world, pick(['s-paper', 's-grid', 's-paper']), R(PAD * .3, BOARD.w - 600), R(PAD * .3, BOARD.h - 500), R(420, 700), R(360, 560), d => {
        if (d.classList.contains('s-paper')) { d.style.background = pick(['var(--kraft)', 'var(--paper-2)', 'var(--pink)']); d.style.opacity = .85; }
        d.style.setProperty('--clip', torn('trbl', 1.5, 2.5)); d.style.zIndex = 1;
        d.style.transform = `rotate(${R(-8, 8)}deg)`;
      });
    }
    // a few bits stuck on top of everything
    for (let k = 0; k < Math.round(n * .8); k++) {
      const type = pick(['tape', 'tape', 'circle', 'word']);
      const x = R(PAD, BOARD.w - PAD), y = R(PAD, BOARD.h - PAD);
      if (type === 'tape') scrap(world, 'tape', x, y, R(80, 140), 26, d => { d.style.zIndex = 99999; });
      else if (type === 'circle') { const s = R(18, 42); scrap(world, 's-circle', x, y, s, s, d => { d.style.background = pick(['var(--red)', 'var(--yellow)', 'var(--blue)']); d.style.zIndex = 99999; }); }
      else scrap(world, 's-word', x, y, 0, 0, d => { d.textContent = pick(S.words); d.style.fontFamily = pick(FONTS); d.style.fontSize = R(16, 26) + 'px'; d.style.background = 'var(--paper-2)'; d.style.zIndex = 99999; d.style.boxShadow = '1px 2px 0 rgba(0,0,0,.2)'; });
    }
  }

  /* ---------------- camera ---------------- */
  const cam = { x: 0, y: 0, z: 1 };
  let vw = innerWidth, vh = innerHeight, anim = null;
  const fitZoom = () => Math.min(vw / BOARD.w, vh / BOARD.h) * .98;
  const Z_MAX = 2.6;
  const zMin = () => fitZoom() * .6;

  function render() {
    world.style.transform = `translate3d(${cam.x}px,${cam.y}px,0) scale(${cam.z})`;
    const bz = .7 + cam.z * .3;
    back.style.transform = `translate3d(${cam.x * .55}px,${cam.y * .55}px,0) scale(${bz})`;
  }
  function clampCam(c = cam) {
    const W = BOARD.w * c.z, H = BOARD.h * c.z;
    c.x = clamp(c.x, vw * .5 - W, vw * .5);
    c.y = clamp(c.y, vh * .5 - H, vh * .5);
    return c;
  }
  const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  function cancelAnim() { if (anim) cancelAnimationFrame(anim); anim = null; }

  // fly the camera with a little zoom-out "hop" for longer trips
  function flyTo(t, dur = 1000) {
    cancelAnim(); stopInertia();
    t = clampCam({ ...t });
    if (reduceMotion) { Object.assign(cam, t); render(); return; }
    const s = { ...cam }, sx = vw / 2, sy = vh / 2;
    const w0 = { x: (sx - s.x) / s.z, y: (sy - s.y) / s.z }, w1 = { x: (sx - t.x) / t.z, y: (sy - t.y) / t.z };
    const dist = Math.hypot(w1.x - w0.x, w1.y - w0.y);
    const hop = clamp(dist / 2500, 0, .45);
    const t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = ease(k);
      const z = (s.z + (t.z - s.z) * e) * (1 - hop * Math.sin(Math.PI * e));
      const wx = w0.x + (w1.x - w0.x) * e, wy = w0.y + (w1.y - w0.y) * e;
      cam.z = z; cam.x = sx - wx * z; cam.y = sy - wy * z;
      render();
      anim = k < 1 ? requestAnimationFrame(step) : null;
    };
    anim = requestAnimationFrame(step);
  }

  function fitAll(dur = 900) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    cards.forEach(c => { minX = Math.min(minX, c.x); minY = Math.min(minY, c.y); maxX = Math.max(maxX, c.x + c.el.offsetWidth); maxY = Math.max(maxY, c.y + c.el.offsetHeight); });
    const m = 80, bw = maxX - minX + m * 2, bh = maxY - minY + m * 2;
    const z = clamp(Math.min(vw / bw, (vh - 60) / bh), zMin(), 1.2);
    flyTo({ z, x: vw / 2 - (minX + maxX) / 2 * z, y: vh / 2 - (minY + maxY) / 2 * z + 10 }, dur);
  }

  const portrait = () => matchMedia('(max-aspect-ratio: 1/1), (max-width: 760px)').matches;
  function focusCard(c, zoomFactor = 1, dur = 1000) {
    const w = c.el.offsetWidth * c.s, h = c.el.offsetHeight * c.s;
    const cx = c.x + c.el.offsetWidth / 2, cy = c.y + c.el.offsetHeight / 2;
    const pw = portrait() ? 0 : panel.offsetWidth, ph = portrait() ? panel.offsetHeight : 0;
    const aw = vw - pw, ah = vh - ph;
    const z = clamp(Math.min(aw * .62 / w, ah * .7 / h) * zoomFactor, .35, 2.2);
    flyTo({ z, x: aw / 2 - cx * z, y: ah / 2 - cy * z }, dur);
  }

  /* ---------------- panel ---------------- */
  let current = null;
  panel.style.setProperty('--torn', portrait() ? torn('t', 1.2, 1.5) : torn('l', 2.2, 1.2));

  function fillPanel(i) {
    const item = DATA[i];
    panel.querySelector('.p-num').textContent = 'N\u00b0 ' + String(i + 1).padStart(2, '0');
    panel.querySelector('.p-title span').textContent = item.title || '';
    const facts = panel.querySelector('.p-facts'); facts.innerHTML = '';
    Object.entries(item.facts || {}).forEach(([k, v]) => {
      if (!v) return;
      const dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = k; dd.textContent = v; facts.append(dt, dd);
    });
    const body = panel.querySelector('.p-body'); body.innerHTML = '';
    [].concat(item.text || []).forEach(t => { const p = document.createElement('p'); p.textContent = t; body.appendChild(p); });
    panel.querySelector('.p-credit').textContent = item.credit || '';
    $('#pCount').textContent = `${i + 1} / ${n}`;
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
  }
  const step = d => select(current === null ? (d > 0 ? 0 : n - 1) : (current + d + n) % n);

  /* ---------------- hint ---------------- */
  let hintTimer = setTimeout(hideHint, 9000);
  function hideHint() { hint.classList.add('hide'); clearTimeout(hintTimer); }
  function showHint() { hint.classList.remove('hide'); }

  /* ---------------- pointer: pan / drag cards / pinch ---------------- */
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
      c.x += dx / cam.z; c.y += dy / cam.z;
      c.r = clamp(c.r * .9 + dx * .35, -18, 18);     // wobble as you drag
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
  function dropCard(c) {
    c.el.classList.remove('lifted');
    c.r = clamp(c.r * .5 + R(-4, 4), -10, 10);    // settles at a new jaunty angle
    setCard(c);
  }

  function fling() {
    const now = performance.now(), recent = moves.filter(m => now - m.t < 100);
    if (recent.length < 2) return;
    const a = recent[0], b = recent[recent.length - 1], dt = Math.max(16, b.t - a.t);
    let vx = (b.x - a.x) / dt * 16, vy = (b.y - a.y) / dt * 16;
    const tick = () => {
      vx *= .93; vy *= .93;
      cam.x += vx; cam.y += vy; clampCam(); render();
      inertia = Math.hypot(vx, vy) > .3 ? requestAnimationFrame(tick) : null;
    };
    inertia = requestAnimationFrame(tick);
  }

  /* ---------------- wheel zoom ---------------- */
  viewport.addEventListener('wheel', e => {
    e.preventDefault(); cancelAnim(); stopInertia(); hideHint();
    if (!e.ctrlKey && Math.abs(e.deltaX) > 0) {           // trackpad two-finger scroll → pan
      cam.x -= e.deltaX; cam.y -= e.deltaY; clampCam(); render(); return;
    }
    const k = e.deltaMode === 1 ? 40 : 1;
    const z = clamp(cam.z * Math.exp(-e.deltaY * k * (e.ctrlKey ? .01 : .0018)), zMin(), Z_MAX);
    cam.x = e.clientX - (e.clientX - cam.x) * (z / cam.z);
    cam.y = e.clientY - (e.clientY - cam.y) * (z / cam.z);
    cam.z = z; clampCam(); render();
  }, { passive: false });

  /* ---------------- buttons & keys ---------------- */
  $('#prev').onclick = () => step(-1);
  $('#next').onclick = () => step(1);
  $('#pPrev').onclick = () => step(-1);
  $('#pNext').onclick = () => step(1);
  $('#close').onclick = closePanel;
  $('#fit').onclick = () => { closePanel(); fitAll(); };
  $('#shuffle').onclick = () => { closePanel(); scatter(Math.floor(Math.random() * 1e6), true); setTimeout(() => fitAll(), 250); };

  world.addEventListener('keydown', e => {
    const el = e.target.closest('.card');
    if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(+el.dataset.i); }
  });
  window.addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('.card') && (e.key === 'Enter' || e.key === ' ')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
    else if (e.key === 'Escape') closePanel();
    else if (e.key === 'f' || e.key === '0') { closePanel(); fitAll(); }
    else if (e.key === 's') $('#shuffle').click();
  });

  /* ---------------- idle / attract mode for the exhibition ---------------- */
  let idleTimer = null, tourTimer = null, tourIdx = 0;
  function wake() {
    clearTimeout(idleTimer); clearTimeout(tourTimer); tourTimer = null;
    cards.forEach(c => c.el.classList.remove('peek'));
    if (S.idleSeconds > 0) idleTimer = setTimeout(goIdle, S.idleSeconds * 1000);
  }
  function goIdle() {
    closePanel(); fitAll(1600); showHint();
    if (S.attractMode && !reduceMotion) tourTimer = setTimeout(tour, 5000);
  }
  function tour() {
    cards.forEach(c => c.el.classList.remove('peek'));
    const c = cards[tourIdx++ % n];
    if (tourIdx % 4 === 0) fitAll(2600);              // pull back now and then
    else { c.el.classList.add('peek'); toTop(c); focusCard(c, .55, 3200); }
    tourTimer = setTimeout(tour, 6500);
  }
  ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, wake, { passive: true, capture: true }));

  /* ---------------- resize ---------------- */
  addEventListener('resize', () => {
    vw = innerWidth; vh = innerHeight;
    panel.style.setProperty('--torn', portrait() ? torn('t', 1.2, 1.5) : torn('l', 2.2, 1.2));
    if (current !== null) focusCard(cards[current], 1, 300); else { clampCam(); render(); }
  });

  /* ---------------- go ---------------- */
  makeDecor();
  scatter(S.seed, false);
  cam.z = fitZoom(); cam.x = (vw - BOARD.w * cam.z) / 2; cam.y = (vh - BOARD.h * cam.z) / 2; render();
  // once images have sizes, settle into a nice overview
  let loaded = 0;
  const settle = () => { if (++loaded === n) fitAll(1200); };
  cards.forEach(c => { const img = c.el.querySelector('img'); if (img.complete && img.naturalWidth) settle(); else img.addEventListener('load', settle, { once: true }); });
  setTimeout(() => { if (loaded < n) fitAll(1200); }, 2500);
  wake();
})();
