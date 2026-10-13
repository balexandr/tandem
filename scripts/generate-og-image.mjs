// Builds public/og-image.png: the social-share preview image, same
// convention every sibling NoodleGame ships (2400x1260, dark background,
// wordmark + tagline + brand label). Renders an SVG to PNG with sharp so
// it can be regenerated if the copy or colors ever change. Modeled on
// Weave's generate-og-image.mjs.
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));

const WIDTH = 2400;
const HEIGHT = 1260;
const LIME = '#84cc16';
const LIME_LIGHT = '#a3e635';
const TEXT_SECONDARY = '#c3d9a0';
const TEXT_DIM = '#6f8556';

// Same two-tile-and-arrow mark as GameLogo.jsx, scaled up from its 48x48
// viewBox. Plain paths (no font dependency) so the icon renders
// identically regardless of what fonts are on the machine doing the
// rendering.
const iconScale = 3.6;
const iconSvg = `
  <g transform="translate(800, 330) scale(${iconScale})">
    <rect x="4" y="13" width="17" height="22" rx="4" fill="${LIME}" />
    <rect x="27" y="13" width="17" height="22" rx="4" fill="${LIME_LIGHT}" />
    <path d="M 21 24 L 27 24" stroke="#0f1410" stroke-width="2.4" stroke-linecap="round" />
    <path d="M 24.5 20.5 L 28.5 24 L 24.5 27.5" fill="none" stroke="#0f1410" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
  </g>
`;

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f1410" />
      <stop offset="55%" stop-color="#0a0d08" />
      <stop offset="100%" stop-color="#060804" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="28%" r="55%">
      <stop offset="0%" stop-color="${LIME}" stop-opacity="0.18" />
      <stop offset="100%" stop-color="${LIME}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)" />

  ${iconSvg}

  <text x="980" y="470" font-family="Arial, Helvetica, sans-serif" font-weight="800"
        font-size="200" fill="${LIME}">Tandem</text>

  <text x="${WIDTH / 2}" y="660" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-weight="400" font-size="62" fill="${TEXT_SECONDARY}">
    Click two words that pair up, in order.
  </text>
  <text x="${WIDTH / 2}" y="740" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-weight="400" font-size="62" fill="${TEXT_SECONDARY}">
    Beat the 60-second clock.
  </text>

  <text x="${WIDTH / 2}" y="880" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-weight="700" font-size="38" letter-spacing="4" fill="${TEXT_DIM}">
    NOODLEGAMES · DAILY WORD GAME
  </text>
</svg>
`;

const outPath = join(__dirname, '../public/og-image.png');
await sharp(Buffer.from(svg)).png().toFile(outPath);
console.log(`Wrote ${outPath} (${WIDTH}x${HEIGHT}).`);
