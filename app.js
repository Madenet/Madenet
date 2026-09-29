(() => {
  'use strict';
  const projects = window.MADENET_PROJECTS || [];
  const $ = (s, scope = document) => scope.querySelector(s);
  const $$ = (s, scope = document) => [...scope.querySelectorAll(s)];
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine) and (hover: hover)');
  let motionPaused = false;
  try { motionPaused = localStorage.getItem('madenet-motion') === 'paused'; } catch {}
  const motionAllowed = () => !reduced.matches && !motionPaused;
  const grid = $('#project-grid');
  const cursor = $('.cursor');
  let opener = null, filter = 'all';
  const briefDialog = $('#brief-dialog');

  const schoolLogos = $('.school-logo-grid');
  if (schoolLogos) {
    const repeatedLogos = schoolLogos.cloneNode(true);
    repeatedLogos.removeAttribute('aria-label');
    repeatedLogos.setAttribute('aria-hidden', 'true');
    $('.school-carousel-track').append(repeatedLogos);
  }

  grid.innerHTML = projects.map((p, i) => `<article class="project project-${p.id} reveal" data-category="${p.category}" style="--project-color:${p.color}">
    <div class="project-preview">
      <div class="cover">
        <img src="${p.cover}" alt="${escape(p.coverAlt)}" loading="lazy" width="1600" height="1200">
        <p class="work-card-label">${escape(p.label)}</p>
        <div class="work-card-copy"><h3>${escape(p.title)}</h3><p>${escape(p.line)}</p></div>
      </div>
    </div></article>`).join('');

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.remove('pending'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  $$('.reveal').forEach(el => {
    if (motionAllowed() && el.getBoundingClientRect().top > innerHeight - 30) el.classList.add('pending');
    observer.observe(el);
  });
  function applyMotion() {
    const enabled = motionAllowed();
    document.body.classList.toggle('motion-enabled', enabled);
    document.documentElement.classList.toggle('motion-off', !enabled);
    document.body.classList.toggle('custom-cursor', enabled && fine.matches);
    const toggle = $('#motion-toggle');
    toggle.textContent = reduced.matches ? 'Reduced motion' : (motionPaused ? 'Resume motion' : 'Pause motion');
    toggle.setAttribute('aria-pressed', String(!enabled));
    toggle.disabled = reduced.matches;
    if (!enabled) {
      $$('.reveal').forEach(el => el.classList.remove('pending'));
      $$('.cover').forEach(el => { el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); });
      $$('.magnetic').forEach(el => el.style.removeProperty('transform'));
    }
  }
  applyMotion();
  reduced.addEventListener('change', applyMotion);
  fine.addEventListener('change', applyMotion);
  $('#motion-toggle').addEventListener('click', () => {
    motionPaused = !motionPaused;
    try { localStorage.setItem('madenet-motion', motionPaused ? 'paused' : 'playing'); } catch {}
    applyMotion();
  });

  $$('.filter').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    $$('.filter').forEach(b => { const selected = b === button; b.classList.toggle('active', selected); b.setAttribute('aria-pressed', String(selected)); });
    $$('.project').forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
      if (!card.hidden) card.classList.remove('pending');
    });
    if (motionAllowed()) grid.animate([{opacity:.25,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}], {duration:400,easing:'ease-out'});
  }));
  function openDialog(dialog, trigger) {
    opener = trigger || document.activeElement;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
    cursor.style.opacity = '0';
    $('.close-button', dialog).focus({preventScroll:true});
  }
  function closeDialog(dialog) { dialog.close(); }
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      opener?.focus({preventScroll:true});
      cursor.style.opacity = '0';
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(dialog);
    });
  });
  $$('[data-close]').forEach(b => b.addEventListener('click', () => closeDialog(document.getElementById(b.dataset.close))));


  $$('.client-folder').forEach(folder => folder.addEventListener('toggle', () => {
    const summary = $('summary', folder);
    summary.dataset.cursor = folder.open ? 'Close folder' : 'Open folder';
    if (!folder.open) return;
    $$('.client-folder').forEach(other => { if (other !== folder) other.open = false; });
  }));

  $$('.brand-card').forEach(card => card.addEventListener('toggle', () => {
    if (!card.open) return;
    $$('.brand-card').forEach(other => { if (other !== card) other.open = false; });
  }));

  $$('.service-list details').forEach(service => service.addEventListener('toggle', () => {
    if (!service.open) return;
    $$('.service-list details').forEach(other => { if (other !== service) other.open = false; });
  }));

  function showBrief(trigger,service) {
    if(service)$$('input[name="service"]',briefDialog).forEach(input=>input.checked=input.value===service);
    openDialog(briefDialog,trigger);
  }
  $$('[data-brief]').forEach(b=>b.addEventListener('click',()=>showBrief(b)));
  $$('[data-service]').forEach(b=>b.addEventListener('click',()=>showBrief(b,b.dataset.service)));
  const menu=$('.menu-toggle');
  const setMenu=open=>{menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');$('#navigation').classList.toggle('is-open',open);};
  menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
  $$('#navigation a, #navigation button').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#navigation').classList.contains('is-open')){setMenu(false);menu.focus();}});

  function briefText() {
    const services=$$('input[name="service"]:checked',briefDialog).map(i=>i.value);
    return `Hello Madenet,\n\nI would like to discuss a project.\n\nServices: ${services.length?services.join(', '):'Let’s discuss'}\n\nMy idea:\n${$('#brief-description').value.trim()||'I would like help shaping the brief.'}\n\nTiming: ${$('#brief-timing').value.trim()||'To be discussed'}\n\nThank you.`;
  }
  async function copyText(text,status) {
    try { await navigator.clipboard.writeText(text);status.textContent='Copied to clipboard.';return true; }
    catch { status.textContent='Copy is unavailable in this browser. You can select and copy the text below.';let box=$('.copy-fallback',status.parentElement);if(!box){box=document.createElement('textarea');box.className='copy-fallback';box.setAttribute('aria-label','Text to copy');box.style.width='100%';status.after(box);}box.value=text;box.focus();box.select();return false; }
  }
  $('#copy-brief').addEventListener('click',()=>copyText(briefText(),$('#brief-status')));
  $('.copy-email').addEventListener('click',async()=>{const button=$('.copy-email');if(await copyText('madenet@proton.me',$('#email-status'))){button.textContent='Email copied';setTimeout(()=>button.textContent='Copy email',2500);}});
  $('#brief-form').addEventListener('submit',e=>{
    e.preventDefault();
    const href=`mailto:madenet@proton.me?subject=${encodeURIComponent('A new project for Madenet')}&body=${encodeURIComponent(briefText())}`;
    window.location.href=href;
    $('#brief-status').textContent='Your email draft is ready to open. If no email app opens, use Copy brief and email madenet@proton.me.';
  });

  // Follow the pointer only while it is moving. No permanent animation loop.
  let cx=-100,cy=-100,tx=-100,ty=-100,raf=0;
  function followCursor(){cx+=(tx-cx)*.4;cy+=(ty-cy)*.4;cursor.style.transform=`translate3d(${cx}px,${cy}px,0) translate(-50%,-50%)`;if(Math.abs(cx-tx)+Math.abs(cy-ty)>.15)raf=requestAnimationFrame(followCursor);else raf=0;}
  document.addEventListener('pointermove',e=>{
    if(!motionAllowed()||!fine.matches||e.pointerType==='touch')return;
    tx=e.clientX;ty=e.clientY;cursor.style.opacity='1';
    const target=e.target.closest('[data-cursor],a,button,summary,input,textarea');
    const label=target?.dataset.cursor||'';
    cursor.classList.toggle('has-label',!!label);cursor.classList.toggle('link-hover',!!target);
    $('span',cursor).textContent=label;
    if(target?.matches('input,textarea'))cursor.style.opacity='0';
    if(!raf)raf=requestAnimationFrame(followCursor);
  },{passive:true});
  document.addEventListener('pointerleave',()=>cursor.style.opacity='0');
  window.addEventListener('blur',()=>cursor.style.opacity='0');
  $$('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{if(!motionAllowed()||!fine.matches||e.pointerType==='touch')return;const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.12}px)`;},{passive:true});
    el.addEventListener('pointerleave',()=>el.style.removeProperty('transform'));
  });
  let scrollQueued=false;
  const sections=['work','services','clients','studio','contact'].map(id=>document.getElementById(id));
  function updateScroll(){scrollQueued=false;const max=document.documentElement.scrollHeight-innerHeight;$('.scroll-progress').style.transform=`scaleX(${max?scrollY/max:0})`;document.body.classList.toggle('scrolled',scrollY>30);let current='';sections.forEach(s=>{if(s.getBoundingClientRect().top<180)current=s.id;});$$('#navigation a').forEach(a=>{if(a.hash==='#'+current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
  window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll);}},{passive:true});updateScroll();
})();
