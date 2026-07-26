# Светлая тема для десктопа — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить переключатель тёмной/светлой темы, работающий только на десктопе (>= 1024px), без изменения дизайна и контента.

**Architecture:** CSS-переменные как единый источник цветов (`assets/theme.css`); Tailwind-цвета ссылаются на токены через `rgb(var(--c-*) / <alpha-value>)`; светлые значения живут в `[data-theme="light"]` внутри `@media (min-width: 1024px)` (мобильный всегда тёмный). Переключатель в шапке (`hidden lg:inline-flex`), выбор в `localStorage["theme"]`, инлайн-сниппет в `<head>` против FOUC.

**Tech Stack:** статический HTML, Tailwind CSS v3 (`npx tailwindcss@3`), ванильный JS, Node.js (проверочный скрипт, `scripts/build.mjs`).

**Спека:** `docs/superpowers/specs/2026-07-26-light-theme-design.md`

---

## Структура файлов

- Create: `assets/theme.css` — токены тем, переходы, иконки переключателя.
- Create: `assets/theme.js` — логика переключателя (localStorage, `data-theme`, meta theme-color, иконка).
- Create: `scripts/check-theme.mjs` — проверочный скрипт (наш «тест»).
- Modify: `tailwind.config.js` — цвета на токены, content-глобулы дополнены.
- Modify: `assets/tailwind.min.css` — пересборка (не редактируется руками).
- Modify: `assets/blog.css` — `--color-*` на токены, `rgba(16,15,13,0.88)` на `var(--c-header-bg)`.
- Modify: `assets/cookie-consent.js` — hex на токены.
- Modify: `index.html` — head-сниппет, link/script, кнопка, вычистка hex из инлайн-`<style>` и hero-градиента.
- Modify: `privacy.html`, `404.html`, `blog/index.html`, `blog/kak-ispravit-osanku/index.html`, `blog/mify-o-massazhe/index.html`, `blog/pochemu-bolit-spina/index.html`, `blog/stress-v-tele/index.html` — head-сниппет, link/script, кнопка.

## Справочные фрагменты (используются в нескольких задачах)

**Head-сниппет** — вставляется сразу после строки `<meta name="theme-color" ...>`:

```html
  <script>try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}</script>
```

**Link на theme.css** — после последнего `<link rel="stylesheet" ...>`:
- в `index.html` (пути относительные): `<link rel="stylesheet" href="assets/theme.css">`
- в остальных страницах (пути абсолютные): `<link rel="stylesheet" href="/assets/theme.css">`

**Script theme.js** — рядом с `<script src="/assets/cookie-consent.js" defer></script>`:
- в `index.html`: `<script src="assets/theme.js" defer></script>`
- в остальных: `<script src="/assets/theme.js" defer></script>`

**Кнопка переключателя** — вставляется в шапку непосредственно ПЕРЕД ссылкой-CTA (в `index.html` перед `<a href="#zapis" class="magnetic hidden lg:inline-flex ...">`, в blog/privacy — перед `<a href="/#zapis" ...>` / `<a href="/" ...>На главную</a>`; в `404.html` шапки-CTA нет — кнопку НЕ добавляем, только тему):

```html
      <button type="button" id="theme-toggle" class="hidden lg:inline-flex items-center justify-center w-11 h-11 border border-foreground/25 hover:border-accent hover:text-accent transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none" aria-pressed="false" aria-label="Переключить тему">
        <svg class="theme-icon-sun w-[18px] h-[18px]" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34L48,36.69A8,8,0,0,0,36.69,48ZM48,136H24a8,8,0,0,0,0,16H48a8,8,0,0,0,0-16Zm21.66,85.66-24-24a8,8,0,0,0-11.32,11.32l24,24a8,8,0,0,0,11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l24-24a8,8,0,0,0-11.32-11.32l-24,24A8,8,0,0,0,192,72Zm5.66,138.34a8,8,0,0,0-11.32,11.32l24,24a8,8,0,0,0,11.32-11.32l-24-24ZM232,136H208a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"/></svg>
        <svg class="theme-icon-moon w-[18px] h-[18px]" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z"/></svg>
      </button>
```

Иконки — Phosphor `sun` и `moon` (regular). В тёмной теме видно солнце (намёк на переход к светлой), в светлой — луну.

---

### Task 1: Проверочный скрипт `scripts/check-theme.mjs`

