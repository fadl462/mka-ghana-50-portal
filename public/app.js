const $=s=>document.querySelector(s);async function api(p,o={}){const r=await fetch(p,o),d=r.headers.get('content-type')?.includes('application/json')?await r.json():await r.text();if(!r.ok)throw Error(d.error||'Request failed');return d}const say=(el,t,error=false)=>{el.textContent=t;el.classList.toggle('error',error)};
const form=$('#entryForm');let current=1,settings={submissionOpen:true,maxUploadMb:12};
function setStep(n){current=n;saveDraft();document.querySelectorAll('.form-step').forEach(x=>x.classList.toggle('active',+x.dataset.step===n));document.querySelectorAll('.step-indicator').forEach((x,i)=>{x.classList.toggle('active',i+1===n);x.classList.toggle('done',i+1<n)});$('#formMessage').textContent='';if(n===3)buildReview();}
function value(name){return String(form.elements[name]?.value||'').trim()}
function checkStep(n){let fields=[...document.querySelector(`.form-step[data-step="${n}"]`).querySelectorAll('input:not([type=checkbox]):not([type=file]),select,textarea')];for(const f of fields){if(f.offsetParent===null)continue;if(!f.checkValidity()){f.reportValidity();return false}}if(n===1&&value('category')==='atfal'&&(!value('guardianName')||!value('guardianPhone')||!form.elements.guardianConsent.checked)){say($('#formMessage'),'Atfal entries require parent/guardian details and consent.',true);return false}if(n===2){if(form.elements.artwork.files.length!==1){say($('#formMessage'),'Attach exactly one image for each submission.',true);return false}const file=form.elements.artwork.files[0];if(!file){say($('#formMessage'),'Please attach your artwork before continuing.',true);return false}if(file.size>settings.maxUploadMb*1048576){say($('#formMessage'),`Your file exceeds the ${settings.maxUploadMb} MB upload limit.`,true);return false}if(!['image/png','image/jpeg','image/webp'].includes(file.type)){say($('#formMessage'),'Please upload one PNG, JPG or WebP image.',true);return false}}return true}
document.querySelectorAll('.next-step').forEach(b=>b.onclick=()=>{if(checkStep(current))setStep(current+1)});document.querySelectorAll('.prev-step').forEach(b=>b.onclick=()=>setStep(current-1));$('#category').onchange=e=>$('#guardian').classList.toggle('hidden',e.target.value!=='atfal');
function buildReview(){const file=form.elements.artwork.files[0];const items=[['PARTICIPANT',value('fullName')],['EMAIL',value('email')],['CONTACT',value('phone')],['REGION / ILAQA',value('region')],['TANZEEM',({khuddam:'Khuddam',atfal:'Atfal',lajna:'Lajna',ansar:'Ansar'})[value('category')]||value('category')],['DESIGN TITLE',value('title')],['ARTWORK',file?`${file.name} · ${(file.size/1048576).toFixed(2)} MB`:'Not attached']];if(value('category')==='atfal')items.push(['PARENT / GUARDIAN',value('guardianName')+' · '+value('guardianPhone')]);const artworkPreview=file&&previewUrl?`<div class="review-artwork-preview"><img src="${previewUrl}" alt="Preview of uploaded artwork"><div><b>${escapeHtml(file.name)}</b><small>${(file.size/1048576).toFixed(2)} MB · Uploaded artwork</small></div></div>`:'';$('#reviewSummary').innerHTML=items.map(([k,v])=>`<div class="review-item"><small>${k}</small><b>${escapeHtml(v)}</b></div>`).join('')+artworkPreview+`<div class="review-item wide"><small>DESIGN RATIONALE</small><p>${escapeHtml(value('rationale'))}</p></div>`}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const upload=$('#artwork'),zone=document.querySelector('.upload-zone');upload.onchange=async()=>{showFile();saveDraft();const f=upload.files[0];if(f){try{await storeDraftArtwork(f)}catch(e){console.warn('Could not save artwork draft',e)}}else await clearDraftArtwork();};['dragenter','dragover'].forEach(t=>zone.addEventListener(t,e=>{e.preventDefault();zone.classList.add('dragover')}));['dragleave','drop'].forEach(t=>zone.addEventListener(t,e=>{e.preventDefault();zone.classList.remove('dragover')}));zone.addEventListener('drop',e=>{if(e.dataTransfer.files.length){upload.files=e.dataTransfer.files;showFile();saveDraft();if(upload.files[0])storeDraftArtwork(upload.files[0]).catch(e=>console.warn('Could not save artwork draft',e))}});let previewUrl=null;
function showFile(){
 const f=upload.files[0],p=$('#filePreview');
 if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null}
 if(!f){p.classList.add('hidden');p.innerHTML='';return}
 if(!['image/png','image/jpeg','image/webp'].includes(f.type)){upload.value='';p.classList.add('hidden');say($('#formMessage'),'Please choose a PNG, JPG or WebP image.',true);return}
 if(f.size>settings.maxUploadMb*1048576){upload.value='';p.classList.add('hidden');say($('#formMessage'),`Your file exceeds the ${settings.maxUploadMb} MB upload limit.`,true);return}
 previewUrl=URL.createObjectURL(f);p.classList.remove('hidden');
 p.innerHTML=`<div class="artwork-preview-card"><img src="${previewUrl}" alt="Preview of selected artwork"><div class="artwork-preview-meta"><b>${escapeHtml(f.name)}</b><small>${(f.size/1048576).toFixed(2)} MB · Ready to submit</small><button type="button" id="removeFile" class="text-link">Remove image</button></div></div>`;
 $('#removeFile').onclick=()=>{upload.value='';showFile();saveDraft();clearDraftArtwork()};
}

