(function(){
'use strict';
const BOOKING='https://gm.grovmedia.com/widget/bookings/growthopportunitygrov';
const sessionKey='grovRevenueLeakShown';
const modalHTML=`<div class="grov-calc-overlay" id="grovCalcOverlay" aria-hidden="true"><div class="grov-calc-modal" role="dialog" aria-modal="true" aria-labelledby="grovCalcTitle"><button class="grov-calc-close" type="button" aria-label="Close revenue leak calculator">×</button><div class="grov-calc-head"><div class="grov-calc-kicker">Before you go</div><h2 id="grovCalcTitle">See where your growth is <em>leaking.</em></h2><p>A few numbers can show you where revenue may be getting lost between traffic, leads and closed clients. Use your current monthly numbers — the result is an estimate, not a forecast.</p></div><div class="grov-calc-body"><form class="grov-calc-form" id="grovCalcForm"><div class="grov-calc-field"><label for="gTraffic">Monthly traffic</label><input id="gTraffic" type="number" min="0" step="1" value="1000" required></div><div class="grov-calc-field"><label for="gLead">Lead conversion %</label><input id="gLead" type="number" min="0" max="100" step="0.1" value="3" required></div><div class="grov-calc-field"><label for="gQual">Qualification %</label><input id="gQual" type="number" min="0" max="100" step="0.1" value="40" required></div><div class="grov-calc-field"><label for="gBook">Sales booking %</label><input id="gBook" type="number" min="0" max="100" step="0.1" value="60" required></div><div class="grov-calc-field"><label for="gShow">Show-up %</label><input id="gShow" type="number" min="0" max="100" step="0.1" value="75" required></div><div class="grov-calc-field"><label for="gClose">Close rate %</label><input id="gClose" type="number" min="0" max="100" step="0.1" value="25" required></div><div class="grov-calc-field full"><label for="gAcv">Average client value ($)</label><input id="gAcv" type="number" min="0" step="1" value="3000" required></div><div class="grov-calc-actions full"><div class="grov-calc-note">The scenario below applies a 25% relative improvement to the weakest conversion step so you can see the size of the opportunity.</div><button class="btn btn-gold" type="submit">Calculate My Revenue Leak →</button></div></form><div class="grov-calc-result" id="grovCalcResult"></div></div></div></div>`;
function money(n){return '$'+Math.round(n).toLocaleString('en-US');} function pct(v){return Math.max(0,Math.min(100,Number(v)||0))/100;} function get(id){return document.getElementById(id);}
function calculate(){
 const traffic=Math.max(0,Number(get('gTraffic').value)||0),lead=pct(get('gLead').value),qual=pct(get('gQual').value),book=pct(get('gBook').value),show=pct(get('gShow').value),close=pct(get('gClose').value),acv=Math.max(0,Number(get('gAcv').value)||0);
 const rates=[['Lead conversion',lead,'lead'],['Qualification',qual,'qual'],['Sales booking',book,'book'],['Show-up',show,'show'],['Close rate',close,'close']]; const weakest=rates.reduce((a,b)=>b[1]<a[1]?b:a); const current=traffic*lead*qual*book*show*close*acv; const improved={lead,qual,book,show,close}; improved[weakest[2]]=Math.min(.95,weakest[1]*1.25); const potential=traffic*improved.lead*improved.qual*improved.book*improved.show*improved.close*acv; const gap=Math.max(0,potential-current); const from=(weakest[1]*100).toFixed(1).replace('.0',''),to=(improved[weakest[2]]*100).toFixed(1).replace('.0','');
 const result=get('grovCalcResult'); result.innerHTML=`<div class="grov-calc-kicker">Your revenue path</div><h3>Your current path is estimated at ${money(current)}/month.</h3><p>Your weakest conversion step is <strong style="color:#fff">${weakest[0]}</strong>. In the illustrative 25% relative-improvement scenario, that step moves from ${from}% to ${to}%.</p><div class="grov-result-metrics"><div class="grov-result-metric"><span>Current revenue</span><strong>${money(current)}</strong></div><div class="grov-result-metric"><span>Scenario revenue</span><strong>${money(potential)}</strong></div><div class="grov-result-metric"><span>Revenue opportunity</span><strong>${money(gap)}</strong></div></div><p>Want to understand what is actually causing the leak — and what should be built around it?</p><div class="grov-result-cta"><a class="btn btn-gold" href="${BOOKING}" target="_blank" rel="noopener">Book Your Free Growth Diagnosis →</a><button class="btn btn-outline grov-calc-again" type="button">Run It Again</button></div>`; result.classList.add('is-visible'); result.querySelector('.grov-calc-again').addEventListener('click',()=>{result.classList.remove('is-visible');get('gTraffic').focus();});
}
function openCalc(mark){const o=get('grovCalcOverlay');if(!o)return;o.classList.add('is-open');o.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';if(mark)sessionStorage.setItem(sessionKey,'1');setTimeout(()=>get('gTraffic')?.focus(),50);}
function closeCalc(){const o=get('grovCalcOverlay');if(!o)return;o.classList.remove('is-open');o.setAttribute('aria-hidden','true');document.body.style.overflow='';}
document.addEventListener('DOMContentLoaded',()=>{
 document.body.insertAdjacentHTML('beforeend',modalHTML); get('grovCalcForm').addEventListener('submit',e=>{e.preventDefault();calculate();}); get('grovCalcOverlay').addEventListener('click',e=>{if(e.target.id==='grovCalcOverlay')closeCalc();}); get('grovCalcOverlay').querySelector('.grov-calc-close').addEventListener('click',closeCalc); document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCalc();});
 document.querySelectorAll('a[href="revenue-calculator.html"]').forEach(a=>{a.addEventListener('click',e=>{e.preventDefault();openCalc(true);});a.classList.add('grov-calc-trigger');}); document.querySelectorAll('[data-open-revenue-calculator]').forEach(el=>el.addEventListener('click',()=>openCalc(true)));
 let armed=false;setTimeout(()=>armed=true,2500);document.addEventListener('mouseout',e=>{if(!armed||e.relatedTarget||e.clientY>8||sessionStorage.getItem(sessionKey))return;openCalc(true);});
 if(window.matchMedia('(max-width:760px)').matches&&!sessionStorage.getItem(sessionKey))setTimeout(()=>openCalc(true),30000);
});
})();


// Universal mobile navigation for pages that load calc.js.
// The homepage has the same handler in script.js; this keeps internal pages consistent.
document.addEventListener('DOMContentLoaded',()=>{
  const header=document.querySelector('.site-header');
  const nav=header?.querySelector('.desktop-nav');
  const btn=header?.querySelector('.menu-btn');
  if(!header||!nav||!btn||btn.dataset.menuBound==='1') return;
  btn.dataset.menuBound='1';
  btn.setAttribute('aria-expanded','false');
  btn.addEventListener('click',()=>{
    const open=header.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded',String(open));
    btn.setAttribute('aria-label',open?'Close menu':'Open menu');
    btn.textContent=open?'×':'☰';
  });
  nav.addEventListener('click',e=>{
    const link=e.target.closest('a');
    if(!link) return;
    header.classList.remove('menu-open');
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-label','Open menu');
    btn.textContent='☰';
  });
});
