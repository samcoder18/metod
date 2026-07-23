# Блок «Форматы и цены» — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить на лендинг «Метод Цуциева» конверсионный блок «Форматы и цены» (подход A «Редакторская витрина») между отзывами и финальным CTA.

**Architecture:** Одна новая секция `<section id="ceny">` в `index.html` + немного CSS в существующем `<style>`. JS не трогаем: существующие механизмы `data-reveal` (fade-up через ScrollTrigger) и `.magnetic` (магнитные кнопки) подхватывают новую разметку автоматически — они работают по селекторам на всём документе.

**Tech Stack:** статический HTML + Tailwind 3.4 (собран в `assets/tailwind.min.css`), GSAP/Lenis уже на странице.

**Спека:** `docs/superpowers/specs/2026-07-23-prices-formats-block-design.md`

**Контекст для исполнителя (важно):**
- Дизайн-система: `design-system/metod-cutcieva/MASTER.md`. Тёмная тема, один акцент золото `#C9A24B`, hairline-разделители вместо карточек, шрифты Tenor Sans / Cormorant Garamond italic / Onest (классы `font-display`, `font-serif`, `font-body`).
- Запрещено: «—» и «–» в заголовках, лейблах, подписях, кнопках (двоеточие/точка/запятая/дефис вместо них); карточки-плашки с тенями; три одинаковые колонки; бейджи «популярный»; count-up анимации цен.
- Tailwind собирается статически: после любых правок HTML с новыми utility-классами пересобирать: `npx tailwindcss@3.4.17 -c tailwind.config.js -i src/input.css -o assets/tailwind.min.css --minify`
- `data-reveal` на любом элементе вне hero автоматически получает fade-up при скролле (index.html ~1214). `.magnetic` на ссылке/кнопке автоматически получает магнитный эффект на `pointer: fine` (index.html ~1364).
- В git ничего не коммитить без явного разрешения пользователя.

---

### Task 1: CSS для строк форматов и полосы курса

**Files:**
- Modify: `index.html` (блок `<style>`, после секции стилей списка техник, ~line 133; и список в `@media (prefers-reduced-motion: reduce)`, ~line 309)

- [ ] **Step 1: Добавить стили блока цен**

Вставить после правила `.technique-item:hover .technique-dash, .technique-item:focus-visible .technique-dash { ... }` (index.html:133):

```css
    /* ── Форматы и цены ── */
    .format-row { transition: padding-left 400ms cubic-bezier(0.22, 1, 0.36, 1); }
    .format-row:hover { padding-left: 1.5rem; }
    .format-row .format-price { transition: color 400ms; }
    .format-row:hover .format-price { color: #C9A24B; }
    @media (hover: none) { .format-row:hover { padding-left: 0; } }

    /* Полоса курса: тихое золотое свечение */
    .course-band { position: relative; }
    .course-band::before {
      content: ""; position: absolute; inset: 0; pointer-events: none;
      background: radial-gradient(ellipse 55% 85% at 82% 50%, rgba(201, 162, 75, 0.10), transparent 65%);
    }
```

- [ ] **Step 2: Дополнить reduced-motion**

В блоке `@media (prefers-reduced-motion: reduce)` (index.html:306-311) дополнить строку отключения transition: добавить `.format-row, .format-row .format-price, ` в начало существующего списка `.technique-item, .technique-item .technique-dash, ...`. Итоговая строка:

```css
      .format-row, .format-row .format-price, .technique-item, .technique-item .technique-dash, .request-strip, .request-strip img, .strip-label, .strip-body, #tech-sheet, .tech-backdrop { transition: none; }
```

---

### Task 2: HTML секции «Форматы и цены»

**Files:**
- Modify: `index.html` (между закрывающим `</section>` отзывов, line 753, и комментарием `<!-- ══════════ ЗАПИСЬ (финал) ══════════ -->`, line 755)

