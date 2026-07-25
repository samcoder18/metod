# Cookie-согласие + политика конфиденциальности — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Плавающая плашка cookie-согласия на всех страницах сайта + страница политики конфиденциальности `privacy.html`.

**Architecture:** Один автономный скрипт `assets/cookie-consent.js` (сам создаёт DOM и стили, хранит согласие в localStorage) подключается одним `<script defer>` на 6 страниц. Новая статическая страница `privacy.html` в стиле сайта добавляется в массив `templated` в `scripts/build.mjs`.

**Tech Stack:** ванильный JS, статический HTML + Tailwind (готовый `assets/tailwind.min.css`), Node.js для сборки.

**Спека:** `docs/superpowers/specs/2026-07-25-cookie-consent-banner-design.md`

**Git:** шаги «Commit» выполняются только после явного подтверждения пользователя.

---

### Task 1: `assets/cookie-consent.js`

**Files:**
- Create: `assets/cookie-consent.js`

- [ ] **Step 1: Создать файл со следующим содержимым**

```js
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
    '@media (max-width:480px){.cc-banner{left:16px;right:16px;bottom:16px;max-width:none;}}',
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
    'Продолжая пользоваться сайтом, вы соглашаетесь с этим. ' +
    '<a class="cc-link" href="/privacy.html">Политика конфиденциальности</a></p>' +
    '<button type="button" class="cc-button">Понятно</button>';
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
```

- [ ] **Step 2: Проверить синтаксис**

