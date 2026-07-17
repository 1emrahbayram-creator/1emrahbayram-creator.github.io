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
  const cv = document.querySelector<HTMLCanvasElement>('[data-gorsel="kure"]');
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

/* ---------- Geliştirme görseli (gayrimenkul kartı arka planı) ----------
   Tasarım handoff'undaki izometrik şantiye bileşeninin vanilla portu:
   büyüyen tel kafes binalar, dönen vinç, zemin ölçüsü ve etiketler. */
function initInsaat(signal: AbortSignal) {
  const cv = document.querySelector<HTMLCanvasElement>('[data-gorsel="insaat"]');
  if (!cv) return;
  const accent = '#D8C39A';
  const speed = 1;

  interface Yapi { x: number; y: number; w: number; d: number; h: number; delay: number; label?: string; sub?: string; beacon?: boolean; }
  const yapilar: Yapi[] = [
    { x: 1.2, y: 4.6, w: 1.6, d: 1.6, h: 2.0, delay: 0.0, label: 'KENTSEL DÖNÜŞÜM', sub: 'BLOK A · YENİLEME' },
    { x: 3.2, y: 4.4, w: 1.4, d: 1.4, h: 3.4, delay: 0.5 },
    { x: 5.0, y: 4.8, w: 1.8, d: 1.5, h: 5.2, delay: 1.0, label: 'BİNA & ALTYAPI PROJELERİ', sub: 'KULE · 34 KAT', beacon: true },
    { x: 7.3, y: 4.5, w: 1.5, d: 1.5, h: 2.8, delay: 1.5 },
    { x: 8.1, y: 6.6, w: 2.6, d: 1.7, h: 1.1, delay: 2.0, label: 'TURİZM YATIRIMLARI', sub: 'RESORT · SAHİL HATTI' },
    { x: 2.4, y: 6.8, w: 1.2, d: 1.2, h: 1.5, delay: 2.4 },
  ];

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
    const s = Math.min(genis ? w * 0.55 : w, h) / 13;
    const cx = w * (genis ? 0.62 : 0.5);
    const cy = h * 0.56;
    const ISO = (x: number, y: number, z: number) => ({
      X: cx + (x - y) * s * 0.87,
      Y: cy + (x + y) * s * 0.5 - z * s * 0.9 - 5 * s * 0.5 - 2 * s,
    });
    const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.pow(1 - u, 3));
    type Pt = ReturnType<typeof ISO>;
    const line = (a: Pt, b: Pt, st: string) => {
      ctx.strokeStyle = st;
      ctx.beginPath(); ctx.moveTo(a.X, a.Y); ctx.lineTo(b.X, b.Y); ctx.stroke();
    };

    // izometrik zemin ızgarası
    ctx.lineWidth = 1;
    const G = 11;
    for (let i = 0; i <= G; i++) {
      const fade = 0.1 - 0.05 * (Math.abs(i - G / 2) / (G / 2));
      line(ISO(i, 0, 0), ISO(i, G, 0), `rgba(255,255,255,${fade.toFixed(3)})`);
      line(ISO(0, i, 0), ISO(G, i, 0), `rgba(255,255,255,${fade.toFixed(3)})`);
    }

    // zeminde genişleyen etüt halkası
    const pr = ((t * 0.25 * speed) % 1) * 5;
    ctx.strokeStyle = rgba(accent, 0.25 * (1 - pr / 5));
    ctx.beginPath();
    for (let a = 0; a <= 64; a++) {
      const rad = (a / 64) * Math.PI * 2;
      const p = ISO(5.5 + pr * Math.cos(rad), 5.5 + pr * Math.sin(rad), 0);
      a === 0 ? ctx.moveTo(p.X, p.Y) : ctx.lineTo(p.X, p.Y);
    }
    ctx.stroke();

    // kesikli parsel sınırları
    ctx.setLineDash([4, 4]);
    yapilar.forEach((b) => {
      const m = 0.25;
      const c = [
        ISO(b.x - m, b.y - m, 0), ISO(b.x + b.w + m, b.y - m, 0),
        ISO(b.x + b.w + m, b.y + b.d + m, 0), ISO(b.x - m, b.y + b.d + m, 0),
      ];
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath(); ctx.moveTo(c[0].X, c[0].Y);
      c.forEach((p) => ctx.lineTo(p.X, p.Y));
      ctx.closePath(); ctx.stroke();
    });
    ctx.setLineDash([]);

    // binalar (arkadan öne)
    const etiketler: Array<{ b: Yapi; p: Pt }> = [];
    [...yapilar].sort((a, b) => a.x + a.y - (b.x + b.y)).forEach((b) => {
      const gh = b.h * ease((t * speed * 0.8 - b.delay) / 1.6);
      const c0 = ISO(b.x, b.y, 0), c1 = ISO(b.x + b.w, b.y, 0);
      const c2 = ISO(b.x + b.w, b.y + b.d, 0), c3 = ISO(b.x, b.y + b.d, 0);
      const t0 = ISO(b.x, b.y, gh), t1 = ISO(b.x + b.w, b.y, gh);
      const t2 = ISO(b.x + b.w, b.y + b.d, gh), t3 = ISO(b.x, b.y + b.d, gh);
      const dim = 'rgba(255,255,255,0.14)', lit = 'rgba(255,255,255,0.42)';
      line(c0, c1, dim); line(c1, c2, lit); line(c2, c3, lit); line(c3, c0, dim);
      if (gh > 0.02) {
        line(c0, t0, dim); line(c1, t1, lit); line(c2, t2, lit); line(c3, t3, lit);
        line(t0, t1, lit); line(t1, t2, lit); line(t2, t3, lit); line(t3, t0, lit);
        const katlar = Math.floor(gh / 0.45);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        for (let f = 1; f <= katlar; f++) {
          const z = f * 0.45;
          const a1 = ISO(b.x + b.w, b.y, z), a2 = ISO(b.x + b.w, b.y + b.d, z), a3 = ISO(b.x, b.y + b.d, z);
          ctx.beginPath(); ctx.moveTo(a1.X, a1.Y); ctx.lineTo(a2.X, a2.Y); ctx.lineTo(a3.X, a3.Y); ctx.stroke();
        }
        if (b.beacon && gh > b.h * 0.95) {
          const bk = 0.5 + 0.5 * Math.sin(t * 2.5 * speed);
          const bp = ISO(b.x + b.w / 2, b.y + b.d / 2, gh + 0.25);
          ctx.fillStyle = rgba(accent, 0.4 + 0.6 * bk);
          ctx.beginPath(); ctx.arc(bp.X, bp.Y, 2.2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = rgba(accent, 0.35 * (1 - bk));
          ctx.beginPath(); ctx.arc(bp.X, bp.Y, 4 + 6 * bk, 0, Math.PI * 2); ctx.stroke();
        }
      }
      if (b.label) etiketler.push({ b, p: ISO(b.x + b.w / 2, b.y + b.d / 2, Math.max(gh, 0.1)) });
    });

    // kulenin yanındaki vinç
    const kb = ISO(4.4, 3.6, 0), kt = ISO(4.4, 3.6, 6.2);
    line(kb, kt, 'rgba(255,255,255,0.30)');
    const ang = Math.sin(t * 0.3 * speed) * 0.5 + 0.4;
    const jx = 4.4 + 2.6 * Math.cos(ang), jy = 3.6 + 2.6 * Math.sin(ang);
    const je = ISO(jx, jy, 6.2), jc = ISO(4.4 - 0.9 * Math.cos(ang), 3.6 - 0.9 * Math.sin(ang), 6.2);
    line(jc, je, 'rgba(255,255,255,0.30)');
    line(jc, ISO(4.4, 3.6, 5.4), 'rgba(255,255,255,0.16)');
    line(je, ISO(4.4, 3.6, 5.4), 'rgba(255,255,255,0.16)');
    const hookZ = 3.4 + 1.6 * Math.sin(t * 0.45 * speed);
    const hk = ISO(jx, jy, hookZ);
    line(je, hk, rgba(accent, 0.5));
    ctx.fillStyle = rgba(accent, 0.9);
    ctx.fillRect(hk.X - 2.5, hk.Y - 2.5, 5, 5);

    // ön cephede ölçü çizgisi
    const d1 = ISO(1.2, 8.8, 0), d2 = ISO(9.8, 8.8, 0);
    line(d1, d2, 'rgba(255,255,255,0.18)');
    [d1, d2].forEach((p) => {
      ctx.beginPath(); ctx.moveTo(p.X - 4, p.Y - 4); ctx.lineTo(p.X + 4, p.Y + 4);
      ctx.strokeStyle = 'rgba(255,255,255,0.30)'; ctx.stroke();
    });
    ctx.font = '400 10px "JetBrains Mono Variable", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('İMAR SAHASI — 42.600 m²', (d1.X + d2.X) / 2, (d1.Y + d2.Y) / 2 + 10);

    // etiketler
    if (showLabels) {
      ctx.font = '500 11px "JetBrains Mono Variable", monospace';
      etiketler.forEach(({ b, p }, i) => {
        const sag = p.X >= cx;
        const ex = p.X + (sag ? 70 : -70), ey = p.Y - 34 - i * 6;
        ctx.strokeStyle = 'rgba(255,255,255,0.30)';
        ctx.beginPath(); ctx.moveTo(p.X, p.Y - 6); ctx.lineTo(ex, ey); ctx.lineTo(ex + (sag ? 14 : -14), ey); ctx.stroke();
        ctx.textAlign = sag ? 'left' : 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(accent, 0.95);
        ctx.fillText(b.label!, ex + (sag ? 20 : -20), ey);
        if (b.sub) {
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.fillText(b.sub, ex + (sag ? 20 : -20), ey + 15);
        }
      });
    }

    // köşe yazıları
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = '400 10px "JetBrains Mono Variable", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.fillText('// ARSA TEMİNİNDEN ANAHTAR TESLİME', 28, h - 28);
    ctx.textAlign = 'right';
    ctx.fillText('ÖLÇEK 1:500', w - 28, h - 28);
  };

  let raf = 0;
  let t0: number | null = null; // ilk görünürlükte başlar: binalar izleyicinin gözü önünde yükselir
  const hareketli = !reduced();
  const loop = (now: number) => {
    if (t0 === null) t0 = now;
    draw((now - t0) / 1000);
    raf = requestAnimationFrame(loop);
  };
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
  const ro = new ResizeObserver(() => draw(hareketli && t0 !== null ? (performance.now() - t0) / 1000 : 30));
  ro.observe(cv.parentElement!);
  draw(hareketli ? 0 : 30);
  signal.addEventListener('abort', () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
  });
}

