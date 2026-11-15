import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'/usr/bin/chromium', headless:'new',
  args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--hide-scrollbars'],
  defaultViewport:{width:1440,height:900}});
const p = await b.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,9000));
const vh = await p.evaluate(()=>window.innerHeight);
await p.evaluate(h=>window.scrollTo(0,h), vh);
await new Promise(r=>setTimeout(r,2500));
await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Intentar'))?.click());
await new Promise(r=>setTimeout(r,2000));
await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Empezar'))?.click());
// sin tocar nada: el módulo cae solo
for (let i=0;i<8;i++){ await new Promise(r=>setTimeout(r,10000)); }
await p.screenshot({path:'/tmp/opencode/games/7-crash.png'});
const res = await p.evaluate(()=>({
  title: document.querySelector('.game-result-title')?.textContent ?? null,
  reason: document.querySelector('.game-lead')?.textContent ?? null,
  isLoss: document.querySelector('.game-result')?.classList.contains('is-loss') ?? null,
}));
console.log('RESULT', JSON.stringify(res));
console.log('errores', errs.length);
await b.close();
