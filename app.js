(() => {
  'use strict';
  const projects = window.MADENET_PROJECTS || [];
  const newPrintRange = {
    learning: [
      ['assets/mockup-numbers-range.png', 'An educational numbers chart from the Madenet print concept range'],
      ['assets/mockup-docs-range.png', 'A practical lesson-plan page from the Madenet print concept range'],
      ['assets/mockup-sign-range.png', 'A readable learning-area sign from the Madenet print concept range']
    ],
    celebration: [
      ['assets/mockup-business-range.png', 'Business cards, flyers and stickers presented as a coordinated print range']
    ]
  };
  Object.entries(newPrintRange).forEach(([id, images]) => {
    const project = projects.find(item => item.id === id);
    if (!project) return;
    images.forEach(image => {
      if (!project.images.some(existing => existing[0] === image[0])) project.images.push(image);
    });
  });
  const $ = (s, scope = document) => scope.querySelector(s);
  const $$ = (s, scope = document) => [...scope.querySelectorAll(s)];
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const arrowIcon = (direction = '') => `<span class="arrow-icon${direction ? ` arrow-icon-${direction}` : ''}" aria-hidden="true"></span>`;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine) and (hover: hover)');
  let motionPaused = false;
  try { motionPaused = localStorage.getItem('madenet-motion') === 'paused'; } catch {}
  const motionAllowed = () => !reduced.matches && !motionPaused;
  const grid = $('#project-grid');
  const cursor = $('.cursor');
  let activeProject = 0, activeImage = 0, opener = null, filter = 'all';
  const projectDialog = $('#project-dialog'), briefDialog = $('#brief-dialog');

  grid.innerHTML = projects.map((p, i) => `<article class="project project-${p.id} reveal" data-category="${p.category}" style="--project-color:${p.color}">
    <button class="project-button" data-project="${p.id}" data-cursor="View work" aria-label="Explore ${escape(p.title)}">
      <div class="cover"><img src="${p.cover}" alt="${escape(p.coverAlt)}" loading="lazy" width="1600" height="1200"><span class="cover-label">${escape(p.label.toUpperCase())}</span><span class="cover-title">${escape(p.line)}</span><span class="open-icon">${arrowIcon()}</span></div>
      <div class="project-caption"><div><h3>${escape(p.title)}</h3><p>${escape(p.label)}</p></div></div>
    </button></article>`).join('');

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

  function renderCase() {
    const p = projects[activeProject], next = projects[(activeProject + 1) % projects.length];
    $('#case-content').innerHTML = `<div class="case-header"><span class="eyebrow">${escape(p.label.toUpperCase())}</span><h2 id="case-title">${escape(p.title)}</h2><p>${escape(p.intro)}</p><div class="case-tags">${p.tags.map(tag => `<span>${escape(tag)}</span>`).join('')}</div></div>
      <figure class="gallery"><div class="gallery-stage" style="--gallery-color:${p.color}" tabindex="0" aria-label="Work image gallery. Use left and right arrow keys to browse."><img id="gallery-image" src="${p.images[activeImage][0]}" alt="${escape(p.images[activeImage][1])}"></div><figcaption class="gallery-caption"><p id="gallery-caption" aria-live="polite">${escape(p.images[activeImage][1])}</p><div class="gallery-controls"><button id="gallery-prev" aria-label="Previous image">${arrowIcon('left')}</button><span class="gallery-count" id="gallery-count"></span><button id="gallery-next" aria-label="Next image">${arrowIcon('right')}</button></div></figcaption><div class="gallery-thumbs" role="group" aria-label="Choose a work image">${p.images.map((im,i) => `<button class="gallery-thumb" data-image="${i}" aria-pressed="${i===activeImage}" aria-label="Show image ${i+1}: ${escape(im[1])}"><img src="${im[0]}" alt="" loading="lazy"></button>`).join('')}</div></figure>
      <div class="case-story"><div><h3>The direction</h3><p>${escape(p.brief)}</p></div><div><h3>The design response</h3><p>${escape(p.work)}</p></div><div class="case-detail"><h3>Portfolio note</h3><p>${escape(p.detail)}</p></div></div>
      <button class="case-next" id="next-project"><div><span>NEXT WORK CHAPTER</span><strong>${escape(next.title)}</strong></div>${arrowIcon()}</button>`;
    $('#gallery-prev').addEventListener('click', () => setImage(activeImage - 1));
    $('#gallery-next').addEventListener('click', () => setImage(activeImage + 1));
    $$('.gallery-thumb').forEach(button => button.addEventListener('click', () => setImage(Number(button.dataset.image))));
    const stage = $('.gallery-stage');
    stage.addEventListener('keydown', e => { if (e.key==='ArrowRight'||e.key==='ArrowLeft') {e.preventDefault();setImage(activeImage+(e.key==='ArrowRight'?1:-1));} });
    let touchX = null;
    stage.addEventListener('touchstart', e => { touchX=e.touches[0].clientX; }, {passive:true});
    stage.addEventListener('touchend', e => { if(touchX!==null){const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>45)setImage(activeImage+(dx<0?1:-1));}touchX=null; }, {passive:true});
    $('#next-project').addEventListener('click', () => {activeProject=(activeProject+1)%projects.length;activeImage=0;renderCase();projectDialog.scrollTop=0;$('.close-button',projectDialog).focus({preventScroll:true});});
    updateGalleryControls();
  }
  function updateGalleryControls() {
    const count=projects[activeProject].images.length;
    $('#gallery-prev').disabled=activeImage===0;
    $('#gallery-next').disabled=activeImage===count-1;
    $('#gallery-count').textContent=`${activeImage+1} / ${count}`;
    $$('.gallery-thumb').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===activeImage)));
  }
  function setImage(index) {
    const p=projects[activeProject];
    if(index<0||index>=p.images.length||index===activeImage)return;
    activeImage=index;
    const img=$('#gallery-image');
    img.src=p.images[index][0];img.alt=p.images[index][1];
    $('#gallery-caption').textContent=p.images[index][1];
    if(motionAllowed())img.animate([{opacity:.25},{opacity:1}],{duration:350});
    updateGalleryControls();
  }
  $$('[data-project]').forEach(button=>button.addEventListener('click',()=>{
    activeProject=projects.findIndex(p=>p.id===button.dataset.project);
    if(activeProject<0)return;
    activeImage=0;renderCase();openDialog(projectDialog,button);projectDialog.scrollTop=0;
  }));

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
  $$('.project-button').forEach(button=>{
    const cover=$('.cover',button);
    button.addEventListener('pointermove',e=>{if(!motionAllowed()||!fine.matches||e.pointerType==='touch')return;const r=cover.getBoundingClientRect();cover.style.setProperty('--ry',`${((e.clientX-r.left)/r.width-.5)*5}deg`);cover.style.setProperty('--rx',`${-((e.clientY-r.top)/r.height-.5)*5}deg`);},{passive:true});
    button.addEventListener('pointerleave',()=>{cover.style.setProperty('--rx','0deg');cover.style.setProperty('--ry','0deg');});
  });
  $$('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{if(!motionAllowed()||!fine.matches||e.pointerType==='touch')return;const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.12}px)`;},{passive:true});
    el.addEventListener('pointerleave',()=>el.style.removeProperty('transform'));
  });
  let scrollQueued=false;
  const sections=['work','services','clients','studio','contact'].map(id=>document.getElementById(id));
  function updateScroll(){scrollQueued=false;const max=document.documentElement.scrollHeight-innerHeight;$('.scroll-progress').style.transform=`scaleX(${max?scrollY/max:0})`;document.body.classList.toggle('scrolled',scrollY>30);let current='';sections.forEach(s=>{if(s.getBoundingClientRect().top<180)current=s.id;});$$('#navigation a').forEach(a=>{if(a.hash==='#'+current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
  window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll);}},{passive:true});updateScroll();
})();
