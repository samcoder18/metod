# Мобильный редизайн лендинга «Метод Цуциева» — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Полностью пересобрать мобильную версию (< 1024px) главной страницы `index.html`: свои композиции секций, лёгкие reveal-анимации вместо GSAP, полноэкранное меню, sticky CTA, перекадрированные изображения — не трогая десктоп.

**Architecture:** Гибридный подход (спека `docs/superpowers/specs/2026-07-25-mobile-redesign-design.md`): новый CSS-слой `assets/mobile.css` + новый JS-слой `assets/mobile.js` поверх существующей страницы; отдельная мобильная разметка только для hero; один гейт `isMobile` в инлайн-скрипте отключает тяжёлые GSAP-системы на мобильных; мобильные кропы генерируются ffmpeg-скриптом.

**Tech Stack:** статичный HTML, Tailwind (уже собран в `assets/tailwind.min.css`), vanilla CSS/JS, GSAP 3.12.5 + Lenis по CDN (только десктоп), ffmpeg (установлен) для кропов, Playwright MCP для проверки.

**Ключевые факты о кодовой базе** (проверено при аудите):

- `index.html` — 2276 строк. Инлайн-`<style>` — строки 233-582, инлайн-`<script>` — 1457-2273.
- Секции: header `595-615`, hero `620-655`, манифест `#metod` `658-666`, запросы `669-733`, сессия `#sessiya` `736-800`, техники `#tekhniki` `803-907`, обо мне `#obo-mne` `910-957`, отзывы `960-1051`, цены `#ceny` `1054-1136`, FAQ `#voprosy` `1139-1388`, запись `#zapis` `1391-1404`, контакты `1409-1451`.
- Десктопный скрипт добавляет `document.documentElement.classList.add('anim')` в начале блока после проверки `if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;` (≈ строка 1975). Все скрытые начальные состояния в CSS завязаны на `html.anim`.
- `assets/tailwind.min.css` собирается отдельно (не пересобираем, все мобильные стили — чистый CSS в `mobile.css`).
- `scripts/build.mjs` копирует `assets/` в `dist/` автоматически.
- Пакета sharp нет и package.json нет; кропы делаем через `ffmpeg` (установлен, `/opt/homebrew/bin/ffmpeg`). `sips` webp не пишет — не использовать.

**Файловая структура:**

- Create: `assets/mobile.css` — весь мобильный CSS-слой (наращивается по задачам).
- Create: `assets/mobile.js` — весь мобильный JS (меню, sticky CTA, reveals, свайп, аккордеон «Обо мне»).
- Create: `scripts/make-mobile-crops.mjs` — генерация `assets/m/*.webp|jpg`.
- Create: `assets/m/` — мобильные кропы (генерируются, коммитятся).
- Modify: `index.html` — подключение слоёв, мобильный hero, бургер+меню, sticky CTA, `data-m-reveal` атрибуты, точечные правки разметки, гейт `isMobile` в скрипте.

**Правило верификации:** проект статический, тест-раннера нет. «Тест» каждой задачи — точная команда с ожидаемым выводом (grep-ассерт, node-ассерт структуры, сборка, Playwright-скриншот). Каждая задача завершается коммитом.

---

### Task 1: Скрипт мобильных кропов и генерация ассетов

**Files:**
- Create: `scripts/make-mobile-crops.mjs`
- Create: `assets/m/*` (генерируются)

Кропы: hero-постер 1920×1012 → центральный кроп 4:5 (810×1012) → 828×1035; request-1..4 (900×1200, уже 3:4) → пережать в 828×1104. Для каждого — webp (q80) + jpg-фолбэк (q85). `master.webp` (768×1157) используется как есть, кроп не нужен.

- [ ] **Step 1: Написать скрипт**

```js
#!/usr/bin/env node
// scripts/make-mobile-crops.mjs
// Генерация мобильных кропов в assets/m/ через ffmpeg (sharp в проекте нет).
// Запуск: node scripts/make-mobile-crops.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';

const jobs = [
  // Hero: 1920x1012 landscape -> центральный кроп 4:5 -> 828x1035.
  // Смещение кропа по X можно подкрутить: (iw-810)/2 = центр.
  { src: 'assets/hero-poster.jpg', base: 'hero-mobile', vf: 'crop=810:1012:(iw-810)/2:0,scale=828:1035' },
  // Запросы: 900x1200 (3:4) -> 828x1104, только пережатие.
  { src: 'assets/request-1.jpg', base: 'request-1', vf: 'scale=828:1104' },
  { src: 'assets/request-2.jpg', base: 'request-2', vf: 'scale=828:1104' },
  { src: 'assets/request-3.jpg', base: 'request-3', vf: 'scale=828:1104' },
  { src: 'assets/request-4.jpg', base: 'request-4', vf: 'scale=828:1104' },
];

mkdirSync('assets/m', { recursive: true });

for (const j of jobs) {
  const webp = `assets/m/${j.base}.webp`;
  const jpg = `assets/m/${j.base}.jpg`;
  execFileSync('ffmpeg', ['-y', '-i', j.src, '-vf', j.vf, '-quality', '80', webp], { stdio: 'inherit' });
  execFileSync('ffmpeg', ['-y', '-i', j.src, '-vf', j.vf, '-q:v', '3', jpg], { stdio: 'inherit' });
  console.log(`${webp} ${statSync(webp).size}b | ${jpg} ${statSync(jpg).size}b`);
}
console.log('OK: mobile crops generated');
```

- [ ] **Step 2: Запустить и проверить результат**

Run: `node scripts/make-mobile-crops.mjs`
Expected: вывод `OK: mobile crops generated`, 10 файлов в `assets/m/`.

Run: `ls -la assets/m/ && sips -g pixelWidth -g pixelHeight assets/m/hero-mobile.webp assets/m/request-1.webp`
Expected: `hero-mobile.webp` — 828×1035, `request-1.webp` — 828×1104. Webp-файлы ≤ ~120 КБ каждый (если больше — снизить `-quality` до 75).

- [ ] **Step 3: Визуально проверить hero-кроп**

Открыть `assets/m/hero-mobile.webp` (ReadMediaFile). Кадр должен быть читаемым вертикально: руки/действие в кадре. Если композиция плохая — подобрать смещение кропа в `vf` (например `crop=810:1012:200:0` — сдвиг влево на 200px) и перегенерировать.

- [ ] **Step 4: Commit**

```bash
git add scripts/make-mobile-crops.mjs assets/m/
git commit -m "Мобильные кропы изображений: ffmpeg-скрипт и ассеты assets/m"
```

---

### Task 2: Каркас mobile.css, mobile.js, подключение в index.html

**Files:**
- Create: `assets/mobile.css`
- Create: `assets/mobile.js`
- Modify: `index.html` (подключение, 2 строки)

- [ ] **Step 1: Создать `assets/mobile.css` (базовый слой)**