// Local draft recovery: text fields use localStorage; artwork is kept in IndexedDB.
const DRAFT_KEY='mka50_entry_draft_v1';
const DRAFT_DB='mka50_entry_drafts';
const DRAFT_STORE='artwork';
let draftSaveTimer=null, restoringDraft=false;
function openDraftDb(){
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open(DRAFT_DB,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(DRAFT_STORE))req.result.createObjectStore(DRAFT_STORE)};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });
}
async function storeDraftArtwork(file){
 const db=await openDraftDb();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(DRAFT_STORE,'readwrite');
  tx.objectStore(DRAFT_STORE).put({blob:file,name:file.name,type:file.type,lastModified:file.lastModified},'current');
  tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)};
 });
}
async function readDraftArtwork(){
 const db=await openDraftDb();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(DRAFT_STORE,'readonly'),req=tx.objectStore(DRAFT_STORE).get('current');
  req.onsuccess=()=>{db.close();resolve(req.result||null)};req.onerror=()=>{db.close();reject(req.error)};
 });
}
async function clearDraftArtwork(){
 try{const db=await openDraftDb();await new Promise((resolve,reject)=>{const tx=db.transaction(DRAFT_STORE,'readwrite');tx.objectStore(DRAFT_STORE).delete('current');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close()}catch(e){console.warn('Could not clear local artwork draft',e)}
}
function collectDraft(){
 const fields={};
 [...form.elements].forEach(el=>{
  if(!el.name||el.type==='file'||el.type==='submit'||el.type==='button')return;
  if(el.type==='checkbox'||el.type==='radio')fields[el.name]=el.checked;
  else fields[el.name]=el.value;
 });
 return {savedAt:Date.now(),step:current,fields};
}
function saveDraft(){
 if(restoringDraft||!form||form.querySelector('.success-screen'))return;
 clearTimeout(draftSaveTimer);
 draftSaveTimer=setTimeout(()=>{
  try{localStorage.setItem(DRAFT_KEY,JSON.stringify(collectDraft()))}catch(e){console.warn('Could not save entry draft',e)}
 },250);
}
async function restoreDraft(){
 let draft;
 try{draft=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null')}catch(e){localStorage.removeItem(DRAFT_KEY)}
 if(!draft||!draft.savedAt||Date.now()-draft.savedAt>30*24*60*60*1000){
  if(draft){localStorage.removeItem(DRAFT_KEY);await clearDraftArtwork()}
  return;
 }
 restoringDraft=true;
 try{
  Object.entries(draft.fields||{}).forEach(([name,v])=>{
   const el=form.elements.namedItem(name);if(!el)return;
   if(el instanceof RadioNodeList){[...el].forEach(x=>{if(x.type==='checkbox'||x.type==='radio')x.checked=!!v;else x.value=v})}
   else if(el.type==='checkbox'||el.type==='radio')el.checked=!!v;
   else if(el.type!=='file')el.value=v;
  });
  const category=form.elements.category;
  if(category)$('#guardian').classList.toggle('hidden',category.value!=='atfal');
  try{
   const saved=await readDraftArtwork();
   if(saved?.blob){
    const file=new File([saved.blob],saved.name||'artwork', {type:saved.type||saved.blob.type,lastModified:saved.lastModified||Date.now()});
    const dt=new DataTransfer();dt.items.add(file);upload.files=dt.files;showFile();
   }
  }catch(e){console.warn('Could not restore artwork draft',e)}
  const step=Math.max(1,Math.min(3,Number(draft.step)||1));
  setStep(step);
 }finally{restoringDraft=false}
}
form.addEventListener('input',saveDraft);
form.addEventListener('change',saveDraft);
window.addEventListener('beforeunload',saveDraft);

form.onsubmit=async e=>{e.preventDefault(); if(!form.elements.acceptedTerms.checked){say($('#formMessage'),'Please confirm that your design is original and accept the competition rules.',true);return}const b=$('#submitButton');b.disabled=true;b.textContent='Sending your entry…';try{const d=await api('/api/submit',{method:'POST',body:new FormData(form)});localStorage.removeItem(DRAFT_KEY);clearDraftArtwork();form.innerHTML=`<div class="success-screen"><div class="success-icon">✓</div><h3>Thank you for your entry!</h3><p>Your entry has been successfully received.</p><div class="reference-box"><small>YOUR SUBMISSION REFERENCE</small><strong>${escapeHtml(d.reference)}</strong><button type="button" id="copyReference">Copy reference</button><span class="reference-hint">Keep this reference to track your entry.</span></div><div class="success-actions"><a class="button button-primary" href="/track">Track your entry</a><a class="text-link" href="/entries">Explore entries</a></div></div>`;$('#copyReference').onclick=()=>navigator.clipboard?.writeText(d.reference).then(()=>$('#copyReference').textContent='Copied!')}catch(x){say($('#formMessage'),x.message,true);b.disabled=false;b.innerHTML='Submit my entry <span></span>'}};
(async()=>{try{const s=await api('/api/public/settings');settings={submissionOpen:true,maxUploadMb:Number(s.maxUploadMb)||12};const maxMb=$('#maxMb');if(maxMb)maxMb.textContent=settings.maxUploadMb;const openPill=$('#openPill');if(openPill){openPill.textContent='Submissions open';openPill.classList.add('open-pill')}const formClosed=$('#formClosed');if(formClosed)formClosed.classList.add('hidden');if(form)form.classList.remove('hidden')}catch(error){console.error('Unable to load public settings:',error);settings.submissionOpen=true;const openPill=$('#openPill');if(openPill){openPill.textContent='Submissions open';openPill.classList.add('open-pill')}const formClosed=$('#formClosed');if(formClosed)formClosed.classList.add('hidden');if(form)form.classList.remove('hidden')}})();
restoreDraft().catch(e=>console.warn('Could not restore entry draft',e));
$('#menuToggle').onclick=()=>$('#mainNav').classList.toggle('open');
