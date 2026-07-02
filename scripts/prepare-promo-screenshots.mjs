#!/usr/bin/env node
// Promotional screenshots for the App Store (and Play Store) — with
// a pt-BR headline + subtitle composited on top of the source captures.
//
// Layout: white background, brand-colored orange accent rule, two-line
// max headline, single-line subtitle, screenshot below with rounded
// corners. Stays comfortably inside Apple's "must represent the app"
// guideline because the actual app UI is shown unmodified.
//
// Inputs:  assets/screenshots/source/*.png  (raw iPhone captures)
// Outputs: assets/screenshots/promo-iphone-6.7/*.png  (1290×2796)
//          assets/screenshots/promo-iphone-6.5/*.png  (1242×2688)

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

// Caption copy keyed to each source screenshot.
const promos = [
  {
    src: '01-hoje.png',
    headline: ['Marque seus dias', 'presenciais.'],
    subtitle: 'Automaticamente, sem precisar abrir o app.',
  },
  {
    src: '02-escritorios.png',
    headline: ['Até 3 locais', 'de trabalho.'],
    subtitle: 'Escritório, filial, casa do cliente.',
  },
  {
    src: '03-metas.png',
    headline: ['Defina sua meta.'],
    subtitle: 'Veja seu progresso na semana e no mês.',
  },
  {
    src: '04-historico.png',
    headline: ['Tudo no calendário.'],
    subtitle: 'Adicione ou remova qualquer dia.',
  },
];

const targets = [
  {
    name: 'promo-iphone-6.7', w: 1290, h: 2796,
    margin: 90,
    headlineSize: 96, headlineLineHeight: 108,
    subtitleSize: 42,
    headlineY: 320, subtitleY: 620,
    accentY: 690,
    ssY: 760,
  },
  {
    name: 'promo-iphone-6.5', w: 1242, h: 2688,
    margin: 86,
    headlineSize: 92, headlineLineHeight: 104,
    subtitleSize: 40,
    headlineY: 308, subtitleY: 596,
    accentY: 663,
    ssY: 730,
  },
  {
    // App Store Connect "iPad 13" Display" slot. The screenshot is
    // letterboxed to a phone aspect ratio centered on the canvas —
    // honest representation of an iPhone-only UI installed on iPad.
    name: 'promo-ipad-13', w: 2064, h: 2752,
    margin: 160,
    headlineSize: 134, headlineLineHeight: 154,
    subtitleSize: 58,
    headlineY: 440, subtitleY: 820,
    accentY: 900,
    ssY: 990,
  },
  {
    // Legacy "iPad 12.9" Display" slot — same content, slightly
    // different canvas. Optional, kept for completeness.
    name: 'promo-ipad-12.9', w: 2048, h: 2732,
    margin: 158,
    headlineSize: 132, headlineLineHeight: 152,
    subtitleSize: 56,
    headlineY: 436, subtitleY: 814,
    accentY: 894,
    ssY: 984,
  },
  // ─────────────── Google Play (strict 9:16 = 0.5625) ───────────────
  // Play accepts 16:9 or 9:16, each side 320–3840 px (10" tablet needs
  // ≥1080). Since Presenciei is portrait, we render 9:16 at three
  // resolutions matching the Play Console slots.
  {
    name: 'play-smartphone', w: 1080, h: 1920,
    margin: 68,
    headlineSize: 72, headlineLineHeight: 82,
    subtitleSize: 30,
    headlineY: 220, subtitleY: 470,
    accentY: 510,
    ssY: 570,
  },
  {
    name: 'play-tablet-7', w: 1440, h: 2560,
    margin: 90,
    headlineSize: 96, headlineLineHeight: 110,
    subtitleSize: 40,
    headlineY: 294, subtitleY: 626,
    accentY: 680,
    ssY: 760,
  },
  {
    name: 'play-tablet-10', w: 2160, h: 3840,
    margin: 136,
    headlineSize: 144, headlineLineHeight: 164,
    subtitleSize: 60,
    headlineY: 440, subtitleY: 940,
    accentY: 1020,
    ssY: 1140,
  },
];

