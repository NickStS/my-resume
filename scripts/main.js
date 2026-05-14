/* ─────────────────────────────────────────────
   main.js — film grain, scroll spy, fade-in
   ───────────────────────────────────────────── */

/* ── Live film grain (canvas) ──
   Renders 1 noise pixel per device pixel for true fine grain,
   refreshes at 24fps (classic film cadence).
*/
(function () {
  const cv = document.getElementById('grain');
  if (!cv) return;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  let W, H;

  function resize() {
    /* Render at 1.5x device pixels so the browser downscales each grain dot,
       producing finer dust-like noise instead of single sharp pixels. */
    const dpr = (window.devicePixelRatio || 1) * 1.5;
    W = Math.floor(window.innerWidth  * dpr);
    H = Math.floor(window.innerHeight * dpr);
    cv.width  = W;
    cv.height = H;
    /* CSS size stays in CSS pixels */
    cv.style.width  = window.innerWidth  + 'px';
    cv.style.height = window.innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  let last = 0;
  const FPS_INTERVAL = 1000 / 24; // 24fps — film

  function draw(t) {
    requestAnimationFrame(draw);
    if (t - last < FPS_INTERVAL) return;
    last = t;

    const img  = ctx.createImageData(W, H);
    const data = img.data;
    /* fill with random monochrome noise */
    for (let i = 0; i < data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      data[i]     = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  requestAnimationFrame(draw);
})();


/* ── Scroll spy ── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  function spy() {
    let cur = '';
    /* If user scrolled to (near) the bottom — force-highlight the last section. */
    const atBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 4);
    if (atBottom && sections.length) {
      cur = sections[sections.length - 1].id;
    } else {
      /* For each section, measure how far its center is from viewport center.
         Pick the section with the SMALLEST distance — that's the one user is looking at.
         This works for short sections too. */
      const vCenter = window.innerHeight / 2;
      let bestDist = Infinity;
      sections.forEach(s => {
        const r = s.getBoundingClientRect();
        const sCenter = r.top + r.height / 2;
        const dist = Math.abs(sCenter - vCenter);
        if (dist < bestDist) {
          bestDist = dist;
          cur = s.id;
        }
      });
    }
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
  }
  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy);
  spy();
  links.forEach(l => l.addEventListener('click', e => {
    e.preventDefault();
    const id = l.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 28, behavior: 'smooth' });
  }));
})();


/* ── Intersection fade-in ── */
(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.07 });
  document.querySelectorAll('.section').forEach(s => obs.observe(s));
})();