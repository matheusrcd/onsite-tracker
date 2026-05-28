#!/usr/bin/env node
// Render all PNG icons from the master SVGs in assets/source/.
// Usage: node scripts/generate-assets.mjs

import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const src = path.join(root, 'assets', 'source');
const out = path.join(root, 'assets');

// outputs: [svg, size, destination, optional flatten color]
const targets = [
  // iOS / general app icon — flat orange background, no transparency.
  ['icon.svg', 1024, 'icon.png', '#EC7000'],
  // Android adaptive icon — foreground keeps alpha, background is solid orange.
  ['adaptive-foreground.svg', 512, 'android-icon-foreground.png', null],
  ['adaptive-foreground.svg', 432, 'android-icon-monochrome.png', null, 'monochrome.svg'],
  // 512x512 solid orange — Android adaptive background.
  [null, 512, 'android-icon-background.png', '#EC7000'],
  // Splash mark — transparent, composited over splash backgroundColor in app.json.
  ['splash.svg', 1024, 'splash-icon.png', null],
  // Web favicon.
  ['icon.svg', 48, 'favicon.png', '#EC7000'],
  // App Store marketing icon (no alpha, 1024).
  ['icon.svg', 1024, 'app-store-icon.png', '#EC7000'],
  // Google Play store icon.
  ['icon.svg', 512, 'play-store-icon.png', '#EC7000'],
];

async function render(svgName, size, dest, flatten, overrideSvg) {
  const destPath = path.join(out, dest);
  let pipeline;
  if (svgName) {
    const svg = await readFile(path.join(src, overrideSvg ?? svgName));
    pipeline = sharp(svg, { density: 384 }).resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  } else {
    // No source SVG — produce a solid color square at the target size.
    pipeline = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: flatten ?? '#FFFFFF',
      },
    });
  }
  if (flatten) {
    pipeline = pipeline.flatten({ background: flatten });
  }
  await pipeline.png({ compressionLevel: 9 }).toFile(destPath);
  console.log(`✓ ${dest}  (${size}×${size}${flatten ? `, bg ${flatten}` : ', alpha'})`);
}

// Special: monochrome uses the dedicated monochrome.svg
const fixed = targets.map((t) =>
  t[2] === 'android-icon-monochrome.png'
    ? ['adaptive-monochrome.svg', t[1], t[2], t[3]]
    : t,
);

for (const [svg, size, dest, flatten] of fixed) {
  await render(svg, size, dest, flatten);
}
console.log('Done.');