/* ---------- Akıllı kent görseli (teknoloji kartı arka planı) ----------
   Tasarım handoff'undaki şehir haritası bileşeninin vanilla portu:
   sokak ızgarası, akan trafik, veri hub'ı, radar taraması ve yayın antenleri. */
function initAkilliKent(signal: AbortSignal) {
  const cv = document.querySelector<HTMLCanvasElement>('[data-gorsel="kent"]');
  if (!cv) return;
  const accent = '#D8C39A';
  const speed = 1;

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
    const S = Math.min(genis ? w * 0.5 : w, h) * 0.72;
    const ox = (genis ? w * 0.64 : w / 2) - S / 2;
    const oy = (h - S) / 2;
    const M = (u: number, v: number) => ({ X: ox + u * S, Y: oy + v * S });
    type Pt = ReturnType<typeof M>;

    // düzensiz sokak ızgarası
    const xs = [0, 0.16, 0.34, 0.5, 0.68, 0.84, 1];
    const ys = [0, 0.18, 0.36, 0.55, 0.72, 0.88, 1];
    ctx.lineWidth = 1;
    xs.forEach((u) => {
      const a = M(u, 0), b = M(u, 1);
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath(); ctx.moveTo(a.X, a.Y); ctx.lineTo(b.X, b.Y); ctx.stroke();
    });
    ys.forEach((v) => {
      const a = M(0, v), b = M(1, v);
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath(); ctx.moveTo(a.X, a.Y); ctx.lineTo(b.X, b.Y); ctx.stroke();
    });
    // şehir adaları; bazıları "ışıklı"
    const isikli = [[1, 1], [3, 2], [2, 4], [4, 3], [1, 3], [4, 0], [0, 2], [5, 4]];
    for (let i = 0; i < xs.length - 1; i++) {
      for (let j = 0; j < ys.length - 1; j++) {
        const p = 0.012;
        const a = M(xs[i] + p, ys[j] + p), b = M(xs[i + 1] - p, ys[j + 1] - p);
        const acik = isikli.some((l) => l[0] === i && l[1] === j);
        ctx.strokeStyle = `rgba(255,255,255,${acik ? 0.16 : 0.05})`;
        ctx.strokeRect(a.X, a.Y, b.X - a.X, b.Y - a.Y);
        if (acik) {
          ctx.fillStyle = 'rgba(255,255,255,0.02)';
          ctx.fillRect(a.X, a.Y, b.X - a.X, b.Y - a.Y);
        }
      }
    }

    // sokaklarda akan trafik darbeleri (L rotalar)
    const rotalar: number[][][] = [
      [[0.16, 0], [0.16, 0.55], [0.68, 0.55], [0.68, 1]],
      [[0, 0.36], [0.5, 0.36], [0.5, 0.88], [1, 0.88]],
      [[1, 0.18], [0.34, 0.18], [0.34, 0.72], [0, 0.72]],
      [[0.84, 1], [0.84, 0.36], [0.16, 0.36]],
      [[0, 0.55], [0.34, 0.55], [0.34, 0.18]],
    ];
    rotalar.forEach((r, ri) => {
      const segs: number[] = [];
      let total = 0;
      for (let i = 1; i < r.length; i++) {
        const L = Math.hypot(r[i][0] - r[i - 1][0], r[i][1] - r[i - 1][1]);
        segs.push(L); total += L;
      }
      const ph = (t * 0.07 * speed + ri * 0.23) % 1;
      let d = ph * total, k = 0;
      while (k < segs.length && d > segs[k]) { d -= segs[k]; k++; }
      if (k >= segs.length) k = segs.length - 1;
      const u0 = r[k], u1 = r[k + 1], f = segs[k] ? d / segs[k] : 0;
      const bas = M(u0[0] + (u1[0] - u0[0]) * f, u0[1] + (u1[1] - u0[1]) * f);
      const geri = (bd: number): Pt | null => {
        let dd = ph * total - bd;
        if (dd < 0) return null;
        let kk = 0, rem = dd;
        while (kk < segs.length && rem > segs[kk]) { rem -= segs[kk]; kk++; }
        if (kk >= segs.length) return null;
        const a = r[kk], b = r[kk + 1], ff = segs[kk] ? rem / segs[kk] : 0;
        return M(a[0] + (b[0] - a[0]) * ff, a[1] + (b[1] - a[1]) * ff);
      };
      let onceki = bas;
      for (let q = 1; q <= 6; q++) {
        const p = geri(q * 0.012);
        if (!p) break;
        ctx.strokeStyle = rgba(accent, 0.5 * (1 - q / 7));
        ctx.beginPath(); ctx.moveTo(onceki.X, onceki.Y); ctx.lineTo(p.X, p.Y); ctx.stroke();
        onceki = p;
      }
      ctx.fillStyle = rgba(accent, 0.95);
      ctx.beginPath(); ctx.arc(bas.X, bas.Y, 2, 0, Math.PI * 2); ctx.fill();
    });

    // kavşaklardaki sensörler
    const sensorler = [[0.16, 0.18], [0.5, 0.55], [0.84, 0.36], [0.34, 0.72], [0.68, 0.18], [0.16, 0.88]];
    sensorler.forEach((sn) => {
      const p = M(sn[0], sn[1]);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.arc(p.X, p.Y, 1.8, 0, Math.PI * 2); ctx.fill();
    });

    // HUB: akıllı kent bilgi yönetimi — genişleyen veri halkaları
    const hub = M(0.5, 0.55);
    ctx.strokeStyle = rgba(accent, 0.8);
    ctx.beginPath(); ctx.arc(hub.X, hub.Y, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = rgba(accent, 0.9);
    ctx.beginPath(); ctx.arc(hub.X, hub.Y, 2, 0, Math.PI * 2); ctx.fill();
    for (let k = 0; k < 3; k++) {
      const ph = (t * 0.22 * speed + k / 3) % 1;
      ctx.strokeStyle = rgba(accent, 0.3 * (1 - ph));
      ctx.beginPath(); ctx.arc(hub.X, hub.Y, 8 + ph * S * 0.13, 0, Math.PI * 2); ctx.stroke();
    }
    // hub → sensör kesikli veri bağlantıları
    ctx.setLineDash([2, 5]);
    sensorler.forEach((sn) => {
      const p = M(sn[0], sn[1]);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.moveTo(hub.X, hub.Y); ctx.lineTo(p.X, p.Y); ctx.stroke();
    });
    ctx.setLineDash([]);

    // RADAR: trafik & güvenlik — dönen tarama
    const rad = M(0.84, 0.18), rr = S * 0.11;
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.arc(rad.X, rad.Y, rr, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.arc(rad.X, rad.Y, rr * 0.6, 0, Math.PI * 2); ctx.stroke();
    const sa = t * 0.9 * speed;
    for (let q = 0; q < 18; q++) {
      const a = sa - q * 0.035;
      ctx.strokeStyle = rgba(accent, 0.35 * (1 - q / 18));
      ctx.beginPath(); ctx.moveTo(rad.X, rad.Y);
      ctx.lineTo(rad.X + rr * Math.cos(a), rad.Y + rr * Math.sin(a)); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(rad.X, rad.Y, 1.8, 0, Math.PI * 2); ctx.fill();
    const bl = { X: rad.X + rr * 0.55 * Math.cos(1.1), Y: rad.Y + rr * 0.55 * Math.sin(1.1) };
    const blA = Math.max(0, Math.cos((sa - 1.1) % (Math.PI * 2)));
    ctx.fillStyle = rgba(accent, 0.9 * blA);
    ctx.beginPath(); ctx.arc(bl.X, bl.Y, 2, 0, Math.PI * 2); ctx.fill();

    // YAYIN: bilişim & medya — sinyal yayları
    const bc = M(0.16, 0.72);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(bc.X, bc.Y, 2, 0, Math.PI * 2); ctx.fill();
    for (let k = 1; k <= 3; k++) {
      const ph = (t * 0.5 * speed + k * 0.33) % 1;
      const al = 0.45 * (1 - ph) * Math.min(1, k);
      ctx.strokeStyle = rgba(accent, al);
      ctx.beginPath(); ctx.arc(bc.X, bc.Y, 6 + (k + ph) * 9, -Math.PI * 0.65, -Math.PI * 0.1); ctx.stroke();
      ctx.beginPath(); ctx.arc(bc.X, bc.Y, 6 + (k + ph) * 9, Math.PI * 0.35, Math.PI * 0.9); ctx.stroke();
    }

    // etiketler
    if (showLabels) {
      ctx.font = '500 11px "JetBrains Mono Variable", monospace';
      const yaz = (p: Pt, txt: string, alt: string, dx: number, dy: number) => {
        const ex = p.X + dx, ey = p.Y + dy, sag = dx >= 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.30)';
        ctx.beginPath(); ctx.moveTo(p.X, p.Y); ctx.lineTo(ex, ey); ctx.lineTo(ex + (sag ? 14 : -14), ey); ctx.stroke();
        ctx.textAlign = sag ? 'left' : 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(accent, 0.95);
        ctx.fillText(txt, ex + (sag ? 20 : -20), ey);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText(alt, ex + (sag ? 20 : -20), ey + 15);
      };
      yaz(hub, 'AKILLI KENT BİLGİ YÖNETİMİ', 'VERİ MERKEZİ · CANLI', 64, 52);
      yaz({ X: rad.X + rr * 0.7, Y: rad.Y - rr * 0.7 }, 'TRAFİK & GÜVENLİK ÇÖZÜMLERİ', 'İZLEME AĞI · 7/24', 40, -34);
      yaz(bc, 'BİLİŞİM & MEDYA', 'YAYIN ALTYAPISI', -52, 44);
    }

    // köşe yazıları
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = '400 10px "JetBrains Mono Variable", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.fillText('// ŞEHRİN DİJİTAL KATMANI', 28, h - 28);
    ctx.textAlign = 'right';
    ctx.fillText('AĞ DURUMU — CANLI', w - 28, h - 28);
  };

  let raf = 0;
  const t0 = performance.now();
  const hareketli = !reduced();
  const loop = (now: number) => {
    draw((now - t0) / 1000);
    raf = requestAnimationFrame(loop);
  };
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
  const ro = new ResizeObserver(() => draw(hareketli ? (performance.now() - t0) / 1000 : 25));
  ro.observe(cv.parentElement!);
  draw(hareketli ? 0 : 25);
  signal.addEventListener('abort', () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
  });
}

