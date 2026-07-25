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

  let updateStickyCta = () => {};

  /* --- Полноэкранное меню --- */
  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    menu.hidden = false;
    [...menu.querySelectorAll('.m-menu-link')].forEach((l, i) => l.style.setProperty('--i', i));
    requestAnimationFrame(() => menu.classList.add('is-open'));
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Закрыть меню');
    menuBtn.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    updateStickyCta();
    menu.querySelector('.m-menu-link')?.focus();
  }

  function closeMenu() {
    menuOpen = false;
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Открыть меню');
    menuBtn.classList.remove('is-active');
    document.body.style.overflow = '';
    updateStickyCta();
    setTimeout(() => { if (!menuOpen) menu.hidden = true; }, 350);
    menuBtn.focus();
  }

  menuBtn.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  /* Фокус-ловушка */
  menu.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [...menu.querySelectorAll('a')];
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  });

  /* Ресайз за брейкпоинт с открытым меню — закрыть */
  mq.addEventListener('change', (e) => {
    if (!e.matches && menuOpen) closeMenu();
  });
})();
