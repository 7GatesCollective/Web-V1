'use strict';
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('header');
  const toggle = document.getElementById('menuToggle');
  const links = document.getElementById('navLinks');
  const setMenu = open => {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {setMenu(false);toggle.focus();}
  });
  links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', event => {if (!header.contains(event.target)) setMenu(false);});
  matchMedia('(max-width:680px)').addEventListener('change', () => setMenu(false));
  header.classList.add('menu-ready');
  document.getElementById('year').textContent = new Date().getFullYear();

  // Animate only on entry; the underlying content never depends on an animation class.
  const animations = new Set();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (motion.matches || !entry.target.animate) return;
      const animation = entry.target.animate([
        {opacity:.65, transform:'perspective(1100px) translateY(14px) rotateX(2deg)'},
        {opacity:1, transform:'perspective(1100px) translateY(0) rotateX(0deg)'}
      ], {duration:650,easing:'cubic-bezier(.2,.65,.3,1)'});
      animations.add(animation);animation.onfinish = () => animations.delete(animation);
    }), {threshold:.12});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
  const cards = document.querySelectorAll('.service-card');
  cards.forEach(card => {
    card.addEventListener('pointermove', event => {
      if (motion.matches || !finePointer.matches) return;
      const r = card.getBoundingClientRect();
      const x = (event.clientX-r.left)/r.width-.5;
      const y = (event.clientY-r.top)/r.height-.5;
      card.style.transform = `perspective(1000px) rotateX(${-y*4}deg) rotateY(${x*4}deg) translateY(-2px)`;
    });
    card.addEventListener('pointerleave', () => card.style.removeProperty('transform'));
  });
  motion.addEventListener('change', () => {
    if(motion.matches) {animations.forEach(a=>a.cancel());animations.clear();cards.forEach(c=>c.style.removeProperty('transform'));}
  });

  const carousel = document.getElementById('missionCarousel');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.mission-slide')];
  const controls = document.getElementById('missionDots');
  let current = 0, timer, paused = false;
  const dots = slides.map((slide, i) => {
    const dot = document.createElement('button');dot.type='button';dot.className='mission-dot';
    dot.setAttribute('aria-label', `Show slide ${i+1}`);dot.setAttribute('aria-controls', slide.id);
    dot.addEventListener('click', () => {show(i);schedule();});controls.append(dot);return dot;
  });
  const pause = document.createElement('button');pause.type='button';pause.className='carousel-pause';
  pause.addEventListener('click', () => {paused=!paused;schedule();});controls.append(pause);
  function show(i) {
    current=i;
    slides.forEach((slide,j) => {slide.classList.toggle('active',i===j);slide.classList.toggle('slide-prev',j===(i+slides.length-1)%slides.length);slide.classList.toggle('slide-next',j===(i+1)%slides.length);slide.setAttribute('aria-hidden',String(i!==j));dots[j].classList.toggle('active',i===j);dots[j].setAttribute('aria-current',String(i===j));});
  }
  function schedule() {
    clearInterval(timer);
    pause.textContent=paused?'Play slideshow':'Pause slideshow';pause.setAttribute('aria-pressed',String(paused));pause.hidden=motion.matches;
    if (!motion.matches && !paused && !document.hidden && !carousel.matches(':hover') && !carousel.contains(document.activeElement)) timer=setInterval(()=>show((current+1)%slides.length),5000);
  }
  carousel.addEventListener('mouseenter',schedule);carousel.addEventListener('mouseleave',schedule);
  carousel.addEventListener('focusin',schedule);carousel.addEventListener('focusout',()=>setTimeout(schedule,0));
  document.addEventListener('visibilitychange',schedule);motion.addEventListener('change',schedule);
  show(0);controls.hidden=false;schedule();
})();