/* ---------- Ticaret & hukuk görseli (ticaret kartı arka planı) ----------
   Tasarım handoff'undaki ticaret koridoru bileşeninin vanilla portu:
   ihracat/ithalat hatları, hukuk mührü (§) ve finansal risk göstergesi. */
function initTicaret(signal: AbortSignal) {
  const cv = document.querySelector<HTMLCanvasElement>('[data-gorsel="ticaret"]');
  if (!cv) return;
  const accent = '#D8C39A';
  const speed = 1;

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
    // Geniş ekranda koridor kartın sağ yarısında akar; kart metni solda kalır
    const wx = genis ? w * 0.42 : 0;
    const ww = genis ? w * 0.56 : w;
    const cx = wx + ww / 2;
    const laneTop = h * 0.18, laneBot = h * 0.62;
    const Lx = wx + ww * 0.14, Rx = wx + ww * 0.86;

    const ihracat = ['İSTANBUL', 'İZMİR', 'MERSİN'];
    const ithalat = ['ROTTERDAM', 'SİNGAPUR', 'NEW YORK'];
    const py = (i: number) => laneTop + (laneBot - laneTop) * (i / 2);

    const Q = (x0: number, y0: number, x1: number, y1: number, u: number) => {
      const mx = cx, my = (y0 + y1) / 2 - h * 0.1;
      const a = 1 - u;
      return {
        X: a * a * x0 + 2 * a * u * mx + u * u * x1,
        Y: a * a * y0 + 2 * a * u * my + u * u * y1,
      };
    };

    // merkez hukuki kontrol hattı
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 6]);
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.beginPath(); ctx.moveTo(cx, h * 0.08); ctx.lineTo(cx, h * 0.86); ctx.stroke();
    ctx.setLineDash([]);

    // hatlar
    const hatlar: Array<[number, number]> = [[0, 1], [1, 0], [2, 2], [0, 2], [2, 0]];
    hatlar.forEach((ln) => {
      const y0 = py(ln[0]), y1 = py(ln[1]);
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath();
      for (let s = 0; s <= 48; s++) {
        const p = Q(Lx, y0, Rx, y1, s / 48);
        s === 0 ? ctx.moveTo(p.X, p.Y) : ctx.lineTo(p.X, p.Y);
      }
      ctx.stroke();
    });
    // hareketli darbeler: ihracat (aksan, →) ve ithalat (beyaz, ←)
    hatlar.forEach((ln, i) => {
      const y0 = py(ln[0]), y1 = py(ln[1]);
      const disa = i % 2 === 0;
      const ph = (t * 0.08 * speed + i * 0.19) % 1;
      const u = disa ? ph : 1 - ph;
      const bas = Q(Lx, y0, Rx, y1, u);
      for (let q = 1; q <= 7; q++) {
        const ub = disa ? u - q * 0.012 : u + q * 0.012;
        if (ub < 0 || ub > 1) break;
        const p0 = Q(Lx, y0, Rx, y1, ub);
        const p1 = Q(Lx, y0, Rx, y1, disa ? ub + 0.012 : ub - 0.012);
        ctx.strokeStyle = disa
          ? rgba(accent, 0.5 * (1 - q / 8))
          : `rgba(255,255,255,${(0.4 * (1 - q / 8)).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(p0.X, p0.Y); ctx.lineTo(p1.X, p1.Y); ctx.stroke();
      }
      ctx.fillStyle = disa ? rgba(accent, 0.95) : 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(bas.X, bas.Y, 2, 0, Math.PI * 2); ctx.fill();
    });

    // liman düğümleri + adlar
    ctx.font = '400 10px "JetBrains Mono Variable", monospace';
    ctx.textBaseline = 'middle';
    ihracat.forEach((n, i) => {
      const y = py(i);
      ctx.fillStyle = rgba(accent, 0.9);
      ctx.beginPath(); ctx.arc(Lx, y, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.20)';
      ctx.beginPath(); ctx.arc(Lx, y, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.textAlign = 'right';
      ctx.fillText(n, Lx - 16, y);
    });
    ithalat.forEach((n, i) => {
      const y = py(i);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath(); ctx.arc(Rx, y, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.20)';
      ctx.beginPath(); ctx.arc(Rx, y, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.textAlign = 'left';
      ctx.fillText(n, Rx + 16, y);
    });

    // kontrol noktasındaki hukuk mührü (dönen tik halkası + §)
    const sy = h * 0.3, sr = Math.min(ww, h) * 0.055;
    ctx.strokeStyle = 'rgba(255,255,255,0.30)';
    ctx.beginPath(); ctx.arc(cx, sy, sr, 0, Math.PI * 2); ctx.stroke();
    const ra = t * 0.25 * speed;
    for (let k = 0; k < 24; k++) {
      const a = ra + (k / 24) * Math.PI * 2;
      const r1 = sr + 4, r2 = sr + (k % 6 === 0 ? 11 : 7);
      ctx.strokeStyle = `rgba(255,255,255,${k % 6 === 0 ? 0.3 : 0.14})`;
      ctx.beginPath();
      ctx.moveTo(cx + r1 * Math.cos(a), sy + r1 * Math.sin(a));
      ctx.lineTo(cx + r2 * Math.cos(a), sy + r2 * Math.sin(a));
      ctx.stroke();
    }
    ctx.strokeStyle = rgba(accent, 0.5);
    ctx.beginPath(); ctx.arc(cx, sy, sr * 0.62, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = rgba(accent, 0.95);
    ctx.font = `500 ${Math.round(sr * 0.7)}px "JetBrains Mono Variable", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('§', cx, sy + 1);

    // risk göstergesi (alt merkez)
    const gy = h * 0.8, gr = Math.min(ww, h) * 0.085;
    for (let k = 0; k <= 28; k++) {
      const a = Math.PI + (k / 28) * Math.PI;
      const bolge = k / 28;
      const r1 = gr - (k % 7 === 0 ? 10 : 6), r2 = gr;
      ctx.strokeStyle = bolge < 0.5
        ? rgba(accent, 0.2 + 0.25 * (k % 7 === 0 ? 1 : 0))
        : `rgba(255,255,255,${k % 7 === 0 ? 0.3 : 0.12})`;
      ctx.beginPath();
      ctx.moveTo(cx + r1 * Math.cos(a), gy + r1 * Math.sin(a));
      ctx.lineTo(cx + r2 * Math.cos(a), gy + r2 * Math.sin(a));
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.arc(cx, gy, gr, Math.PI, Math.PI * 2); ctx.stroke();
    // ibre kontrollü bölgede, hafif nefes alır
    const na = Math.PI + Math.PI * (0.3 + 0.06 * Math.sin(t * 0.7 * speed));
    ctx.strokeStyle = rgba(accent, 0.9);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, gy);
    ctx.lineTo(cx + (gr - 14) * Math.cos(na), gy + (gr - 14) * Math.sin(na)); ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = rgba(accent, 0.9);
    ctx.beginPath(); ctx.arc(cx, gy, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = '400 10px "JetBrains Mono Variable", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('RİSK — KONTROL ALTINDA', cx, gy + 12);

    // etiketler
    if (showLabels) {
      ctx.font = '500 11px "JetBrains Mono Variable", monospace';
      ctx.textBaseline = 'middle';
      const yaz = (p: { X: number; Y: number }, txt: string, alt: string, dx: number, dy: number) => {
        const ex = p.X + dx, ey = p.Y + dy, sag = dx >= 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.30)';
        ctx.beginPath(); ctx.moveTo(p.X, p.Y); ctx.lineTo(ex, ey); ctx.lineTo(ex + (sag ? 14 : -14), ey); ctx.stroke();
        ctx.textAlign = sag ? 'left' : 'right';
        ctx.fillStyle = rgba(accent, 0.95);
        ctx.fillText(txt, ex + (sag ? 20 : -20), ey);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText(alt, ex + (sag ? 20 : -20), ey + 15);
      };
      const orta = Q(Lx, py(0), Rx, py(2), 0.3);
      yaz(orta, 'İTHALAT & İHRACAT', 'AKTİF KORİDOR · ÇİFT YÖN', -46, -40);
      yaz({ X: cx + sr + 8, Y: sy - sr * 0.5 }, 'SÖZLEŞME HUKUKU DANIŞMANLIĞI', 'HER GEÇİŞTE HUKUKİ GÜVENCE', 52, -26);
      yaz({ X: cx + gr * 0.75, Y: gy - gr * 0.55 }, 'FİNANSAL RİSK ANALİZİ', 'SÜREKLİ İZLEME', 56, -18);
    }

    // köşe yazıları
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = '400 10px "JetBrains Mono Variable", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.fillText('// KÜRESEL TİCARET KORİDORU', 28, h - 28);
    ctx.textAlign = 'right';
    ctx.fillText('İHRACAT → / ← İTHALAT', w - 28, h - 28);
  };

  let raf = 0;
  const t0 = performance.now();
  const hareketli = !reduced();
  const loop = (now: number) => {
    draw((now - t0) / 1000);
    raf = requestAnimationFrame(loop);
  };
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
  const ro = new ResizeObserver(() => draw(hareketli ? (performance.now() - t0) / 1000 : 25));
  ro.observe(cv.parentElement!);
  draw(hareketli ? 0 : 25);
  signal.addEventListener('abort', () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
  });
}