**Files:**
- Create: `scripts/check-theme.mjs`

- [ ] **Step 1: Написать проверочный скрипт**

```js
#!/usr/bin/env node
/**
 * Проверка внедрения светлой темы (см. docs/superpowers/specs/2026-07-26-light-theme-design.md).
 * Запуск: node scripts/check-theme.mjs
 * Падает с ненулевым кодом, если хоть одна проверка не пройдена.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(root, f), 'utf8');

const pages = [
  'index.html',
  'privacy.html',
  '404.html',
  'blog/index.html',
  'blog/kak-ispravit-osanku/index.html',
  'blog/mify-o-massazhe/index.html',
  'blog/pochemu-bolit-spina/index.html',
  'blog/stress-v-tele/index.html',
];

/* hex-палитра, которая должна исчезнуть из HTML/CSS/JS (живёт только в theme.css и meta theme-color) */
const palette = [
  '#100F0D', '#171512', '#1D1A16', '#ECE7DE', '#9C968C',
  '#C9A24B', '#8F7331', '#27231E', '#14120F', '#3A352E',
];
const paletteRgba = ['rgba(16, 15, 13', 'rgba(16,15,13', 'rgba(201, 162, 75', 'rgba(201,162,75'];

let failures = 0;
const fail = (msg) => { failures++; console.error(`✗ ${msg}`); };
const ok = (msg) => console.log(`✓ ${msg}`);

/* 1. theme.css: токены, светлая тема, desktop-only */
const themeCss = read('assets/theme.css');
if (themeCss.includes('@media (min-width: 1024px)') && themeCss.includes('[data-theme="light"]')) {
  ok('theme.css: светлая тема ограничена десктопом');
} else {
  fail('theme.css: нет @media (min-width: 1024px) + [data-theme="light"]');
}

/* 2. tailwind.min.css пересобран на токенах */
if (read('assets/tailwind.min.css').includes('var(--c-background)')) {
  ok('tailwind.min.css: цвета на var(--c-*)');
} else {
  fail('tailwind.min.css: не содержит var(--c-background) — нужна пересборка');
}

/* 3. Каждая страница: сниппет, theme.css, theme.js */
for (const page of pages) {
  const html = read(page);
  if (!html.includes('document.documentElement.dataset.theme')) fail(`${page}: нет head-сниппета темы`);
  else if (!html.includes('theme.css')) fail(`${page}: не подключён theme.css`);
  else if (!html.includes('theme.js')) fail(`${page}: не подключён theme.js`);
  else ok(`${page}: сниппет, theme.css, theme.js на месте`);
}

/* 4. Кнопка во всех шапках, кроме 404.html (там шапка без CTA) */
for (const page of pages.filter((p) => p !== '404.html')) {
  if (read(page).includes('id="theme-toggle"')) ok(`${page}: кнопка есть`);
  else fail(`${page}: нет кнопки #theme-toggle`);
}

/* 5. Hex-палитра вычищена (строки <meta name="theme-color"> разрешены) */
const scanFiles = [...pages, 'assets/blog.css', 'assets/cookie-consent.js'];
for (const f of scanFiles) {
  const body = read(f)
    .split('\n')
    .filter((line) => !line.includes('name="theme-color"'))
    .join('\n');
  for (const hex of palette) {
    if (body.includes(hex)) fail(`${f}: остался hex ${hex}`);
  }
  for (const rgba of paletteRgba) {
    if (body.includes(rgba)) fail(`${f}: остался хардкод ${rgba}...`);
  }
}
ok('сканирование hex завершено');

if (failures) {
  console.error(`\nПровалено проверок: ${failures}`);
  process.exit(1);
}
console.log('\nВсе проверки темы пройдены');
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `node scripts/check-theme.mjs`
Expected: FAIL — «theme.css: нет @media...», «не содержит var(--c-background)» и т.д.; exit code 1.

- [ ] **Step 3: Commit**

```bash
git add scripts/check-theme.mjs
git commit -m "test: проверочный скрипт внедрения светлой темы"
```

---

### Task 2: Токены — `assets/theme.css`

**Files:**
- Create: `assets/theme.css`

- [ ] **Step 1: Создать файл**

