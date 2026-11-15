import puppeteer from 'puppeteer-core';
const OUT = '/tmp/opencode/games';
const b = await puppeteer.launch({ executablePath:'/usr/bin/chromium', headless:'new',
  args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--hide-scrollbars'],
  defaultViewport:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1}});
const p = await b.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,9000));
const vh = await p.evaluate(()=>innerHeight);

await p.evaluate(h=>scrollTo(0,h), vh);
await new Promise(r=>setTimeout(r,2500));
await p.screenshot({path:`${OUT}/m1-eagle.png`});

await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Intentar'))?.click());
await new Promise(r=>setTimeout(r,2000));
await p.screenshot({path:`${OUT}/m2-descent-start.png`});
await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Start'))?.click());
await new Promise(r=>setTimeout(r,3000));
await p.screenshot({path:`${OUT}/m3-descent-play.png`});
await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Back to the museum'))?.click());
await new Promise(r=>setTimeout(r,1200));

await p.evaluate(h=>scrollTo(0,h*2), vh);
await new Promise(r=>setTimeout(r,2500));
await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Repartir'))?.click());
await new Promise(r=>setTimeout(r,2000));
await p.screenshot({path:`${OUT}/m4-energy.png`});
await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Back to the museum'))?.click());
await new Promise(r=>setTimeout(r,1200));

await p.evaluate(h=>scrollTo(0,h*5), vh);
await new Promise(r=>setTimeout(r,2500));
await p.screenshot({path:`${OUT}/m5-epilogue.png`});

const overflow = await p.evaluate(()=>({
  x: document.documentElement.scrollWidth > innerWidth,
  epiScroll: document.querySelector('.epilogue')?.scrollHeight > innerHeight,
}));
console.log('MOBILE', JSON.stringify(overflow), 'errores', errs.length);
await b.close();