/* ---------- Hero mızrak görseli (anasayfa hero arka planı) ----------
   Tasarım handoff'undaki "Hero Slider" bileşeninin vanilla portu:
   warp yıldız tarlası, enerji kuyruğu ve uçan Ares mızrağı. */
function initMizrak(signal: AbortSignal) {
  const cv = document.querySelector<HTMLCanvasElement>('[data-gorsel="mizrak"]');
  if (!cv) return;
  const accent = '#D8C39A';
  const speed = 1;

  const rgba = (hex: string, a: number) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
  };
  const rnd = (i: number) => Math.abs(Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1;

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

    const T = t * speed;
    // mızrak sağ üçte birlik alanda süzülür, hafif salınım yapar
    const sx = w * (w > 860 ? 0.64 : 0.5) + Math.sin(T * 0.9) * w * 0.012;
    const sy = h * 0.52 + Math.sin(T * 1.7) * h * 0.02 + Math.cos(T * 0.6) * h * 0.012;
    const tiltA = Math.sin(T * 1.1) * 0.035;
    const cosA = Math.cos(tiltA), sinA = Math.sin(tiltA);
    const R = (x: number, y: number) => ({ X: sx + x * cosA - y * sinA, Y: sy + x * sinA + y * cosA });
    const U = Math.min(w, h) / 900;

    // warp yıldız tarlası: geriye akan çizgiler
    for (let i = 0; i < 90; i++) {
      const seed = rnd(i);
      const lane = rnd(i + 50) * h;
      const depth = 0.25 + seed * 0.75;
      const vel = (0.35 + seed) * w * 0.5 * depth;
      const px = w - ((seed * w * 3 + T * vel) % (w * 1.3)) + w * 0.15;
      const len = vel * 0.06 * (0.5 + depth);
      const dy = (lane - sy) * 0.06 * depth;
      const al = 0.04 + 0.2 * depth;
      ctx.strokeStyle = `rgba(255,255,255,${al.toFixed(3)})`;
      ctx.lineWidth = depth > 0.8 ? 1.4 : 1;
      ctx.beginPath(); ctx.moveTo(px, lane); ctx.lineTo(px + len, lane - dy * 0.2); ctx.stroke();
    }
    ctx.lineWidth = 1;

    // mızrağın yanından geriye süpürülen şok halkaları
    for (let k = 0; k < 3; k++) {
      const ph = (T * 0.5 + k / 3) % 1;
      const rx = sx + 120 * U - ph * w * 0.9;
      const rr = (30 + ph * 340) * U;
      ctx.strokeStyle = rgba(accent, 0.22 * (1 - ph));
      ctx.beginPath(); ctx.ellipse(rx, sy, rr * 0.28, rr, 0, 0, Math.PI * 2); ctx.stroke();
    }

    // enerji kuyruğu: türbülanslı şeritler
    const tail = 620 * U;
    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      for (let s = 0; s <= 60; s++) {
        const u = s / 60;
        const x = -u * tail;
        const amp = (4 + 46 * u * u) * U;
        const y = Math.sin(u * 14 - T * 10 + r * 2.1) * amp * (0.5 + 0.5 * rnd(r * 7 + s));
        const p = R(x, y);
        s === 0 ? ctx.moveTo(p.X, p.Y) : ctx.lineTo(p.X, p.Y);
      }
      ctx.strokeStyle = rgba(accent, 0.3 - r * 0.09);
      ctx.stroke();
    }
    // kuyruk kıvılcımları
    for (let i = 0; i < 26; i++) {
      const ph = (rnd(i + 9) + T * (0.6 + rnd(i) * 0.8)) % 1;
      const x = -ph * tail;
      const y = (rnd(i + 31) - 0.5) * 110 * U * (0.3 + ph);
      const p = R(x, y);
      ctx.fillStyle = rgba(accent, 0.85 * (1 - ph));
      const sz = 1 + 1.6 * (1 - ph);
      ctx.fillRect(p.X - sz / 2, p.Y - sz / 2, sz, sz);
    }

    // MIZRAK
    const shaft = 300 * U, headL = 92 * U, headW = 26 * U;
    // gövde: metalik çift çizgi
    let a = R(-shaft, 0), b = R(0, 0);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.moveTo(a.X, a.Y); ctx.lineTo(b.X, b.Y); ctx.stroke();
    ctx.lineWidth = 1;
    a = R(-shaft, -2.5 * U); b = R(-headL * 0.2, -2.5 * U);
    ctx.strokeStyle = 'rgba(255,255,255,0.30)';
    ctx.beginPath(); ctx.moveTo(a.X, a.Y); ctx.lineTo(b.X, b.Y); ctx.stroke();
    // kabza sargıları
    for (let g = 0; g < 4; g++) {
      const gx = -shaft * (0.45 + g * 0.09);
      const g1 = R(gx, -4 * U), g2 = R(gx + 6 * U, 4 * U);
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath(); ctx.moveTo(g1.X, g1.Y); ctx.lineTo(g2.X, g2.Y); ctx.stroke();
    }
    // dip sivri ucu
    const bt1 = R(-shaft, 0), bt2 = R(-shaft - 26 * U, 0);
    ctx.strokeStyle = rgba(accent, 0.7);
    ctx.beginPath(); ctx.moveTo(bt1.X, bt1.Y); ctx.lineTo(bt2.X, bt2.Y); ctx.stroke();
    // siperlik
    const cg1 = R(-headL * 0.1, -16 * U), cg2 = R(-headL * 0.1, 16 * U);
    ctx.lineWidth = 2;
    ctx.strokeStyle = rgba(accent, 0.9);
    ctx.beginPath(); ctx.moveTo(cg1.X, cg1.Y); ctx.lineTo(cg2.X, cg2.Y); ctx.stroke();
    // uç (dolgulu bıçak)
    const tip = R(headL, 0), w1 = R(0, -headW / 2), w2 = R(0, headW / 2), nk = R(headL * 0.18, 0);
    const grad = ctx.createLinearGradient(w1.X, w1.Y, tip.X, tip.Y);
    grad.addColorStop(0, rgba(accent, 0.25));
    grad.addColorStop(1, rgba(accent, 0.95));
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.moveTo(w1.X, w1.Y); ctx.lineTo(tip.X, tip.Y); ctx.lineTo(w2.X, w2.Y); ctx.lineTo(nk.X, nk.Y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgba(accent, 1);
    ctx.stroke();
    ctx.lineWidth = 1;
    // bıçak orta çizgisi parlaması
    const gl = 0.5 + 0.5 * Math.sin(T * 5);
    const glA = R(headL * (0.2 + 0.5 * gl), 0);
    ctx.strokeStyle = `rgba(255,255,255,${(0.5 + 0.4 * gl).toFixed(3)})`;
    ctx.beginPath(); ctx.moveTo(nk.X, nk.Y); ctx.lineTo(glA.X, glA.Y); ctx.stroke();

    // uç önünde sıkışan şok yayları
    for (let k = 0; k < 4; k++) {
      const ph = (T * 1.6 + k / 4) % 1;
      const d = (14 + ph * 90) * U;
      const p = R(headL + d, 0);
      const rr = (10 + ph * 60) * U;
      ctx.strokeStyle = rgba(accent, 0.5 * (1 - ph));
      ctx.beginPath();
      ctx.arc(p.X, p.Y, rr, Math.PI * 0.62 + tiltA, Math.PI * 1.38 + tiltA);
      ctx.stroke();
    }
    // uç parlaması
    const fl = 0.6 + 0.4 * Math.sin(T * 7);
    ctx.fillStyle = `rgba(255,255,255,${(0.75 * fl).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(tip.X, tip.Y, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.5 * fl);
    ctx.beginPath(); ctx.arc(tip.X, tip.Y, 7 + 5 * fl, 0, Math.PI * 2); ctx.stroke();

    // HUD yazıları
    if (w > 560) {
      ctx.font = '400 10px "JetBrains Mono Variable", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('// ARES — İLERİ HAREKET', 28, h - 28);
      ctx.textAlign = 'right';
      const vel = (24.6 + Math.sin(T * 1.3) * 0.35).toFixed(2);
      ctx.fillText('HIZ ' + vel + ' AU/S — ROTA SABİT', w - 28, h - 28);
    }
  };

  let raf = 0;
  const t0 = performance.now();
  const hareketli = !reduced();
  const loop = (now: number) => {
    draw((now - t0) / 1000);
    raf = requestAnimationFrame(loop);
  };
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
  const ro = new ResizeObserver(() => draw(hareketli ? (performance.now() - t0) / 1000 : 40));
  ro.observe(cv.parentElement!);
  draw(hareketli ? 0 : 40);
  signal.addEventListener('abort', () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
  });
}

/* ---------- Hero arka plan videosu (YouTube embed) ----------
   Hareket azaltmada video kaldırılır (statik zemin kalır); perde
   hero'yu örtünce video duraklatılır, geri dönünce sürdürülür. */
function initHeroVideo(signal: AbortSignal) {
  const wrap = document.querySelector<HTMLElement>('.hero__video-wrap');
  if (!wrap) return;
  if (reduced()) {
    wrap.remove();
    return;
  }
  const iframe = wrap.querySelector<HTMLIFrameElement>('iframe');
  if (!iframe) return;
  const komut = (func: string) =>
    iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
  let durdu = false;
  window.addEventListener(
    'scroll',
    () => {
      const gecti = window.scrollY > window.innerHeight;
      if (gecti && !durdu) {
        komut('pauseVideo');
        durdu = true;
      } else if (!gecti && durdu) {
        komut('playVideo');
        durdu = false;
      }
    },
    { passive: true, signal }
  );
}

/* ---------- Yaşam döngüsü ---------- */
function initPage() {
  ac = new AbortController();
  const { signal } = ac;

  initNav(signal);
  initTicker(signal);
  initForm(signal);
  initHeroVideo(signal);
  initGlobe(signal); // hareket azaltmada tek statik kare çizer
  initInsaat(signal);
  initAkilliKent(signal);
  initTicaret(signal);
  initMizrak(signal);

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
