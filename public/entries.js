const $=s=>document.querySelector(s);
let page=1,pages=1,searchTimer;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function visitorId(){let id=localStorage.getItem('mka50_visitor_id');if(!id){id=crypto.randomUUID();localStorage.setItem('mka50_visitor_id',id)}return id}
function stars(score){
  const value=Math.max(0,Math.min(5,Number(score||0)/20));
  return `<span class="rating-stars" role="img" aria-label="${value?`${value.toFixed(1)} out of 5 stars`:'Not yet rated'}">${[1,2,3,4,5].map(n=>{const fill=Math.max(0,Math.min(1,value-(n-1)))*100;return `<span class="rating-star" aria-hidden="true"><span style="width:${fill}%">★</span>☆</span>`}).join('')}</span>`;
}
async function load(){
 const grid=$('#galleryGrid');grid.innerHTML='<p class="gallery-empty">Loading entries…</p>';
 const qs=new URLSearchParams({page,sort:$('#gallerySort').value,q:$('#gallerySearch').value.trim()});
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
    <div class="gallery-card-rating">${stars(x.average_score)}<small>${Number(x.judge_count||0)} ${Number(x.judge_count||0)===1?'review':'reviews'}</small></div>
    <div class="gallery-card-foot"><small>Submitted ${new Date(x.created_at.includes('Z')?x.created_at:x.created_at+'Z').toLocaleDateString()}</small><button class="like-button" data-id="${esc(x.id)}" aria-label="Like entry by ${esc(x.full_name)}">♡ <span>${x.like_count}</span> Like</button></div>
   </div></article>`).join('');
  grid.querySelectorAll('.like-button').forEach(b=>b.onclick=()=>like(b));
  grid.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openArtwork(d.entries.find(x=>x.id===b.dataset.open)));
 }catch(e){grid.innerHTML=`<p class="gallery-empty">${esc(e.message)}</p>`}
}
async function like(b){
 if(b.disabled)return;b.disabled=true;
 try{const r=await fetch(`/api/public/entries/${encodeURIComponent(b.dataset.id)}/like`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({visitorId:visitorId()})}),d=await r.json();if(!r.ok)throw Error(d.error||'Like could not be recorded.');b.innerHTML=`${d.liked?'♥':'♡'} <span>${d.likes}</span> ${d.liked?'Liked':'Already liked'}`;if(d.liked)b.classList.add('liked')}
 catch(e){b.title=e.message;b.disabled=false;alert(e.message)}
}
function openArtwork(x){
 if(!x)return;
 $('#dialogImage').src=`/api/public/entry-file/${encodeURIComponent(x.id)}`;
 $('#dialogImage').alt=`Artwork submitted by ${x.full_name}`;
 $('#dialogTitle').textContent=x.title;
 $('#dialogRationale').textContent=x.rationale;
 $('#dialogReference').textContent=`${x.reference_code} · Submitted by ${x.full_name}`;
 $('#dialogRating').innerHTML=`${stars(x.average_score)} <span>${Number(x.judge_count||0)} ${Number(x.judge_count||0)===1?'review':'reviews'}</span>`;
 $('#artworkDialog').showModal();
}
$('#dialogClose').onclick=()=>$('#artworkDialog').close();
$('#artworkDialog').addEventListener('click',e=>{if(e.target===$('#artworkDialog'))$('#artworkDialog').close()});
$('#gallerySearch').oninput=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{page=1;load()},250)};
$('#gallerySort').onchange=()=>{page=1;load()};
$('#prevPage').onclick=()=>{if(page>1){page--;load()}};
$('#nextPage').onclick=()=>{if(page<pages){page++;load()}};
$('#menuToggle').onclick=()=>$('#mainNav').classList.toggle('open');
load();
