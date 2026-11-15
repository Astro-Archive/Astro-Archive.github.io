import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'/usr/bin/chromium', headless:'new',
  args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--hide-scrollbars'],
  defaultViewport:{width:1280,height:800}});
const p = await b.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,9000));
const vh = await p.evaluate(()=>innerHeight);
const out = [];
const visible = [];
for (const i of [1,2,3,4]) {
  await p.evaluate(y=>scrollTo(0,y), vh*i);
  await new Promise(r=>setTimeout(r,2600));
  out.push(await p.evaluate(()=>document.querySelector('.card-title')?.textContent ?? null));
  visible.push(await p.evaluate(()=>document.querySelector('.card')?.classList.contains('is-visible') ?? false));
}
await p.evaluate(()=>scrollTo(0, document.documentElement.scrollHeight));
await new Promise(r=>setTimeout(r,2600));
const epi = await p.evaluate(()=>document.querySelector('.epilogue')?.classList.contains('is-visible'));
console.log(JSON.stringify({cards: out, visible, epilogue: epi, errors: errs.length}));
if (errs.length) console.log(errs.slice(0,4));
await b.close();
