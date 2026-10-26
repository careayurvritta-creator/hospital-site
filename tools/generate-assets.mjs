/**
 * Generates real PWA icons and a social-share (Open Graph) image from the
 * hospital logo. Run with: node tools/generate-assets.mjs
 *
 * Why: manifest.json referenced /icons/*.png that did not exist (PWA install
 * failed), and og:image pointed at SVGs / missing JPGs that social crawlers
 * cannot render. All generated files are JPEG/PNG and actually exist.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LOGO = resolve(ROOT, 'public/images/logo-nobg.png');
const ICONS_DIR = resolve(ROOT, 'public/icons');
const BG = { r: 245, g: 240, b: 232 }; // ayur-cream #F5F0E8

async function main() {
  await mkdir(ICONS_DIR, { recursive: true });

  for (const size of [72, 96, 128, 144, 152, 192, 384, 512]) {
    // 72% logo with padding works for both "any" and "maskable" purposes.
    const inner = Math.round(size * 0.72);
    const logo = await sharp(LOGO).resize(inner, inner, { fit: 'inside' }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 3, background: BG } })
      .composite([{ input: logo, gravity: 'centre' }])
      .png()
      .toFile(resolve(ICONS_DIR, `icon-${size}x${size}.png`));
    console.log(`created public/icons/icon-${size}x${size}.png`);
  }

  // 1200x630 social share card (JPEG required by Facebook/X/WhatsApp).
  const logo = await sharp(LOGO).resize(760, 380, { fit: 'inside' }).png().toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: BG } })
    .composite([{ input: logo, gravity: 'centre' }])
    .jpeg({ quality: 88 })
    .toFile(resolve(ROOT, 'public/images/og-default.jpg'));
  console.log('created public/images/og-default.jpg');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
