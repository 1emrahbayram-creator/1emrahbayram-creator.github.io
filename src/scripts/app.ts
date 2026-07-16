/* ============================================================
   ARES HOLDİNG v2 — GSAP tabanlı etkileşim katmanı
   ClientRouter (view transitions) ile uyumlu: her sayfa
   yüklemesinde astro:page-load üzerinden yeniden kurulur.
   ============================================================ */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
// Sekme arka plandayken kaçırılan süre giriş animasyonlarına eklenmesin:
// tek seferlik reveal'lar odak dönünce sona atlar (takılı kalmaz).
gsap.ticker.lagSmoothing(0);

const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(pointer: fine)').matches;

let ac: AbortController | null = null;

/* ---------- Nav ---------- */
function initNav(signal: AbortSignal) {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!nav || !toggle || !links) return;

  const onScroll = () => nav.classList.toggle('nav--scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true, signal });
  onScroll();

  const setBackgroundInert = (state: boolean) => {
    ['main', 'footer'].forEach((sel) => {
      const el = document.querySelector<HTMLElement>(sel);
      if (el && 'inert' in el) el.inert = state;
    });
  };

  const openMenu = () => {
    links.classList.add('is-open');
    // APG toggle deseni: etiket sabit ("Menü"), durum yalnız aria-expanded ile
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    setBackgroundInert(true);
    const first = links.querySelector<HTMLElement>('a');
    // Görünürlük geçişi başladıktan sonra odakla
    requestAnimationFrame(() => requestAnimationFrame(() => first?.focus()));
  };

  const closeMenu = () => {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    setBackgroundInert(false);
  };

  toggle.addEventListener(
    'click',
    () => (links.classList.contains('is-open') ? closeMenu() : openMenu()),
    { signal }
  );
  links.addEventListener(
    'click',
    (e) => {
      if ((e.target as HTMLElement).closest('a')) closeMenu();
    },
    { signal }
  );
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && links.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    },
    { signal }
  );
  const mq = window.matchMedia('(min-width: 861px)');
  mq.addEventListener('change', (e) => e.matches && closeMenu(), { signal });
}

/* ---------- Ticker duraklat/oynat ---------- */
function initTicker(signal: AbortSignal) {
  const btn = document.getElementById('ticker-pause');
  if (!btn) return;
  btn.addEventListener(
    'click',
    () => {
      const paused = btn.closest('.ticker')?.classList.toggle('ticker--paused') ?? false;
      // APG toggle deseni: etiket sabit, durum aria-pressed ile
      btn.setAttribute('aria-pressed', String(paused));
    },
    { signal }
  );
}

/* ---------- Scroll reveal ---------- */
function initReveals() {
  // Sayfa içi hero: yüklemede kademeli giriş
  const heroEls = gsap.utils.toArray<HTMLElement>('.gs-hero');
  if (heroEls.length) {
    gsap.from(heroEls, {
      autoAlpha: 0,
      y: 28,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
      delay: 0.1,
      clearProps: 'all',
    });
  }
  // Scroll ile görünenler
  gsap.utils.toArray<HTMLElement>('.gs-reveal').forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      y: 32,
      duration: 0.9,
      ease: 'power3.out',
      delay: (Number(el.dataset.delay) || 0) * 0.12,
      clearProps: 'all',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

/* ---------- Sayaçlar ---------- */
function initCounters() {
  gsap.utils.toArray<HTMLElement>('.stats__num').forEach((el) => {
    const target = parseInt(el.dataset.count ?? '', 10);
    if (!isFinite(target)) return;
    const obj = { val: target };
    gsap.from(obj, {
      val: 0,
      duration: 1.4,
      ease: 'power3.out',
      onUpdate: () => (el.textContent = String(Math.round(obj.val))),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

/* ---------- Parallax ---------- */
function initParallax() {
  const arcs = document.querySelector('.hero__arcs');
  if (arcs) {
    gsap.to(arcs, {
      rotation: 18,
      scale: 1.12,
      transformOrigin: '50% 100%',
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
    });
  }
  const glow = document.querySelector('.hero__glow');
  if (glow) {
    gsap.to(glow, {
      yPercent: 24,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
    });
  }
  const bigNo = document.querySelector('.page-hero__no');
  if (bigNo) {
    gsap.to(bigNo, {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
    });
  }
}

/* ---------- Scroll ilerleme çubuğu ---------- */
function initProgress() {
  const bar = document.querySelector('.progress-bar');
  if (!bar) return;
  gsap.to(bar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });
}

/* ---------- Manyetik butonlar ---------- */
function initMagnetic(signal: AbortSignal) {
  if (!finePointer()) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = 0.35;
    el.addEventListener(
      'mousemove',
      (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.4, ease: 'power2.out' });
      },
      { signal }
    );
    el.addEventListener(
      'mouseleave',
      () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' }),
      { signal }
    );
  });
}

/* ---------- 3D eğilen kartlar ---------- */
function initTilt(signal: AbortSignal) {
  if (!finePointer()) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    el.addEventListener(
      'pointermove',
      (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        gsap.to(el, {
          rotateX: (0.5 - py) * 8,
          rotateY: (px - 0.5) * 8,
          transformPerspective: 900,
          duration: 0.45,
          ease: 'power2.out',
        });
        el.style.setProperty('--gx', `${px * 100}%`);
        el.style.setProperty('--gy', `${py * 100}%`);
      },
      { signal }
    );
    el.addEventListener(
      'pointerleave',
      () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'power3.out' }),
      { signal }
    );
  });
}

