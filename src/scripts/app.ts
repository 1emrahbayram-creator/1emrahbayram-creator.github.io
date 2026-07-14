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

/* ---------- Yaşam döngüsü ---------- */
function initPage() {
  ac = new AbortController();
  const { signal } = ac;

  initNav(signal);
  initTicker(signal);
  initForm(signal);

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