Весь файл завёрнут в медиа-запрос — десктоп не затрагивается никогда.
`html.anim ... !important`-правила ниже критичны: десктопный скрипт добавляет
`html.anim`, под которым элементы `data-reveal`, `.js-words .w`, `.reveal-line > span`,
`.photo-frame` скрыты до GSAP-анимации. GSAP на мобильных отключаем (Task 14),
поэтому здесь принудительно показываем всё это.

```css
/* ============================================================
   mobile.css — мобильный слой лендинга (< 1024px)
   Подключается ПОСЛЕ tailwind.min.css. Десктоп не затрагивается:
   всё завёрнуто в @media (max-width: 1023px).
   Система форм: карточки radius 12px, кнопки без скругления (как на десктопе).
   ============================================================ */

@media (max-width: 1023px) {

  /* --- Форс-видимость десктопных анимационных начальных состояний --- */
  html.anim [data-reveal],
  html.anim .js-words .w,
  html.anim .reveal-line > span,
  html.anim .photo-frame,
  html.anim .hero-bg {
    opacity: 1 !important;
    transform: none !important;
    clip-path: none !important;
  }
  html.anim .photo-parallax {
    transform: none !important;
  }

  /* --- Reveal-система (замена GSAP на мобильных) --- */
  html.anim [data-m-reveal] {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  html.anim [data-m-reveal="fade"] {
    transform: none;
  }
  html.anim [data-m-reveal].m-is-in {
    opacity: 1;
    transform: none;
  }
  html.anim [data-m-reveal="stagger"] > * {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: calc(var(--i, 0) * 70ms);
  }
  html.anim [data-m-reveal="stagger"].m-is-in > * {
    opacity: 1;
    transform: none;
  }

  /* --- grain: статичный, без постоянного repaint --- */
  .grain {
    animation: none !important;
  }

  /* --- Плавный скролл к якорям (Lenis на мобильных выключен) --- */
  html {
    scroll-behavior: smooth;
  }
}

@media (max-width: 1023px) and (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  html.anim [data-m-reveal],
  html.anim [data-m-reveal="stagger"] > * {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 2: Создать `assets/mobile.js` (каркас + reveal-observer)**

Весь файл гейтится мобильным брейкпоинтом: на десктопе скрипт ничего не делает.

```js
/* mobile.js — мобильный слой (< 1024px). Подключается с defer. */
(() => {
  const mq = window.matchMedia('(max-width: 1023px)');
  if (!mq.matches) return;

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
  }, { threshold: 0.2 });

  document.querySelectorAll('[data-m-reveal]').forEach((el) => mRevealIO.observe(el));
})();
```

- [ ] **Step 3: Подключить слои в `index.html`**

Найти строку подключения стилей:

Run: `grep -n 'tailwind.min.css' index.html`
Expected: одна строка `<link rel="stylesheet" href="assets/tailwind.min.css">` (≈ строка 232).

Сразу ПОСЛЕ неё добавить:

```html
  <link rel="stylesheet" href="assets/mobile.css">
```

Перед закрывающим `</body>` (после инлайн-скрипта, ≈ строка 2273) добавить:

```html
  <script src="assets/mobile.js" defer></script>
```

- [ ] **Step 4: Проверка**

Run: `grep -n 'assets/mobile' index.html`
Expected: две строки — `mobile.css` после tailwind.min.css, `mobile.js` перед `</body>`.

Run: `node scripts/build.mjs && ls dist/assets/mobile.css dist/assets/mobile.js`
Expected: сборка без ошибок, оба файла скопированы в `dist/assets/`.

- [ ] **Step 5: Commit**

```bash
git add assets/mobile.css assets/mobile.js index.html
git commit -m "Мобильный слой: каркас mobile.css/mobile.js, reveal-система, подключение"
```

---

### Task 3: Мобильный hero

**Files:**
- Modify: `index.html:620-655` (десктопный hero), `index.html` head (preload), `index.html` (новый блок)
- Modify: `assets/mobile.css`

- [ ] **Step 1: Скрыть десктопный hero на мобильных**

В `index.html:620` у секции hero классы сейчас:
`class="relative min-h-[100dvh] flex flex-col justify-center px-6 lg:px-12 overflow-hidden"`.
Заменить `flex` на `hidden lg:flex`:

```html
    <section class="relative min-h-[100dvh] hidden lg:flex flex-col justify-center px-6 lg:px-12 overflow-hidden">
```

- [ ] **Step 2: Отключить загрузку видео и постера на мобильных**

В `index.html:622-623` у `<source>` видео добавить media-атрибут:

```html
          <source src="assets/hero.mp4" type="video/mp4" media="(min-width: 1024px)">
```

Найти preload постера в `<head>`:

Run: `grep -n 'hero-poster' index.html | head -3`

У `<link rel="preload" ... hero-poster.webp ...>` добавить `media="(min-width: 1024px)"`.
Сразу после него добавить preload мобильного кадра:

```html
  <link rel="preload" as="image" href="assets/m/hero-mobile.webp" media="(max-width: 1023px)">
```

- [ ] **Step 3: Добавить мобильный hero-блок**

Сразу ПОСЛЕ закрывающего `</section>` десктопного hero (после строки 655, перед комментарием `══════════ МАНИФЕСТ`) вставить.
H1 физически один (остаётся в десктопном hero); здесь — `aria-hidden` дубль (спека §3.2).

```html
    <!-- ══════════ HERO MOBILE ══════════ -->
    <section id="hero-mobile" class="lg:hidden relative flex flex-col" aria-label="Метод Цуциева — массаж и работа с телом во Владикавказе">
      <div class="m-hero-media" data-m-reveal="fade">
        <picture>
          <source srcset="assets/m/hero-mobile.webp" type="image/webp">
          <source srcset="assets/m/hero-mobile.jpg">
          <img src="assets/m/hero-mobile.jpg" alt="Мастер проводит сессию массажа" width="828" height="1035" fetchpriority="high">
        </picture>
        <div class="m-hero-scrim" aria-hidden="true"></div>
      </div>

      <div class="px-6 pt-8 pb-12">
        <p class="text-[11px] uppercase tracking-[0.32em] text-accent mb-6" data-m-reveal>Индивидуальные сессии · Владикавказ</p>
        <span class="m-hero-title font-display" aria-hidden="true" data-m-reveal>Метод<br>Цуциева<span class="text-accent">.</span></span>
        <p class="text-lg text-secondary leading-relaxed mt-6 max-w-md" data-m-reveal>
          Персональный массаж и работа с телом во Владикавказе: снимаю боль и напряжение
          через биомеханику, возвращаю покой и энергию через глубокие телесные техники.
        </p>
        <div class="mt-8 flex flex-col items-start gap-4" data-m-reveal>
          <a href="#zapis" class="m-hero-cta">Записаться</a>
          <a href="tel:+79187056969" class="m-hero-tel">+7 918 705 69 69</a>
        </div>
      </div>
    </section>
