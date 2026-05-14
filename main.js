'use strict';

/* ── Slider ──────────────────────────────────────────────────────────── */
function initSlider() {
  const captions = [
    { title: 'Bathroom Install',    meta: 'Resolved in <span class="caption-badge">4h</span> · Brugge' },
    { title: 'Main Drain Blockage', meta: 'Resolved in <span class="caption-badge">1h</span> · Ghent'  },
    { title: 'Tap Replacement',     meta: 'Resolved in <span class="caption-badge">2h</span> · Bruges' },
  ];

  const shell        = document.getElementById('sliderShell');
  const divider      = document.getElementById('sliderDivider');
  const handle       = document.getElementById('sliderHandle');
  const slides       = Array.from(document.querySelectorAll('.slide'));
  const tabs         = Array.from(document.querySelectorAll('.proof-tab'));
  const captionTitle = document.getElementById('captionTitle');
  const captionMeta  = document.getElementById('captionMeta');

  if (!shell) return;

  let currentSlide = 0;
  let pos = 20;
  let dragging = false;

  /* Auto-animation state */
  let animFrame    = null;
  let animStart    = null;
  let autoPlaying  = true;
  let resumeTimer  = null;
  const HALF_CYCLE = 3200; // ms per sweep (left→right or right→left)

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  function setPos(pct) {
    pos = clamp(pct, 2, 98);
    divider.style.left = pos + '%';
    const after = slides[currentSlide].querySelector('.slide-after');
    after.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
  }

  /* Smoothstep easing: maps t∈[0,1] to a smooth S-curve */
  function smoothstep(t) { return t * t * (3 - 2 * t); }

  function autoTick(ts) {
    if (!autoPlaying) return;
    if (!animStart) animStart = ts;

    const elapsed  = ts - animStart;
    const cycle    = HALF_CYCLE * 2;
    const phase    = elapsed % cycle;                     // 0 → cycle
    const half     = phase < HALF_CYCLE;                  // first or second sweep
    const t        = half ? phase / HALF_CYCLE : (cycle - phase) / HALF_CYCLE;
    const eased    = smoothstep(t);
    setPos(15 + eased * 70);                              // sweep 15% ↔ 85%

    animFrame = requestAnimationFrame(autoTick);
  }

  function startAuto() {
    autoPlaying = true;
    animStart   = null;
    animFrame   = requestAnimationFrame(autoTick);
  }

  function stopAuto() {
    autoPlaying = false;
    cancelAnimationFrame(animFrame);
    animStart = null;
    clearTimeout(resumeTimer);
  }

  function scheduleResume() {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(startAuto, 2500);
  }

  function switchSlide(idx) {
    slides[currentSlide].classList.remove('active');
    tabs[currentSlide].classList.remove('active');
    currentSlide = idx;
    slides[currentSlide].classList.add('active');
    tabs[currentSlide].classList.add('active');
    captionTitle.textContent = captions[idx].title;
    captionMeta.innerHTML    = captions[idx].meta;
    /* Reset animation phase so new slide starts from left */
    animStart = null;
    if (!autoPlaying) setPos(20);
  }

  slides.forEach(slide => {
    slide.querySelector('.slide-after').style.clipPath = 'inset(0 80% 0 0)';
  });

  /* Set initial caption with badge */
  captionTitle.textContent = captions[0].title;
  captionMeta.innerHTML    = captions[0].meta;

  tabs.forEach((tab, i) => tab.addEventListener('click', () => switchSlide(i)));

  function getPercent(clientX) {
    const rect = shell.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  /* Mouse drag — pauses auto, resumes 2.5s after release */
  handle.addEventListener('mousedown', e => {
    dragging = true;
    stopAuto();
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => { if (dragging) setPos(getPercent(e.clientX)); });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    scheduleResume();
  });

  /* Touch drag */
  handle.addEventListener('touchstart', e => {
    dragging = true;
    stopAuto();
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchmove', e => {
    if (!dragging) return;
    setPos(getPercent(e.touches[0].clientX));
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    scheduleResume();
  });

  /* Click anywhere on shell (not the handle) */
  shell.addEventListener('click', e => {
    if (e.target === handle || handle.contains(e.target)) return;
    stopAuto();
    setPos(getPercent(e.clientX));
    scheduleResume();
  });

  /* Kick off auto-play */
  startAuto();
}

/* ── Scroll reveal ───────────────────────────────────────────────────── */
function initScrollReveal() {
  const items = document.querySelectorAll('[data-animate]');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  items.forEach(el => observer.observe(el));
}

/* ── Counter animation ───────────────────────────────────────────────── */
function initCounters() {
  const items = document.querySelectorAll('[data-count]');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const numEl   = el.querySelector('.trust-number') || el;
      const target  = parseInt(el.dataset.count, 10);
      const suffix  = el.dataset.suffix || '';
      const dur     = 1400;
      const start   = performance.now();

      function tick(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / dur, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        const current  = Math.round(eased * target);
        numEl.textContent = current.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.25 });

  items.forEach(el => observer.observe(el));
}

/* ── Nav glass on scroll ─────────────────────────────────────────────── */
function initNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  function update() {
    nav.classList.toggle('nav--scrolled', window.scrollY > 80);
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── Scroll progress bar ─────────────────────────────────────────────── */
function initScrollBar() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function update() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width  = progress + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── Button ripple ───────────────────────────────────────────────────── */
function initRipple() {
  document.addEventListener('pointerdown', e => {
    const btn = e.target.closest('.btn-primary, .btn-white, .hero-card-cta');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x    = e.clientX - rect.left - size / 2;
    const y    = e.clientY - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  });
}

/* ── Platform bars entrance ──────────────────────────────────────────── */
function initPlatformBars() {
  const bars = document.querySelectorAll('.platform-bar');
  if (!bars.length) return;

  bars.forEach(bar => bar.classList.add('bar-hidden'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.platform-bar').forEach((bar, i) => {
        setTimeout(() => bar.classList.remove('bar-hidden'), i * 120);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  const aggregate = document.querySelector('.reviews-aggregate');
  if (aggregate) observer.observe(aggregate);
}

/* ── Init ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initScrollReveal();
  initCounters();
  initNav();
  initScrollBar();
  initRipple();
  initPlatformBars();
});