- [ ] **Step 1: Вставить секцию**

```html
    <!-- ══════════ ФОРМАТЫ И ЦЕНЫ ══════════ -->
    <section id="ceny" class="px-6 lg:px-12 py-24 lg:py-40 border-t border-border">
      <div class="max-w-[1400px] mx-auto">
        <h2 class="font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.08] tracking-tight mb-6" data-reveal>
          Форматы и цены
        </h2>
        <p class="text-secondary max-w-xl leading-relaxed mb-16 lg:mb-20" data-reveal>
          Цена за результат и время мастера, а не за «массаж спины».
        </p>

        <ul>
          <li class="format-row border-t border-border py-8 lg:py-10 grid lg:grid-cols-12 gap-x-8 gap-y-3 items-baseline" data-reveal>
            <h3 class="lg:col-span-5 font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-tight">Диагностика и первая сессия</h3>
            <p class="lg:col-span-4 text-secondary leading-relaxed">Разговор, карта тела, первая работа и план под ваш запрос</p>
            <span class="lg:col-span-1 text-[13px] uppercase tracking-[0.14em] text-secondary">2 часа</span>
            <span class="format-price lg:col-span-2 lg:text-right font-display text-[clamp(1.5rem,2.2vw,2rem)] leading-none">4 000 ₽</span>
          </li>
          <li class="format-row border-t border-border py-8 lg:py-10 grid lg:grid-cols-12 gap-x-8 gap-y-3 items-baseline" data-reveal>
            <h3 class="lg:col-span-5 font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-tight">Сессия метода</h3>
            <p class="lg:col-span-4 text-secondary leading-relaxed">Полная индивидуальная работа под состояние тела в конкретный день</p>
            <span class="lg:col-span-1 text-[13px] uppercase tracking-[0.14em] text-secondary">90 минут</span>
            <span class="format-price lg:col-span-2 lg:text-right font-display text-[clamp(1.5rem,2.2vw,2rem)] leading-none">5 500 ₽</span>
          </li>
          <li class="format-row border-t border-b border-border py-8 lg:py-10 grid lg:grid-cols-12 gap-x-8 gap-y-3 items-baseline" data-reveal>
            <h3 class="lg:col-span-5 font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-tight">Глубокая программа</h3>
            <p class="lg:col-span-4 text-secondary leading-relaxed">Расширенный день: глубокие техники плюс Lomi-Lomi или палсинг</p>
            <span class="lg:col-span-1 text-[13px] uppercase tracking-[0.14em] text-secondary">2.5 часа</span>
            <span class="format-price lg:col-span-2 lg:text-right font-display text-[clamp(1.5rem,2.2vw,2rem)] leading-none">9 000 ₽</span>
          </li>
        </ul>

        <div class="course-band mt-16 lg:mt-24 bg-raised border border-border px-8 py-12 lg:px-16 lg:py-16 grid lg:grid-cols-12 gap-10 items-center overflow-hidden" data-reveal>
          <div class="relative lg:col-span-6">
            <h3 class="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.08] tracking-tight mb-5">Курс из 6 сессий</h3>
            <p class="text-lg text-secondary leading-relaxed max-w-[46ch]">Устойчивый результат: работа с причиной, а не с симптомом. Программа собирается после диагностики.</p>
          </div>
          <div class="relative lg:col-span-6 lg:text-right">
            <p class="font-display text-[clamp(2.5rem,5vw,4.25rem)] leading-none text-accent">27 000 ₽</p>
            <p class="text-secondary mt-4">4 500 ₽ за сессию вместо 5 500. Выгода 6 000 ₽</p>
            <a href="#zapis" class="magnetic group inline-flex items-center gap-4 min-h-[52px] mt-8 px-9 border border-accent/70 text-accent tracking-[0.08em] uppercase text-sm hover:bg-accent hover:text-on-accent transition-colors duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none">
              Записаться
              <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"/></svg>
            </a>
          </div>
        </div>

        <p class="font-serif italic text-xl lg:text-2xl text-secondary mt-12 lg:mt-16 max-w-2xl" data-reveal>
          «Не уверены, что подходит: начните с диагностики. Её стоимость полностью зачтётся в курс.»
        </p>
      </div>
    </section>
```