```

- [ ] **Step 4: Добавить стили hero в `assets/mobile.css`**

Дописать ВНУТРЬ основного блока `@media (max-width: 1023px) { ... }` (перед его закрывающей скобкой):

```css
  /* --- Hero mobile --- */
  .m-hero-media {
    position: relative;
    aspect-ratio: 4 / 5;
    max-height: 58svh;
    overflow: hidden;
  }
  .m-hero-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 30%;
  }
  .m-hero-scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom,
      rgba(16, 15, 13, 0.30) 0%,
      rgba(16, 15, 13, 0) 30%,
      rgba(16, 15, 13, 0) 55%,
      #100F0D 99%);
  }
  .m-hero-title {
    display: block;
    font-size: clamp(2.75rem, 12vw, 4rem);
    line-height: 1.02;
    letter-spacing: -0.01em;
    color: #ECE7DE;
  }
  .m-hero-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 52px;
    background: #C9A24B;
    color: #14120F;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.875rem;
    transition: transform 0.2s ease, background 0.2s ease;
  }
  .m-hero-cta:active {
    transform: translateY(1px);
    background: #8F7331;
  }
  .m-hero-tel {
    color: #9C968C;
    font-size: 0.9375rem;
    letter-spacing: 0.04em;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
  .m-hero-tel:active {
    color: #C9A24B;
  }
```

- [ ] **Step 5: Проверка**

Run: `grep -c 'hero-mobile' index.html`
Expected: `5` (preload, section id, 2 source, img src... минимум 4 — проверить ≥ 4).

Run: `node -e "const h=require('fs').readFileSync('index.html','utf8'); const h1=(h.match(/<h1/g)||[]).length; if(h1!==1){console.error('FAIL: h1 count '+h1);process.exit(1)} console.log('OK: один h1')"`
Expected: `OK: один h1`.

- [ ] **Step 6: Commit**

```bash
git add index.html assets/mobile.css
git commit -m "Мобильный hero: вертикальная композиция 4:5, своя CTA, видео off на мобильных"
```

---

### Task 4: Полноэкранное меню

**Files:**
- Modify: `index.html:595-615` (header: бургер, скрытие CTA), `index.html` (оверлей после header)
- Modify: `assets/mobile.css`
- Modify: `assets/mobile.js`

- [ ] **Step 1: Бургер в шапку + скрыть CTA шапки на мобильных**

В `index.html:611` CTA «Записаться» имеет класс `magnetic inline-flex items-center ...`.
Заменить начало на `magnetic hidden lg:inline-flex items-center ...` (остальное не менять).

Сразу ПЕРЕД этой ссылкой (внутри flex-контейнера шапки, после `</nav>`) вставить бургер:

```html
      <button type="button" id="menu-btn" class="lg:hidden m-menu-btn" aria-expanded="false" aria-controls="mobile-menu" aria-label="Открыть меню">
        <span class="m-menu-btn-line" aria-hidden="true"></span>
        <span class="m-menu-btn-line" aria-hidden="true"></span>
      </button>
```

- [ ] **Step 2: Оверлей меню**

Сразу ПОСЛЕ `</header>` (строка 615) вставить:

```html
  <!-- ══════════ MOBILE MENU ══════════ -->
  <div id="mobile-menu" class="m-menu" role="dialog" aria-modal="true" aria-label="Меню" hidden>
    <nav class="m-menu-nav" aria-label="Мобильная навигация">
      <a href="#metod" class="m-menu-link">Метод</a>
      <a href="#sessiya" class="m-menu-link">Сессия</a>
      <a href="#tekhniki" class="m-menu-link">Техники</a>
      <a href="#obo-mne" class="m-menu-link">Обо мне</a>
      <a href="#ceny" class="m-menu-link">Цены</a>
      <a href="#voprosy" class="m-menu-link">Вопросы</a>
      <a href="blog/" class="m-menu-link">Блог</a>
      <a href="#kontakty" class="m-menu-link">Контакты</a>
    </nav>
    <div class="m-menu-foot">
      <a href="tel:+79187056969" class="m-menu-contact">+7 918 705 69 69</a>
      <a href="https://t.me/OlegTsutsiev" class="m-menu-contact" target="_blank" rel="noopener">Telegram @OlegTsutsiev</a>
      <a href="#zapis" class="m-menu-cta">Записаться</a>
    </div>
  </div>
```

- [ ] **Step 3: Стили меню в `assets/mobile.css`** (внутрь основного медиа-блока)

```css
  /* --- Бургер --- */
  .m-menu-btn {
    width: 44px;
    height: 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
  }
  .m-menu-btn-line {
    display: block;
    width: 24px;
    height: 1.5px;
    background: #ECE7DE;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .m-menu-btn.is-active .m-menu-btn-line:first-child {
    transform: translateY(4.25px) rotate(45deg);
  }
  .m-menu-btn.is-active .m-menu-btn-line:last-child {
    transform: translateY(-4.25px) rotate(-45deg);
  }

  /* --- Оверлей меню --- */
  .m-menu {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: #100F0D;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: calc(72px + 2rem) 1.5rem calc(2rem + env(safe-area-inset-bottom));
    opacity: 0;
    transition: opacity 0.35s ease;
  }
  .m-menu.is-open {
    opacity: 1;
  }
  .m-menu[hidden] {
    display: none;
  }
  .m-menu-nav {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .m-menu-link {
    font-family: "Tenor Sans", serif;
    font-size: clamp(2rem, 8vw, 3rem);
    line-height: 1.15;
    color: #ECE7DE;
    padding: 0.35rem 0;
    min-height: 44px;
    display: flex;
    align-items: center;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                color 0.2s ease;
    transition-delay: calc(var(--i, 0) * 60ms);
  }
  .m-menu.is-open .m-menu-link {
    opacity: 1;
    transform: none;
  }
  .m-menu-link:active {
    color: #C9A24B;
  }
  .m-menu-foot {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .m-menu-contact {
    color: #9C968C;
    font-size: 1rem;
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  .m-menu-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 52px;
    margin-top: 0.5rem;
    background: #C9A24B;
    color: #14120F;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.875rem;
  }
  .m-menu-cta:active {
    background: #8F7331;
  }
```

- [ ] **Step 4: JS меню в `assets/mobile.js`**

Дописать ВНУТРЬ IIFE, после reveal-observer'а. Состояние `menuOpen` объявляем
здесь — sticky CTA (Task 5) использует его через общую функцию `updateStickyCta`.

```js
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
```

ВНИМАНИЕ: `updateStickyCta()` появится в Task 5. Чтобы Task 4 работал автономно,
первой строкой блока меню добавить заглушку, которую Task 5 заменит:

```js
  let updateStickyCta = () => {};
```

(В Task 5 эта строка заменяется настоящей реализацией; `let` позволяет переназначить.)

- [ ] **Step 5: Проверка**

Run: `node -e "new Function(require('fs').readFileSync('assets/mobile.js','utf8')); console.log('OK: mobile.js парсится')"`
Expected: `OK: mobile.js парсится`.

Run: `grep -c 'm-menu-link' index.html`
Expected: `8` (CSS-селекторы не в index.html — только ссылки).

- [ ] **Step 6: Commit**

```bash
git add index.html assets/mobile.css assets/mobile.js
git commit -m "Мобильное меню: бургер, полноэкранный оверлей, фокус-ловушка, stagger"
```

---

### Task 5: Sticky CTA «Записаться»

**Files:**
- Modify: `index.html` (одна строка перед `</main>` или после `</main>`)
- Modify: `assets/mobile.css`
- Modify: `assets/mobile.js`

- [ ] **Step 1: Разметка**

Сразу ПОСЛЕ `</main>` (≈ строка 1405, перед `<footer`) вставить:

```html
  <a href="#zapis" id="sticky-cta" class="m-sticky-cta lg:hidden">Записаться</a>
```

- [ ] **Step 2: Стили в `assets/mobile.css`** (внутрь основного медиа-блока)

z-index 30: ниже шторок техник/цен и меню (они перекрывают без JS).

```css
  /* --- Sticky CTA --- */
  .m-sticky-cta {
    position: fixed;
    left: 1rem;
    right: 1rem;
    bottom: calc(1rem + env(safe-area-inset-bottom));
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 52px;
    background: #C9A24B;
    color: #14120F;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.875rem;
    box-shadow: 0 8px 30px rgba(201, 162, 75, 0.28);
    opacity: 0;
    transform: translateY(140%);
    pointer-events: none;
    transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .m-sticky-cta.is-visible {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }
  .m-sticky-cta:active {
    background: #8F7331;
  }
```

- [ ] **Step 3: JS в `assets/mobile.js`**

В Task 4 добавлена заглушка `let updateStickyCta = () => {};`.
Удалить её и вместо неё вставить (ПЕРЕД блоком меню, чтобы `openMenu/closeMenu`
могли вызывать функцию; `menuOpen` доступен через замыкание — объявлен в блоке
меню, поэтому блок sticky CTA размещаем ПОСЛЕ объявления `let menuOpen = false;`,
т.е. сразу после строки `let menuOpen = false;`):

```js
  /* --- Sticky CTA --- */
  const stickyCta = document.getElementById('sticky-cta');
  const heroMobile = document.getElementById('hero-mobile');
  const zapisSection = document.getElementById('zapis');
  let pastHero = false;
  let zapisVisible = false;

  updateStickyCta = () => {
    stickyCta.classList.toggle(
      'is-visible',
      pastHero && !zapisVisible && !menuOpen && document.body.style.overflow !== 'hidden'
    );
  };

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
```

И удалить строку-заглушку `let updateStickyCta = () => {};` из блока меню
(объявление `let updateStickyCta` без инициализации должно остаться ДО блока
меню: заменить заглушку на `let updateStickyCta;` перед `const menuBtn`).

Итоговый порядок внутри IIFE: reveal-observer → `let updateStickyCta;` →
блок меню (`const menuBtn...`, `let menuOpen = false;`) → блок sticky CTA
(переназначает `updateStickyCta`) → обработчики меню.

Проще: разместить блок sticky CTA сразу после строки `let menuOpen = false;`
и до `function openMenu()`. Проверить глазами итоговый порядок.

- [ ] **Step 4: Проверка**

Run: `node -e "new Function(require('fs').readFileSync('assets/mobile.js','utf8')); console.log('OK')"`
Expected: `OK`.

Run: `grep -n 'updateStickyCta' assets/mobile.js`
Expected: объявление `let updateStickyCta;`, одно присваивание `updateStickyCta = () =>`, вызовы в openMenu/closeMenu и обоих observer'ах.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/mobile.css assets/mobile.js
git commit -m "Sticky CTA «Записаться»: появление после hero, скрытие на #zapis и в меню"
```

---

### Task 6: Манифест + перенос цитаты

**Files:**
- Modify: `index.html:658-666` (секция `#metod`)
- Modify: `assets/mobile.css`

- [ ] **Step 1: Мобильная копия цитаты**

Десктопная цитата «Сначала тело…» живёт внутри десктопного hero (строки 652-654)
и на мобильных скрыта вместе с ним. Добавить мобильную копию внутрь `#metod`,
сразу после закрывающего `</blockquote>` (после строки 665, внутри
`<div class="max-w-5xl mx-auto">`):

```html
        <p class="lg:hidden font-serif italic text-xl text-secondary mt-10" data-m-reveal>«Сначала тело. За ним и всё остальное.»</p>
```

- [ ] **Step 2: Стили манифеста в `assets/mobile.css`** (внутрь основного медиа-блока)

```css
  /* --- Манифест --- */
  #metod .js-words {
    font-size: clamp(1.6rem, 5.5vw, 2.2rem) !important;
    line-height: 1.35 !important;
  }
```

Добавить `data-m-reveal` на `blockquote.js-words` в разметке (строка 660):
`class="js-words font-serif ..."` → дописать атрибут `data-m-reveal`.

- [ ] **Step 3: Проверка**

Run: `grep -n 'Сначала тело' index.html`
Expected: две строки — десктопная (в hero) и мобильная (`lg:hidden`, в #metod).

- [ ] **Step 4: Commit**

```bash
git add index.html assets/mobile.css
git commit -m "Манифест: крупнее на мобильных, цитата перенесена под манифест"
```

---

### Task 7: «С чем приходят» — карточки вместо полос

**Files:**
- Modify: `index.html:678-731` (4 блока `<picture>`)
- Modify: `assets/mobile.css`

Существующий мобильный CSS в инлайн-`<style>` (≈ строки 310-315) задаёт полосам
`height: 18.5rem` — перебиваем из `mobile.css` (грузится позже).

- [ ] **Step 1: Мобильные source в 4 `<picture>`**

В каждом из 4 блоков `<picture>` (строки 680-683, 693-696, 706-709, 719-722)
ПЕРЕД существующей строкой `<source srcset="assets/request-N.webp" type="image/webp">`
вставить две строки (N = 1..4):

```html
              <source srcset="assets/m/request-N.webp" media="(max-width: 1023px)" type="image/webp">
              <source srcset="assets/m/request-N.jpg" media="(max-width: 1023px)">
```

Порядок source важен: первый подошедший по media+type выигрывает.

- [ ] **Step 2: `data-m-reveal` на заголовок и контейнер**

Строка 671 (`<h2 ... data-reveal>`): дописать `data-m-reveal`.
Строка 678 (`<div class="requests-accordion" data-reveal>`): заменить на
`<div class="requests-accordion" data-m-reveal="stagger">`
(десктопный `data-reveal` убрать — на десктопе этот контейнер анимировался
целиком; чтобы не сломать десктоп, НЕ убирать `data-reveal`, а просто дописать
`data-m-reveal="stagger"` рядом: оба атрибута coexist, каждый работает на своей
ширине).

- [ ] **Step 3: Стили карточек в `assets/mobile.css`** (внутрь основного медиа-блока)

```css
  /* --- Запросы: карточки вместо полос --- */
  .requests-accordion {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.25rem !important;
    height: auto !important;
    min-height: 0 !important;
  }
  .request-strip {
    height: auto !important;
    min-height: 0 !important;
    flex: none !important;
    display: flex;
    flex-direction: column;
    background: #171512;
    border-radius: 12px;
    overflow: hidden;
  }
  .request-strip:nth-child(odd) {
    margin-right: 1.5rem;
  }
  .request-strip:nth-child(even) {
    margin-left: 1.5rem;
  }
  .request-strip picture {
    display: block;
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4;
    flex: none;
  }
  .request-strip picture img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .request-strip .strip-scrim,
  .request-strip .strip-label,
  .request-strip .strip-dash {
    display: none !important;
  }
  .request-strip .strip-body {
    position: static !important;
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
    padding: 1.25rem 1.25rem 1.5rem;
  }
  .request-strip .strip-body h3 {
    font-family: "Tenor Sans", serif;
    font-size: 1.375rem;
    line-height: 1.2;
    color: #ECE7DE;
    margin-bottom: 0.5rem;
  }
  .request-strip .strip-desc {
    color: #9C968C;
    font-size: 0.9375rem;
    line-height: 1.55;
  }
```

- [ ] **Step 4: Проверка**

Run: `grep -c 'assets/m/request-' index.html`
Expected: `8` (по 2 source на 4 картинки).

Run: `node -e "const h=require('fs').readFileSync('index.html','utf8'); if(!h.includes('data-m-reveal=\"stagger\"')){console.error('FAIL');process.exit(1)} console.log('OK: stagger на requests-accordion')"`
Expected: `OK: stagger на requests-accordion`.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/mobile.css
git commit -m "Запросы: вертикальные карточки с фото 3:4 вместо полос, мобильные кропы"
```

---

### Task 8: «Как проходит сессия» — timeline-лента (CSS)

**Files:**
- Modify: `index.html:744-751` (sessiya-head), `index.html:753` (.scenes)
- Modify: `assets/mobile.css`

JS-отключение canvas — в Task 14 (все правки инлайн-скрипта одним проходом).

- [ ] **Step 1: `data-m-reveal` атрибуты**

Строки 745 и 748 (h2 и лид в `.sessiya-head`): дописать `data-m-reveal`.
Строка 753 (`<div class="scenes relative">`): дописать `data-m-reveal="stagger"`.

- [ ] **Step 2: Стили в `assets/mobile.css`** (внутрь основного медиа-блока)

Перед записью посмотреть текущие стили `.scene-title-text` / `.scene-num` /
`.scenes-bg` в инлайн-`<style>` (`grep -n 'scene-title-text\|scene-num\|scenes-bg' index.html`),
чтобы !important-оверрайды ниже попадали точно.

```css
  /* --- Сессия: timeline-лента, статичный фон --- */
  #sessiya {
    background:
      radial-gradient(120% 60% at 50% 0%, rgba(201, 162, 75, 0.07) 0%, transparent 55%),
      linear-gradient(to bottom, #14120F 0%, #100F0D 30%, #100F0D 100%);
  }
  .scenes-bg-wrap {
    display: none !important;
  }
  .scene-progress {
    display: none !important;
  }
  .scenes {
    padding-bottom: 4rem;
  }
  .scene {
    position: relative;
    display: block !important;
    min-height: 0 !important;
    height: auto !important;
    padding: 2.25rem 1.5rem 2.25rem 3rem !important;
  }
  .scene::before {
    content: "";
    position: absolute;
    left: 1.5rem;
    top: 3rem;
    bottom: -2.25rem;
    width: 1px;
    background: linear-gradient(to bottom, rgba(201, 162, 75, 0.5), rgba(201, 162, 75, 0.06));
  }
  .scene:last-child::before {
    display: none;
  }
  .scene .scene-num {
    position: static !important;
    top: auto !important;
    right: auto !important;
    font-size: 3.5rem !important;
    line-height: 1 !important;
    margin-bottom: 1rem;
  }
  .scene .scene-content {
    padding: 0 !important;
    position: static !important;
    transform: none !important;
  }
  .scene .scene-title {
    font-size: clamp(2rem, 8.5vw, 2.75rem) !important;
    margin-bottom: 0.75rem !important;
  }
  .scene .scene-title-fill {
    display: none !important;
  }
  .scene .scene-title-text {
    color: #ECE7DE !important;
    -webkit-text-stroke: 0 !important;
    opacity: 1 !important;
  }
  .scene .scene-desc {
    font-size: 1.0625rem !important;
    line-height: 1.6 !important;
    color: rgba(236, 231, 222, 0.8) !important;
  }
```

- [ ] **Step 3: Проверка**

Run: `grep -n 'data-m-reveal="stagger"' index.html`
Expected: две строки — requests-accordion (Task 7) и scenes.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/mobile.css
git commit -m "Сессия: timeline-лента из 4 сцен, статичный фон, canvas отключён стилями"
```

---

### Task 9: Техники — крупнее, со стрелкой

**Files:**
- Modify: `index.html:803-835` (секция `#tekhniki`)
- Modify: `assets/mobile.css`

- [ ] **Step 1: Подсказка и атрибуты**

Прочитать строки 803-835, найти лид секции (`<p class="text-secondary ...">`).
Сразу после него добавить:

```html
        <p class="lg:hidden text-[13px] uppercase tracking-[0.14em] text-secondary/70 mb-6" data-m-reveal>Нажмите на технику, чтобы узнать подробнее</p>
```

На `<h2>` секции дописать `data-m-reveal`. На контейнер списка техник
(`<ul>`/`<div>` с `.technique-item` внутри) дописать `data-m-reveal="stagger"`.

- [ ] **Step 2: Стили в `assets/mobile.css`** (внутрь основного медиа-блока)

Перед записью проверить точную разметку `.technique-item` (кнопка или li,
есть ли вложенный span): `sed -n '803,835p' index.html`. Оверрайды:

```css
  /* --- Техники --- */
  #tekhniki .technique-item {
    font-size: clamp(1.5rem, 6vw, 2rem) !important;
    padding-top: 1.5rem !important;
    padding-bottom: 1.5rem !important;
    padding-right: 2.75rem !important;
    position: relative;
    min-height: 56px;
  }
  #tekhniki .technique-item::after {
    content: "";
    position: absolute;
    right: 0.5rem;
    top: 50%;
    width: 0.6rem;
    height: 0.6rem;
    border-right: 1.5px solid #C9A24B;
    border-bottom: 1.5px solid #C9A24B;
    transform: translateY(-50%) rotate(-45deg);
  }
  #tekhniki .technique-item:active {
    background: rgba(201, 162, 75, 0.06);
  }
```

Если в `.technique-item` уже есть декоративный элемент справа (тире/стрелка
десктопная), которая конфликтует — скрыть её:
`#tekhniki .technique-item .имя-класса { display: none !important; }`.

- [ ] **Step 3: Проверка**

Run: `grep -n 'Нажмите на технику' index.html`
Expected: одна строка.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/mobile.css
git commit -m "Техники: крупные строки со стрелкой-индикатором и подсказкой"
```

---

### Task 10: Обо мне — bleed-фото + аккордеон текста

**Files:**
- Modify: `index.html:910-957` (секция `#obo-mne`)
- Modify: `assets/mobile.css`
- Modify: `assets/mobile.js`

- [ ] **Step 1: Прочитать текущую разметку**

Run: `sed -n '910,957p' index.html`

Найти: блок фото `.photo-frame`, текстовый блок, и 4 смысловых блока
(заголовок + абзацы) в `<div class="max-w-3xl ...">`.

- [ ] **Step 2: Аккордеон из 4 текстовых блоков**

Каждый из 4 блоков вида «заголовок + содержимое» обернуть в `<details>`:

Было (условно):
```html
<div>
  <h3 class="...">О взгляде на тело</h3>
  <p class="...">...</p>
</div>
```

Стало (классы заголовка и содержимого сохранить как есть):
```html
<details class="about-acc" open>
  <summary class="...классы заголовка...">О взгляде на тело</summary>
  <div class="about-acc-body">
    <p class="...">...</p>
  </div>
</details>
```

Всем четырём — `open` (десктоп видит всё открытым, визуально без изменений:
стили summary наследуют классы бывшего заголовка). Мобильный JS (Step 4)
закроет все, кроме первого.

- [ ] **Step 3: Стили в `assets/mobile.css`** (внутрь основного медиа-блока)

```css
  /* --- Обо мне --- */
  #obo-mne .photo-frame {
    margin-left: -1.5rem;
    margin-right: -1.5rem;
    aspect-ratio: 4 / 5 !important;
  }
  .about-acc summary {
    list-style: none;
    cursor: pointer;
    position: relative;
    padding-right: 2.5rem;
    min-height: 44px;
  }
  .about-acc summary::-webkit-details-marker {
    display: none;
  }
  .about-acc summary::after {
    content: "";
    position: absolute;
    right: 0.25rem;
    top: 0.55rem;
    width: 0.55rem;
    height: 0.55rem;
    border-right: 1.5px solid #C9A24B;
    border-bottom: 1.5px solid #C9A24B;
    transform: rotate(45deg);
    transition: transform 0.25s ease;
  }
  .about-acc[open] summary::after {
    transform: rotate(225deg);
  }
  .about-acc + .about-acc {
    border-top: 1px solid #27231E;
    padding-top: 1.25rem;
    margin-top: 1.25rem;
  }
```

Десктопный маркер details тоже нужно скрыть глобально (вне медиа-запроса),
иначе на десктопе появятся треугольники. В САМОЕ НАЧАЛО `assets/mobile.css`,
ПЕРЕД медиа-блоком, добавить:

```css
/* details-аккордеон «Обо мне»: маркер скрыт на всех ширинах */
.about-acc summary {
  list-style: none;
}
.about-acc summary::-webkit-details-marker {
  display: none;
}
/* На десктопе аккордеон всегда раскрыт и без стрелок */
@media (min-width: 1024px) {
  .about-acc summary {
    pointer-events: none;
  }
  .about-acc summary::after {
    display: none;
  }
  .about-acc + .about-acc {
    border-top: none;
    padding-top: 0;
    margin-top: 0;
  }
}
```

ВНИМАНИЕ: на десктопе `details:not([open])` скрывает содержимое. Если
мобильный JS закрыл details, а пользователь повернул экран/расширил окно —
содержимое исчезнет. Страховка вне медиа-запроса:

```css
@media (min-width: 1024px) {
  .about-acc:not([open]) .about-acc-body {
    display: block;
  }
}
```

(Содержимое details скрывается браузером через внутренний слот; надёжный
кроссбраузерный способ — именно JS: в `mobile.js` слушать `mq` и при выходе
за брейкпоинт открывать все details. Реализуем в Step 4.)

- [ ] **Step 4: JS в `assets/mobile.js`**

Дописать внутрь IIFE (после блока sticky CTA):

```js
  /* --- Аккордеон «Обо мне»: на мобильных открыт только первый --- */
  const aboutAccs = document.querySelectorAll('.about-acc');
  if (aboutAccs.length) {
    aboutAccs.forEach((d, i) => { d.open = i === 0; });
    /* При расширении окна за брейкпоинт — открыть все (десктопная parity) */
    mq.addEventListener('change', (e) => {
      if (!e.matches) aboutAccs.forEach((d) => { d.open = true; });
    });
  }
```

- [ ] **Step 5: `data-m-reveal`**

На `<h2>` секции и на блок фото `.photo-frame` дописать `data-m-reveal`.

- [ ] **Step 6: Проверка**

Run: `grep -c 'about-acc' index.html`
Expected: `8` (4 details + 4 summary... минимум 4 — проверить ≥ 4).

Run: `node -e "new Function(require('fs').readFileSync('assets/mobile.js','utf8')); console.log('OK')"`
Expected: `OK`.

- [ ] **Step 7: Commit**

```bash
git add index.html assets/mobile.css assets/mobile.js
git commit -m "Обо мне: фото bleed 4:5, текстовые блоки — details-аккордеон"
```

---

### Task 11: Отзывы — точки, свайп, естественная высота

**Files:**
- Modify: `index.html:960-1051` (секция отзывов)
- Modify: `assets/mobile.css`
- Modify: `assets/mobile.js`

- [ ] **Step 1: `data-m-reveal`**

На `<h2>` (строка 962) и `.quote-stage` (966) дописать `data-m-reveal`.

- [ ] **Step 2: Стили в `assets/mobile.css`** (внутрь основного медиа-блока)

Цитаты перестают быть absolute — высота стейджа становится естественной,
риск обрезки длинных цитат исчезает. Точки возвращаем (скрыты < 640px
в инлайн-CSS).

```css
  /* --- Отзывы --- */
  .quote-stage {
    min-height: 0 !important;
  }
  .quote {
    position: static !important;
    inset: auto !important;
    display: none;
    opacity: 1 !important;
    transform: none !important;
    touch-action: pan-y;
  }
  .quote.is-active {
    display: block;
    animation: m-quote-in 0.4s ease;
  }
  .quote blockquote {
    font-size: clamp(1.4rem, 5.8vw, 1.9rem) !important;
  }
  .quote-dots {
    display: flex !important;
  }
  @keyframes m-quote-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
```

Если десктопный ротатор выставляет `.quote` инлайн-стили (opacity через
style-атрибут) — `!important` выше их перебивает; проверить в инлайн-скрипте
(`sed -n '1471,1511p' index.html`), как переключаются цитаты: класс `.is-active`
должен быть единственным механизмом. Если JS пишет `style.opacity` — оставить,
наши `!important` сильнее.

- [ ] **Step 3: Свайп в `assets/mobile.js`** (внутрь IIFE)

```js
  /* --- Свайп отзывов --- */
  const quoteStage = document.querySelector('.quote-stage');
  if (quoteStage) {
    let swipeX = null;
    quoteStage.addEventListener('pointerdown', (e) => { swipeX = e.clientX; }, { passive: true });
    quoteStage.addEventListener('pointerup', (e) => {
      if (swipeX === null) return;
      const dx = e.clientX - swipeX;
      swipeX = null;
      if (Math.abs(dx) < 40) return;
      const btn = document.querySelector(dx > 0 ? '.quote-prev' : '.quote-next');
      btn?.click();
    }, { passive: true });
  }
```

- [ ] **Step 4: Проверка**

Run: `node -e "new Function(require('fs').readFileSync('assets/mobile.js','utf8')); console.log('OK')"`
Expected: `OK`.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/mobile.css assets/mobile.js
git commit -m "Отзывы: точки навигации, свайп, естественная высота стейджа"
```

---

### Task 12: Цены — карточки

**Files:**
- Modify: `index.html:1054-1090` (секция `#ceny`)
- Modify: `assets/mobile.css`

- [ ] **Step 1: `data-m-reveal`**

На `<h2>` (1056) дописать `data-m-reveal`. На `<ul>` (1064) дописать
`data-m-reveal="stagger"`.

- [ ] **Step 2: Стили в `assets/mobile.css`** (внутрь основного медиа-блока)

```css
  /* --- Цены: карточки --- */
  #ceny ul {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }
  #ceny .format-row {
    border: none !important;
    background: #171512;
    border-radius: 12px;
    padding: 1.25rem !important;
    display: grid !important;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "title duration"
      "desc desc"
      "price more";
    column-gap: 1rem;
    row-gap: 0.5rem;
    align-items: baseline;
  }
  #ceny .format-row h3 {
    grid-area: title;
    font-size: 1.25rem !important;
  }
  #ceny .format-row p {
    grid-area: desc;
    font-size: 0.9375rem;
  }
  #ceny .format-row > span:first-of-type {
    grid-area: duration;
    white-space: nowrap;
  }
  #ceny .format-price {
    grid-area: price;
    font-size: 1.75rem !important;
  }
  #ceny .format-row::after {
    content: "Подробнее";
    grid-area: more;
    color: #C9A24B;
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    white-space: nowrap;
  }
  #ceny .format-row:active {
    background: #1D1A16;
  }
  #ceny li.format-row:last-child {
    border: 1px solid rgba(201, 162, 75, 0.4) !important;
  }
```

- [ ] **Step 3: Проверка**

Run: `grep -c 'format-row' index.html`
Expected: `4` (4 строки цен).

- [ ] **Step 4: Commit**

```bash
git add index.html assets/mobile.css
git commit -m "Цены: карточки с ценой и «Подробнее», курс выделен рамкой"
```

---

### Task 13: FAQ, Запись, Контакты — точечные правки

**Files:**
- Modify: `index.html:1391-1404` (`#zapis`), `index.html:1139-1388` (FAQ h2)
- Modify: `assets/mobile.css`

- [ ] **Step 1: Альтернативные контакты под CTA записи**

Прочитать `sed -n '1391,1404p' index.html`. После гигантской ссылки
(внутри `#zapis`, после закрывающего тега ссылки) добавить:

```html
      <div class="lg:hidden px-6 pb-16 flex flex-col gap-1">
        <a href="tel:+79187056969" class="m-zapis-alt">Позвонить: +7 918 705 69 69</a>
        <a href="https://t.me/OlegTsutsiev" target="_blank" rel="noopener" class="m-zapis-alt">Написать в Telegram</a>
      </div>
```

(Отступы у ссылки: если у неё `py-32` и текст по центру — блок ставим сразу
под ней; если ссылка единственный ребёнок секции — структуру не менять,
просто добавить div после неё.)

- [ ] **Step 2: `data-m-reveal` на FAQ**

На `<h2 id="voprosy-title">` (строка 1142) дописать `data-m-reveal`.

- [ ] **Step 3: Стили в `assets/mobile.css`** (внутрь основного медиа-блока)

```css
  /* --- FAQ --- */
  .faq-question {
    font-size: 1.35rem !important;
    min-height: 56px;
  }
  .faq-nav-mobile {
    top: 72px !important;
  }

  /* --- Запись --- */
  #zapis > a:active {
    background: #C9A24B !important;
    color: #14120F !important;
  }
  .m-zapis-alt {
    color: #9C968C;
    font-size: 1rem;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .m-zapis-alt:active {
    color: #C9A24B;
  }

  /* --- Контакты --- */
  #kontakty address a {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
  .contacts-map-iframe {
    aspect-ratio: 4 / 3;
    height: auto !important;
    min-height: 0 !important;
  }
```

Перед записью проверить точные селекторы: `grep -n 'faq-nav-mobile\|contacts-map-iframe\|#zapis' index.html | head`.
Если гигантская ссылка в `#zapis` не прямой ребёнок — поправить селектор
`#zapis > a:active` на актуальный (например `#zapis a:first-of-type:active`).

- [ ] **Step 4: Проверка**

Run: `grep -n 'm-zapis-alt' index.html`
Expected: две строки (tel и telegram).

- [ ] **Step 5: Commit**

```bash
git add index.html assets/mobile.css
git commit -m "FAQ/Запись/Контакты: зоны тапа, :active у CTA, alt-контакты, карта 4:3"
```

---

### Task 14: Гейт isMobile в инлайн-скрипте (canvas, Lenis, ScrollTrigger)

**Files:**
- Modify: `index.html:1457-2273` (инлайн-скрипт, 3 точечные правки)

Это единственная задача, трогающая существующий JS. Принцип: минимальные
правки, десктопное поведение идентично.

- [ ] **Step 1: Объявить isMobile**

Строка 1459:
```js
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

Сразу после неё добавить (скрипт написан в ES5-стиле — используем `var`):

```js
      var isMobile = window.matchMedia('(max-width: 1023px)').matches;
```

- [ ] **Step 2: Отключить canvas-модуль**

Canvas-модуль — IIFE, начинается на строке 1531:

```js
      (function () {
        var contoursC = document.querySelector('.scenes-canvas-contours');
        var strokesC = document.querySelector('.scenes-canvas-strokes');
        if (!contoursC || !strokesC) return;
```

Заменить начало на:

```js
      (function () {
        if (isMobile) return; // canvas-фон «Сессии» выключен на мобильных; статичный фон даёт mobile.css
        var contoursC = document.querySelector('.scenes-canvas-contours');
        var strokesC = document.querySelector('.scenes-canvas-strokes');
        if (!contoursC || !strokesC) return;
```

`sceneBgSet`/`sceneBgPulse` (строки 1529-1530) при этом остаются `null` —
все вызовы (строки 2117, 2128) уже обёрнуты в `if (sceneBgSet)` /
`if (sceneBgPulse)`, ничего больше гейтить не нужно. Ни одного
canvas-контекста и rAF на мобильных не создаётся.

- [ ] **Step 3: Гейт всего GSAP-блока**

Найти строку ≈ 1975:

Run: `grep -n 'window.ScrollTrigger' index.html`

Сейчас там:
```js
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
    document.documentElement.classList.add('anim');
```

Заменить на:

```js
    document.documentElement.classList.add('anim');
    if (reduceMotion || isMobile || !window.gsap || !window.ScrollTrigger) return;
```

Эффект: `html.anim` добавляется всегда (согласованность CSS-состояний;
mobile.css форс-показывает спрятанное), а Lenis, hero-анимации, scrub
манифеста, сцены, параллаксы — не инициализируются на мобильных.
FAQ-аккордеон, шторки, ротатор цитат, аккордеон полос стоят ДО этой строки
и продолжают работать.

Проверить, что до этой строки нет обращений к Lenis/ScrollTrigger, которые
живут после неё (например якорные обработчики Lenis ≈ 1980-1999 — они внутри
гейтимого блока, на мобильных якоря работают нативно + `scroll-behavior: smooth`
из mobile.css + `scroll-margin-top` из существующего CSS).

- [ ] **Step 4: Проверка форс-видимости**

Run: `grep -n 'html.anim' index.html | head -20`

Сверить каждое скрытое начальное состояние (`html.anim ... opacity: 0` /
`clip-path` / `translateY`) с форс-правилами в `assets/mobile.css` (Task 2):
`[data-reveal]`, `.js-words .w`, `.reveal-line > span`, `.photo-frame`,
`.hero-bg`, `.photo-parallax`. Если в инлайн-CSS есть ещё скрытые состояния
(например `.scene-content`, `.strip-body`, `.quote`) — добавить для них
форс-правила в `assets/mobile.css` по образцу Task 2. `.strip-body` уже
покрыт в Task 7, `.quote` — в Task 11, `.scene-content` — в Task 8.

- [ ] **Step 5: Проверка синтаксиса страницы**

Run: `node -e "
const h = require('fs').readFileSync('index.html','utf8');
const m = h.match(/<script>([\s\S]*?)<\/script>/g).filter(s => s.includes('isMobile'));
if (!m.length) { console.error('FAIL: скрипт с isMobile не найден'); process.exit(1); }
new Function(m[m.length-1].replace(/<\/?script>/g,''));
console.log('OK: инлайн-скрипт парсится');
"`
Expected: `OK: инлайн-скрипт парсится`.

Run: `node scripts/build.mjs && echo BUILD_OK`
Expected: `BUILD_OK` без ошибок.

- [ ] **Step 6: Commit**

```bash
git add index.html assets/mobile.css
git commit -m "isMobile-гейт: canvas, Lenis и ScrollTrigger отключены на мобильных"
```

---

### Task 15: Финальная проверка (Playwright + сборка)

**Files:**
- Modify: любые файлы по результатам найденных проблем

- [ ] **Step 1: Сборка и локальный сервер**

Run: `node scripts/build.mjs && (cd dist && python3 -m http.server 8901 &)`
Expected: сборка без ошибок, сервер на :8901.

- [ ] **Step 2: Прогон 375×812 (iPhone SE/13 mini)**

Playwright MCP: `browser_resize` 375×812, `browser_navigate` на
`http://localhost:8901/`. Проверить и заскриншотить каждую секцию
(`browser_take_screenshot` fullPage + отдельные секции):

- Hero: кадр 4:5 сверху, заголовок в 2 строки, CTA на всю ширину читаема
  (золотой фон / тёмный текст).
- Горизонтальный скролл отсутствует:
  `browser_evaluate` → `document.documentElement.scrollWidth <= window.innerWidth` → `true`.
- Меню: клик по бургеру → оверлей, stagger ссылок, закрытие по Escape/кресту/ссылке.
- Sticky CTA: невидим на hero, видим после, скрыт на `#zapis`.
- Карточки запросов: фото 3:4, текст под фото, смещение чётных/нечётных.
- Сессия: timeline-лента, нет canvas (фон статичный), номера не перекрывают заголовки.
- Техники: тап по строке → bottom-sheet открывается, свайп вниз закрывает.
- Обо мне: фото bleed, аккордеон — открыт первый блок.
- Отзывы: точки видны, свайп переключает (через `browser_evaluate` dispatch
  pointer events или вручную стрелками).
- Цены: карточки, курс с рамкой, тап → sheet.
- FAQ: рубрикатор sticky под шапкой, аккордеон работает.
- Запись: гигантская ссылка, под ней tel/Telegram.
- Контакты: карта 4:3.

- [ ] **Step 3: Прогон 390×844 (iPhone 14)**

Ключевые секции: hero, запросы, цены, меню. Те же проверки скролла и контраста.

- [ ] **Step 4: Десктоп-регрессия**

`browser_resize` 1440×900, перезагрузка. Проверить глазами: hero-видео играет,
сцены sticky работают, hover-превью техник живы, десктоп НЕ изменился.
`browser_take_screenshot` hero + sessiya + ceny.

- [ ] **Step 5: Производительность (грубая)**

`browser_network_requests`: при 375px НЕ должно быть запроса `hero.mp4`
и `hero-poster.webp`; должен быть `hero-mobile.webp`.
Если есть Lighthouse (`which lighthouse || npx --yes lighthouse --version`):
прогон `lighthouse http://localhost:8901/ --preset=desktop=false --form-factor=mobile --output=json --output-path=/tmp/lh.json --chrome-flags="--headless"`,
проверить LCP < 2.5s, CLS < 0.1. Если npx-тянет слишком долго — пропустить,
зафиксировать ручную проверку сети.

- [ ] **Step 6: Исправить найденное и финальный коммит**

Каждая найденная проблема — точечный фикс в `mobile.css`/`mobile.js`/`index.html`
с повторной проверкой. Затем:

```bash
git add -A
git commit -m "Мобильный редизайн: финальные правки по результатам прогона 375/390/1440"
```

- [ ] **Step 7: Остановить сервер**

```bash
kill %1 2>/dev/null; lsof -ti:8901 | xargs kill 2>/dev/null; true
```

---

## Post-plan notes

**Спек-покрытие:** §3.1 файлы → Tasks 1-2; §3.2 разметка hero → Task 3;
§3.3 JS-гейт → Task 14; §4.1 меню → Task 4; §4.2 sticky CTA → Task 5;
§4.3 hero → Task 3; §4.4 манифест → Task 6; §4.5 запросы → Task 7;
§4.6 сессия → Tasks 8+14; §4.7 техники → Task 9; §4.8 обо мне → Task 10;
§4.9 отзывы → Task 11; §4.10 цены → Task 12; §4.11-4.13 → Task 13;
§5 анимации → Task 2; §6 производительность → Tasks 1-3, 14, 15;
§7 краевые случаи → no-JS (атрибуты без html.anim видимы), webp-фолбэк (Task 1),
длинные цитаты (Task 11), safe-area (Tasks 4-5); §8 проверка → Task 15.

**Риски исполнителю:**
- Точные классы внутри `.technique-item`, `.about-блоков`, `#zapis` не
  вычитаны построчно — каждая такая задача начинается с чтения разметки.
- Если `html.anim`-скрытых состояний больше, чем перечислено в Task 2 —
  Task 14 Step 4 обязывает добить форс-правила.
- Порядок объявлений в `mobile.js` (updateStickyCta/menuOpen) описан в
  Task 5 Step 3 — сверить глазами итоговый файл.
