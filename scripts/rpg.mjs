import puppeteer from 'puppeteer-core';

const URL = process.argv[2] ?? 'http://127.0.0.1:4180/';
const OUT = process.argv[3] ?? '/tmp/opencode/rpg';
const W = Number(process.argv[4] ?? 1440);
const H = Number(process.argv[5] ?? 900);

const b = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: 'new',
  args: [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--hide-scrollbars',
  ],
  defaultViewport: { width: W, height: H },
});

const p = await b.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
p.on('console', (m) => {
  if (m.type() === 'error') errs.push(m.text());
});

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clickBox = () => p.evaluate(() => document.querySelector('.interview-box')?.click());

/** avanza hasta que aparezcan las opciones (máximo 30 clics) */
async function untilChoices() {
  for (let i = 0; i < 30; i++) {
    const count = await p.evaluate(() => document.querySelectorAll('.choice').length);
    if (count > 0) return count;
    await clickBox();
    await wait(320);
  }
  return 0;
}

/** tras responder, avanza hasta que vuelvan las opciones o aparezca el resumen */
async function afterAnswer() {
  for (let i = 0; i < 30; i++) {
    const state = await p.evaluate(() => ({
      choices: document.querySelectorAll('.choice').length,
      entry: !!document.querySelector('.entry'),
      pips: document.querySelectorAll('.pips span.is-on').length,
    }));
    if (state.choices > 0 || state.entry) return state;
    await clickBox();
    await wait(320);
  }
  return { choices: 0, entry: false, pips: -1 };
}

await p.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
await wait(9000);

const vh = await p.evaluate(() => window.innerHeight);
await p.evaluate((h) => window.scrollTo(0, h), vh);
await wait(2600);

await p.evaluate(() => {
  [...document.querySelectorAll('button')]
    .find((x) => x.textContent?.includes('Connect with the machine'))
    ?.click();
});
await wait(2600);

const opened = await p.evaluate(() => ({
  open: !!document.querySelector('.interview'),
  speaker: document.querySelector('.game-title')?.textContent ?? null,
  pips: document.querySelectorAll('.pips span.is-on').length,
  portrait: document.querySelector('.portrait img')?.getAttribute('src') ?? null,
}));
console.log('ABIERTO', JSON.stringify(opened));
await p.screenshot({ path: `${OUT}/1-intro.png` });

const choices = await untilChoices();
console.log('opciones visibles:', choices);
await p.screenshot({ path: `${OUT}/2-asking.png` });

for (let n = 0; n < 4; n++) {
  await p.evaluate(() => document.querySelector('.choice')?.click());
  await wait(700);
  const state = await afterAnswer();
  console.log(`  pregunta ${n + 1}: pips=${state.pips} choices=${state.choices} entry=${state.entry}`);
  if (state.entry) break;
}

await p.screenshot({ path: `${OUT}/3-silence.png` });

const entryPanel = await p.evaluate(() => ({
  title: document.querySelector('.entry-title')?.textContent ?? null,
  count: document.querySelector('.entry-count')?.textContent?.replace(/\s+/g, ' ') ?? null,
  fragments: [...document.querySelectorAll('.entry-fragments li')].map((n) => n.textContent),
  pips: document.querySelectorAll('.pips span.is-on').length,
  dead: document.querySelector('.interview-scene')?.classList.contains('is-dead') ?? null,
}));
console.log('ENTRADA', JSON.stringify(entryPanel));
await p.screenshot({ path: `${OUT}/4-entry.png` });

await p.evaluate(() => {
  [...document.querySelectorAll('button')].find((x) => x.textContent?.includes('View catalog'))?.click();
});
await wait(2200);

const catalog = await p.evaluate(() => ({
  open: !!document.querySelector('.catalog'),
  items: document.querySelectorAll('.catalog-item').length,
  found: document.querySelectorAll('.catalog-item.is-found').length,
  total: document.querySelector('.catalog .game-title')?.textContent ?? null,
  hud: [...document.querySelectorAll('.hud-actions button')].map((n) => n.textContent),
}));
console.log('CATÁLOGO', JSON.stringify(catalog));
await p.screenshot({ path: `${OUT}/5-catalog.png` });

console.log('\nERRORES (' + errs.length + ')');
[...new Set(errs)].slice(0, 8).forEach((e) => console.log(' -', e));

await b.close();
