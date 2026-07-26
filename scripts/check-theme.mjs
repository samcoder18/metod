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