- [ ] **Step 2: Проверить, что в новой разметке нет «—» и «–»**

Run: `sed -n '755,860p' index.html | grep -n '[—–]' || echo "OK: тире нет"`
Expected: `OK: тире нет`

---

### Task 3: Ссылка «Цены» в навигации

**Files:**
- Modify: `index.html:331-336` (nav в header)

- [ ] **Step 1: Добавить ссылку после «Обо мне»**

```html
        <a href="#ceny" class="nav-link hover:text-foreground transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none">Цены</a>
```

Проверка: на desktop 1024px+ навигация остаётся в одну строку (5 коротких ссылок, места достаточно).

---

### Task 4: Пересборка Tailwind

**Files:**
- Modify: `assets/tailwind.min.css` (генерируется)

- [ ] **Step 1: Пересобрать**

Run: `npx tailwindcss@3.4.17 -c tailwind.config.js -i src/input.css -o assets/tailwind.min.css --minify`
Expected: `Done in ...ms`, файл перезаписан

- [ ] **Step 2: Проверить, что новые классы попали в сборку**

Run: `grep -c 'bg-raised' assets/tailwind.min.css && grep -c 'gap-y-3' assets/tailwind.min.css`
Expected: оба числа > 0

---

### Task 5: Визуальная проверка (Playwright)

**Files:**
- Read-only: `index.html` в браузере

- [ ] **Step 1: Открыть страницу и проскроллить к блоку**

Playwright: `browser_navigate` на `file:///Users/albina/Oleg1/index.html`, затем `browser_evaluate`: `document.getElementById('ceny').scrollIntoView()`, подождать 1.5s (reveal-анимация), `browser_take_screenshot` в `.playwright-mcp/ceny-desktop.png` (viewport 1440).

- [ ] **Step 2: Мобильная проверка**

`browser_resize` 375×812, повторить скролл и скриншот `.playwright-mcp/ceny-mobile.png`. Прочитать оба скриншота через ReadMediaFile: строки в одну колонку, цена не обрезана, кнопка «Записаться» не переносится на 2 строки, нет горизонтального скролла.

- [ ] **Step 3: Проверка overflow и консоли**

`browser_evaluate`: `document.documentElement.scrollWidth <= window.innerWidth` (true на обоих вьюпортах). `browser_console_messages` level=error: ошибок нет.

- [ ] **Step 4: Контраст и дотык**

Визуально по скриншоту: цена курса золотая крупная (крупный текст, контраст ок), вторичный текст читаем. Тач-таргет кнопки ≥ 52px (min-h-[52px] в разметке).

---

### Task 6: Обновить MASTER.md

**Files:**
- Modify: `design-system/metod-cutcieva/MASTER.md` (раздел «Фирменные приёмы»)

- [ ] **Step 1: Добавить строку про блок цен**

В список «Фирменные приёмы» после пункта про типографический список техник добавить:

```markdown
- Форматы и цены: три формата типографическими строками через hairline (hover-сдвиг, цена загорается золотом), флагман «Курс из 6 сессий» широкой полосой на `raised` с золотым radial-свечением и честной строкой выгоды в рублях; под полосой serif-строка снятия возражения (зачёт диагностики в курс)
```

---

### Task 7: Коммит (только после явного разрешения пользователя)

- [ ] **Step 1: Спросить разрешение и закоммитить**

```bash
git add index.html assets/tailwind.min.css design-system/metod-cutcieva/MASTER.md docs/
git commit -m "feat: блок «Форматы и цены» между отзывами и записью"
```
