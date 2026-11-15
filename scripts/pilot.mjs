import puppeteer from 'puppeteer-core';

/**
 * Piloto automático: juega el descenso leyendo el HUD y pulsando las teclas.
 * Sirve para comprobar que el juego se puede ganar sin tocar la física.
 */

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
  defaultViewport: { width: 900, height: 600 },
});

const p = await b.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://127.0.0.1:4180/', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 8000));

const vh = await p.evaluate(() => window.innerHeight);
await p.evaluate((h) => window.scrollTo(0, h), vh);
await new Promise((r) => setTimeout(r, 2000));
await p.evaluate(() =>
  [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Intentar'))?.click(),
);
await new Promise((r) => setTimeout(r, 1500));
await p.evaluate(() =>
  [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Start'))?.click(),
);

const read = () =>
  p.evaluate(() => {
    const v = [...document.querySelectorAll('.hud-value')].map((n) => n.textContent ?? '');
    const num = (s) => parseFloat(s.replace('+', ''));
    return {
      alt: num(v[0] ?? '0'),
      vy: num(v[1] ?? '0'),
      x: num(v[2] ?? '0'),
      vx: num(v[3] ?? '0'),
      fuel: num(v[4] ?? '100'),
      result: document.querySelector('.game-result-title')?.textContent ?? null,
      reason: document.querySelector('.game-lead')?.textContent ?? null,
    };
  });

let thrust = false;
let dir = 0; // -1 izquierda, 1 derecha, 0 nada

const setThrust = async (on) => {
  if (on === thrust) return;
  thrust = on;
  if (on) await p.keyboard.down('Space');
  else await p.keyboard.up('Space');
};

const setDir = async (d) => {
  if (d === dir) return;
  if (dir === -1) await p.keyboard.up('ArrowLeft');
  if (dir === 1) await p.keyboard.up('ArrowRight');
  dir = d;
  if (d === -1) await p.keyboard.down('ArrowLeft');
  if (d === 1) await p.keyboard.down('ArrowRight');
};

let last = null;
for (let i = 0; i < 1200; i++) {
  const s = await read();
  last = s;
  if (s.result) break;

  // vertical: frena cuando la velocidad de caída se pasa del objetivo
  const targetVy = -Math.max(1.0, Math.min(6, s.alt * 0.35));
  await setThrust(s.vy < targetVy - 0.2);

  // lateral: corrige hacia el centro sin pasarse
  if (s.x > 0.8 && s.vx > -1.2) await setDir(-1);
  else if (s.x < -0.8 && s.vx < 1.2) await setDir(1);
  else await setDir(0);

  await new Promise((r) => setTimeout(r, 200));
}

await setThrust(false);
await setDir(0);

console.log('FINAL', JSON.stringify(last));
await p.screenshot({ path: '/tmp/opencode/games/8-win.png' });
console.log('errores', errs.length);
await b.close();
