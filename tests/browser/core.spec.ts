import { test, expect } from '@playwright/test';

test('consultation validates input and creates a selectable message', async ({ page }) => {
  await page.goto('/contact?service=vsat');
  await expect(page.locator('select[name="service"]')).toHaveValue('VSAT');
  await page.getByRole('button', { name: 'Susun konsultasi', exact: true }).click();
  await expect(page.locator('input[name="name"]')).toBeFocused();
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(3);
  await page.locator('input[name="name"]').fill('Bayu');
  await page.locator('input[name="phone"]').fill('+628123456789');
  await page.locator('input[name="location"]').fill('Banjarmasin Tengah');
  await page.getByRole('button', { name: 'Susun konsultasi', exact: true }).click();
  await expect(page.locator('pre')).toContainText('Bayu');
  await expect(page.locator('pre')).toContainText('VSAT');
  await expect(page.locator('pre')).toContainText('Banjarmasin Tengah');
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException('Denied');
        },
      },
    }),
  );
  await page.getByRole('button', { name: 'Salin pesan' }).click();
  await expect(page.getByRole('status')).toContainText('salin secara manual');
});

test('assistant traps focus, closes with Escape and restores its trigger', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Buka asisten NEX+' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('textbox', { name: 'Pertanyaan Anda' }).fill('Bagaimana proses pemasangan?');
  await page.getByRole('button', { name: 'Susun pertanyaan' }).click();
  await expect(page.locator('pre')).toContainText('Bagaimana proses pemasangan?');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('calculator recalculates and blocks invalid assumptions', async ({ page }) => {
  await page.goto('/bandwidth-calculator');
  await expect(page.locator('aside')).toContainText('500');
  const assumption = page.getByRole('spinbutton', { name: 'Asumsi per pengguna (Mbps)' });
  await assumption.fill('3.5');
  await expect(page.locator('aside')).toContainText('875');
  await assumption.fill('0');
  await expect(page.getByRole('button', { name: 'Konsultasikan konfigurasi' })).toBeDisabled();
  await assumption.fill('2');
  await page.getByRole('button', { name: 'Konsultasikan konfigurasi' }).click();
  await expect(page.locator('pre')).toContainText('500 Mbps');
});

test('coverage validates location and monitoring filters demo data', async ({ page }) => {
  await page.goto('/coverage');
  await page.getByRole('button', { name: 'Susun pertanyaan' }).click();
  await expect(page.locator('input[name="location"]')).toBeFocused();
  await page.locator('input[name="location"]').fill('Banjarbaru');
  await page.getByRole('button', { name: 'Susun pertanyaan' }).click();
  await expect(page.locator('pre')).toContainText('Banjarbaru');
  await page.goto('/monitoring');
  await page.getByRole('button', { name: 'Mati', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Core Router 02', exact: true })).toHaveCount(1);
  await expect(
    page.getByRole('heading', { name: 'Cyber 2 — neuCentrIX', exact: true }),
  ).toHaveCount(0);
});

test('speed testing can cancel and recover from network failure', async ({ page }) => {
  await page.goto('/speed-test');
  await page.route('**/favicon.svg?probe=*', (route) => route.abort());
  const downloadStarted = Promise.withResolvers<void>();
  const failDownloads = Promise.withResolvers<void>();
  await page.route('**/images/*.jpg?probe=*', async (route) => {
    downloadStarted.resolve();
    await failDownloads.promise;
    await route.abort();
  });
  await page.getByRole('button', { name: 'Mulai pengujian' }).click();
  await downloadStarted.promise;
  await page.getByRole('button', { name: 'Batalkan pengujian' }).click();
  await expect(page.getByRole('status')).toContainText('dibatalkan');
  failDownloads.resolve();
  await page.getByRole('button', { name: 'Mulai pengujian' }).click();
  await expect(page.getByRole('status')).toContainText('terhenti');
  await expect(page.getByRole('button', { name: 'Mulai pengujian' })).toBeEnabled();
});

test('header dropdown chevrons follow keyboard opening and dismissal', async ({ page }) => {
  await page.goto('/');
  for (const label of ['Solusi', 'Alat']) {
    const summary = page.locator('summary').filter({ hasText: label });
    const icon = summary.locator('svg');
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(icon).toHaveCSS('rotate', 'none');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(icon).toHaveCSS('rotate', '180deg');
    await page.keyboard.press('Escape');
    await expect(summary).toBeFocused();
    await expect(icon).toHaveCSS('rotate', 'none');
  }
});
