import puppeteer from 'puppeteer-core';

const URL = process.argv[2] ?? 'http://127.0.0.1:4180/';
const OUT = process.argv[3] ?? '/tmp/opencode/games';

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
    '--hide-scrollbars',
  ],
  defaultViewport: { width: 1440, height: 900 },
});

const page = await browser.newPage();
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});

const click = async (text) => {
  const ok = await page.evaluate((txt) => {
    const el = [...document.querySelectorAll('button')].find((b) =>
      (b.textContent ?? '').trim().toLowerCase().includes(txt.toLowerCase()),
    );
    if (!el) return false;
    el.click();
    return true;
  }, text);
  if (!ok) console.log(`  !! no encontré el botón "${text}"`);
  return ok;
};

await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
await new Promise((r) => setTimeout(r, 9500));

const vh = await page.evaluate(() => window.innerHeight);
const go = async (sections) => {
  await page.evaluate((y) => window.scrollTo(0, y), vh * sections);
  await new Promise((r) => setTimeout(r, 3000));
};

// --- estación 1: Eagle
await go(1);
const eagle = await page.evaluate(() => ({
  title: document.querySelector('.card-title')?.textContent ?? null,
  hasPlay: !!document.querySelector('.play-button'),
  playLabel: document.querySelector('.play-button')?.textContent ?? null,
}));
console.log('EAGLE', JSON.stringify(eagle));
await page.screenshot({ path: `${OUT}/1-eagle-card.png` });

// --- minijuego de descenso
await click('Intentar el aterrizaje');
await new Promise((r) => setTimeout(r, 2500));
await page.screenshot({ path: `${OUT}/2-descent-start.png` });

await click('Empezar el descenso');
await new Promise((r) => setTimeout(r, 4000));
await page.keyboard.down('Space');
await new Promise((r) => setTimeout(r, 6000));
await page.keyboard.up('Space');
await page.screenshot({ path: `${OUT}/3-descent-flying.png` });

const hud = await page.evaluate(() => ({
  values: [...document.querySelectorAll('.hud-value')].map((n) => n.textContent),
  controls: document.querySelectorAll('.ctrl').length,
}));
console.log('HUD', JSON.stringify(hud));

await click('Volver al museo');
await new Promise((r) => setTimeout(r, 1200));

// --- estación 2: Opportunity
await go(2);
const opp = await page.evaluate(() => ({
  title: document.querySelector('.card-title')?.textContent ?? null,
  play: document.querySelector('.play-button')?.textContent ?? null,
}));
console.log('OPP', JSON.stringify(opp));

await click('Repartir la energía');
await new Promise((r) => setTimeout(r, 2000));
await page.screenshot({ path: `${OUT}/4-energy-start.png` });

await click('Calentar la batería');
await click('Tomar una medición');
await click('Transmitir a la Tierra');
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: `${OUT}/5-energy-playing.png` });

const energy = await page.evaluate(() => ({
  left: document.querySelector('.energy-numbers')?.textContent?.trim() ?? null,
  state: document.querySelector('.energy-state')?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
  disabled: [...document.querySelectorAll('.energy-action')].filter((b) => b.disabled).length,
}));
console.log('ENERGY', JSON.stringify(energy));

await click('Terminar el sol');
await new Promise((r) => setTimeout(r, 800));
const sol2 = await page.evaluate(() => document.querySelector('.energy-sol')?.textContent?.trim() ?? null);
console.log('SOL2', JSON.stringify(sol2));

await click('Volver al museo');
await new Promise((r) => setTimeout(r, 1200));

// --- epílogo
await go(5);
const epi = await page.evaluate(() => ({
  visible: document.querySelector('.epilogue')?.classList.contains('is-visible') ?? null,
  title: document.querySelector('.epilogue-title')?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
}));
console.log('EPILOGUE', JSON.stringify(epi));
await page.screenshot({ path: `${OUT}/6-epilogue.png` });

console.log('\nERRORES (' + errors.length + ')');
[...new Set(errors)].slice(0, 10).forEach((e) => console.log(' -', e));

await browser.close();
