// Render the public page families at desktop and phone sizes in CI.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve(process.env.VISUAL_QA_OUTPUT || 'visual-qa');
const origin = 'http://127.0.0.1:8765';
const server = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1', '--directory', 'portfolio'], {
  stdio: 'ignore',
});

const waitForServer = async () => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${origin}/index.html`);
      if (response.ok) return;
    } catch { /* server is starting */ }
    await new Promise((done) => setTimeout(done, 250));
  }
  throw new Error('Preview server did not start.');
};

const contrast = (foreground, background) => {
  const channels = (rgb) => rgb.match(/[\d.]+/g).slice(0, 3).map((number) => {
    const value = Number(number) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = (rgb) => {
    const [r, g, b] = channels(rgb);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return Number(((values[0] + 0.05) / (values[1] + 0.05)).toFixed(2));
};

const report = [];
let browser;
try {
  await mkdir(output, { recursive: true });
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const views = [
    { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    { name: 'phone', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  ];
  const pages = [
    { name: 'home', path: '/index.html' },
    { name: 'projects', path: '/projects/index.html' },
    { name: 'instructional-design', path: '/projects/instructional-design/index.html' },
    { name: 'case-study', path: '/projects/instructional-design/complete-learning-paths/enterprise-sales-certification/index.html' },
  ];

  for (const view of views) {
    const context = await browser.newContext(view);
    for (const item of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`${origin}${item.path}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready.then(() => true));
      const details = await page.evaluate(() => {
        const brandImage = document.querySelector('.site-brand-mark img');
        const primaryButton = document.querySelector('.btn-primary');
        const buttonStyle = primaryButton ? getComputedStyle(primaryButton) : null;
        return {
          paper: getComputedStyle(document.documentElement).getPropertyValue('--portfolio-paper').trim().toLowerCase(),
          brandLoaded: Boolean(brandImage?.complete && brandImage.naturalWidth),
          horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          buttonForeground: buttonStyle?.color || null,
          buttonBackground: buttonStyle?.backgroundColor || null,
        };
      });
      const buttonContrast = details.buttonForeground && details.buttonBackground
        ? contrast(details.buttonForeground, details.buttonBackground) : null;
      if (details.paper !== '#f4f9f8') throw new Error(`${item.name} ${view.name}: wrong paper token ${details.paper}`);
      if (!details.brandLoaded) throw new Error(`${item.name} ${view.name}: selected logo did not load`);
      if (details.horizontalOverflow) throw new Error(`${item.name} ${view.name}: horizontal overflow`);
      if (buttonContrast !== null && buttonContrast < 4.5) throw new Error(`${item.name} ${view.name}: primary button contrast ${buttonContrast}`);
      if (errors.length) throw new Error(`${item.name} ${view.name}: ${errors.join('; ')}`);

      await page.screenshot({ path: resolve(output, `${item.name}-${view.name}.png`) });
      if (view.name === 'phone' && item.name === 'projects') {
        const menu = page.locator('.site-nav-toggle');
        if (!await menu.isVisible()) throw new Error('Phone menu toggle is missing.');
        await menu.click();
        if (await menu.getAttribute('aria-expanded') !== 'true') throw new Error('Phone menu did not open.');
        await page.screenshot({ path: resolve(output, 'projects-phone-menu-open.png') });
        await page.keyboard.press('Escape');
        if (await menu.getAttribute('aria-expanded') !== 'false') throw new Error('Escape did not close the phone menu.');
      }
      report.push({ page: item.name, view: view.name, ...details, buttonContrast, pageErrors: errors });
      await page.close();
    }
    await context.close();
  }
  await writeFile(resolve(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Rendered ${report.length} page/viewport combinations; desktop and phone checks passed.`);
} finally {
  await browser?.close();
  server.kill();
}
