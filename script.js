// Ano no rodapé
document.getElementById('year').textContent = new Date().getFullYear();

// Barra de progresso
const bar = document.querySelector('.progress');
addEventListener('scroll', () => {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
}, { passive: true });

// Menu mobile
const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');
function setMenu(open) {
  burger.classList.toggle('open', open);
  menu.classList.toggle('open', open);
  menu.setAttribute('aria-hidden', !open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('locked', open);
}
burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// Menu desktop: indicador que desliza + secção ativa
const nav = document.getElementById('nav');
const links = [...nav.querySelectorAll('a')];
const ind = nav.querySelector('.ind');
let current = links[0];
function moveInd(el) {
  ind.style.width = el.offsetWidth + 'px';
  ind.style.transform = `translateX(${el.offsetLeft}px)`;
}
function setActive(el) {
  current = el;
  links.forEach(l => l.classList.toggle('active', l === el));
  moveInd(el);
}
links.forEach(l => {
  l.addEventListener('mouseenter', () => moveInd(l));
  l.addEventListener('mouseleave', () => moveInd(current));
});
nav.addEventListener('mouseleave', () => moveInd(current));
addEventListener('resize', () => moveInd(current));
document.fonts && document.fonts.ready.then(() => moveInd(current));
moveInd(current);

// Secção ativa ao fazer scroll
const sectionIds = links.map(l => l.getAttribute('href').slice(1));
const so = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    let id = e.target.id;
    if (id === 'tools') id = 'path';
    const l = links.find(x => x.getAttribute('href') === '#' + id);
    if (l) setActive(l);
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('[data-section]').forEach(s => so.observe(s));

// Revelar ao fazer scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Linha do tempo que se preenche com o scroll
const tlWrap = document.querySelector('.timeline');
const tlFill = document.querySelector('.tl-line i');
if (tlWrap && tlFill) {
  const upd = () => {
    const r = tlWrap.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.65 - r.top) / r.height));
    tlFill.style.height = p * 100 + '%';
  };
  addEventListener('scroll', upd, { passive: true });
  addEventListener('resize', upd);
  upd();
}

// Contador de seguidores
const counter = document.querySelector('[data-count]');
if (counter) {
  const end = +counter.dataset.count;
  const co = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    const t0 = performance.now(), dur = 1800;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      counter.textContent = Math.round(end * (1 - Math.pow(1 - k, 4)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    co.disconnect();
  }, { threshold: 0.5 });
  co.observe(counter);
}

// Cursor personalizado
const cursor = document.querySelector('.cursor');
let cx = 0, cy = 0, tx = 0, ty = 0;
addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
(function loop() {
  cx += (tx - cx) * 0.18;
  cy += (ty - cy) * 0.18;
  cursor.style.left = cx + 'px';
  cursor.style.top = cy + 'px';
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a, .btn, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('big'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
});

// Efeito magnético
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.25;
    const y = (e.clientY - r.top - r.height / 2) * 0.25;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
  el.addEventListener('mouseleave', () => el.style.transform = '');
});

// Inclinação 3D nos cartões
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

// Aurora segue ligeiramente o rato
const blobs = document.querySelectorAll('.aurora i');
addEventListener('mousemove', e => {
  const x = (e.clientX / innerWidth - 0.5), y = (e.clientY / innerHeight - 0.5);
  blobs.forEach((b, i) => { b.style.translate = `${x * (30 + i * 20)}px ${y * (30 + i * 20)}px`; });
});
