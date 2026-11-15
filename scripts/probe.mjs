import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'/usr/bin/chromium', headless:'new',
  args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--hide-scrollbars'],
  defaultViewport:{width:900,height:600}});
const p = await b.newPage();
await p.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,8000));
const vh = await p.evaluate(()=>window.innerHeight);
await p.evaluate(h=>window.scrollTo(0,h), vh);
await new Promise(r=>setTimeout(r,2000));
await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Intentar'))?.click());
await new Promise(r=>setTimeout(r,1500));
await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Empezar'))?.click());
const read = async () => p.evaluate(()=>({
  alt: document.querySelectorAll('.hud-value')[0]?.textContent,
  vy: document.querySelectorAll('.hud-value')[1]?.textContent,
  result: document.querySelector('.game-result-title')?.textContent ?? null,
}));
for (let i=0;i<10;i++){ await new Promise(r=>setTimeout(r,6000)); console.log(i, JSON.stringify(await read())); }
await b.close();