```css
/* ============================================================
   theme.css — дизайн-токены тем оформления.
   Спека: docs/superpowers/specs/2026-07-26-light-theme-design.md
   Подключается ПОСЛЕ tailwind.min.css / mobile.css / blog.css.
   Тёмная тема — значения по умолчанию в :root.
   Светлая — только на десктопе: @media (min-width: 1024px).
   Формат "R G B" нужен для opacity-модификаторов Tailwind.
   ============================================================ */

:root {
  --c-background: 16 15 13;    /* #100F0D */
  --c-surface: 23 21 18;       /* #171512 */
  --c-raised: 29 26 22;        /* #1D1A16 */
  --c-foreground: 236 231 222; /* #ECE7DE */
  --c-secondary: 156 150 140;  /* #9C968C */
  --c-accent: 201 162 75;      /* #C9A24B */
  --c-accent-deep: 143 115 49; /* #8F7331 */
  --c-border: 39 35 30;        /* #27231E */
  --c-on-accent: 20 18 15;     /* #14120F */
  --c-muted: 58 53 46;         /* #3A352E (quote-btn, декоративные линии) */
  --c-header-bg: rgba(16, 15, 13, 0.88);
}

@media (min-width: 1024px) {
  [data-theme="light"] {
    --c-background: 246 243 236; /* #F6F3EC */
    --c-surface: 252 250 245;    /* #FCFAF5 */
    --c-raised: 237 234 221;     /* #EDE8DD */
    --c-foreground: 27 24 19;    /* #1B1813 */
    --c-secondary: 110 103 92;   /* #6E675C */
    --c-accent: 143 115 49;      /* #8F7331 — золото, затемнённое для контраста */
    --c-accent-deep: 110 89 38;  /* #6E5926 */
    --c-border: 226 220 207;     /* #E2DCCF */
    --c-on-accent: 253 251 246;  /* #FDFBF6 */
    --c-muted: 220 213 196;      /* #DCD5C4 */
    --c-header-bg: rgba(246, 243, 236, 0.88);
  }
}

/* Плавный переход между темами */
body,
#site-header,
.request-strip,
.quote-btn,
#theme-toggle {
  transition: background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease;
}

@media (prefers-reduced-motion: reduce) {
  body,
  #site-header,
  .request-strip,
  .quote-btn,
  #theme-toggle {
    transition: none;
  }
}

/* Иконки переключателя: в тёмной теме — солнце, в светлой — луна */
#theme-toggle .theme-icon-moon { display: none; }
#theme-toggle.is-light .theme-icon-moon { display: block; }
#theme-toggle.is-light .theme-icon-sun { display: none; }
```

- [ ] **Step 2: Промежуточная проверка**

Run: `node scripts/check-theme.mjs`
Expected: всё ещё FAIL (нет tailwind-пересборки и внедрения в страницы), но проверка «theme.css: светлая тема ограничена десктопом» — PASS.

- [ ] **Step 3: Commit**

```bash
git add assets/theme.css
git commit -m "feat: токены тем оформления (theme.css)"
```

---

### Task 3: Tailwind на токенах

**Files:**
- Modify: `tailwind.config.js`
- Modify: `assets/tailwind.min.css` (пересборкой)

- [ ] **Step 1: Переписать `tailwind.config.js` целиком**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './privacy.html', './404.html', './blog/**/*.html'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--c-background) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        raised: 'rgb(var(--c-raised) / <alpha-value>)',
        foreground: 'rgb(var(--c-foreground) / <alpha-value>)',
        secondary: 'rgb(var(--c-secondary) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        'accent-deep': 'rgb(var(--c-accent-deep) / <alpha-value>)',
        border: 'rgb(var(--c-border) / <alpha-value>)',
        'on-accent': 'rgb(var(--c-on-accent) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Tenor Sans"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Onest', 'system-ui', 'sans-serif'],
      },
    }
  }
}
```

Заодно добавлены `./privacy.html` и `./404.html` в `content` — раньше их классы попадали в CSS только случайно через совпадения с index/blog.

- [ ] **Step 2: Пересобрать CSS**

Run: `npx -y tailwindcss@3 -i src/input.css -o assets/tailwind.min.css --minify`
Expected: завершается без ошибок, `assets/tailwind.min.css` перезаписан.

- [ ] **Step 3: Проверить, что цвета стали токенами**

Run: `grep -c 'var(--c-background)' assets/tailwind.min.css`
Expected: число > 0.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js assets/tailwind.min.css
git commit -m "feat: цвета Tailwind на CSS-токенах темы"
```

---

### Task 4: Логика переключателя — `assets/theme.js`

