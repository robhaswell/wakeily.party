(() => {
  document.getElementById('year').textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Click-to-copy ---------- */
  document.addEventListener('click', async (e) => {
    const target = e.target.closest('[data-copy]');
    if (!target) return;
    const value = target.dataset.copy;
    if (!value) return;
    const original = target.textContent.trim();
    try {
      await navigator.clipboard.writeText(value);
      target.textContent = 'copied!';
      target.classList.add('is-copied');
    } catch {
      target.textContent = 'failed';
    }
    setTimeout(() => {
      target.textContent = original;
      target.classList.remove('is-copied');
    }, 1500);
  });

  /* ---------- Nav: scroll state, mobile menu, scroll-spy ---------- */
  const nav = document.getElementById('top-nav');
  const toggle = nav.querySelector('.nav-toggle');
  const navLinksContainer = nav.querySelector('.nav-links');
  const navLinks = [...nav.querySelectorAll('.nav-links a')];

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  toggle.addEventListener('click', () => {
    const open = nav.getAttribute('data-menu-open') === 'true';
    nav.setAttribute('data-menu-open', String(!open));
    toggle.setAttribute('aria-expanded', String(!open));
  });
  navLinksContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      nav.setAttribute('data-menu-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => observer.observe(s));
  }

  /* ---------- Carousel ---------- */
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = [...track.querySelectorAll('.slide')];
  const prev = carousel.querySelector('.carousel-btn.prev');
  const next = carousel.querySelector('.carousel-btn.next');
  const dots = carousel.querySelector('.carousel-dots');

  if (slides.length <= 1) {
    if (prev) prev.style.display = 'none';
    if (next) next.style.display = 'none';
    if (dots) dots.style.display = 'none';
    return;
  }

  let index = 0;
  let timer = null;
  const AUTOPLAY_MS = 5000;

  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Photo ${i + 1} of ${slides.length}`);
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.addEventListener('click', () => go(i, true));
    dots.appendChild(b);
  });
  const dotButtons = [...dots.querySelectorAll('button')];

  const render = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    dotButtons.forEach((d, i) => d.setAttribute('aria-selected', i === index ? 'true' : 'false'));
  };
  const go = (i, fromUser) => {
    index = (i + slides.length) % slides.length;
    render();
    if (fromUser) restart();
  };

  prev.addEventListener('click', () => go(index - 1, true));
  next.addEventListener('click', () => go(index + 1, true));

  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); go(index - 1, true); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1, true); }
  });

  const start = () => {
    if (reduceMotion) return;
    stop();
    timer = setInterval(() => go(index + 1, false), AUTOPLAY_MS);
  };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const restart = () => { stop(); start(); };

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  render();
  start();
})();
