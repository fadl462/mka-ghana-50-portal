const $=s=>document.querySelector(s);
$('#menuToggle').onclick=()=>$('#mainNav').classList.toggle('open');
$('#trackForm').onsubmit=async e=>{
 e.preventDefault();const b=$('#trackButton'),o=$('#trackResult');b.disabled=true;b.textContent='Checking your entry…';o.classList.remove('error');o.textContent='';
 try{
  const d=Object.fromEntries(new FormData(e.currentTarget)),r=await fetch('/api/track',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)}),x=await r.json();
  if(!r.ok)throw Error(x.error||'Unable to find that entry.');
  const token=localStorage.getItem('mka50_owner_'+x.reference);
  const labels={received:'Received',under_review:'Under review',shortlisted:'Shortlisted',not_shortlisted:'Not shortlisted',withdrawn:'Withdrawn'};
  const submitted=new Date(x.submittedAt.replace(' ','T')+'Z');
  const date=Number.isNaN(submitted.getTime())?x.submittedAt:submitted.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
  o.innerHTML=`<div class="status-result"><span class="status-chip">${esc(labels[x.status]||x.status.replaceAll('_',' '))}</span><p><b>${esc(x.title)}</b><br><span class="track-detail-label">Reference</span> ${esc(x.reference)}<br><span class="track-detail-label">Submitted</span> ${esc(date)}</p>${x.status==='withdrawn'?'<p>This entry has been withdrawn and is no longer visible in the public gallery.</p>':token?'<div class="withdraw-panel"><b>Manage this submission</b><p>You can withdraw this entry from the original browser used to submit it.</p><button type="button" class="withdraw-button" id="withdrawEntry">Withdraw this submission</button></div>':'<p class="owner-note">This entry can be tracked here. To withdraw it, use the original browser/device where you submitted it. The reference number and email address are not sufficient to authorise withdrawal.</p>'}</div>`;
  const w=$('#withdrawEntry');if(w)w.onclick=()=>withdraw(token,w)
 }catch(x){o.textContent=x.message;o.classList.add('error')}
 finally{b.disabled=false;b.innerHTML='Check my entry <span>→</span>'}
};
async function withdraw(token,b){
 if(!confirm('Withdraw this submission? It will immediately disappear from the public gallery and cannot receive further likes. This action cannot be reversed.'))return;
 b.disabled=true;b.textContent='Withdrawing…';
 try{const r=await fetch('/api/submission/withdraw',{method:'POST',headers:{authorization:'Bearer '+token}}),d=await r.json();if(!r.ok)throw Error(d.error||'Unable to withdraw entry.');oReplace(b)}
 catch(e){alert(e.message);b.disabled=false;b.textContent='Withdraw this submission'}
}
function oReplace(b){b.parentElement.innerHTML='<p><b>Submission withdrawn.</b><br>This entry is no longer public. Its record remains with the competition administrators for audit purposes.</p>'}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