**Files:**
- Create: `assets/theme.js`

- [ ] **Step 1: Создать файл**

```js
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
  }

  if (btn) {
    btn.addEventListener('click', function () {
      apply(current() === 'light' ? 'dark' : 'light', true);
    });
    apply(current(), false); /* синхронизировать иконку с темой из head-сниппета */
  }
})();
```

- [ ] **Step 2: Синтаксическая проверка**

Run: `node --check assets/theme.js`
Expected: без вывода, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add assets/theme.js
git commit -m "feat: логика переключателя темы (theme.js)"
```

---

### Task 5: `index.html` — подключение и вычистка hex

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Head-сниппет**

После строки 24 (`<meta name="theme-color" content="#100F0D">`) вставить head-сниппет из справочных фрагментов (значение meta НЕ менять — это тёмная тема по умолчанию; `theme.js` обновляет его динамически).

- [ ] **Step 2: Подключить theme.css и theme.js**

После строки 233 (`<link rel="stylesheet" href="assets/mobile.css">`) добавить:

```html
  <link rel="stylesheet" href="assets/theme.css">
```

После строки 2383 (`<script src="/assets/cookie-consent.js" defer></script>`) добавить:

```html
  <script src="assets/theme.js" defer></script>
```

- [ ] **Step 3: Кнопка в шапку**

Перед строкой 617 (`<a href="#zapis" class="magnetic hidden lg:inline-flex ...">Записаться</a>`) вставить кнопку `#theme-toggle` из справочных фрагментов.

- [ ] **Step 4: Вычистка hex в инлайн-`<style>` (строки ~236–500)**

В блоке `:root` (строки 236–241) заменить значения и дополнить токенами:

```css
    :root {
      --color-background: rgb(var(--c-background));
      --color-foreground: rgb(var(--c-foreground));
      --color-accent: rgb(var(--c-accent));
      --color-border: rgb(var(--c-border));
      --color-secondary: rgb(var(--c-secondary));
      --color-on-accent: rgb(var(--c-on-accent));
      --color-muted: rgb(var(--c-muted));
    }
```

Далее по блоку (точные замены, все внутри того же `<style>`):

| Строка | Было | Стало |
|---|---|---|
| 244 | `background: #100F0D;` | `background: var(--color-background);` |
| 245 | `background: rgba(201, 162, 75, 0.28); color: #ECE7DE;` | `background: rgb(var(--c-accent) / 0.28); color: var(--color-foreground);` |
| 294 | `color: #ECE7DE;` | `color: var(--color-foreground);` |
| 301 | `color: #ECE7DE;` | `color: var(--color-foreground);` |
| 303 | `background: #C9A24B;` | `background: var(--color-accent);` |
| 304 | `outline: 2px solid #C9A24B;` | `outline: 2px solid var(--color-accent);` |
| 321 | `color: #ECE7DE;` | `color: var(--color-foreground);` |
| 323 | `background-color: #C9A24B;` | `background-color: var(--color-accent);` |
| 329 | `color: #C9A24B;` | `color: var(--color-accent);` |
| 338 | `background: #100F0D;` | `background: var(--color-background);` |
| 363 | `color: #ECE7DE;` | `color: var(--color-foreground);` |
| 378 | `background: #100F0D;` | `background: var(--color-background);` |
| 392 | `color: #9C968C;` | `color: var(--color-secondary);` |
| 407 | `color: #9C968C;` | `color: var(--color-secondary);` |
| 410 | `color: #ECE7DE;` | `color: var(--color-foreground);` |
| 420 | `background: #3A352E;` | `background: var(--color-muted);` |
| 470 | `background: #3A352E;` | `background: var(--color-muted);` |
| 489 | `background: #C9A24B; color: #14120F;` | `background: var(--color-accent); color: var(--color-on-accent);` |
| 498 | `background: #14120F; color: #C9A24B;` | `background: var(--color-on-accent); color: var(--color-accent);` |

Если в блоке есть правило `#site-header.is-scrolled` с `rgba(16, 15, 13, ...)` — заменить фон на `var(--c-header-bg)` (найти: `grep -n 'rgba(16' index.html`).

- [ ] **Step 5: Hero-градиент**

Строка 651: `rgba(201,162,75,0.10)` → `rgb(var(--c-accent) / 0.10)`.

- [ ] **Step 6: Прогнать проверку**

