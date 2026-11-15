import puppeteer from 'puppeteer-core';

const URL = process.argv[2] ?? 'http://127.0.0.1:5182/';
const OUT = process.argv[3] ?? '/tmp/opencode/shots';

const errors = [];

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
  ],
});

async function shoot(width, height, prefix) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => errors.push(`${prefix} PAGEERROR: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`${prefix} ${m.text()}`);
  });

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 6500));

  await page.screenshot({ path: `${OUT}/${prefix}-1-hero.png` });

  const vh = await page.evaluate(() => window.innerHeight);
  const titles = [];
  for (let i = 1; i <= 4; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), vh * i);
    await new Promise((r) => setTimeout(r, 2800));
    titles.push(
      await page.evaluate(() => document.querySelector('.card-title')?.textContent ?? null),
    );
    if (i <= 3) await page.screenshot({ path: `${OUT}/${prefix}-${i + 1}-station.png` });
  }

  const state = await page.evaluate(() => ({
    titles: [],
    active: document.querySelector('.timeline-item.is-active .timeline-name')?.textContent ?? null,
    overflowX: document.documentElement.scrollWidth > window.innerWidth,
  }));
  state.titles = titles;

  await page.close();
  return state;
}

const desktop = await shoot(1440, 900, 'd');
const mobile = await shoot(390, 844, 'm');

// modo lectura
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 4000));
await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('button'));
  buttons.find((b) => b.textContent?.includes('Modo lectura'))?.click();
});
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: `${OUT}/d-4-reading.png` });
const reading = await page.evaluate(() => ({
  open: !!document.querySelector('.reading'),
  chapters: document.querySelectorAll('.reading-chapter').length,
}));
await page.close();

console.log('DESKTOP', JSON.stringify(desktop));
console.log('MOBILE', JSON.stringify(mobile));
console.log('READING', JSON.stringify(reading));
console.log('\nERRORS (' + errors.length + ')');
[...new Set(errors)].slice(0, 12).forEach((e) => console.log(' -', e));

await browser.close();