Run: `node --check assets/cookie-consent.js`
Expected: без вывода, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add assets/cookie-consent.js
git commit -m "feat: cookie consent banner script"
```

---

### Task 2: `privacy.html`

**Files:**
- Create: `privacy.html`

Страница моделируется по страницам блога (абсолютные пути `/assets/...`, та же шапка и футер). Реквизиты помечены плейсхолдерами `[УКАЗАТЬ ...]` — их заполняет владелец сайта.

- [ ] **Step 1: Создать файл со следующим содержимым**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Политика конфиденциальности — Метод Цуциева</title>
  <meta name="description" content="Политика обработки персональных данных и использования cookies на сайте «Метод Цуциева».">
  <meta name="robots" content="noindex, follow">
  <!-- Все абсолютные URL собираются из SITE_URL: node scripts/build.mjs (см. .env.example) -->
  <link rel="canonical" href="__SITE_URL__/privacy.html">
  <meta property="og:title" content="Политика конфиденциальности — Метод Цуциева">
  <meta property="og:type" content="website">
  <meta property="og:url" content="__SITE_URL__/privacy.html">
  <meta property="og:locale" content="ru_RU">
  <meta property="og:site_name" content="Метод Цуциева">
  <meta name="theme-color" content="#100F0D">
  <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
  <link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png">
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Onest:wght@400;500;600&family=Tenor+Sans&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/tailwind.min.css">
</head>
<body class="bg-background text-foreground font-body">

  <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[80] focus:bg-foreground focus:text-background focus:px-4 focus:py-2">
    Перейти к содержанию
  </a>

  <!-- ══════════ HEADER ══════════ -->
  <header id="site-header" class="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
    <div class="max-w-[1400px] mx-auto px-6 lg:px-12 h-[72px] flex items-center justify-between">
      <a href="/" class="flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none" aria-label="Метод Цуциева, на главную">
        <svg class="h-6 w-auto text-accent" viewBox="36 42 326 242" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M66,76 L138,168 L212,72 V222 H332 V72 M332,222 V254"/></svg>
        <span class="font-display text-lg tracking-wide">Метод&nbsp;Цуциева</span>
      </a>
      <a href="/" class="inline-flex items-center justify-center min-h-[44px] px-6 border border-foreground/25 text-[13px] uppercase tracking-[0.14em] hover:border-accent hover:text-accent transition-colors duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none">
        На главную
      </a>
    </div>
  </header>

  <main id="main">
    <article class="px-6 lg:px-12 pt-36 lg:pt-44 pb-24 lg:pb-32">
      <div class="max-w-[800px] mx-auto">
        <h1 class="font-display tracking-[-0.01em] leading-[1.08] text-[clamp(2.25rem,4.5vw,3.75rem)] mb-12">
          Политика конфиденциальности
        </h1>

        <div class="flex flex-col gap-10 leading-relaxed text-foreground/90 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:mb-4 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_a]:text-accent [&_a]:underline">

          <section>
            <h2>1. Общие положения</h2>
            <p>Настоящая политика описывает, как сайт «Метод Цуциева» (далее — Сайт) обрабатывает данные посетителей.</p>
            <p>Оператор персональных данных: [УКАЗАТЬ ФИО / НАЗВАНИЕ ИП], адрес: [УКАЗАТЬ АДРЕС], e-mail: [УКАЗАТЬ EMAIL].</p>
            <p>Используя Сайт, вы соглашаетесь с настоящей политикой. Если вы не согласны — пожалуйста, покиньте Сайт и отключите cookies в настройках браузера.</p>
          </section>

          <section>
            <h2>2. Какие данные собираются</h2>
            <ul>
              <li><strong>Cookies</strong> — небольшие файлы, которые браузер сохраняет на вашем устройстве. Используются для корректной работы Сайта и запоминания вашего согласия с настоящей политикой.</li>
              <li><strong>Данные аналитики</strong> — на Сайте установлен счётчик Яндекс.Метрики (ООО «Яндекс», Россия). Он собирает обезличенные данные: тип устройства и браузера, страницы, которые вы посещаете, время визита, источник перехода, примерный регион.</li>
              <li><strong>Данные, которые вы сообщаете сами</strong> — имя, телефон или текст сообщения, если вы пишете в Telegram или звоните по номеру, указанному на Сайте.</li>
            </ul>
          </section>

          <section>
            <h2>3. Цели обработки</h2>
            <ul>
              <li>анализ посещаемости и улучшение Сайта;</li>
              <li>ответ на ваши обращения и запись на сессии;</li>
              <li>выполнение требований законодательства РФ, в том числе Федерального закона № 152-ФЗ «О персональных данных».</li>
            </ul>
          </section>

          <section>
            <h2>4. Передача данных третьим лицам</h2>
            <p>Обезличенные данные аналитики обрабатываются Яндексом в соответствии с <a href="https://yandex.ru/legal/confidential/" target="_blank" rel="noopener">политикой конфиденциальности Яндекса</a>. Иным третьим лицам данные не передаются, за исключением случаев, предусмотренных законом.</p>
          </section>

          <section>
            <h2>5. Сроки хранения</h2>
            <p>Данные аналитики хранятся в течение сроков, установленных Яндекс.Метрикой. Данные из личных обращений — до достижения целей обработки или до вашего запроса на удаление.</p>
          </section>

          <section>
            <h2>6. Ваши права</h2>
            <p>Вы можете в любой момент:</p>
            <ul>
              <li>отключить cookies в настройках браузера — Сайт останется доступен;</li>
              <li>запросить уточнение, блокировку или удаление ваших персональных данных, написав на [УКАЗАТЬ EMAIL].</li>
            </ul>
          </section>

          <section>
            <h2>7. Изменения политики</h2>
            <p>Актуальная версия всегда доступна на этой странице. Дата последнего обновления: [УКАЗАТЬ ДАТУ].</p>
          </section>

        </div>
      </div>
    </article>
  </main>

  <footer class="border-t border-border px-6 lg:px-12 py-8">
    <div class="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-secondary">
      <a href="/" class="flex items-center gap-2.5 font-display text-foreground/80 text-base focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none">
        <svg class="h-4 w-auto text-accent/80" viewBox="36 42 326 242" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M66,76 L138,168 L212,72 V222 H332 V72 M332,222 V254"/></svg>
        Метод Цуциева
      </a>
      <a href="tel:+79187056969" class="hover:text-foreground transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none">+7 918 705 6969</a>
      <a href="https://t.me/OlegTsutsiev" target="_blank" rel="noopener" class="hover:text-foreground transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none">Telegram: @OlegTsutsiev</a>
      <span>© 2026. Все права защищены</span>
    </div>
  </footer>

  <script src="/assets/cookie-consent.js" defer></script>
</body>
</html>
```

Примечание: классы `sr-only`, `bg-background` и т.п. уже есть в `assets/tailwind.min.css` (используются страницами блога). Произвольные варианты `[&_h2]:...` — только если они уже попали в собранный CSS; проверка — визуальная на Step 2. Если стили списков/заголовков не применились (Tailwind собран без этих классов), заменить блок `<div class="flex flex-col gap-10 ...">` на версию с явными классами у каждого `h2`/`ul` (см. `assets/blog.css` для образца типографики). Это единственное допустимое отклонение от кода выше.

- [ ] **Step 2: Проверить, что нужные Tailwind-классы есть в собранном CSS**

