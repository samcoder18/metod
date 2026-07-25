#!/usr/bin/env node
// scripts/make-mobile-crops.mjs
// Генерация мобильных кропов в assets/m/.
// Запуск: node scripts/make-mobile-crops.mjs
//
// sharp в проекте нет, поэтому:
//  - кроп/скейл делает ffmpeg -> временный PNG (без потерь);
//  - webp (q80) и jpg (q85) кодирует Pillow (в этой сборке ffmpeg
//    нет libwebp-энкодера, а sips webp писать не умеет).
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync, rmSync } from 'node:fs';

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

// PNG -> webp q80 + jpg q85. argv: tmp.png out_base
const encodePy = `
import sys
from PIL import Image
tmp, base = sys.argv[1], sys.argv[2]
im = Image.open(tmp).convert('RGB')
im.save(base + '.webp', 'WEBP', quality=80)
im.save(base + '.jpg', 'JPEG', quality=85)
`;

mkdirSync('assets/m', { recursive: true });

for (const j of jobs) {
  const tmp = `assets/m/.tmp-${j.base}.png`;
  const outBase = `assets/m/${j.base}`;
  execFileSync('ffmpeg', ['-y', '-i', j.src, '-vf', j.vf, tmp], { stdio: 'inherit' });
  execFileSync('python3', ['-c', encodePy, tmp, outBase], { stdio: 'inherit' });
  rmSync(tmp);
  console.log(`${outBase}.webp ${statSync(outBase + '.webp').size}b | ${outBase}.jpg ${statSync(outBase + '.jpg').size}b`);
}
console.log('OK: mobile crops generated');
