document.addEventListener('DOMContentLoaded',()=>{
  const header=document.querySelector('.site-header');
  const nav=header?.querySelector('.desktop-nav');
  const btn=header?.querySelector('.menu-btn');
  if(!header||!nav||!btn) return;
  btn.setAttribute('aria-expanded','false');
  btn.addEventListener('click',()=>{
    const open=header.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded',String(open));
    btn.setAttribute('aria-label',open?'Close menu':'Open menu');
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    header.classList.remove('menu-open');
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-label','Open menu');
  }));
});
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}});
},{threshold:.12});
document.querySelectorAll('section').forEach(s=>observer.observe(s));


// Unified calculated-number reveal. Supports prefixes/suffixes and runs once per metric.
(function(){
  const els=[...document.querySelectorAll('.countup[data-target]')];
  if(!els.length) return;
  const format=n=>n.toLocaleString('en-US');
  const animate=el=>{
    if(el.dataset.done==='1') return;
    el.dataset.done='1';
    const target=Number(el.dataset.target||0);
    const prefix=el.dataset.prefix||'';
    const suffix=el.dataset.suffix||'';
    const duration=1600;
    const start=performance.now();
    function tick(now){
      const p=Math.min((now-start)/duration,1);
      const eased=1-Math.pow(1-p,3);
      el.textContent=prefix+format(Math.floor(target*eased))+suffix;
      if(p<1) requestAnimationFrame(tick);
      else el.textContent=prefix+format(target)+suffix;
    }
    requestAnimationFrame(tick);
  };
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){animate(entry.target);io.unobserve(entry.target);}});
    },{threshold:.3});
    els.forEach(el=>io.observe(el));
  }else els.forEach(animate);
})();