Run: `grep -c 'sr-only' assets/tailwind.min.css && grep -c 'backdrop-blur' assets/tailwind.min.css`
Expected: оба числа > 0. Если 0 — добавить недостающие утилиты явно (они есть в страницах блога, значит скорее всего уже собраны).

- [ ] **Step 3: Commit**

```bash
git add privacy.html
git commit -m "feat: privacy policy page"
```

---

### Task 3: Добавить `privacy.html` в сборку

**Files:**
- Modify: `scripts/build.mjs:55`

- [ ] **Step 1: Изменить массив `templated`**

Было (строка 55):
```js
const templated = ['index.html', 'robots.txt', 'sitemap.xml', '404.html'];
```
Стало:
```js
const templated = ['index.html', 'privacy.html', 'robots.txt', 'sitemap.xml', '404.html'];
```

- [ ] **Step 2: Собрать и проверить**

Run: `node scripts/build.mjs --dev && ls dist/privacy.html && grep -c '__SITE_URL__' dist/privacy.html`
Expected: файл существует; последняя команда выводит `0` (плейсхолдеры подставлены).

- [ ] **Step 3: Commit**

```bash
git add scripts/build.mjs
git commit -m "build: include privacy.html in dist"
```

---

### Task 4: Подключить скрипт на все страницы

**Files:**
- Modify: `index.html` (перед `</body>`, строка ~2274)
- Modify: `blog/kak-ispravit-osanku/index.html`
- Modify: `blog/mify-o-massazhe/index.html`
- Modify: `blog/pochemu-bolit-spina/index.html`
- Modify: `blog/stress-v-tele/index.html`
- Modify: `404.html`

- [ ] **Step 1: В каждый из 6 файлов добавить перед `</body>`**

```html
  <script src="/assets/cookie-consent.js" defer></script>
</body>
```

Edit: `old_string` = `</body>`, `new_string` = `  <script src="/assets/cookie-consent.js" defer></script>\n</body>`. В каждом файле `</body>` встречается один раз. Для `privacy.html` это уже сделано в Task 2.

- [ ] **Step 2: Проверить подключение**

Run: `grep -l 'cookie-consent.js' index.html 404.html privacy.html blog/*/index.html | wc -l`
Expected: `7`

- [ ] **Step 3: Commit**

```bash
git add index.html 404.html blog/
git commit -m "feat: load cookie consent script on all pages"
```

---

### Task 5: Сборка и проверка в браузере

**Files:** только проверка, изменений нет.

- [ ] **Step 1: Собрать**

Run: `node scripts/build.mjs --dev`
Expected: все строки `✓`, `dist/privacy.html` существует.

- [ ] **Step 2: Запустить локальный сервер**

Run: `python3 -m http.server 8765 --directory dist` (в фоне).

- [ ] **Step 3: Проверить плашку (Playwright MCP)**

1. `browser_navigate` → `http://localhost:8765/`
2. `browser_find` текст `Сайт использует cookies` — плашка найдена в левом нижнем углу.
3. Клик `Понятно` → `browser_evaluate` `localStorage.getItem('cookie-consent')` — не `null`.
4. `browser_navigate` (перезагрузка) → `browser_find` тот же текст — не найден.
5. `browser_evaluate` `localStorage.clear()` → перейти на `http://localhost:8765/blog/pochemu-bolit-spina/` — плашка снова есть.
6. Клик по ссылке «Политика конфиденциальности» → открывается `http://localhost:8765/privacy.html`, страница в стиле сайта (тёмный фон, шапка, футер).
7. `browser_resize` 390×844 → плашка вписывается в экран, текст читается.
8. Скриншот плашки и страницы политики — глазами сверить со стилем сайта.

- [ ] **Step 4: Остановить сервер и закрыть браузер**

---

## Self-Review (выполнен)

- **Покрытие спеки:** плашка (Task 1), localStorage-логика (Task 1), privacy.html (Task 2), build.mjs (Task 3), подключение на 6 страниц (Task 4, +privacy.html уже в Task 2), ручная проверка (Task 5). Ссылки в футеры не добавляем — по решению пользователя. Метрику не трогаем.
- **Плейсхолдеры:** `[УКАЗАТЬ ...]` в privacy.html — осознанные, для владельца сайта; задокументированы в спеке.
- **Консистентность:** путь `/assets/cookie-consent.js` и ключ `cookie-consent` одинаковы во всех задачах; `STORAGE_KEY` используется только внутри Task 1.
