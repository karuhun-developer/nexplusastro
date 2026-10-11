import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const skillRoot = process.env.OMO_BROWSER_SKILL;
assert(skillRoot, 'Set OMO_BROWSER_SKILL to the installed browser skill directory.');
const { loadOmowright } = await import(join(skillRoot, 'scripts/omowright.mjs'));
const { omowright } = await loadOmowright();
const profile = mkdtempSync(join(tmpdir(), 'nexplus-qa-'));
const output = process.env.QA_DIR ?? '/tmp/nexplus-qa';
mkdirSync(output, { recursive: true });
const browser = await omowright.connectPipe({
  browserPath: process.env.BROWSER_PATH ?? chromium.executablePath(),
  browserArgs: ['--headless', '--no-first-run', '--no-sandbox', '--user-data-dir=' + profile],
  storageRoot: profile,
});
const routes = [
  '/',
  '/solutions',
  '/solutions/internet-dedicated',
  '/solutions/metro-e',
  '/solutions/vsat',
  '/solutions/managed-services',
  '/solutions/iptv-hospitality',
  '/contact',
  '/coverage',
  '/bandwidth-calculator',
  '/speed-test',
  '/infrastructure',
  '/monitoring',
  '/missing-page',
];
const rows = [];
try {
  const page = await browser.newTab('about:blank');
  const session = await page.resolveSessionId();
  const errors = [];
  await page.cdp.send('Runtime.enable', {}, session);
  page.cdp.on('Runtime.exceptionThrown', (event) =>
    errors.push(event.exceptionDetails?.text ?? 'Runtime exception'),
  );
  for (const width of [320, 390, 768, 1440, 1920]) {
    const device =
      width === 390
        ? 'iphone-14'
        : {
            width,
            height: width < 768 ? 844 : 900,
            deviceScaleFactor: width < 768 ? 3 : 1,
            mobile: width < 768,
            hasTouch: width < 768,
          };
    await omowright.emulate(page, device);
    for (const theme of ['dark', 'light']) {
      await page.cdp.send(
        'Emulation.setEmulatedMedia',
        {
          features: [
            { name: 'prefers-color-scheme', value: theme },
            { name: 'prefers-reduced-motion', value: 'no-preference' },
          ],
        },
        session,
      );
      for (const route of routes) {
        await page.goto((process.env.QA_BASE_URL ?? 'http://localhost:4321') + route, {
          waitUntil: 'load',
        });
        await omowright.emulate(page, device);
        await page.evaluate((theme) => {
          localStorage.setItem('nex-theme', theme);
          document.documentElement.dataset.theme = theme;
        }, theme);
        await page.evaluate(async () => {
          await document.fonts.ready;
          document.documentElement.style.scrollBehavior = 'auto';
          document.querySelectorAll('[data-reveal]').forEach((el) => {
            el.style.transition = 'none';
            el.classList.remove('waiting');
          });
          await Promise.all(
            [...document.images].map(async (img) => {
              img.loading = 'eager';
              await img.decode().catch(() => {});
            }),
          );
          scrollTo(0, 0);
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
        });
        const facts = await page.evaluate(() => ({
          actualWidth: innerWidth,
          scroll: document.documentElement.scrollWidth,
          h1: document.querySelectorAll('h1').length,
          broken: [...document.images]
            .filter((img) => !img.complete || img.naturalWidth === 0)
            .map((img) => img.src),
          theme: document.documentElement.dataset.theme,
          topY: scrollY,
        }));
        const name = (route.replaceAll('/', '-') || 'home') + '-' + width + '-' + theme;
        const top = join(output, name + '-top.png');
        const end = join(output, name + '-end.png');
        await Bun.write(top, await page.screenshot());
        await page.evaluate(async () => {
          scrollTo(0, document.documentElement.scrollHeight);
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
        });
        await Bun.write(end, await page.screenshot());
        const bottom = await page.evaluate(() => ({
          endY: scrollY,
          bottomGap: document.documentElement.scrollHeight - innerHeight - scrollY,
        }));
        rows.push({ route, width, theme, ...facts, ...bottom, top, end, errors: [...errors] });
        console.log(JSON.stringify(rows.at(-1)));
        errors.length = 0;
      }
    }
  }
  await Bun.write(join(output, 'matrix.json'), JSON.stringify(rows, null, 2));
  assert(
    rows.every(
      (row) =>
        row.actualWidth === row.width &&
        row.scroll <= row.width + 1 &&
        row.h1 === 1 &&
        row.topY === 0 &&
        row.bottomGap <= 2 &&
        row.broken.length === 0 &&
        row.errors.length === 0,
    ),
    'Route matrix contains a failure; inspect matrix.json',
  );
  console.log(
    'PASS: ' +
      rows.length +
      ' route/theme/width combinations, ' +
      rows.length * 2 +
      ' screenshots.',
  );
} finally {
  await browser.close();
  rmSync(profile, { recursive: true, force: true });
}
