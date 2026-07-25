/* mobile.js — мобильный слой (< 1024px). Подключается с defer. */
(() => {
  const mq = window.matchMedia('(max-width: 1023.98px)');
  if (!mq.matches) return;

  /* --- Фолбэк без IntersectionObserver: сразу показываем всё --- */
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-m-reveal]').forEach((el) => el.classList.add('m-is-in'));
    return;
  }

  /* --- Reveal-observer (замена GSAP data-reveal) --- */
  document.querySelectorAll('[data-m-reveal="stagger"]').forEach((parent) => {
    [...parent.children].forEach((child, i) => child.style.setProperty('--i', i));
  });

  const mRevealIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('m-is-in');
        mRevealIO.unobserve(e.target);
      }
    }
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('[data-m-reveal]').forEach((el) => mRevealIO.observe(el));
})();