Run: `node scripts/check-theme.mjs`
Expected: по `index.html` все проверки PASS; остальные страницы пока FAIL.

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: светлая тема на главной (index.html)"
```

---

### Task 6: `privacy.html` и `404.html`

**Files:**
- Modify: `privacy.html`
- Modify: `404.html`

- [ ] **Step 1: `privacy.html`**

- После строки 16 (`<meta name="theme-color" content="#100F0D">`) — head-сниппет.
- После строки 25 (`<link rel="stylesheet" href="/assets/blog.css">`) — `<link rel="stylesheet" href="/assets/theme.css">`.
- Перед строкой 40 (`<a href="/" ...>На главную</a>`) — кнопка `#theme-toggle`.
- Рядом со строкой 108 (`<script src="/assets/cookie-consent.js" defer></script>`) — `<script src="/assets/theme.js" defer></script>`.

- [ ] **Step 2: `404.html`**

- После строки с `<meta name="theme-color" ...>` — head-сниппет.
- После последнего `<link rel="stylesheet" href="/assets/tailwind.min.css">` — `<link rel="stylesheet" href="/assets/theme.css">`.
- В инлайн-`<style>`: `body { background: #100F0D; ... }` → `body { background: rgb(var(--c-background)); -webkit-font-smoothing: antialiased; }`.
- Рядом со строкой 61 (`<script src="/assets/cookie-consent.js" defer></script>`) — `<script src="/assets/theme.js" defer></script>`.
- Кнопку НЕ добавлять (шапка без CTA и навигации).

- [ ] **Step 3: Прогнать проверку**

Run: `node scripts/check-theme.mjs`
Expected: `privacy.html` и `404.html` — PASS; blog-страницы пока FAIL.

- [ ] **Step 4: Commit**

```bash
git add privacy.html 404.html
git commit -m "feat: светлая тема на privacy и 404"
```

---

### Task 7: Блог — `assets/blog.css` и 5 страниц

**Files:**
- Modify: `assets/blog.css`
- Modify: `blog/index.html`, `blog/kak-ispravit-osanku/index.html`, `blog/mify-o-massazhe/index.html`, `blog/pochemu-bolit-spina/index.html`, `blog/stress-v-tele/index.html`

- [ ] **Step 1: `assets/blog.css` — переменные на токены**

В верхнем блоке `:root` (строки ~6–11) заменить hex-значения:

```css
:root {
  --color-background: rgb(var(--c-background));
  --color-foreground: rgb(var(--c-foreground));
  --color-accent: rgb(var(--c-accent));
  --color-border: rgb(var(--c-border));
}
```

(Сохранить остальные переменные блока, если они есть, — заменить только четыре цветовых.)

- [ ] **Step 2: `assets/blog.css` — фон прилипшей шапки**

Строка 35: `background: rgba(16, 15, 13, 0.88);` → `background: var(--c-header-bg);`.

Проверить, что других hex/rgba палитры не осталось:

Run: `grep -n '#100F0D\|#171512\|#1D1A16\|#ECE7DE\|#9C968C\|#C9A24B\|#8F7331\|#27231E\|#14120F\|rgba(16' assets/blog.css`
Expected: пустой вывод (любые находки — заменить на ближайший `var(--color-*)`).

- [ ] **Step 3: Пять страниц блога**

В каждой из `blog/index.html`, `blog/kak-ispravit-osanku/index.html`, `blog/mify-o-massazhe/index.html`, `blog/pochemu-bolit-spina/index.html`, `blog/stress-v-tele/index.html`:

- После `<meta name="theme-color" content="#100F0D">` — head-сниппет.
- После `<link rel="stylesheet" href="/assets/blog.css">` — `<link rel="stylesheet" href="/assets/theme.css">`.
- В шапке перед ссылкой-CTA (в `blog/index.html` и статьях это `<a href="/#zapis" ...>Записаться</a>`; вставка между `</nav>` и этой ссылкой) — кнопка `#theme-toggle`.
- Рядом с `<script src="/assets/cookie-consent.js" defer></script>` — `<script src="/assets/theme.js" defer></script>`.

Внимание: в статьях блога есть второй `<header>` (заголовок статьи, ~строка 150) — кнопку вставлять только в `#site-header`.

- [ ] **Step 4: Прогнать проверку**

Run: `node scripts/check-theme.mjs`
Expected: все проверки страниц и кнопок PASS; остаётся FAIL только по `assets/cookie-consent.js` (hex-палитра).