/* ---------- Özel imleç halkası ---------- */
function initCursor(signal: AbortSignal) {
  const ring = document.querySelector<HTMLElement>('.cursor-ring');
  if (!ring || !finePointer()) return;
  document.documentElement.classList.add('has-cursor');
  const xTo = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
  const yTo = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });
  document.addEventListener(
    'mousemove',
    (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    },
    { signal }
  );
  document.addEventListener(
    'mouseover',
    (e) => {
      const interactive = (e.target as HTMLElement).closest('a, button, [data-tilt]');
      ring.classList.toggle('is-active', !!interactive);
      gsap.to(ring, { scale: interactive ? 1.5 : 1, duration: 0.3 });
    },
    { signal }
  );
}

/* ---------- İletişim formu (mailto iletimi) ----------
   Sunucu tarafı endpoint bağlandığında fetch ile değiştirilmelidir.
   Ziyaretçinin e-posta istemcisini önceden doldurulmuş taslakla açar;
   sahte "gönderildi" onayı vermez. */
function initForm(signal: AbortSignal) {
  const form = document.getElementById('iletisim-form') as HTMLFormElement | null;
  if (!form) return;
  form.addEventListener(
    'submit',
    (e) => {
      e.preventDefault();
      const ad = (form.elements.namedItem('ad') as HTMLInputElement).value.trim();
      const eposta = (form.elements.namedItem('eposta') as HTMLInputElement).value.trim();
      const mesaj = (form.elements.namedItem('mesaj') as HTMLTextAreaElement).value.trim();
      const konu = encodeURIComponent(`Web Sitesi Görüşme Talebi — ${ad}`);
      const govde = encodeURIComponent(`${mesaj}\n\n—\nAd Soyad: ${ad}\nE-posta: ${eposta}`);
      window.location.href = `mailto:info@aresholding.com.tr?subject=${konu}&body=${govde}`;
      const note = form.querySelector<HTMLElement>('.form__note');
      if (note)
        note.textContent =
          'E-posta uygulamanız açılıyor; talebiniz info@aresholding.com.tr adresine iletilecek.';
    },
    { signal }
  );
}

/* ---------- Perde: hero çıkış animasyonu ---------- */
function initCurtain() {
  const heroInner = document.querySelector('.hero--sticky .hero__inner');
  const curtain = document.querySelector('.curtain');
  if (!heroInner || !curtain) return;
  gsap.to(heroInner, {
    autoAlpha: 0.15,
    y: -60,
    ease: 'none',
    scrollTrigger: { trigger: curtain, start: 'top bottom', end: 'top top', scrub: 0.4 },
  });
}

/* ---------- Manifesto: scroll ile kelime kelime beliren metin ---------- */
function initManifesto() {
  const el = document.getElementById('manifesto-metin');
  if (!el || el.querySelector('.w')) {
    if (el) buildManifestoTween(el);
    return;
  }
  const wrap = (n: Node) => {
    if (n.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      (n.textContent ?? '').split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(' '));
        } else {
          const s = document.createElement('span');
          s.className = 'w';
          s.textContent = part;
          frag.appendChild(s);
        }
      });
      n.parentNode?.replaceChild(frag, n);
    } else if (n.nodeType === Node.ELEMENT_NODE) {
      [...n.childNodes].forEach(wrap);
    }
  };
  [...el.childNodes].forEach(wrap);
  buildManifestoTween(el);
}

