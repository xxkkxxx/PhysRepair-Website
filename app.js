 'use strict';
const $=s=>document.querySelector(s);
let DATA,selected='',selectedAblation='3video';
const groups=new Map();
function videos(root){return [...root.querySelectorAll('video')].filter(v=>!v.hidden&&v.getAttribute('src'));}
function setupGroup(key,root,button,status){
 const group={root,button,status,epoch:0,loading:false};groups.set(key,group);
 button.onclick=()=>toggleGroup(key);
 root.addEventListener('ended',()=>{if(videos(root).every(v=>v.ended||v.dataset.failed==='true'))button.textContent='↺ Replay';},true);
}
function pauseGroup(group,reset=false){group.epoch++;group.loading=false;group.button.disabled=false;videos(group.root).forEach(v=>{v.pause();if(reset)v.currentTime=0;});group.button.textContent=reset?'▶ Start':videos(group.root).some(v=>v.currentTime>0)?'▶ Resume':'▶ Start';if(group.status)group.status.textContent='';}
function resetGroups(){groups.forEach(g=>pauseGroup(g,true));}
function prepareVideo(v){
 if(v.readyState>=3)return Promise.resolve(true);
 return new Promise(resolve=>{let timer;const clean=()=>{clearTimeout(timer);v.removeEventListener('canplay',ok);v.removeEventListener('error',fail);};const ok=()=>{clean();resolve(true);};const fail=()=>{clean();resolve(false);};v.addEventListener('canplay',ok);v.addEventListener('error',fail);timer=setTimeout(fail,25000);v.preload='auto';if(v.error)fail();});
}
async function toggleGroup(key){
 const g=groups.get(key),vs=videos(g.root);if(!vs.length)return;
 if(vs.some(v=>!v.paused)){pauseGroup(g);return;}
 const token=++g.epoch;const resume=vs.some(v=>v.currentTime>0)&&!vs.every(v=>v.ended||v.dataset.failed==='true');
 g.loading=true;g.button.disabled=true;g.button.textContent='Loading…';if(g.status)g.status.textContent='Preparing the videos…';
 const ready=await Promise.all(vs.map(prepareVideo));if(g.epoch!==token)return;
 const available=vs.filter((v,i)=>{v.dataset.failed=String(!ready[i]);return ready[i];});
 if(!resume)available.forEach(v=>v.currentTime=0);
 const results=await Promise.allSettled(available.filter(v=>!resume||!v.ended).map(v=>v.play()));
 if(g.epoch!==token){vs.forEach(v=>v.pause());return;}
 g.loading=false;g.button.disabled=false;
 const started=results.some(r=>r.status==='fulfilled');g.button.textContent=started?'Ⅱ Pause':'▶ Try again';
 const failed=ready.filter(x=>!x).length+results.filter(r=>r.status==='rejected').length;
 if(g.status)g.status.textContent=failed?'Some clips could not play. Press the same button to pause or retry.':'';
}
function load(v,a){v.pause();v.controls=false;v.disablePictureInPicture=true;v.muted=true;v.playsInline=true;v.preload='none';v.poster=a.poster;v.src=a.src;v.load();}
function card(asset,label,ours=false){
 const fig=document.createElement('figure');if(ours)fig.className='ours-frame';
 const box=document.createElement('div');box.className='video-box';
 if(asset){const v=document.createElement('video');v.setAttribute('aria-label',label+' video');load(v,asset);box.append(v);}else{const missing=document.createElement('div');missing.className='missing';missing.textContent='Result not supplied';box.append(missing);}
 const cap=document.createElement('figcaption');cap.textContent=label;
 if(ours){const badge=document.createElement('span');badge.className='ours-pill';badge.textContent='OURS';cap.append(badge);}
 fig.append(box,cap);return fig;
}
const list=()=>DATA.cases;
function strip(){const box=$('#case-strip');box.replaceChildren();for(const c of list()){const b=document.createElement('button');b.className='case-thumb'+(c.id===selected?' active':'');b.setAttribute('aria-label','Select '+c.title);b.setAttribute('aria-pressed',c.id===selected);const img=document.createElement('img');img.src=c.poster;img.alt='';img.loading='lazy';const t=document.createElement('span');t.textContent=c.title;b.append(img,t);b.onclick=()=>choose(c.id);box.append(b);}$('#case-count').textContent=list().length+' scenes';}
function choose(id){
 resetGroups();selected=id;const c=DATA.cases.find(x=>x.id===id);$('#case-title').textContent=c.title;$('#case-prompt').textContent=c.prompt;$('#case-category').textContent=c.category.toUpperCase();strip();
 const magi=c.methods['MAGI-1_4.5B']?'MAGI-1_4.5B':'MAGI-1_4.5B_PPT';
 const vlipp=c.methods.VLIPP_newcase?'VLIPP_newcase':'VLIPP',phyco=c.methods.PhyCo_newcase?'PhyCo_newcase':'PhyCo';
 const order=[['CogVideoX-5B','CogVideoX-5B'],['HunyuanVideo-1.5','HunyuanVideo-1.5'],['Wan2.2_TI2V-5B','Wan2.2 TI2V-5B'],[vlipp,c.methods[vlipp]?.label||'VLIPP'],[phyco,c.methods[phyco]?.label||'PhyCo'],['Cosmos3-Super','Cosmos 3 Super'],[magi,'MAGI-1 4.5B']];
 order.push(['minmaxh3','MiniMax H3'],['Ours','PhysRepair (Ours)']);const grid=$('#comparison-grid');grid.replaceChildren();
 for(const[key,label]of order){const el=card(c.methods[key],label,key==='Ours');el.dataset.method=key;grid.append(el);}
 $('#variant-note').textContent=c.id.startsWith('wind_')?'VLIPP · motion plan uses an assistant-authored motion plan. PhyCo · alternate VAE uses a separately supplied tokenizer configuration.':'';
}
for(const[id,step]of[['#previous-case',-1],['#next-case',1]])$(id).onclick=()=>{const cs=list(),i=cs.findIndex(c=>c.id===selected);choose(cs[(i+step+cs.length)%cs.length].id);};
function ablation(id){resetGroups();selectedAblation=id;const c=DATA.ablations.find(c=>c.id===id),grid=$('#ablation-grid');$('#ablation-title').textContent=c.title;$('#ablation-prompt').textContent=c.prompt;grid.replaceChildren();document.querySelectorAll('#ablation-tabs button').forEach(b=>{b.classList.toggle('active',b.dataset.id===id);b.setAttribute('aria-pressed',b.dataset.id===id);});for(const[key,label]of[['Original','MiniMax H3'],['Intermediate',c.causal?'Ours w/o causal constraints':'Intermediate repair'],['Ours','PhysRepair (Ours)']])grid.append(card(c.videos[key],label,key==='Ours'));$('#ablation-note').textContent=id==='3video'?'The manuscript examines a saved-and-scored contradiction: correcting the ball alone leaves downstream scoring cues. Full causal repair also addresses the goal and net.':id==='2video'?'The manuscript examines preservation of a valid kick while repairing the subsequent ball–ball collision.':id==='bvideo'?'':'Three supplied repair stages. The middle video is an intermediate result; its exact ablation setting is not specified in the source presentation.';}
setupGroup('hero',$('.hero-demo'),$('#hero-play'),$('#hero-status'));
setupGroup('comparison',$('.comparison-shell'),$('#case-play'),$('#comparison-status'));
setupGroup('ablation',$('.ablation-shell'),$('#ablation-play'),$('#ablation-status'));
for(const[id,step]of[['#previous-ablation',-1],['#next-ablation',1]])$(id).onclick=()=>{const cs=DATA.ablations,i=cs.findIndex(c=>c.id===selectedAblation);ablation(cs[(i+step+cs.length)%cs.length].id);};
const rows=[['MAGI-1 4.5B',14.3,13.3,7.0,null,18.8],['Cosmos-Predict2-2B',null,null,null,null,27.7],['Wan2.2 TI2V-5B',35.9,26.4,23.0,25.5,27.7],['CogVideoX-I2V-5B',37.8,35.5,21.8,32.0,31.8],['Wan2.2 I2V-14B',51.1,20.5,28.5,28.9,32.2],['HunyuanVideo-1.5',47.1,26.9,29.7,30.0,33.4],['MiniMax H3 FL2VA',58.9,22.8,40.5,37.0,39.8],['Cosmos 3 Super',57.4,32.5,43.0,37.8,42.7],['VLIPP',45.5,29.9,29.0,25.1,32.4],['PhyCo',46.2,43.8,30.5,26.8,36.8],['PhysRepair (Ours)',58.2,34.7,44.2,37.4,43.6]];
for(const r of rows){const tr=document.createElement('tr');if(r[0].startsWith('PhysRepair'))tr.className='ours-row';r.forEach((v,i)=>{const td=document.createElement(i===0?'th':'td');if(!i)td.scope='row';td.textContent=v===null?'—':typeof v==='number'?v.toFixed(1):v;if(i>0&&v===Math.max(...rows.map(x=>x[i]??-Infinity)))td.className='best';tr.append(td);});$('#results-body').append(tr);}
const dialog=$('#figure-dialog');document.querySelectorAll('[data-figure]').forEach(b=>b.onclick=()=>{$('#figure-expanded').src=b.dataset.figure;$('#figure-expanded').alt=b.querySelector('img').alt;dialog.showModal();});$('#close-figure').onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog)dialog.close();};$('#copy-citation').onclick=async()=>{try{await navigator.clipboard.writeText($('#bibtex').textContent);$('#copy-status').textContent='Copied to clipboard.';}catch{const r=document.createRange();r.selectNodeContents($('#bibtex'));const s=window.getSelection();s.removeAllRanges();s.addRange(r);$('#copy-status').textContent='Citation selected. Copy with Ctrl/Cmd+C.';}};
try{if(localStorage.getItem('physrepair-theme')==='dark')document.body.classList.add('dark');}catch{}$('.theme-toggle').onclick=()=>{const dark=document.body.classList.toggle('dark');try{localStorage.setItem('physrepair-theme',dark?'dark':'light');}catch{}};
const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting){const g=[...groups.values()].find(g=>g.root===e.target);if(g)pauseGroup(g);}}),{threshold:0});groups.forEach(g=>obs.observe(g.root));
fetch('assets/data.json').then(r=>{if(!r.ok)throw new Error('Data unavailable');return r.json();}).then(d=>{DATA={...d,cases:d.cases.filter(c=>!c.hidden),ablations:d.ablations.filter(c=>!c.hidden)};choose(DATA.cases[0].id);const c=d.cases.find(c=>c.id==='3video');load($('#hero-before'),c.methods.minmaxh3);load($('#hero-after'),c.methods.Ours);$('#ablation-count').textContent=DATA.ablations.length+' scenes';for(const c of DATA.ablations){const b=document.createElement('button');b.className='case-thumb';b.setAttribute('aria-label','Select ablation '+c.title);const img=document.createElement('img');img.src=c.videos.Original.poster;img.alt='';img.loading='lazy';const label=document.createElement('span');label.textContent=c.title;b.append(img,label);b.dataset.id=c.id;b.onclick=()=>ablation(c.id);$('#ablation-tabs').append(b);}ablation('3video');}).catch(e=>{$('#data-error').hidden=false;console.error(e);});
