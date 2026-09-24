import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.MOTION_URL||'http://127.0.0.1:5174';
const qaDir=process.env.MOTION_QA_DIR||'output/motion-v2-qa';
const browser=await chromium.launch({headless:true,channel:'msedge'});
try {
 const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${base}/agrani-motion.html`);
 await page.waitForURL('**/agrani-motion-v2.html');
 assert.match(await page.locator('#typed').innerText(),/Describe the land cover/);
 assert.equal(await page.locator('.opening>.reveal').first().evaluate(el=>getComputedStyle(el).opacity),'1');
 const script=readFileSync('docs/AGRANI_FINAL_SCRIPT.md','utf8');
 const scenes=await page.evaluate(()=>chapters);
 scenes.forEach(c=>assert.ok(script.includes(c.text),`Narration mismatch: ${c.label}`));
 mkdirSync(qaDir,{recursive:true});
 for(let i=0;i<scenes.length;i++){
  await page.goto(`${base}/agrani-motion-v2.html?clean=1&t=${scenes[i].end-1}`);
  assert.ok(await page.locator('#scene .card, #scene .answer-sheet').count()>0);
  assert.equal(await page.locator('#stage header, #stage footer, #stage .edition').count(),0);
  const overflow=await page.locator('#scene').evaluate(el=>[...el.querySelectorAll('.card,.answer-sheet,.trace-sheet')].filter(n=>{const r=n.getBoundingClientRect(),s=document.querySelector('#stage').getBoundingClientRect();return r.left<s.left||r.right>s.right||r.bottom>s.bottom}).length);
  assert.equal(overflow,0,`Overflow scene ${i}`);
  if([2,3,5].includes(i)){
   const detached=await page.evaluate(()=>{
    const s=document.querySelector('#stage').getBoundingClientRect(),scale=s.width/1920;
    return [...document.querySelectorAll('.flow-paths path')].filter(path=>{
     const from=document.querySelector(`[data-node="${path.dataset.from}"] .card`).getBoundingClientRect(),to=document.querySelector(`[data-node="${path.dataset.to}"] .card`).getBoundingClientRect();
     const start=path.getPointAtLength(0),end=path.getPointAtLength(path.getTotalLength());
     return Math.abs(start.x-(from.left+from.width/2-s.left)/scale)>1||Math.abs(start.y-(from.bottom-s.top)/scale)>1||Math.abs(end.x-(to.left+to.width/2-s.left)/scale)>1||Math.abs(end.y+4-(to.top-s.top)/scale)>1||end.y<=start.y;
    }).length;
   });
   assert.equal(detached,0,`Detached or reversed connector in scene ${i}`);
   assert.equal(await page.locator('.flow-paths path').count(),i===2?3:i===3?4:5);
  }
  await page.screenshot({path:`${qaDir}/${i+1}.png`});
 }
 await page.goto(`${base}/agrani-motion-v2.html`);
 await page.locator('#duration').fill('30');await page.locator('#duration').dispatchEvent('change');
 assert.equal(await page.locator('#seek').getAttribute('max'),'30');
 await page.locator('#play').click();await page.waitForTimeout(250);await page.locator('#play').click();
 assert.ok(await page.evaluate(()=>time>0));
 await page.locator('#captions').check();assert.ok(await page.locator('#caption').isVisible());
 await page.evaluate(()=>seek(duration));assert.match(await page.locator('#scene').innerText(),/Qwen3-VL/);
 await page.locator('#record').click();
 await page.waitForTimeout(3400);
 assert.ok(await page.evaluate(()=>playing && !countTimer && !!document.fullscreenElement));
 await page.evaluate(()=>{pause();return document.exitFullscreen()});
 await page.setViewportSize({width:1280,height:720});
 await page.goto(`${base}/agrani-motion-v2.html?clean=1&t=43`);
 const fits=await page.locator('#stage').evaluate(el=>{const r=el.getBoundingClientRect();return Math.abs(r.width-innerWidth)<2&&Math.abs(r.height-innerHeight)<2});
 assert.ok(fits,'Clean recording frame should fit a 16:9 viewport');
 assert.deepEqual(errors,[]);console.log('PASS: eight scenes, no frame branding, redirect, matching narration, bounds, playback, duration, captions and end state.');
}finally{await browser.close()}