function buildManifestoTween(el: HTMLElement) {
  const words = el.querySelectorAll('.w');
  if (!words.length) return;
  gsap.set(words, { autoAlpha: 0.14 });
  gsap.to(words, {
    autoAlpha: 1,
    ease: 'none',
    stagger: 0.6,
    scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.4 },
  });
}

/* ---------- Sektör kartları: öndeki kart gelirken alttaki kararır ---------- */
function initStack() {
  const cards = gsap.utils.toArray<HTMLElement>('.stack__card');
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    const dim = card.querySelector('.stack__dim');
    const inner = card.querySelector('.stack__inner');
    if (dim) {
      gsap.fromTo(
        dim,
        { opacity: 0 },
        {
          opacity: 0.65,
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: 0.3 },
        }
      );
    }
    if (inner) {
      gsap.to(inner, {
        scale: 0.95,
        y: -30,
        ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: 0.3 },
      });
    }
  });
}

/* ---------- Zoom: sabitlenen kutu tam ekrana açılır ---------- */
function initZoom() {
  if (!window.matchMedia('(min-width: 861px)').matches) return;
  const zoom = document.querySelector('.zoom');
  const stage = document.querySelector('.zoom__stage');
  const content = document.querySelector('.zoom__content');
  if (!zoom || !stage) return;
  gsap.fromTo(
    stage,
    { clipPath: 'inset(16% 24% 16% 24% round 28px)' },
    {
      clipPath: 'inset(0% 0% 0% 0% round 0px)',
      ease: 'none',
      scrollTrigger: { trigger: zoom, start: 'top top', end: 'bottom bottom', scrub: 0.4 },
    }
  );
  if (content) {
    gsap.fromTo(
      content,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        ease: 'none',
        scrollTrigger: { trigger: zoom, start: 'top top', end: '40% top', scrub: 0.4 },
      }
    );
  }
  const steps = gsap.utils.toArray<HTMLElement>('.zoom__steps .process__step');
  if (steps.length) {
    gsap.from(steps, {
      autoAlpha: 0,
      y: 40,
      stagger: 0.15,
      ease: 'none',
      scrollTrigger: { trigger: zoom, start: '25% top', end: '65% top', scrub: 0.4 },
    });
  }
}

/* ---------- Küresel sermaye ağı küresi (finans kartı arka planı) ----------
   Tasarım handoff'undaki canvas bileşeninin vanilla portu: dönen tel kafes
   küre, İstanbul merkezli bağlantı yayları, akan ışık darbeleri ve etiketler. */
