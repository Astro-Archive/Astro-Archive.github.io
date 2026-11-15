import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Captura frames deterministas para el video.
 * El scroll se mueve a posiciones exactas y se espera a que la cámara asiente,
 * así el video sale suave aunque el render por software vaya a 1,7 fps.
 */

const URL = process.argv[2] ?? 'http://127.0.0.1:4180/?capture';
const OUT = process.argv[3] ?? '/tmp/opencode/video2';

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

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
  defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
await new Promise((r) => setTimeout(r, 10000));

const maxScroll = await page.evaluate(
  () => document.documentElement.scrollHeight - window.innerHeight,
);

let n = 0;
const shot = async (count = 1) => {
  for (let i = 0; i < count; i++) {
    await page.screenshot({
      path: path.join(OUT, `f-${String(n++).padStart(5, '0')}.jpg`),
      type: 'jpeg',
      quality: 90,
    });
    process.stdout.write(`.${n}`);
  }
};

const scrollTo = async (p) => {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(p * maxScroll));
  await new Promise((r) => setTimeout(r, 260));
};

const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const glide = async (from, to, frames) => {
  for (let i = 1; i <= frames; i++) {
    const p = from + (to - from) * ease(i / frames);
    await scrollTo(p);
    await shot(1);
  }
};

const click = async (text) => {
  const ok = await page.evaluate((txt) => {
    const el = [...document.querySelectorAll('button')].find((b) =>
      (b.textContent ?? '').toLowerCase().includes(txt.toLowerCase()),
    );
    if (!el) return false;
    el.click();
    return true;
  }, text);
  if (!ok) console.log(`  !! botón no encontrado: ${text}`);
  return ok;
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const S0 = 1 / 5;
const S1 = 2 / 5;
const S2 = 3 / 5;
const S3 = 4 / 5;

await shot(10); // portada

await glide(0, S0, 8); // Eagle
await shot(9);

await click('Intentar el aterrizaje');
await wait(3200);
await shot(6); // panel de inicio del juego

await click('Empezar el descenso');
await wait(4200);
await page.keyboard.down('Space');
await wait(2600);
await shot(8); // módulo encendiendo el motor
await page.keyboard.up('Space');

await click('Volver al museo');
await wait(1800);

await glide(S0, S1, 8); // Opportunity
await shot(8);

await click('Repartir la energía');
await wait(2600);
await shot(7); // juego de energía
await click('Volver al museo');
await wait(1600);

await glide(S1, S2, 8); // Ingenuity
await shot(8);

await glide(S2, S3, 8); // Dawn
await shot(8);

await glide(S3, 1, 8); // epílogo
await shot(12);

await browser.close();
console.log(`\nlisto: ${n} frames en ${OUT}`);
