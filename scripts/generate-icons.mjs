/**
 * Generate PWA icons as PNG files using SVG → data URL → sharp
 * Run: node scripts/generate-icons.mjs
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

// Brand colors
const ocean = "#2B6B7F";
const sand = "#F5EDE3";
const white = "#FFFCF7";

// Standard icon: rounded square with "M" wordmark + sun
function standardSvg(size) {
  const s = size;
  const r = s * 0.18; // corner radius
  const fontSize = s * 0.52;
  const sunR = s * 0.07;
  const sunX = s * 0.72;
  const sunY = s * 0.22;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${r}" fill="${ocean}"/>
  <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${sand}" opacity="0.9"/>
  ${[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    const x1 = sunX + Math.cos(rad) * sunR * 1.4;
    const y1 = sunY + Math.sin(rad) * sunR * 1.4;
    const x2 = sunX + Math.cos(rad) * sunR * 2;
    const y2 = sunY + Math.sin(rad) * sunR * 2;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${sand}" stroke-width="${s * 0.012}" stroke-linecap="round" opacity="0.7"/>`;
  }).join("\n  ")}
  <text x="${s * 0.48}" y="${s * 0.62}" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" fill="${white}" text-anchor="middle" dominant-baseline="central" font-weight="400" letter-spacing="-${s * 0.02}">M</text>
  <text x="${s * 0.48}" y="${s * 0.84}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="${s * 0.09}" fill="${sand}" text-anchor="middle" dominant-baseline="central" font-weight="300" letter-spacing="${s * 0.015}">TODAY</text>
</svg>`;
}

// Maskable icon: same design but with safe-area padding (icon content in center 80%)
function maskableSvg(size) {
  const s = size;
  const pad = s * 0.1; // 10% padding on each side for safe area
  const inner = s - pad * 2;
  const fontSize = inner * 0.52;
  const sunR = inner * 0.07;
  const cx = s / 2;
  const sunX = cx + inner * 0.22;
  const sunY = pad + inner * 0.22;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="${ocean}"/>
  <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${sand}" opacity="0.9"/>
  ${[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    const x1 = sunX + Math.cos(rad) * sunR * 1.4;
    const y1 = sunY + Math.sin(rad) * sunR * 1.4;
    const x2 = sunX + Math.cos(rad) * sunR * 2;
    const y2 = sunY + Math.sin(rad) * sunR * 2;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${sand}" stroke-width="${s * 0.012}" stroke-linecap="round" opacity="0.7"/>`;
  }).join("\n  ")}
  <text x="${cx}" y="${s * 0.52}" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" fill="${white}" text-anchor="middle" dominant-baseline="central" font-weight="400" letter-spacing="-${inner * 0.02}">M</text>
  <text x="${cx}" y="${s * 0.76}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="${inner * 0.09}" fill="${sand}" text-anchor="middle" dominant-baseline="central" font-weight="300" letter-spacing="${inner * 0.015}">TODAY</text>
</svg>`;
}

// Apple touch icon (180x180)
const appleSvg = standardSvg(180);

// Write SVGs (we'll convert to PNG separately)
writeFileSync(join(outDir, "icon-192.svg"), standardSvg(192));
writeFileSync(join(outDir, "icon-512.svg"), standardSvg(512));
writeFileSync(join(outDir, "icon-maskable-512.svg"), maskableSvg(512));
writeFileSync(join(outDir, "apple-touch-icon.svg"), appleSvg);

console.log("SVG icons generated in public/icons/");
console.log("");
console.log("To convert to PNG, install sharp and run:");
console.log("  node scripts/svg-to-png.mjs");
console.log("");
console.log("Or use an online converter / design tool to export PNGs from the SVGs.");
