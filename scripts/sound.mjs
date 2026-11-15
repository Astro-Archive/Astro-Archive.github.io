import puppeteer from 'puppeteer-core';

/**
 * Verifica el blip de escritura del RPG.
 *
 * Chromium headless no tiene tarjeta de sonido, así que no se escucha nada:
 * se cuenta cada `AudioBufferSource` que crea el navegador. Para que el
 * AudioContext arranque sin un gesto real se desactiva la política de autoplay;
 * el resto del flujo usa clics de ratón reales.
 *
 *   node scripts/sound.mjs [url] [carpeta-de-capturas]
 */

const URL = process.argv[2] ?? 'http://127.0.0.1:4180/';
const OUT = process.argv[3] ?? '/tmp/opencode/sound';

const b = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: 'new',
  args: [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--hide-scrollbars',
    '--autoplay-policy=no-user-gesture-required',
  ],
  defaultViewport: { width: 1440, height: 900 },
});

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const p = await b.newPage();

await p.evaluateOnNewDocument(() => {
  window.__blips = 0;
  const original = AudioContext.prototype.createBufferSource;
  AudioContext.prototype.createBufferSource = function patched(...args) {
    window.__blips += 1;
    return original.apply(this, args);
  };
});

const errors = [];
const mp3 = [];
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
p.on('response', (r) => {
  if (r.url().includes('text-blip.mp3')) mp3.push(r.status());
});

await p.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
await wait(9000);
await p.evaluate(() => scrollTo(0, innerHeight));
await wait(2600);

let connect;
for (const button of await p.$$('button')) {
  const text = await button.evaluate((el) => el.textContent ?? '');
  if (text.includes('Connect with the machine')) connect = button;
}
await connect.click();
await wait(3500);

const play = await p.evaluate(() => ({
  sound: document.querySelector('.sound-toggle')?.getAttribute('aria-pressed'),
  label: document.querySelector('.sound-toggle')?.textContent?.trim().replace(/\s+/g, ' '),
  blips: window.__blips,
}));
await p.screenshot({ path: `${OUT}/1-sonido-on.png` });

await p.click('.sound-toggle');
await wait(300);
const muted = await p.evaluate(() => ({
  sound: document.querySelector('.sound-toggle')?.getAttribute('aria-pressed'),
  label: document.querySelector('.sound-toggle')?.textContent?.trim().replace(/\s+/g, ' '),
  blips: window.__blips,
  stored: localStorage.getItem('still-listening:sfx'),
}));

// con el sonido apagado, una línea nueva no debe crear fuentes de audio
await p.click('.interview-box');
await wait(2200);
const afterMute = await p.evaluate(() => window.__blips);

console.log(
  JSON.stringify({
    play: { ...play, mp3 },
    muted,
    afterMute,
    muteOk: afterMute === muted.blips,
    errors: errors.length,
  }),
);
await b.close();
