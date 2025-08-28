
// Utility: fancy toast
const toast = (msg, timeout=2200) => {
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(()=> el.style.display = 'none', timeout);
};

// Header: mobile nav
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');
if(navToggle && navMenu){
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navMenu.addEventListener('click', (e)=>{
    if(e.target.tagName === 'A') navMenu.classList.remove('open');
  });
}

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
if(themeToggle){
  const applyTheme = (t)=> document.body.classList.toggle('light', t==='light');
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);
  themeToggle.addEventListener('click', ()=>{
    const next = document.body.classList.contains('light') ? 'dark':'light';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });
}

// Smooth page transition
const pageTrans = document.getElementById('page-transition');
if(pageTrans){
  window.addEventListener('pageshow', ()=>{
    pageTrans.style.transform = 'translateY(100%)';
    setTimeout(()=> pageTrans.style.transition = 'transform .6s ease', 10);
  });
  document.querySelectorAll('a[href$=".html"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      if(a.target === '_blank' || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      pageTrans.style.transform = 'translateY(0)';
      setTimeout(()=> window.location.href = a.href, 250);
    });
  });
}

// Scroll progress & back-to-top
const progress = document.getElementById('scroll-progress');
const toTop = document.getElementById('to-top');
if(progress){
  document.addEventListener('scroll', ()=>{
    const h = document.documentElement;
    const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = pct + '%';
    toTop.style.display = h.scrollTop > 400 ? 'block':'none';
  });
  if(toTop) toTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
}

// Footer year
document.querySelectorAll('[data-year]').forEach(el=> el.textContent = new Date().getFullYear());

// Intersection reveal
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  })
}, {threshold:.15});
document.querySelectorAll('.reveal-up').forEach(el=> io.observe(el));

