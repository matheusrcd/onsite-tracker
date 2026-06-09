#!/usr/bin/env node
// Resize the iPhone screenshots in assets/screenshots/source/ to every
// dimension currently accepted by App Store Connect.
//
// Apple accepts (as of 2026):
//   6.9" / 6.7"  → 1290×2796 (this is the "iPhone 6.7 Display" slot in ASC)
//   6.5"         → 1242×2688 (iPhone Xs Max / 11 Pro Max class)
//
// iPhone 13 native is 1170×2532. Aspect ratios:
//   6.5"  → 1242×2688 ratio is identical to 1170×2532 (clean upscale, no crop)
//   6.7"  → 1290×2796 ratio differs by 0.15% (sub-pixel crop, invisible)
//
// We do `fit: cover` so the output is fully full-bleed (Apple rejects
// letterboxed screenshots).

import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const srcDir = path.join(root, 'assets', 'screenshots', 'source');
const outRoot = path.join(root, 'assets', 'screenshots');

const sizes = [
  { name: 'iphone-6.7', width: 1290, height: 2796, label: 'iPhone 6.7"/6.9" (primary)' },
  { name: 'iphone-6.5', width: 1242, height: 2688, label: 'iPhone 6.5" (legacy)' },
];

async function run() {
  const files = (await readdir(srcDir))
    .filter((f) => /\.(png|jpg|jpeg)$/i.test(f))
    .sort();

  if (!files.length) {
    console.error(`No source images found in ${srcDir}`);
    process.exit(1);
  }

  for (const target of sizes) {
    const dir = path.join(outRoot, target.name);
    await mkdir(dir, { recursive: true });
    console.log(`\n${target.label} → ${dir}`);
    for (const file of files) {
      const out = path.join(dir, file.replace(/\.(jpg|jpeg)$/i, '.png'));
      await sharp(path.join(srcDir, file))
        .resize(target.width, target.height, { fit: 'cover', position: 'center' })
        // Apple rejects screenshots with an alpha channel — flatten to
        // the app's neutral bg color before writing.
        .flatten({ background: '#F7F7FA' })
        .png({ compressionLevel: 9 })
        .toFile(out);
      console.log(`  ✓ ${file} → ${target.width}×${target.height}`);
    }
  }
  console.log('\nDone. Upload the files in assets/screenshots/iphone-6.7/ to App Store Connect.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
