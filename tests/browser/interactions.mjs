import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const root = process.env.OMO_BROWSER_SKILL;
assert(root, 'Set OMO_BROWSER_SKILL to the installed browser skill directory.');
const { loadOmowright } = await import(join(root, 'scripts/omowright.mjs'));
const { omowright } = await loadOmowright();
const profile = mkdtempSync(join(tmpdir(), 'nexplus-actions-'));
const output = process.env.QA_DIR ?? '/tmp/nexplus-qa';
const base = process.env.QA_BASE_URL ?? 'http://localhost:4321';
mkdirSync(output, { recursive: true });
const browser = await omowright.connectPipe({
  browserPath: process.env.BROWSER_PATH ?? chromium.executablePath(),
  browserArgs: ['--headless', '--no-first-run', '--no-sandbox', '--user-data-dir=' + profile],
  storageRoot: profile,
});
const rows = [];
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
try {
  const page = await browser.newTab('about:blank');
  const session = await page.resolveSessionId();
  async function visit(route, device = 'desktop-1440') {
    await page.goto(base + route, { waitUntil: 'load' });
    await omowright.emulate(page, device);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
  }
  async function snapshot() {
    console.log(omowright.compactSnapshot(await page.snapshot()));
  }
  async function capture(name, facts = {}) {
    const file = join(output, name + '.png');
    await Bun.write(file, await page.screenshot());
    rows.push({ name, file, ...facts });
  }
  async function until(condition, timeout = 15000) {
    await page.evaluate(`new Promise((resolve, reject) => {
      const condition = (${condition.toString()});
      const observer = new MutationObserver(check);
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('Browser state did not settle before timeout.'));
      }, ${timeout});
      function cleanup() {
        clearTimeout(timer);
        observer.disconnect();
        document.removeEventListener('focusin', check);
      }
      function check() {
        if (condition()) { cleanup(); resolve(); }
      }
      observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
      document.addEventListener('focusin', check);
      check();
    })`);
  }

  await visit('/', 'iphone-14');
  await snapshot();
  await page.locator('#menu-toggle').click();
  assert(await page.evaluate(() => !document.querySelector('#mobile-menu').hidden));
  await capture('phone-menu-open');
  await snapshot();
  await page.keyboard.press('Escape');
  assert(
    await page.evaluate(
      () =>
        document.querySelector('#mobile-menu').hidden &&
        document.activeElement.id === 'menu-toggle',
    ),
  );
  await snapshot();
  await page.locator('[data-theme-toggle]').click();
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  await visit('/solutions', 'iphone-14');
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
  await capture('phone-theme-persists', { theme });

  await visit('/');
  await snapshot();
  await page.locator('[data-dropdown] summary').first().click();
  await capture('desktop-dropdown-open');
  await snapshot();
  await page.keyboard.press('Escape');
  assert.equal(
    await page.evaluate(() => document.querySelectorAll('[data-dropdown][open]').length),
    0,
  );

  await visit('/contact');
  await until(() =>
    Boolean(document.querySelector('button[aria-label="Buka asisten NEX+"][data-state]')),
  );
  await snapshot();
  await page.locator('button[aria-label="Buka asisten NEX+"]').click();
  await capture('dialog-rest');
  await pause(100);
  await capture('dialog-mid');
  await until(() => Boolean(document.querySelector('[role="dialog"] textarea')));
  await capture('dialog-settled');
  await snapshot();
  await page
    .locator('[role="dialog"] textarea')
    .fill('Bagaimana proses pemasangan untuk kantor kami?');
  await snapshot();
  await page.locator('[role="dialog"] button[type="submit"]').click();
  await until(() => Boolean(document.querySelector('[role="dialog"] pre')));
  await page.cdp.send('Browser.grantPermissions', {
    origin: base,
    permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
  });
  await snapshot();
  await page.locator('[role="dialog"] button:has-text("Salin pesan")').click();
  await until(() =>
    document.querySelector('[role="dialog"]').textContent.includes('Pesan berhasil disalin.'),
  );
  assert(
    (await page.evaluate(() => navigator.clipboard.readText())).includes(
      'Bagaimana proses pemasangan',
    ),
  );
  for (let index = 0; index < 10; index++) {
    await page.keyboard.press('Tab');
    assert(
      await page.evaluate(() =>
        document.querySelector('[role="dialog"]').contains(document.activeElement),
      ),
    );
  }
  await capture('dialog-copy-focus-trap');
  await snapshot();
  await page.keyboard.press('Escape');
  await until(() => !document.querySelector('[role="dialog"]'));
  await until(() => document.activeElement.getAttribute('aria-label') === 'Buka asisten NEX+');
  assert.equal(
    await page.evaluate(() => document.activeElement.getAttribute('aria-label')),
    'Buka asisten NEX+',
  );

  await visit('/infrastructure');
  await until(() =>
    Boolean(
      document.querySelector('astro-island[component-export="InfrastructureExplorer"]:not([ssr])'),
    ),
  );
  await snapshot();
  await page.locator('button:has-text("Customer")').click();
  assert(
    await page.evaluate(() =>
      document.querySelector('section[aria-live]').textContent.includes('Bisnis Anda'),
    ),
  );
  await capture('infrastructure-customer-rest');
  await snapshot();
  await page.locator('button:has-text("Putar alur")').click();
  await pause(100);
  assert.equal(await page.evaluate(() => document.querySelectorAll('.route-pulse').length), 2);
  await capture('infrastructure-replay-mid');
  await until(() => document.querySelectorAll('.route-pulse').length === 0);
  await capture('infrastructure-replay-settled');
  await snapshot();
  await page.locator('button:has-text("Putar alur")').click();
  await pause(100);
  await snapshot();
  await page.locator('button:has-text("Hentikan alur")').click();
  assert.equal(await page.evaluate(() => document.querySelectorAll('.route-pulse').length), 0);
  await capture('infrastructure-replay-interrupted');
  await page.cdp.send(
    'Emulation.setEmulatedMedia',
    { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
    session,
  );
  await until(() =>
    [...document.querySelectorAll('button')].some(
      (button) => button.textContent.includes('Putar alur') && button.disabled,
    ),
  );
  await capture('infrastructure-reduced-motion');
  await page.cdp.send(
    'Emulation.setEmulatedMedia',
    { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] },
    session,
  );

  await visit('/');
  await page.evaluate(() => document.querySelector('#customers').scrollIntoView());
  await capture('customers-reveal-rest');
  await pause(100);
  await capture('customers-reveal-mid');
  await pause(450);
  await capture('customers-reveal-settled');
  await snapshot();
  await page.locator('[data-marquee-toggle]').click();
  assert.equal(
    await page.evaluate(() => document.querySelector('.marquee').dataset.paused),
    'true',
  );
  await capture('customers-marquee-paused');
  await page.cdp.send(
    'Emulation.setEmulatedMedia',
    { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
    session,
  );
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.querySelector('.marquee-track')).animationName,
    ),
    'none',
  );
  await capture('customers-reduced-motion');

  await visit('/speed-test');
  await until(() =>
    Boolean(document.querySelector('astro-island[component-export="SpeedTest"]:not([ssr])')),
  );
  await snapshot();
  await page.locator('button:has-text("Mulai pengujian")').click();
  await until(() =>
    document.querySelector('[role="status"]').textContent.includes('Pengujian selesai.'),
  );
  const status = await page.evaluate(() => document.querySelector('[role="status"]').textContent);
  assert(/Unduh [0-9.]+ Mbps/.test(status));
  await capture('speed-test-success', { status });

  await Bun.write(join(output, 'interactions.json'), JSON.stringify(rows, null, 2));
  console.log(
    'PASS: navigation, theme, clipboard, dialog focus, infrastructure motion, marquee and real speed success.',
  );
} finally {
  await browser.close();
  rmSync(profile, { recursive: true, force: true });
}