function initGlobe(signal: AbortSignal) {
  const cv = document.querySelector<HTMLCanvasElement>('.stack__globe');
  if (!cv) return;
  const accent = '#D8C39A';
  const speed = 0.8;
  const D2R = Math.PI / 180;
  const tilt = 23 * D2R;

  interface Merkez { n: string; la: number; lo: number; hub?: boolean; label?: string; }
  const merkezler: Merkez[] = [
    { n: 'İSTANBUL', la: 41, lo: 29, hub: true, label: 'MELEK YATIRIMCILIK' },
    { n: 'LONDRA', la: 51.5, lo: 0, label: 'ŞİRKET EVLİLİKLERİ & ORTAKLIKLAR' },
    { n: 'NEW YORK', la: 40.7, lo: -74, label: 'KÜRESEL FON YÖNETİMİ' },
    { n: 'TOKYO', la: 35.7, lo: 139.7, label: 'YURT DIŞI BORSALAR' },
    { n: 'DUBAİ', la: 25.2, lo: 55.3 },
    { n: 'HONG KONG', la: 22.3, lo: 114.2 },
    { n: 'FRANKFURT', la: 50.1, lo: 8.7 },
  ];
  const baglar: Array<[number, number]> = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [3, 5]];

  const rgba = (hex: string, a: number) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
  };

  const draw = (t: number) => {
    const parent = cv.parentElement;
    if (!parent) return;
    const box = parent.getBoundingClientRect();
    const w = Math.max(1, box.width);
    const h = Math.max(1, box.height);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const genis = w > 860;
    const showLabels = w > 700;
    const cx = w * (genis ? 0.66 : 0.5);
    const cy = h / 2;
    const R = Math.min(genis ? w * 0.5 : w, h) * 0.31;
    const rot = t * 0.09 * speed;

    const P = (la: number, lo: number) => {
      const p = la * D2R, l = lo * D2R + rot;
      const x = Math.cos(p) * Math.sin(l), y = Math.sin(p), z = Math.cos(p) * Math.cos(l);
      const yt = y * Math.cos(tilt) - z * Math.sin(tilt);
      const zt = y * Math.sin(tilt) + z * Math.cos(tilt);
      return { X: cx + R * x, Y: cy - R * yt, z: zt, x, y, zz: z };
    };

    // dış kadran halkası + tik işaretleri
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R + 58, 0, Math.PI * 2); ctx.stroke();
    for (let a = 0; a < 360; a += 5) {
      const rad = a * D2R, uzun = a % 30 === 0;
      const r1 = R + 58, r2 = r1 + (uzun ? 10 : 5);
      ctx.strokeStyle = uzun ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(cx + r1 * Math.cos(rad), cy + r1 * Math.sin(rad));
      ctx.lineTo(cx + r2 * Math.cos(rad), cy + r2 * Math.sin(rad));
      ctx.stroke();
    }
    const oa = -t * 0.05 * speed;
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(cx + (R + 58) * Math.cos(oa), cy + (R + 58) * Math.sin(oa), 2, 0, Math.PI * 2); ctx.fill();

    // küre dış hattı
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

    // tel kafes (derinliğe göre saydamlık)
    type Nk = ReturnType<typeof P>;
    const wire = (pts: Nk[], base: number) => {
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const zm = (a.z + b.z) / 2;
        ctx.strokeStyle = `rgba(255,255,255,${(base * (0.22 + 0.78 * Math.max(0, zm))).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(a.X, a.Y); ctx.lineTo(b.X, b.Y); ctx.stroke();
      }
    };
    for (let la = -60; la <= 60; la += 30) {
      const pts: Nk[] = [];
      for (let lo = 0; lo <= 360; lo += 4) pts.push(P(la, lo));
      wire(pts, 0.16);
    }
    for (let lo = 0; lo < 180; lo += 30) {
      const pts: Nk[] = [];
      for (let la = -90; la <= 90; la += 4) pts.push(P(la, lo));
      for (let la = 90; la >= -90; la -= 4) pts.push(P(la, lo + 180));
      wire(pts, 0.14);
    }

    const M = merkezler.map((m) => ({ ...m, ...P(m.la, m.lo) }));

    // hub'dan bağlantı yayları + akan darbeler
    const lerp3 = (m1: (typeof M)[0], m2: (typeof M)[0], u: number) => {
      let x = m1.x + (m2.x - m1.x) * u;
      let y = m1.y + (m2.y - m1.y) * u;
      let z = m1.zz + (m2.zz - m1.zz) * u;
      const n = Math.hypot(x, y, z) || 1;
      const lift = 1 + 0.22 * Math.sin(Math.PI * u);
      x = (x / n) * lift; y = (y / n) * lift; z = (z / n) * lift;
      const yt = y * Math.cos(tilt) - z * Math.sin(tilt);
      const zt = y * Math.sin(tilt) + z * Math.cos(tilt);
      return { X: cx + R * x, Y: cy - R * yt, z: zt };
    };
    baglar.forEach((lk, i) => {
      const a = M[lk[0]], b = M[lk[1]];
      const pts = [] as Array<ReturnType<typeof lerp3>>;
      for (let s = 0; s <= 40; s++) pts.push(lerp3(a, b, s / 40));
      for (let s = 1; s < pts.length; s++) {
        const zm = (pts[s - 1].z + pts[s].z) / 2;
        if (zm < -0.15) continue;
        ctx.strokeStyle = rgba(accent, 0.1 + 0.3 * Math.max(0, zm));
        ctx.beginPath(); ctx.moveTo(pts[s - 1].X, pts[s - 1].Y); ctx.lineTo(pts[s].X, pts[s].Y); ctx.stroke();
      }
      const ph = (t * 0.12 * speed + i * 0.37) % 1;
      const pp = lerp3(a, b, ph);
      if (pp.z > -0.05) {
        ctx.fillStyle = rgba(accent, 0.9);
        ctx.beginPath(); ctx.arc(pp.X, pp.Y, 1.8, 0, Math.PI * 2); ctx.fill();
      }
    });

    // düğümler
    M.forEach((m) => {
      const on = m.z > -0.05, al = on ? 0.95 : 0.25;
      if (m.hub) {
        const pulse = 5 + 3 * (0.5 + 0.5 * Math.sin(t * 2 * speed));
        ctx.strokeStyle = rgba(accent, 0.5 * Math.max(0.2, m.z + 0.5));
        ctx.beginPath(); ctx.arc(m.X, m.Y, pulse, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = rgba(accent, al);
      } else {
        ctx.fillStyle = `rgba(255,255,255,${on ? 0.85 : 0.2})`;
      }
      ctx.beginPath(); ctx.arc(m.X, m.Y, m.hub ? 3 : 2, 0, Math.PI * 2); ctx.fill();
    });

    // etiketler ve kılavuz çizgileri
    if (showLabels) {
      ctx.font = '500 11px "JetBrains Mono Variable", monospace';
      M.filter((m) => m.label).forEach((m) => {
        const vis = Math.max(0, Math.min(1, (m.z + 0.15) * 2.2));
        if (vis <= 0.02) return;
        const dx = m.X - cx, dy = m.Y - cy, dn = Math.hypot(dx, dy) || 1;
        const ex = m.X + (dx / dn) * 46, ey = m.Y + (dy / dn) * 46;
        const sag = dx >= 0;
        ctx.strokeStyle = `rgba(255,255,255,${(0.3 * vis).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(m.X, m.Y); ctx.lineTo(ex, ey); ctx.lineTo(ex + (sag ? 14 : -14), ey); ctx.stroke();
        ctx.fillStyle = m.hub ? rgba(accent, vis) : `rgba(255,255,255,${(0.72 * vis).toFixed(3)})`;
        ctx.textAlign = sag ? 'left' : 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(m.label!, ex + (sag ? 20 : -20), ey);
        ctx.fillStyle = `rgba(255,255,255,${(0.35 * vis).toFixed(3)})`;
        ctx.fillText(m.n, ex + (sag ? 20 : -20), ey + 15);
      });
    }

    // köşe yazıları
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = '400 10px "JetBrains Mono Variable", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.fillText('// KÜRESEL SERMAYE AĞI', 28, h - 28);
    ctx.textAlign = 'right';
    ctx.fillText('41°N — 29°E', w - 28, h - 28);
  };

  let raf = 0;
  const t0 = performance.now();
  const hareketli = !reduced();
  const loop = (now: number) => {
    draw((now - t0) / 1000);
    raf = requestAnimationFrame(loop);
  };
  // yalnızca kart görünürken animasyon çalışır
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        cancelAnimationFrame(raf);
        if (e.isIntersecting && hareketli) raf = requestAnimationFrame(loop);
      });
    },
    { threshold: 0.05 }
  );
  io.observe(cv);
  const ro = new ResizeObserver(() => draw(hareketli ? (performance.now() - t0) / 1000 : 42));
  ro.observe(cv.parentElement!);
  document.fonts?.ready.then(() => draw(hareketli ? (performance.now() - t0) / 1000 : 42));
  draw(hareketli ? 0 : 42);
  signal.addEventListener('abort', () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
  });
}

