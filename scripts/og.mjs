import puppeteer from 'puppeteer-core';

const URL = process.argv[2] ?? 'http://127.0.0.1:4180/?capture';
const OUT = process.argv[3] ?? '/tmp/opencode/og.png';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: 'new',
  args: [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--hide-scrollbars',
  ],
  defaultViewport: { width: 1200, height: 630, deviceScaleFactor: 2 },
});

const page = await browser.newPage();
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
await new Promise((r) => setTimeout(r, 11000));
// en 630 px de alto los créditos chocan con la timeline
await page.evaluate(() => {
  const credits = document.querySelector('.credits');
  if (credits) credits.style.display = 'none';
});
await page.screenshot({ path: OUT, type: 'png' });
await browser.close();
console.log('ok', OUT);
