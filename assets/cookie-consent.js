/**
 * Плашка cookie-согласия.
 * Показывается один раз до согласия, выбор хранится в localStorage.
 * Подключается на всех страницах: <script src="/assets/cookie-consent.js" defer></script>
 * DOM и стили создаются скриптом — разметка в HTML не нужна.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cookie-consent';

  function hasConsent() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) !== null;
    } catch (e) {
      return false; /* localStorage недоступен — показываем плашку при каждой загрузке */
    }
  }

  function saveConsent() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, ts: Date.now() }));
    } catch (e) { /* приватный режим: просто скрываем плашку до следующей загрузки */ }
  }

  if (hasConsent()) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = [
    '.cc-banner{position:fixed;left:24px;bottom:24px;z-index:70;box-sizing:border-box;',
    'max-width:400px;padding:20px 24px;background:#1D1A16;color:#ECE7DE;',
    'border:1px solid #27231E;border-radius:12px;',
    'font-family:Onest,system-ui,sans-serif;font-size:14px;line-height:1.55;',
    'box-shadow:0 12px 40px rgba(0,0,0,.45);',
    'opacity:0;transform:translateY(12px);',
    'transition:opacity .35s ease,transform .35s ease;}',
    '.cc-banner.cc-visible{opacity:1;transform:translateY(0);}',
    '.cc-banner.cc-hidden{opacity:0;transform:translateY(12px);pointer-events:none;}',
    '.cc-text{margin:0 0 14px;}',
    '.cc-link{color:#C9A24B;text-decoration:underline;text-underline-offset:2px;}',
    '.cc-link:hover{color:#ECE7DE;}',
    '.cc-button{display:inline-flex;align-items:center;justify-content:center;',
    'min-height:40px;padding:0 22px;border:0;border-radius:8px;cursor:pointer;',
    'background:#C9A24B;color:#14120F;font:inherit;font-weight:600;',
    'transition:background .2s ease;}',
    '.cc-button:hover{background:#8F7331;color:#ECE7DE;}',
    '.cc-button:focus-visible,.cc-link:focus-visible{outline:2px solid #C9A24B;outline-offset:2px;}',
    '@media (max-width:1023.98px){.cc-banner{left:16px;right:16px;bottom:16px;max-width:none;',
    'padding:12px 16px;font-size:13px;line-height:1.45;}',
    '.cc-text{margin:0 0 10px;}',
    '.cc-button{min-height:36px;padding:0 16px;}',
    /* Страницы со sticky CTA (главная): поднимаем баннер над кнопкой (52px CTA + 16px её отступ + 16px зазор) */
    '.cc-banner.cc-above-cta{bottom:calc(84px + env(safe-area-inset-bottom));}}',
    '@media (prefers-reduced-motion:reduce){.cc-banner{transition:none;}}'
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var banner = document.createElement('div');
  banner.className = 'cc-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-live', 'polite');
  banner.setAttribute('aria-label', 'Уведомление об использовании cookies');
  banner.innerHTML =
    '<p class="cc-text">Сайт использует cookies и Яндекс.Метрику для анализа посещаемости. ' +
    '<a class="cc-link" href="/privacy.html">Политика конфиденциальности</a></p>' +
    '<button type="button" class="cc-button">Понятно</button>';
  if (document.getElementById('sticky-cta')) banner.classList.add('cc-above-cta');
  document.body.appendChild(banner);

  /* Появление — в следующий кадр, чтобы сработал transition */
  if (reduceMotion) {
    banner.classList.add('cc-visible');
  } else {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        banner.classList.add('cc-visible');
      });
    });
  }

  banner.querySelector('.cc-button').addEventListener('click', function () {
    saveConsent();
    banner.classList.remove('cc-visible');
    banner.classList.add('cc-hidden');
    window.setTimeout(function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, reduceMotion ? 0 : 400);
  });
})();
