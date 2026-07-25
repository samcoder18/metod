/* mobile.js — мобильный слой (< 1024px). Подключается с defer. */
(() => {
  const mq = window.matchMedia('(max-width: 1023.98px)');
  if (!mq.matches) return;

  let updateStickyCta;

  /* --- Полноэкранное меню --- */
  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  let menuOpen = false;

  /* Индексы stagger для ссылок меню — один раз при инициализации */
  [...menu.querySelectorAll('.m-menu-link')].forEach((l, i) => l.style.setProperty('--i', i));

  /* --- Sticky CTA --- */
  const stickyCta = document.getElementById('sticky-cta');
  const heroMobile = document.getElementById('hero-mobile');
  const zapisSection = document.getElementById('zapis');
  const siteFooter = document.querySelector('footer');
  let pastHero = false;
  let zapisVisible = false;
  let footerVisible = false;

  updateStickyCta = () => {
    stickyCta.classList.toggle(
      'is-visible',
      pastHero && !zapisVisible && !footerVisible && !menuOpen && document.body.style.overflow !== 'hidden'
    );
  };

  if ('IntersectionObserver' in window) {
    if (heroMobile) {
      new IntersectionObserver(([e]) => {
        pastHero = !e.isIntersecting;
        updateStickyCta();
      }, { threshold: 0 }).observe(heroMobile);
    }
    if (zapisSection) {
      new IntersectionObserver(([e]) => {
        zapisVisible = e.isIntersecting;
        updateStickyCta();
      }, { threshold: 0.15 }).observe(zapisSection);
    }
    if (siteFooter) {
      new IntersectionObserver(([e]) => {
        footerVisible = e.isIntersecting;
        updateStickyCta();
      }, { threshold: 0 }).observe(siteFooter);
    }
  }

  function openMenu() {
    menuOpen = true;
    /* Закрыть открытые bottom-sheet'ы их же механизмом — иначе конфликт overflow-lock'ов и z-index */
    document.querySelectorAll('#tech-sheet.is-open, #format-sheet.is-open').forEach((sheet) => {
      sheet.querySelector('.tech-sheet-close')?.click();
    });
    menu.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Закрыть меню');
    menuBtn.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    updateStickyCta();
    menu.querySelector('.m-menu-link')?.focus();
  }

  function closeMenu({ restoreFocus = true } = {}) {
    menuOpen = false;
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Открыть меню');
    menuBtn.classList.remove('is-active');
    document.body.style.overflow = '';
    updateStickyCta();
    setTimeout(() => { if (!menuOpen) menu.hidden = true; }, 350);
    if (restoreFocus) menuBtn.focus();
  }

  menuBtn.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => closeMenu({ restoreFocus: false })));

  /* Фокус-ловушка: крестик (menuBtn) включён в цикл.
     Слушаем и menu, и menuBtn — кнопка вне оверлея, события на ней до menu не всплывают. */
  function menuTrap(e) {
    if (!menuOpen) return;
    if (e.key !== 'Tab') return;
    const f = [menuBtn, ...menu.querySelectorAll('a')];
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  }
  menu.addEventListener('keydown', menuTrap);
  menuBtn.addEventListener('keydown', menuTrap);

  /* Ресайз за брейкпоинт с открытым меню — закрыть */
  mq.addEventListener('change', (e) => {
    if (!e.matches && menuOpen) closeMenu();
  });

  /* --- Аккордеон «Обо мне»: на мобильных открыт только первый --- */
  const aboutAccs = document.querySelectorAll('.about-acc');
  if (aboutAccs.length) {
    aboutAccs.forEach((d, i) => { d.open = i === 0; });
    /* При расширении окна за брейкпоинт — открыть все (десктопная parity) */
    mq.addEventListener('change', (e) => {
      if (!e.matches) aboutAccs.forEach((d) => { d.open = true; });
    });
  }

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
