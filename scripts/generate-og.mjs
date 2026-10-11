import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#303034" stroke-width="1"/></pattern></defs><rect width="1200" height="630" fill="#080809"/><rect width="1200" height="630" fill="url(#grid)" opacity=".4"/><g font-family="DejaVu Sans, sans-serif"><text x="80" y="105" fill="#f5f5f6" font-size="48" font-weight="bold">NEX<tspan fill="#e62629">+</tspan></text><text x="80" y="235" fill="#f5f5f6" font-size="60" font-weight="bold">Empowering business</text><text x="80" y="315" fill="#f5f5f6" font-size="60" font-weight="bold">with smart connectivity.</text><text x="80" y="375" fill="#a6a6ad" font-size="24">PT. Nexus Indonesia Plus</text><g fill="#101012" stroke="#303034"><rect x="80" y="445" width="310" height="95" rx="20"/><rect x="445" y="445" width="310" height="95" rx="20"/><rect x="810" y="445" width="310" height="95" rx="20"/></g><path d="M390 492H445M755 492H810" stroke="#e62629" stroke-width="3"/><g fill="#f5f5f6" font-size="24" text-anchor="middle"><text x="235" y="502">Cyber 2 · Jakarta</text><text x="600" y="502">neuCentrIX</text><text x="965" y="502">Bisnis Anda</text></g></g></svg>';
await sharp(Buffer.from(svg))
  .png()
  .toFile(fileURLToPath(new URL('../public/og.png', import.meta.url)));
