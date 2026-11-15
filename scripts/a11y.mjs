import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'/usr/bin/chromium', headless:'new',
  args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--hide-scrollbars'],
  defaultViewport:{width:1280,height:800}});
const p = await b.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,9000));
const vh = await p.evaluate(()=>innerHeight);
await p.evaluate(h=>scrollTo(0,h), vh);
await new Promise(r=>setTimeout(r,2500));

const active = () => p.evaluate(()=>{
  const el = document.activeElement;
  return { tag: el?.tagName, cls: el?.className?.toString().slice(0,40), text: (el?.textContent??'').trim().slice(0,32) };
});

// Tab hasta el botón del minijuego
let found = false;
for (let i=0;i<25;i++){
  await p.keyboard.press('Tab');
  const a = await active();
  if (a.cls?.includes('play-button')) { found = true; break; }
}
console.log('play alcanzable con Tab:', found);

await p.keyboard.press('Enter');
await new Promise(r=>setTimeout(r,2000));
const inside = await p.evaluate(()=>{
  const g = document.querySelector('.game');
  return { open: !!g, focusedInside: g?.contains(document.activeElement) ?? false,
           inertBg: document.querySelector('.app-main')?.hasAttribute('inert') ?? null };
});
console.log('ABIERTO', JSON.stringify(inside));

// Tab nunca debe caer en el fondo inerte
let leaked = 0;
for (let i=0;i<14;i++){
  await p.keyboard.press('Tab');
  const inBg = await p.evaluate(()=>document.querySelector('.app-main')?.contains(document.activeElement) ?? false);
  if (inBg) leaked++;
}
console.log('focos filtrados al fondo inerte:', leaked);

await p.keyboard.press('Escape');
await new Promise(r=>setTimeout(r,1200));
const after = await p.evaluate(()=>({
  closed: !document.querySelector('.game'),
  focus: document.activeElement?.className?.toString().slice(0,30),
  inertBg: document.querySelector('.app-main')?.hasAttribute('inert') ?? null,
}));
console.log('CERRADO', JSON.stringify(after));
console.log('errores', errs.length);
await b.close();
