const $=s=>document.querySelector(s);
let page=1,pages=1,searchTimer;
let viewerEntries=[],viewerIndex=-1,viewerPage=1,viewerBusy=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function visitorId(){let id=localStorage.getItem('mka50_visitor_id');if(!id){id=crypto.randomUUID();localStorage.setItem('mka50_visitor_id',id)}return id}
function stars(score){
  const rated=score!==null&&score!==undefined&&score!=='';
  const value=rated?Math.max(0,Math.min(5,Number(score)/20)):0;
  const icons=`<span class="rating-stars" role="img" aria-label="${rated?`${value.toFixed(1)} out of 5 stars`:'Not yet rated'}">${[1,2,3,4,5].map(n=>{const fill=Math.max(0,Math.min(1,value-(n-1)))*100;return `<span class="rating-star" aria-hidden="true"><span style="width:${fill}%">★</span>☆</span>`}).join('')}</span>`;
  return rated?`${icons}<strong class="rating-score">${Number.isInteger(value)?value:value.toFixed(1)}/5</strong>`:icons;
}
async function load(){
 const grid=$('#galleryGrid');grid.innerHTML='<p class="gallery-empty">Loading entries…</p>';
 const qs=new URLSearchParams({page,sort:$('#gallerySort').value,q:$('#gallerySearch').value.trim(),visitorId:visitorId()});
 try{
  const r=await fetch('/api/public/entries?'+qs),d=await r.json();
  if(!r.ok)throw Error(d.error||'Could not load entries.');
  pages=d.pages;$('#galleryCount').textContent=`${d.total} public ${d.total===1?'entry':'entries'}`;
  $('#pageLabel').textContent=`Page ${page} of ${pages}`;$('#prevPage').disabled=page<=1;$('#nextPage').disabled=page>=pages;
  if(!d.entries.length){grid.innerHTML='<p class="gallery-empty">No public entries match your search yet.</p>';return}
  grid.innerHTML=d.entries.map(x=>`<article class="gallery-card">
   <button class="gallery-art-open" type="button" data-open="${esc(x.id)}" aria-label="Open artwork by ${esc(x.full_name)}">
    <div class="gallery-image"><img loading="lazy" src="/api/public/entry-file/${encodeURIComponent(x.id)}" alt="Submitted artwork by ${esc(x.full_name)}"><span class="gallery-ref">${esc(x.reference_code)}</span></div>
   </button>
   <div class="gallery-card-body">
    <h3 class="gallery-contestant">${esc(x.full_name)}</h3>
    <div class="gallery-card-rating">${stars(x.average_score)}</div>
    <div class="gallery-card-foot"><small>Submitted ${new Date(x.created_at.includes('Z')?x.created_at:x.created_at+'Z').toLocaleDateString()}</small><button class="like-button ${x.viewer_liked?'liked':''}" data-id="${esc(x.id)}" aria-pressed="${x.viewer_liked?'true':'false'}" aria-label="${x.viewer_liked?'Unlike':'Like'} entry by ${esc(x.full_name)}">${x.viewer_liked?'♥':'♡'} <span>${x.like_count}</span> ${x.viewer_liked?'Liked':'Like'}</button></div>
   </div></article>`).join('');
  grid.querySelectorAll('.like-button').forEach(b=>b.onclick=()=>like(b));
  grid.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openArtwork(d.entries.findIndex(x=>x.id===b.dataset.open),d.entries,page));
 }catch(e){grid.innerHTML=`<p class="gallery-empty">${esc(e.message)}</p>`}
}
async function like(b){
 if(b.disabled)return;
 b.disabled=true;
 try{
  const r=await fetch(`/api/public/entries/${encodeURIComponent(b.dataset.id)}/like`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({visitorId:visitorId()})});
  const d=await r.json();
  if(!r.ok)throw Error(d.error||'Like could not be updated.');
  b.classList.toggle('liked',d.liked);
  b.setAttribute('aria-pressed',String(d.liked));
  b.setAttribute('aria-label',`${d.liked?'Unlike':'Like'} this entry`);
  b.innerHTML=`${d.liked?'♥':'♡'} <span>${d.likes}</span> ${d.liked?'Liked':'Like'}`;
 }catch(e){b.title=e.message;alert(e.message)}
 finally{b.disabled=false}
}
function renderArtwork(){
 const x=viewerEntries[viewerIndex];if(!x)return;
 $('#dialogImage').src=`/api/public/entry-file/${encodeURIComponent(x.id)}`;
 $('#dialogImage').alt=`Artwork submitted by ${x.full_name}`;
 $('#dialogTitle').textContent=x.title||'Untitled entry';
 $('#dialogRationale').textContent=x.rationale||'';
 $('#dialogReference').textContent=x.reference_code;
 const score=Number(x.average_score||0);
 $('#dialogRating').innerHTML=score>0?`${stars(score)} <strong>${(score/20).toFixed(1)}/5</strong>`:`${stars(0)} <span class="dialog-unrated">Not yet rated</span>`;
 $('#artworkPrev').disabled=viewerBusy||(viewerIndex===0&&viewerPage<=1);
 $('#artworkNext').disabled=viewerBusy||(viewerIndex===viewerEntries.length-1&&viewerPage>=pages);
}
function openArtwork(index,entries,currentPage){
 if(!entries?.[index])return;
 viewerEntries=entries.slice();viewerIndex=index;viewerPage=currentPage;
 renderArtwork();$('#artworkDialog').showModal();
}
async function moveArtwork(direction){
 if(viewerBusy||viewerIndex<0)return;
 const next=viewerIndex+direction;
 if(next>=0&&next<viewerEntries.length){viewerIndex=next;renderArtwork();return}
 const targetPage=viewerPage+direction;
 if(targetPage<1||targetPage>pages)return;
 viewerBusy=true;renderArtwork();
 try{
  const qs=new URLSearchParams({page:targetPage,sort:$('#gallerySort').value,q:$('#gallerySearch').value.trim(),visitorId:visitorId()});
  const r=await fetch('/api/public/entries?'+qs),d=await r.json();
  if(!r.ok)throw Error(d.error||'Could not load the next design.');
  viewerEntries=d.entries||[];viewerPage=targetPage;viewerIndex=direction>0?0:viewerEntries.length-1;
 }catch(e){alert(e.message)}
 finally{viewerBusy=false;renderArtwork()}
}
$('#dialogClose').onclick=()=>$('#artworkDialog').close();
$('#artworkPrev').onclick=()=>moveArtwork(-1);
$('#artworkNext').onclick=()=>moveArtwork(1);
document.addEventListener('keydown',e=>{if(!$('#artworkDialog').open)return;if(e.key==='ArrowLeft'){e.preventDefault();moveArtwork(-1)}else if(e.key==='ArrowRight'){e.preventDefault();moveArtwork(1)}});
$('#artworkDialog').addEventListener('click',e=>{if(e.target===$('#artworkDialog'))$('#artworkDialog').close()});
$('#gallerySearch').oninput=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{page=1;load()},250)};
$('#gallerySort').onchange=()=>{page=1;load()};
$('#prevPage').onclick=()=>{if(page>1){page--;load()}};
$('#nextPage').onclick=()=>{if(page<pages){page++;load()}};
$('#menuToggle').onclick=()=>$('#mainNav').classList.toggle('open');
load();
