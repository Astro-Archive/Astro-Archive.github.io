import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const URL = process.argv[2] ?? 'http://127.0.0.1:4180/?capture';
const OUT = process.argv[3] ?? '/tmp/opencode/frames';
const W = 1280;
const H = 720;

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
    '--force-device-scale-factor=1',
  ],
  defaultViewport: { width: W, height: H, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
await new Promise((r) => setTimeout(r, 9000));

const maxScroll = await page.evaluate(
  () => document.documentElement.scrollHeight - window.innerHeight,
);

const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** línea de tiempo: [segundoInicio, segundoFin, desde, hasta] */
const TIMELINE = [
  [0.0, 1.0, 0, 0],
  [1.0, 2.3, 0, 1 / 3],
  [2.3, 4.5, 1 / 3, 1 / 3],
  [4.5, 5.8, 1 / 3, 2 / 3],
  [5.8, 8.0, 2 / 3, 2 / 3],
  [8.0, 9.3, 2 / 3, 1],
  [9.3, 10.6, 1, 1],
];

const FPS = 10;
const TOTAL = Math.round(10.6 * FPS);

function progressAt(seconds) {
  for (const [start, end, from, to] of TIMELINE) {
    if (seconds >= start && seconds <= end) {
      const t = (seconds - start) / (end - start);
      return from + (to - from) * ease(t);
    }
  }
  return 1;
}

for (let i = 0; i < TOTAL; i++) {
  const seconds = i / FPS;
  const p = progressAt(seconds);
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(p * maxScroll));
  await new Promise((r) => setTimeout(r, 260));
  await page.screenshot({
    path: path.join(OUT, `f-${String(i).padStart(5, '0')}.jpg`),
    type: 'jpeg',
    quality: 90,
  });
  if (i % 10 === 0) process.stdout.write(`${i}/${TOTAL}\n`);
}

await browser.close();
console.log(`listo: ${TOTAL} frames en ${OUT}`);