/* ---------- Yaşam döngüsü ---------- */
function initPage() {
  ac = new AbortController();
  const { signal } = ac;

  initNav(signal);
  initTicker(signal);
  initForm(signal);
  initGlobe(signal); // hareket azaltmada tek statik kare çizer

  if (reduced()) return; // hareket azaltmada içerik zaten görünür

  initReveals();
  initCounters();
  initParallax();
  initProgress();
  initMagnetic(signal);
  initTilt(signal);
  initCursor(signal);
  initCurtain();
  initManifesto();
  initStack();
  initZoom();
}

document.addEventListener('astro:page-load', initPage);
document.addEventListener('astro:before-swap', () => {
  ac?.abort();
  ScrollTrigger.getAll().forEach((t) => t.kill());
  // Persist edilen imleç halkası: eski quickTo tween'lerini öldür, durumunu sıfırla
  const ring = document.querySelector<HTMLElement>('.cursor-ring');
  if (ring) {
    gsap.killTweensOf(ring);
    ring.classList.remove('is-active');
    gsap.set(ring, { scale: 1 });
  }
});
// Astro her swap'ta <html> özniteliklerini statik belgeninkilerle değiştirir;
// has-cursor sınıfını geri ekle ki halka geçişlerde kaybolmasın.
document.addEventListener('astro:after-swap', () => {
  if (finePointer() && !reduced()) document.documentElement.classList.add('has-cursor');
});