- [ ] **Step 5: Commit**

```bash
git add assets/blog.css blog/
git commit -m "feat: светлая тема в блоге (blog.css + 5 страниц)"
```

---

### Task 8: `assets/cookie-consent.js`

**Files:**
- Modify: `assets/cookie-consent.js`

- [ ] **Step 1: Заменить hex на токены (строки ~32–48)**

```js
    'max-width:400px;padding:20px 24px;background:rgb(var(--c-raised));color:rgb(var(--c-foreground));',
    'border:1px solid rgb(var(--c-border));border-radius:12px;',
```

```js
    '.cc-link{color:rgb(var(--c-accent));text-decoration:underline;text-underline-offset:2px;}',
    '.cc-link:hover{color:rgb(var(--c-foreground));}',
```

```js
    'background:rgb(var(--c-accent));color:rgb(var(--c-on-accent));font:inherit;font-weight:600;',
    'transition:background .2s ease;}',
    '.cc-button:hover{background:rgb(var(--c-accent-deep));color:rgb(var(--c-foreground));}',
    '.cc-button:focus-visible,.cc-link:focus-visible{outline:2px solid rgb(var(--c-accent));outline-offset:2px;}',
```

(Сохранить окружающую структуру шаблонных строк файла; заменить только значения цветов.)

- [ ] **Step 2: Прогнать полную проверку**

Run: `node scripts/check-theme.mjs`
Expected: «Все проверки темы пройдены», exit code 0.

- [ ] **Step 3: Commit**

```bash
git add assets/cookie-consent.js
git commit -m "feat: cookie-баннер на токенах темы"
```

---

### Task 9: Сборка и визуальная верификация

**Files:**
- Modify: `dist/` (результат сборки, в git может не коммититься — проверить `.gitignore`)

- [ ] **Step 1: Сборка**

Run: `node scripts/build.mjs --dev`
Expected: «Готово: dist/ ...», `dist/assets/theme.css` и `dist/assets/theme.js` существуют:

Run: `ls dist/assets/theme.css dist/assets/theme.js`
Expected: оба файла перечислены.

- [ ] **Step 2: Визуальная проверка в браузере (Playwright)**

Поднять локальный сервер из корня проекта (`python3 -m http.server 8765` или `npx serve .`), затем через Playwright MCP:

1. Открыть `http://localhost:8765/index.html` на viewport 1440×900 → скриншот (тёмная тема по умолчанию).
2. Кликнуть `#theme-toggle` → скриншот (светлая): проверить глазами hero, секции, шапку, форму записи, футер — текст читаем, контрасты в порядке, золото читается на светлом.
3. Перезагрузить страницу → тема осталась светлой (localStorage) и НЕ было вспышки тёмного.
4. Кликнуть `#theme-toggle` обратно → тёмная тема выглядит как раньше.
5. Открыть `http://localhost:8765/blog/pochemu-bolit-spina/` → переключить тему → проверить статью и прилипшую шапку в обеих темах.
6. Resize 800×900 (мобильный) → кнопки `#theme-toggle` нет, тема тёмная независимо от сохранённого значения.
7. Остановить сервер.

- [ ] **Step 3: Финальная проверка**

Run: `node scripts/check-theme.mjs && node scripts/build.mjs --dev`
Expected: все проверки PASS, сборка успешна.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: финальная верификация светлой темы" || true
```

(Если `dist/` в `.gitignore` и менять больше нечего — коммит пустым не создавать.)

---

## Self-review notes

- Покрытие спеки: токены (Task 2), Tailwind (Task 3), переключатель + localStorage + FOUC-сниппет + meta theme-color (Tasks 4–7), вычистка hex (Tasks 5, 7, 8), blog.css и `--c-header-bg` (Task 7), cookie-consent (Task 8), сборка + визуальная проверка + мобильный (Task 9). Вне scope (prefers-color-scheme, мобильный переключатель, редизайн) — не добавляется.
- Отклонение от спеки, зафиксированное здесь: добавлен 11-й токен `--c-muted` (hex `#3A352E` встречается в инлайн-стилях index.html, в спеке не был учтён); светлое значение `#DCD5C4`.
- Имена согласованы: токены `--c-*`, `data-theme="light"`, `#theme-toggle`, классы `.theme-icon-sun`/`.theme-icon-moon`/`.is-light`, ключ `localStorage["theme"]` — одинаковы во всех задачах.
