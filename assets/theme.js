/* theme.js — переключатель тёмной/светлой темы (десктоп; кнопка скрыта на мобильных).
   Выбор хранится в localStorage["theme"] ("dark" | "light"); по умолчанию — тёмная.
   Применение темы до первой отрисовки делает инлайн-сниппет в <head> каждой страницы. */
(function () {
  var KEY = 'theme';
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  var meta = document.querySelector('meta[name="theme-color"]');
  var META_COLORS = { dark: '#100F0D', light: '#F6F3EC' };

  function current() {
    return root.dataset.theme === 'light' ? 'light' : 'dark';
  }

  function apply(theme, save) {
    root.dataset.theme = theme;
    if (meta) meta.setAttribute('content', META_COLORS[theme]);
    if (btn) {
      btn.setAttribute('aria-pressed', String(theme === 'light'));
      btn.classList.toggle('is-light', theme === 'light');
    }
    if (save) {
      try { localStorage.setItem(KEY, theme); } catch (e) { /* приватный режим */ }
    }
    /* canvas-сцены и др. подписчики перечитывают токены */
    document.dispatchEvent(new CustomEvent('themechange'));
  }

  if (btn) {
    btn.addEventListener('click', function () {
      apply(current() === 'light' ? 'dark' : 'light', true);
    });
    apply(current(), false); /* синхронизировать иконку с темой из head-сниппета */
  }
})();