// Animated counters
document.querySelectorAll('[data-counter]').forEach(el=>{
  const target = Number(el.dataset.target || 0);
  let n = 0;
  const step = Math.max(1, Math.floor(target/120));
  const tick = () => { n += step; if(n>target) n = target; el.textContent = n.toLocaleString(); if(n<target) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});

// Background particles
(function(){
  const canvas = document.getElementById('bg-particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dots;
  const init = () => {
    w = canvas.width = innerWidth;
    h = canvas.height = Math.max(innerHeight, 700);
    dots = Array.from({length: Math.min(140, Math.floor(w*h/15000))}, () => ({
      x: Math.random()*w, y: Math.random()*h, r: Math.random()*2 + 0.6,
      vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3
    }));
  };
  const draw = () => {
    ctx.clearRect(0,0,w,h);
    for(const d of dots){
      d.x += d.vx; d.y += d.vy;
      if(d.x<0||d.x>w) d.vx*=-1;
      if(d.y<0||d.y>h) d.vy*=-1;
      ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
      ctx.fillStyle = 'rgba(255,46,136,.7)'; ctx.fill();
    }
    // connective glow
    for(let i=0;i<dots.length;i++){
      for(let j=i+1;j<dots.length;j++){
        const a = dots[i], b = dots[j];
        const dx=a.x-b.x, dy=a.y-b.y, dist=Math.hypot(dx,dy);
        if(dist<120){
          ctx.strokeStyle = `rgba(255,111,169,${1-dist/120})`;
          ctx.lineWidth = .5;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  };
  addEventListener('resize', init, {passive:true});
  init(); draw();
})();

// Carousel
document.querySelectorAll('[data-carousel]').forEach(carousel=>{
  const track = carousel.querySelector('.carousel-track');
  const items = Array.from(track.children);
  let idx = 0;
  const go = (n)=>{
    idx = (n + items.length) % items.length;
    track.style.transform = `translateX(${-idx*100}%)`;
  };
  carousel.querySelector('.next').addEventListener('click', ()=> go(idx+1));
  carousel.querySelector('.prev').addEventListener('click', ()=> go(idx-1));
  setInterval(()=> go(idx+1), 4500);
});

// Donate page features
(function(){
  const range = document.querySelector('[data-donation-range]');
  if(!range) return;
  const display = document.querySelector('[data-donation-display]');
  const freqSel = document.querySelector('[data-donation-frequency]');
  const mealsEl = document.querySelector('[data-impact-meals]');
  const kitsEl = document.querySelector('[data-impact-kits]');
  const rescuesEl = document.querySelector('[data-impact-rescues]');
  const progressEl = document.querySelector('[data-goal-progress]');
  const historyEl = document.querySelector('[data-history]');

  const goal = 200000; // ₹
  const history = JSON.parse(localStorage.getItem('nh-history') || '[]');

  const update = () => {
    const amt = Number(range.value);
    display.textContent = '₹' + amt.toLocaleString();
    mealsEl.textContent = Math.floor(amt/25);
    kitsEl.textContent = Math.floor(amt/150);
    rescuesEl.textContent = Math.max(1, Math.floor(amt/800));
    const total = history.reduce((s,i)=> s+i.amount, 0);
    progressEl.style.width = Math.min(100, (total/goal)*100) + '%';
    historyEl.innerHTML = history.length ? history.map(i=> `<div class="history-item chip">₹${i.amount.toLocaleString()} · ${i.freq} · ${new Date(i.ts).toLocaleDateString()}</div>`).join('') : '<p class="form-hint">No donations yet.</p>';
  };
  range.addEventListener('input', update);
  document.querySelectorAll('[data-donate]').forEach(btn=> btn.addEventListener('click', ()=>{
    range.value = btn.dataset.donate; update();
  }));
  document.querySelector('[data-checkout]').addEventListener('click', ()=>{
    const item = {amount: Number(range.value), freq: freqSel.value, ts: Date.now()};
    history.push(item);
    localStorage.setItem('nh-history', JSON.stringify(history));
    update(); toast('Donation recorded locally. Thank you!');
  });
  document.querySelector('[data-clear-history]').addEventListener('click', ()=>{
    localStorage.removeItem('nh-history'); location.reload();
  });
  update();
})();

// Modal controls
document.querySelectorAll('[data-open-modal]').forEach(btn=>{
  const sel = btn.getAttribute('data-open-modal');
  btn.addEventListener('click', ()=>{
    const m = document.querySelector(sel); if(!m) return;
    m.setAttribute('aria-hidden','false');
  });
});
document.querySelectorAll('[data-close-modal]').forEach(btn=>{
  btn.addEventListener('click', ()=> btn.closest('.modal').setAttribute('aria-hidden','true'));
});
document.querySelectorAll('.modal').forEach(m=> m.addEventListener('click', (e)=>{
  if(e.target === m) m.setAttribute('aria-hidden','true');
}));

// Volunteer shifts (mock dataset)
(function(){
  const list = document.querySelector('[data-shifts]');
  if(!list) return;
  const search = document.getElementById('search-shifts');
  const daySel = document.getElementById('shift-day');
  const typeSel = document.getElementById('shift-type');
  const data = [
    {title:'Hotel Surplus Rescue', city:'Mumbai', day:'Saturday', type:'rescue', time:'9–11pm'},
    {title:'Community Kitchen Prep', city:'Delhi', day:'Sunday', type:'kitchen', time:'8–11am'},
    {title:'Distribution Line Lead', city:'Bengaluru', day:'Friday', type:'distribution', time:'5–8pm'},
    {title:'Warehouse Sorting', city:'Mumbai', day:'Wednesday', type:'logistics', time:'4–7pm'},
    {title:'Cook & Pack', city:'Kolkata', day:'Thursday', type:'kitchen', time:'10am–1pm'},
    {title:'School Lunch Support', city:'Delhi', day:'Monday', type:'distribution', time:'12–2pm'},
  ];

  const render = (items)=>{
    list.innerHTML = items.map((s,i)=> `
      <div class="card">
        <h3>${s.title}</h3>
        <p>${s.city} · ${s.day} · ${s.time}</p>
        <div class="chips">
          <span class="chip">${s.type}</span>
          <button class="btn secondary small" data-signup="${i}">Sign up</button>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('[data-signup]').forEach(btn=> btn.addEventListener('click', ()=> toast('Shift saved — see your email for details.')));
  };

  const filter = () => {
    const q = (search.value||'').toLowerCase();
    const d = daySel.value;
    const t = typeSel.value;
    render(data.filter(s=> (!q||s.title.toLowerCase().includes(q)) && (!d||s.day===d) && (!t||s.type===t)));
  };

  [search, daySel, typeSel].forEach(el=> el && el.addEventListener('input', filter));
  render(data);
})();

// Events dataset + filters
(function(){
  const timeline = document.getElementById('event-timeline');
  if(!timeline) return;
  const month = document.getElementById('event-month');
  const city = document.getElementById('event-city');
  const data = [
    {date:'2025-08-30', city:'Mumbai', title:'Kitchen Drive 500 Meals', id:'e1'},
    {date:'2025-09-05', city:'Delhi', title:'Hotel Rescue Night', id:'e2'},
    {date:'2025-09-13', city:'Bengaluru', title:'School Lunch Boost', id:'e3'},
    {date:'2025-09-21', city:'Kolkata', title:'Warehouse Sorting Day', id:'e4'},
  ];
  const saved = new Set(JSON.parse(localStorage.getItem('nh-events')||'[]'));
  const save = ()=> localStorage.setItem('nh-events', JSON.stringify(Array.from(saved)));

  const render = (items)=>{
    timeline.innerHTML = items.map(e=> `
      <div class="item card">
        <h3>${new Date(e.date).toLocaleDateString()} — ${e.title}</h3>
        <p>${e.city}</p>
        <button class="btn ${saved.has(e.id)?'ghost':'secondary'} small" data-save="${e.id}">${saved.has(e.id)?'Saved':'Save'}</button>
      </div>
    `).join('');
    timeline.querySelectorAll('[data-save]').forEach(btn=> btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-save');
      if(saved.has(id)){ saved.delete(id); toast('Event removed.'); } else { saved.add(id); toast('Event saved.'); }
      save(); // re-render
      const m = month.value, c = city.value;
      doFilter(m, c);
    }));
  };

  const doFilter = (m, c)=>{
    const items = data.filter(e=> (!m || e.date.startsWith(m)) && (!c || e.city===c));
    render(items);
  };

  month.addEventListener('input', ()=> doFilter(month.value, city.value));
  city.addEventListener('input', ()=> doFilter(month.value, city.value));
  doFilter('', '');
})();

// Forms (newsletter, contact, request, volunteer, modals) — validate + simulate submit
document.querySelectorAll('form').forEach(form=>{
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const name = form.getAttribute('data-form');
    localStorage.setItem('nh-form-' + (name || 'generic'), JSON.stringify({data, ts: Date.now()}));
    toast('Submitted! We will reach out soon.');
    form.reset();
  });
});

// Request tracking
(function(){
  const wrap = document.querySelector('[data-requests]');
  if(!wrap) return;
  const key = 'nh-requests';
  const getAll = ()=> JSON.parse(localStorage.getItem(key)||'[]');
  const render = ()=> wrap.innerHTML = getAll().map(r=> `<div class="chip">#${r.id} · ${r.city} · ${r.people} people · ${new Date(r.ts).toLocaleString()}</div>`).join('') || '<p class="form-hint">No requests yet.</p>';
  document.querySelector('[data-form="request"]')?.addEventListener('submit', (e)=>{
    const data = Object.fromEntries(new FormData(e.target).entries());
    const list = getAll();
    const item = {id: list.length+1, ...data, ts: Date.now()};
    list.push(item); localStorage.setItem(key, JSON.stringify(list));
    render();
  });
  document.querySelector('[data-clear-requests]')?.addEventListener('click', ()=>{localStorage.removeItem(key); render();});
  render();
})();

// Impact page mock KPIs + chart
(function(){
  const meals = document.querySelector('[data-kpi="meals"]');
  if(!meals) return;
  const kg = document.querySelector('[data-kpi="kg"]');
  const vols = document.querySelector('[data-kpi="vols"]');
  const history = JSON.parse(localStorage.getItem('nh-history') || '[]');
  const sum = history.reduce((s,i)=> s+i.amount, 0);
  meals.textContent = (sum/25 | 0).toLocaleString();
  kg.textContent = (sum/8 | 0).toLocaleString();
  vols.textContent = Math.max(5800, 5800 + (sum/2000|0)).toLocaleString();

  const canvas = document.getElementById('donation-chart');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  // generate series
  const days = 30, vals = Array.from({length: days}, (_,i)=> Math.round(2000 + Math.random()*6000));
  // draw axes
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = 'rgba(255,255,255,.8)';
  ctx.font = '12px sans-serif';
  ctx.strokeStyle = 'rgba(255,255,255,.2)';
  ctx.beginPath();
  ctx.moveTo(40, h-40); ctx.lineTo(w-20, h-40); ctx.lineTo(w-20, 20); ctx.stroke();
  // plot
  const max = Math.max(...vals);
  ctx.beginPath();
  for(let i=0;i<days;i++){
    const x = 40 + i*(w-60)/(days-1);
    const y = 20 + (1 - vals[i]/max) * (h-60);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.strokeStyle = 'rgba(255,111,169,1)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // fill gradient
  const grad = ctx.createLinearGradient(0,20,0,h-40);
  grad.addColorStop(0,'rgba(255,111,169,.35)');
  grad.addColorStop(1,'rgba(255,111,169,0)');
  ctx.fillStyle = grad;
  ctx.lineTo(w-20, h-40); ctx.lineTo(40, h-40); ctx.closePath(); ctx.fill();
})();

// FAQ accordion polish (native <details> used; just add toast)
document.querySelectorAll('details > summary').forEach(s=> s.addEventListener('click', ()=> setTimeout(()=>{
  toast('Section toggled');
}, 200)));
