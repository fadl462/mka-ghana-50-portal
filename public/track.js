const $=s=>document.querySelector(s);
$('#menuToggle').onclick=()=>$('#mainNav').classList.toggle('open');
$('#trackForm').onsubmit=async e=>{
 e.preventDefault();const b=$('#trackButton'),o=$('#trackResult');b.disabled=true;b.textContent='Checking your entry…';o.classList.remove('error');o.textContent='';
 try{
 const d=Object.fromEntries(new FormData(e.currentTarget)),r=await fetch('/api/track',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)}),x=await r.json();
 if(!r.ok)throw Error(x.error||'Unable to find that entry.');
 const labels={received:'Received',under_review:'Under review',shortlisted:'Shortlisted',not_shortlisted:'Not shortlisted',withdrawn:'Withdrawn'};
 const submitted=new Date(x.submittedAt.replace(' ','T')+'Z');
 const date=Number.isNaN(submitted.getTime())?x.submittedAt:submitted.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
 const feedback=x.feedback||[];const feedbackHtml=feedback.length?`<section class="contestant-feedback-list"><h3>Feedback from the judging panel</h3><p class="feedback-intro">The following comments have been shared with you by the competition's reviewers.</p>${feedback.map((f,i)=>`<article class="contestant-feedback-item"><div class="feedback-item-head"><b>Reviewer's feedback ${feedback.length>1?i+1:''}</b><small>${esc(f.created_at||'')}</small></div><p>${esc(f.message)}</p></article>`).join('')}</section>`:'<section class="contestant-feedback-empty"><b>No feedback shared yet</b><p>If the judging panel shares feedback on your entry, it will appear here.</p></section>';
o.innerHTML=`<div class="status-result"><span class="status-chip">${esc(labels[x.status]||x.status.replaceAll('_',' '))}</span><p><b>${esc(x.title)}</b><br><span class="track-detail-label">Reference</span> ${esc(x.reference)}<br><span class="track-detail-label">Submitted</span> ${esc(date)}</p>${feedbackHtml}</div>`;
 }catch(x){o.textContent=x.message;o.classList.add('error')}
 finally{b.disabled=false;b.innerHTML='Check my entry <span></span>'}
};
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
