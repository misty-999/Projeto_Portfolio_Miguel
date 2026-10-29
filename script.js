'use strict';
const toggle = document.querySelector('.menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
let menuOpen = false;
let menuAnimation;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const background = [document.querySelector('main'), document.querySelector('footer'), document.querySelector('.desktop-nav'), document.querySelector('.header-contact'), document.querySelector('.logo')];
function setMenu(open, restoreFocus = true) {
  menuOpen = open;
  if (menuAnimation) menuAnimation.cancel();
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  document.body.classList.toggle('locked', open);
  background.forEach(element => { if (element) element.inert = open; });
  if (open) {
    mobileMenu.hidden = false;
    if (!reducedMotion.matches) {
      menuAnimation = mobileMenu.animate([{opacity:0,transform:'translateY(-16px)'},{opacity:1,transform:'translateY(0)'}], {duration:340,easing:'cubic-bezier(.2,.8,.2,1)'});
      mobileMenu.querySelectorAll('.menu-links a').forEach((link, index) => {
        link.animate([{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}], {duration:460,delay:70+index*45,fill:'backwards',easing:'cubic-bezier(.2,.8,.2,1)'});
      });
    }
    mobileMenu.querySelector('.menu-links a').focus({preventScroll:true});
  } else {
    if (restoreFocus) toggle.focus({preventScroll:true});
    mobileMenu.inert = true;
    if (reducedMotion.matches) { mobileMenu.hidden = true; mobileMenu.inert = false; }
    else {
      menuAnimation = mobileMenu.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-12px)'}], {duration:190,easing:'ease-in'});
      menuAnimation.finished.then(() => { if (!menuOpen) { mobileMenu.hidden = true; mobileMenu.inert = false; } }).catch(() => {});
    }
  }
  if (open) mobileMenu.inert = false;
}
toggle.addEventListener('click', () => setMenu(!menuOpen));
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  const target = link.hash && link.origin === location.origin ? document.querySelector(link.hash) : null;
  setMenu(false, !target);
  if (target) {
    target.setAttribute('tabindex', '-1');
    target.focus({preventScroll:true});
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), {once:true});
  }
}));
document.addEventListener('keydown', event => {
  if (!menuOpen) return;
  if (event.key === 'Escape') { event.preventDefault(); setMenu(false); }
  if (event.key === 'Tab') {
    const items = [toggle, ...mobileMenu.querySelectorAll('a')];
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
const header = document.querySelector('.header');
const progress = document.querySelector('.reading-progress');
let scrollQueued = false;
function updateScroll() {
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0})`;
  header.classList.toggle('scrolled', scrollY > 24);
  scrollQueued = false;
}
addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); } }, {passive:true});
addEventListener('resize', updateScroll);
updateScroll();
document.querySelectorAll('.faq details').forEach(detail => {
  detail.addEventListener('toggle', () => {
    if (detail.open) {
      document.querySelectorAll('.faq details').forEach(other => { if (other !== detail) other.open = false; });
      if (!reducedMotion.matches) detail.querySelector('.faq-answer').animate([{opacity:0,transform:'translateY(-7px)'},{opacity:1,transform:'translateY(0)'}], {duration:260,easing:'ease-out'});
    }
  });
});
document.getElementById('year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  document.documentElement.classList.add('js-motion');
}
if ('IntersectionObserver' in window) {
  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  const sections = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) navLinks.forEach(link => {
      const active = link.hash === '#' + entry.target.id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    }); });
  }, { rootMargin: '-15% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => sections.observe(section));
}
document.getElementById('copy-email').addEventListener('click', async () => {