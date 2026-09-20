// Render the production HTML/CSS offline: no web server, no API, no application JS.
// This checks layout only. It does not replace live browser integration tests.
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('@playwright/test');
async function main() {
  const root = path.resolve(__dirname, '..');
  const app = path.join(root, 'apps/frontend');
  const output = path.join(root, '.local/ui');
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const route of ['index', 'demo', 'login', 'app']) {
      let html = await fs.readFile(path.join(app, '.next/server/app', route + '.html'), 'utf8');
      html = html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<link\b(?=[^>]*as="script")[^>]*>/gi, '');
      const styles = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/gi)];
      for (const [tag] of styles) {
        const href = tag.match(/href="([^"]+)"/)[1];
        const cssPath = path.join(app, '.next', href.replace(/^\/_next\//, ''));
        let css = await fs.readFile(cssPath, 'utf8');
        css = css.replace(
          /url\((?:["']?)(\/_next\/static\/media\/[^)"']+)(?:["']?)\)/g,
          (_, url) =>
            'url("' +
            pathToFileURL(path.join(app, '.next', url.replace(/^\/_next\//, ''))).href +
            '")',
        );
        css = css.replace(
          /url\((?:["']?)(\.\.\/media\/[^)"']+)(?:["']?)\)/g,
          (_, url) => 'url("' + pathToFileURL(path.resolve(path.dirname(cssPath), url)).href + '")',
        );
        html = html.replace(tag, '<style>' + css + '</style>');
      }
      html = html.replace(/<link\b(?=[^>]*rel="preload")[^>]*>/gi, '');
      const file = path.join(output, route + '.html');
      await fs.writeFile(file, html);
      for (const width of [1440, 768, 390, 320]) {
        const context = await browser.newContext({
          javaScriptEnabled: false,
          viewport: { width, height: 950 },
          reducedMotion: 'reduce',
          deviceScaleFactor: 1,
        });
        const page = await context.newPage();
        await page.goto(pathToFileURL(file).href);
        // loading.tsx produces React streaming boundaries. Assemble already-rendered
        // completed HTML for the offline snapshot without running application code.
        await page.evaluate(() => {
          for (const completed of document.querySelectorAll('div[hidden][id^="S:"]')) {
            const placeholder = document.getElementById(completed.id.replace('S:', 'B:'));
            if (!placeholder) continue;
            let sibling = placeholder.nextSibling;
            while (
              sibling &&
              !(sibling.nodeType === Node.COMMENT_NODE && sibling.nodeValue === '/$')
            ) {
              const next = sibling.nextSibling;
              sibling.remove();
              sibling = next;
            }
            placeholder.replaceWith(...completed.childNodes);
            completed.remove();
          }
        });
        if (width === 1440) await fs.writeFile(file, await page.content());
        await page.evaluate(() => document.fonts.load('400 16px Inter', 'Appi Подключение'));
        await page.evaluate(() => document.fonts.ready);
        if (
          !(await page.evaluate(() => document.fonts.check('400 16px Inter', 'Appi Подключение')))
        )
          throw new Error('Inter font not loaded');
        const overflow = await page.evaluate(() => ({
          viewport: innerWidth,
          document: document.documentElement.scrollWidth,
        }));
        if (overflow.document > width + 1)
          throw new Error(route + ' overflows at ' + width + ': ' + JSON.stringify(overflow));
        if (route === 'index') {
          const faq = page.locator('#faq summary').first();
          await faq.click();
          if (
            !(await page.locator('#faq details').first().getAttribute('open')) &&
            (await page.locator('#faq details').first().getAttribute('open')) !== ''
          )
            throw new Error('FAQ does not open');
          await faq.click();
          await page.evaluate(() => window.scrollTo(0, 0));
        }
        await page.screenshot({
          path: path.join(output, route + '-' + width + '.png'),
          fullPage: true,
        });
        if (route === 'index' && width === 1440)
          await page.screenshot({ path: path.join(output, 'hero-desktop.png') });
        results.push({ route, width, overflow: false });
        await context.close();
      }
    }
    await fs.writeFile(path.join(output, 'checks.json'), JSON.stringify(results, null, 2));
    console.log(
      JSON.stringify(
        { kind: 'offline static layout checks; application JS disabled', results },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
