'use strict';
const chapters=[
  {
    "at": 0,
    "end": 9,
    "label": "Query + image",
    "text": "How does a question become an answer? Our architecture brings the user's natural-language request and satellite imagery into one evidence-driven workflow."
  },
  {
    "at": 9,
    "end": 22,
    "label": "Ingestion + validation",
    "text": "The ingestion layer reads the GeoTIFF's numerical bands and geospatial metadata, preserving the original data. Validation checks sensor information, dates and usable coverage. Paired analysis additionally requires spatial compatibility; a shared coordinate system alone is not enough."
  },
  {
    "at": 22,
    "end": 32,
    "label": "Query understanding",
    "text": "Query understanding identifies the requested task and required evidence. A scene-description question needs one observation. Change analysis needs two dates; cross-modal analysis needs a compatible optical and radar pair."
  },
  {
    "at": 32,
    "end": 46,
    "label": "Planning + execution",
    "text": "The orchestrator matches those requirements to a registry of specialist models and geospatial tools. It builds the smallest valid workflow. Application code checks allowed parameters and dependencies, while missing inputs trigger clarification rather than an unsupported analysis."
  },
  {
    "at": 46,
    "end": 58,
    "label": "Models + GIS",
    "text": "Specialist models provide visual and semantic interpretation. GIS tools handle numerical operations. For example, an area estimate comes from a georeferenced mask and valid pixel areas, not from a language model guessing a number."
  },
  {
    "at": 58,
    "end": 71,
    "label": "Evidence engine",
    "text": "The evidence engine links each conclusion to its source and supporting output. It checks coverage and records conflicting sensor evidence. Model confidence, data quality and agreement are distinct signals; they are not combined into an arbitrary accuracy percentage."
  },
  {
    "at": 71,
    "end": 80,
    "label": "Answer + trace",
    "text": "The user receives a plain-language answer, relevant visual evidence and an execution record: which observations, models, tools and parameters produced the result."
  },
  {
    "at": 80,
    "end": 103,
    "label": "Model development",
    "text": "Our adaptation plan starts with Qwen three V L, an eight-billion-parameter backbone, using parameter-efficient tuning and BigEarthNet dot txt. Candidate versions are evaluated on held-out tasks, including base-versus-adapted and single-versus-paired comparisons. These development tests determine which versions enter the registry. At runtime, the orchestrator selects by task and sensor compatibility."
  }
];
const BASE=103,$=id=>document.getElementById(id),audio=new Audio(),params=new URLSearchParams(location.search);
let duration=BASE,time=0,playing=false,last=0,frame=0,active=-1,url='',countTimer=0;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),stamp=n=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
const card=(text,small='',cls='')=>`<div class="card ${cls}"><strong>${text}</strong>${small?`<small>${small}</small>`:''}</div>`;
const enter=(html,at=0,cls='')=>`<div class="reveal ${cls}" data-at="${at}">${html}</div>`;
const arrow=(at=0)=>enter('<div class="arrow">→</div>',at);
const row=(html,cls='')=>`<div class="row ${cls}">${html}</div>`;
function pixels(mask=false){return `<div class="pixels" role="img" aria-label="Abstract raster diagram">${Array.from({length:64},(_,i)=>`<i style="background:${mask?([10,11,18,19,20,26,27,28,35,36,43,44].includes(i)?'#50d7ca':'#233442'):['#1c4650','#50796a','#789278','#355a5c','#9fa88a'][(i*7+Math.floor(i/8)*3)%5]}"></i>`).join('')}</div>`;}
const file=()=>`<div class="card file">${pixels()}<strong>Observation.tif</strong></div>`;
const templates=[
()=>`<div class="composition opening">${enter('<div class="card query"><small>QUESTION</small><strong id="typed"></strong><span class="cursor"></span></div>',0)}${enter(file(),1.5,'file-arrival')}</div>`,
()=>`<div class="composition">${row(enter(file(),0)+arrow(.7)+enter(card('GeoTIFF ingestion','Original arrays + metadata','primary'),.7)+arrow(2)+enter(card('Validation','Task-dependent checks'),2))}<div class="row details">${['Bands','Sensor + dates','Coverage','Alignment'].map((x,i)=>enter(card(x),3+i*.8)).join('')}</div>${enter('<div class="under">Missing evidence → ask the user</div>',8)}</div>`,
()=>`<div class="composition">${row(enter(card('Question'),0)+arrow(.3)+enter(card('Query understanding','Task + required inputs','primary'),.5))}<div class="branches">${enter(card('Scene description','One observation','selected'),2)}${enter(card('Change analysis','Two acquisition dates'),3)}${enter(card('Cross-modal analysis','Optical + SAR pair'),4)}</div></div>`,
()=>`<div class="composition planning">${row(enter(card('Intent + metadata'),0)+arrow(.3)+enter(card('Orchestrator','Select · sequence · execute','primary'),.6))}<div class="bus">${enter('<div class="bus-line"></div>',1)}</div><div class="branches">${['Visual-language model','Temporal specialist','Optical–SAR analysis','GIS tools'].map((x,i)=>enter(card(x,i===0?'Selected for scene description':'',i===0?'selected':''),1.5+i*.35)).join('')}</div>${enter(row(card('Input requirements')+card('Permitted parameters')+card('Dependencies'),'details'),6)}${enter('<div class="under">Approved capability registry</div>',4)}</div>`,
()=>`<div class="composition">${row(enter(card('Specialist models','Interpret imagery','primary'),0)+enter(card('Geospatial tools','Calculate from source data','primary'),1),'twins')}${enter('<div class="example-label">Area calculation</div>',3)}${row(enter('<div class="card mask">'+pixels(true)+'<small>Valid mask pixels</small></div>',3)+enter('<div class="operator">×</div>',4)+enter(card('Pixel area','From the georeferencing'),4.4)+arrow(5.2)+enter(card('Measured area','Units + valid coverage','selected'),5.5),'measurement')}</div>`,
()=>`<div class="composition evidence">${row(enter(card('Source observations'),0)+enter(card('Model / tool outputs'),.7))}${enter('<div class="vertical-line"></div>',1)}${enter(card('Evidence engine','Connect claims to supporting outputs','primary'),1.5)}<div class="branches">${enter(card('Coverage','Usable / excluded regions'),3)}${enter(card('Agreement','Sensor conflicts'),4)}${enter(card('Uncertainty','Task-specific evidence'),5)}</div>${enter('<div class="under">Claim → source → method</div>',8)}</div>`,
()=>`<div class="composition answer">${enter('<div class="answer-sheet"><div class="answer-title">Answer</div><div class="skeleton long"></div><div class="skeleton"></div><div class="skeleton short"></div><div class="source-link">Source-linked evidence</div></div>',.3)}${enter('<div class="trace-sheet"><strong>Execution trace</strong><div>Observations</div><div>Model + tool versions</div><div>Parameters + outputs</div></div>',1.5)}</div>`,
()=>`<div class="composition development">${enter('<div class="example-label">Adaptation & evaluation plan</div>',0)}${row(enter(card('Qwen3-VL · 8B','Candidate backbone','primary'),.5)+enter('<div class="operator">+</div>',1)+enter(card('LoRA / QLoRA','Parameter-efficient adaptation'),1.5)+enter('<div class="operator">←</div>',2)+enter(card('BigEarthNet.txt','Paired sensor supervision'),2.5))}${enter(row(card('Base ↔ adapted')+card('Single ↔ paired'),'details'),7)}${enter(row(card('Held-out evaluation')+arrow(0)+card('Approved registry','Task + sensor compatibility','selected'),'closing-flow'),12)}</div>`
];
function resize(){const full=!!document.fullscreenElement||document.body.classList.contains('clean'),p=$('preview');const scale=Math.min(p.clientWidth/1920,p.clientHeight/1080);$('stage').style.transform=(full?'translate(-50%,-50%) ':'')+`scale(${scale})`}
function draw(){
 // A paused opening must be visible, including when opened directly from disk.
 const t=time===0&&!playing?3.5:time/duration*BASE;
 const i=time>=duration?chapters.length-1:chapters.findIndex(c=>t<c.end);
 const local=t-chapters[i].at;
 if(active!==i){
  active=i;
  $('scene').innerHTML=templates[i]();
  $('caption').textContent=chapters[i].text;
  [...$('cues').children].forEach((b,j)=>b.classList.toggle('active',i===j));
 }
 const exit=i===chapters.length-1?1:clamp((chapters[i].end-t)/.45);
 $('scene').style.opacity=exit;
 document.querySelectorAll('.reveal').forEach(n=>{
  const p=clamp((local-Number(n.dataset.at))/1.05),e=1-Math.pow(1-p,3);
  n.style.opacity=e;
  const horizontal=n.classList.contains('file-arrival')?100:0;
  n.style.transform=`translate(${(1-e)*horizontal}px,${(1-e)*(horizontal?0:34)}px) scale(${.97+.03*e})`;
 });
 if($('typed')){
  const q='Describe the land cover in this image.';
  $('typed').textContent=q.slice(0,Math.floor(clamp((local-.2)/3)*q.length));
  document.querySelector('.cursor').style.opacity=local>4?0:(Math.floor(local*2)%2?0:1);
 }
 $('seek').value=time;
 $('clock').textContent=`${stamp(time)} / ${stamp(duration)}`;
 $('play').textContent=playing?'Pause':'Play';
}
function pause(){playing=false;cancelAnimationFrame(frame);audio.pause();draw()}
function tick(now){if(!playing)return;time=Math.min(duration,time+(last?(now-last)/1000:0));last=now;draw();if(time>=duration){pause();return}frame=requestAnimationFrame(tick)}
function play(){if(countTimer)return;if(time>=duration)time=0;playing=true;last=0;if(url){audio.currentTime=time;audio.play().catch(()=>{$('audioStatus').textContent='Press Play again to enable audio.'})}cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);draw()}
function seek(n){time=clamp(Number(n),0,duration);last=0;if(url&&Number.isFinite(audio.duration))audio.currentTime=Math.min(time,audio.duration);draw()}
function setDuration(n){const fraction=time/duration;duration=clamp(Number(n)||BASE,30,300);$('duration').value=duration;$('seek').max=duration;seek(fraction*duration);[...$('cues').children].forEach((b,i)=>b.textContent=`${stamp(chapters[i].at/BASE*duration)} ${chapters[i].label}`)}
chapters.forEach((c,i)=>{const b=document.createElement('button');b.textContent=`${stamp(c.at)} ${c.label}`;b.onclick=()=>{pause();seek(c.at/BASE*duration+.1)};$('cues').append(b);const p=document.createElement('p');p.innerHTML=`<b>${i+1}. ${c.label}</b><br>${c.text}`;$('script').append(p)});
$('play').onclick=()=>playing?pause():play();$('restart').onclick=()=>{pause();seek(0);play()};$('seek').oninput=e=>seek(e.target.value);$('duration').onchange=e=>setDuration(e.target.value);$('captions').onchange=e=>$('caption').hidden=!e.target.checked;
async function fullscreen(){try{await $('preview').requestFullscreen()}catch{$('audioStatus').textContent='Fullscreen unavailable. Use the clean-view link.'}}
$('full').onclick=fullscreen;
function cancelCountdown(){clearInterval(countTimer);countTimer=0;$('countdown').hidden=true}
$('record').onclick=async()=>{pause();cancelCountdown();seek(0);await fullscreen();$('preview').classList.add('recording');let n=3;$('countdown').hidden=false;$('countdown').textContent=n;countTimer=setInterval(()=>{n--;if(!n){cancelCountdown();play()}else $('countdown').textContent=n},1000)};
$('voice').onchange=e=>{const file=e.target.files[0];if(!file)return;pause();$('fit').disabled=true;if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(file);audio.src=url;$('audioStatus').textContent='Reading voice…';audio.onloadedmetadata=()=>{$('fit').disabled=!Number.isFinite(audio.duration);$('audioStatus').textContent=`${file.name} · ${stamp(audio.duration)}`};audio.onerror=()=>{$('fit').disabled=true;$('audioStatus').textContent='Cannot decode this audio file.'}};
$('fit').onclick=()=>{pause();setDuration(audio.duration);seek(0)};$('clear').onclick=()=>{pause();audio.removeAttribute('src');audio.load();if(url)URL.revokeObjectURL(url);url='';$('voice').value='';$('fit').disabled=true;$('audioStatus').textContent='Audio stays on this device.'};
document.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();playing?pause():play()}if(e.key.toLowerCase()==='r'){pause();seek(0);play()}if(e.key==='ArrowRight'){e.preventDefault();seek(time+2)}if(e.key==='ArrowLeft'){e.preventDefault();seek(time-2)}if(e.key==='Escape'){cancelCountdown();$('preview').classList.remove('recording')}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();cancelCountdown()}});document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){cancelCountdown();$('preview').classList.remove('recording')}resize()});new ResizeObserver(resize).observe($('preview'));
if(params.get('clean')==='1')document.body.classList.add('clean');setDuration(params.get('duration')||BASE);seek(params.get('t')||0);resize();if(params.get('autoplay')==='1')play();