const SCREENSHOT_BOTTOM_MARGIN = 70;
const SCREENSHOT_RADIUS = 64;

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function makeBackground(t, promo) {
  const tspans = promo.headline
    .map(
      (line, i) =>
        `<tspan x="${t.margin}" dy="${i === 0 ? 0 : t.headlineLineHeight}">${esc(line)}</tspan>`,
    )
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${t.w}" height="${t.h}">
  <rect width="${t.w}" height="${t.h}" fill="#FFFFFF"/>
  <!-- subtle top-band tint matching the brand -->
  <rect width="${t.w}" height="14" fill="#EC7000"/>
  <!-- headline -->
  <text x="${t.margin}" y="${t.headlineY}"
        font-family="Helvetica, Arial, sans-serif"
        font-size="${t.headlineSize}" font-weight="700"
        fill="#0F1B2D" letter-spacing="-1.5">${tspans}</text>
  <!-- subtitle -->
  <text x="${t.margin}" y="${t.subtitleY}"
        font-family="Helvetica, Arial, sans-serif"
        font-size="${t.subtitleSize}" font-weight="400"
        fill="#5B6678">${esc(promo.subtitle)}</text>
  <!-- brand accent bar -->
  <rect x="${t.margin}" y="${t.accentY}" width="72" height="8" rx="4" fill="#EC7000"/>
</svg>`;
}

async function buildPromo(target, promo) {
  const bgSvg = makeBackground(target, promo);
  const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  // Resize the source screenshot to fit the available area below the caption.
  const maxSsHeight = target.h - target.ssY - SCREENSHOT_BOTTOM_MARGIN;
  const sourcePath = path.join(root, 'assets/screenshots/source', promo.src);
  const ss = await sharp(sourcePath)
    .resize({ height: maxSsHeight, fit: 'inside' })
    .png()
    .toBuffer();
  const ssMeta = await sharp(ss).metadata();

  // Round the screenshot's corners with an SVG mask.
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ssMeta.width}" height="${ssMeta.height}">
  <rect width="${ssMeta.width}" height="${ssMeta.height}"
        rx="${SCREENSHOT_RADIUS}" ry="${SCREENSHOT_RADIUS}" fill="white"/>
</svg>`,
  );
  const ssRounded = await sharp(ss)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Soft drop shadow under the screenshot for a bit of depth.
  const shadow = await sharp({
    create: {
      width: ssMeta.width + 60,
      height: ssMeta.height + 60,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${ssMeta.width + 60}" height="${ssMeta.height + 60}">
  <rect x="30" y="30" width="${ssMeta.width}" height="${ssMeta.height}"
        rx="${SCREENSHOT_RADIUS}" ry="${SCREENSHOT_RADIUS}" fill="#0B1B3A" fill-opacity="0.10"/>
</svg>`,
        ),
        top: 0,
        left: 0,
      },
    ])
    .blur(18)
    .png()
    .toBuffer();

  const ssX = Math.round((target.w - ssMeta.width) / 2);

  const outDir = path.join(root, 'assets/screenshots', target.name);
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, promo.src);

  await sharp(bg)
    .composite([
      { input: shadow, top: target.ssY - 18, left: ssX - 30 },
      { input: ssRounded, top: target.ssY, left: ssX },
    ])
    // Apple rejects screenshots with an alpha channel — flatten then
    // explicitly drop the alpha so the PNG header is RGB, not RGBA.
    .flatten({ background: '#FFFFFF' })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  return { outPath, ssWidth: ssMeta.width, ssHeight: ssMeta.height };
}

for (const target of targets) {
  console.log(`\n${target.name}  (${target.w}×${target.h})`);
  for (const promo of promos) {
    const { outPath, ssWidth, ssHeight } = await buildPromo(target, promo);
    console.log(
      `  ✓ ${path.basename(outPath)}  ↳ screenshot ${ssWidth}×${ssHeight} inside`,
    );
  }
}
console.log('\nDone.');
