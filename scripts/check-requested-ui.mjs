import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless:true,channel:'msedge'});
try {
 const page = await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:5173/');
 await page.screenshot({path:'output/river-hero-check.png'});
 await page.getByRole('button',{name:'Watch demo',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Product demo'});
 for(const [i,label] of ['Find your evidence','Ground your question','Compare across time','Review the result'].entries()) {
  await dialog.getByRole('button',{name:label,exact:true}).click();
  await page.locator(`.sq-tour-step-${i}`).waitFor();
  await page.screenshot({path:`output/tour-step-${i+1}-check.png`});
 }
 await page.getByRole('button',{name:'Close demo'}).click();
 await page.getByRole('button',{name:'Open workspace',exact:true}).first().click();
 await page.getByRole('button',{name:'Close tutorial'}).click();
 const grip=page.getByRole('separator',{name:'Resize navigation',exact:true});
 async function dragTo(delta){const box=await grip.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+delta,box.y+box.height/2,{steps:15});await page.mouse.up();}
 await dragTo(155);assert.equal(await grip.getAttribute('aria-valuenow'),'227');
 await page.screenshot({path:'output/navigation-expanded-check.png'});
 await dragTo(-180);assert.equal(await grip.getAttribute('aria-valuenow'),'72');
 await dragTo(120);assert.equal(await grip.getAttribute('aria-valuenow'),'192');
 await page.setViewportSize({width:1000,height:800});
 assert.equal(Math.round((await page.locator('.aw-rail').boundingBox()).width),192);
 await dragTo(-150);assert.equal(await grip.getAttribute('aria-valuenow'),'72');
 await grip.focus();await page.keyboard.press('ArrowRight');assert.equal(await grip.getAttribute('aria-valuenow'),'180');
 assert.deepEqual(errors,[]);
 console.log('PASS: four distinct demo steps; navigation expands, collapses, reopens, and supports keyboard at desktop and narrow widths; no runtime errors.');
} finally {await browser.close();}
