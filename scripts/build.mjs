#!/usr/bin/env node
/**
 * Сборка статического сайта: подстановка SITE_URL во все абсолютные URL
 * (canonical, Open Graph, Schema.org, sitemap.xml, robots.txt).
 *
 * Источники с плейсхолдером __SITE_URL__ лежат в корне, результат — в dist/.
 *
 * Использование:
 *   SITE_URL=https://domain.ru node scripts/build.mjs   — прод
 *   node scripts/build.mjs --dev                        — локальный предпросмотр
 *                                                         (относительные URL)
 *
 * Зависимостей нет, нужен только Node.js.
 */
import { readFileSync, writeFileSync, cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const isDev = process.argv.includes('--dev');

/* .env — простой KEY=VALUE без библиотек; переменные окружения важнее */
function readEnv() {
  const env = {};
  const envPath = join(root, '.env');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !line.trim().startsWith('#')) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return { ...env, ...process.env };
}

const { SITE_URL: rawSiteUrl } = readEnv();
let siteUrl = (rawSiteUrl || '').trim().replace(/\/+$/, '');

if (!isDev && !siteUrl) {
  console.error('Ошибка: SITE_URL не задан.');
  console.error('Создайте .env по образцу .env.example или передайте переменную:');
  console.error('  SITE_URL=https://domain.ru node scripts/build.mjs');
  console.error('Для локального предпросмотра без домена: node scripts/build.mjs --dev');
  process.exit(1);
}

if (siteUrl && !/^https?:\/\//.test(siteUrl)) {
  console.error(`Ошибка: SITE_URL должен начинаться с http:// или https:// (сейчас: "${siteUrl}")`);
  process.exit(1);
}

/* Файлы, в которых подставляем __SITE_URL__: корневые + все страницы блога */
import { readdirSync } from 'node:fs';

const templated = ['index.html', 'privacy.html', 'robots.txt', 'sitemap.xml', '404.html', 'yandex_db8a645e11d2a4bb.html'];

function collectHtml(dir, relBase) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
    if (entry.isDirectory()) collectHtml(join(dir, entry.name), rel);
    else if (entry.name.endsWith('.html')) templated.push(rel);
  }
}
collectHtml(join(root, 'blog'), 'blog');

const placeholder = '__SITE_URL__';

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const file of templated) {
  const src = join(root, file);
  if (!existsSync(src)) continue;
  let content = readFileSync(src, 'utf8');
  const count = content.split(placeholder).length - 1;
  content = content.split(placeholder).join(siteUrl);
  const out = join(dist, file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, content);
  console.log(`✓ ${file} — подстановок SITE_URL: ${count}`);
}

/* Ассеты копируем как есть */
if (existsSync(join(root, 'assets'))) {
  cpSync(join(root, 'assets'), join(dist, 'assets'), { recursive: true });
  console.log('✓ assets/ скопированы');
}

/* favicon.ico должен лежать в корне сайта: его ищут браузеры и поисковые роботы */
if (existsSync(join(root, 'favicon.ico'))) {
  cpSync(join(root, 'favicon.ico'), join(dist, 'favicon.ico'));
  console.log('✓ favicon.ico скопирован');
}

console.log(`\nГотово: dist/ (SITE_URL=${siteUrl || '<пусто, dev-режим>'})`);
