/* NOEL STUDIO — JavaScript compartido por todas las páginas.
   Sacado del index el 23-ago-2026 (reestructura a 5 páginas).
   Debe tolerar que en una página falten secciones: todo acceso al DOM va con guarda. */

// CURSOR — solo en equipos con mouse fino (no en celular/tablet).
// Así, si esto no corre, el visitante conserva el cursor normal del sistema.
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (finePointer) {
  document.documentElement.classList.add('custom-cursor');
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  function animFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(animFollower);
  }
  animFollower();

  document.querySelectorAll('a, button, .service-item, .portfolio-item, .pricing-card').forEach(el => {
    el.addEventListener('mouseenter', () => follower.classList.add('hover'));
    el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
  });
}

// PRELOADER — barra de carga rápida con la marca. JS vanilla, NO depende de GSAP:
// se quita siempre (incluso si GSAP falla) gracias al failsafe. No bloquea el render.
(function(){
  const pre = document.getElementById('preload');
  if (!pre) return;
  const bar = document.getElementById('plBar');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finish = () => pre.classList.add('done');
  if (reduce) { if (bar) bar.style.width = '100%'; setTimeout(finish, 350); return; }
  let p = 0;
  const t = setInterval(() => {
    p = Math.min(100, p + Math.random() * 28);
    if (bar) bar.style.width = p + '%';
    if (p >= 100) { clearInterval(t); setTimeout(finish, 250); }
  }, 120);
  // failsafe: nunca dejar el preloader pegado en pantalla
  setTimeout(() => { clearInterval(t); finish(); }, 2600);
})();

// ANIMACIONES GSAP — corren SOLO si GSAP cargó (ahora viene con defer, por eso
// las envolvemos y esperamos a DOMContentLoaded). Si GSAP no carga, nada de esto
// se ejecuta y TODO el contenido queda visible (robustez).
function initGsapAnimations() {
  if (!window.gsap) return;
  document.documentElement.classList.add('has-gsap');
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // TEXTOS POR LÍNEAS (SplitText) — los párrafos de cuerpo se revelan línea por línea
  // al hacer scroll. Solo aplica a TEXTOS (no a los títulos, que ya tienen su efecto cortina).
  // Robusto: si SplitText no cargó, los párrafos quedan visibles tal cual.
  if (window.SplitText && !reduceMotion) {
    document.querySelectorAll('.section-desc').forEach(el => {
      // Le quitamos el reveal genérico para que no choque con la animación por líneas.
      el.classList.remove('reveal');
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,            // re-divide las líneas si cambia el ancho (responsive)
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 110,
          opacity: 0,
          duration: 0.5,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        })
      });
    });
  }

  // TEXTO QUE SE ILUMINA AL SCROLL (estilo Midu) — las palabras pasan de gris tenue
  // a blanco mientras el cliente las LEE al bajar. Premium y con propósito (engancha la lectura).
  // Robusto: si SplitText/GSAP no cargan, el texto queda visible y blanco normal.
  if (window.SplitText && !reduceMotion) {
    document.querySelectorAll('.about-body p').forEach(el => {
      el.classList.remove('reveal');
      const split = SplitText.create(el, { type: 'words' });
      gsap.fromTo(split.words,
        { opacity: 0.2 },
        { opacity: 1, ease: 'none', stagger: 0.06,
          scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 60%', scrub: 0.6 }
        }
      );
    });
  }

  // Scroll NATIVO (sin Lenis): aprovecha los 120Hz del Mac (ProMotion) y se siente más fluido.
  // El desplazamiento a las secciones lo maneja el CSS (scroll-behavior + scroll-padding-top).

  // INTRO DEL HERO — secuencia en 2 tiempos:
  //   1) Las letras NOEL STUDIO aparecen desvanecidas y borrosas, y se vuelven nítidas y potentes.
  //   2) Cuando las letras ya están firmes, entra TODO lo demás del hero (etiqueta, subtítulo, logo, redes).
  // Usamos fromTo porque el estado inicial (opacity 0) ya viene del CSS .has-gsap.
  if (reduceMotion) {
    gsap.set('.hero-title .line span, #heroTag, #heroSub, .hero-social', { opacity: 1 });
  } else {
    // delay ~1s: deja que el preloader termine de desvanecerse antes de la intro,
    // así el usuario sí ve aparecer las letras (no quedan ocultas tras el preloader).
    const heroIntro = gsap.timeline({ delay: 1.0, defaults: { ease: 'power3.out' } });
    heroIntro
      .fromTo('.hero-title .line span',
        { opacity: 0, filter: 'blur(20px)', scale: 1.06 },
        { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' }
      )
      .fromTo(['#heroTag', '#heroSub', '.hero-social'],
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05 },
        '-=0.2'  // el resto entra apenas las letras quedan firmes (más ágil)
      );
  }

  // SCROLL REVEALS (con cascada: los hermanos entran escalonados, no todos de golpe)
  // El retraso se CORTA a 0.24s. Antes crecía sin límite: en la lista de servicios,
  // que ahora trae 10, el último tardaba 0.72s en aparecer y se sentía lento y flojo.
  // La cascada es adorno; en cuanto se nota la espera, dejó de sumar.
  const RETRASO_MAX = 0.24;
  document.querySelectorAll('.reveal').forEach(el => {
    const siblings = [...el.parentElement.querySelectorAll(':scope > .reveal')];
    const i = siblings.indexOf(el);
    const delay = i > 0 ? Math.min(i * 0.06, RETRASO_MAX) : 0;
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', delay,
      scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' }
    });
  });

  // PORTAFOLIO HORIZONTAL — "pin": la sección se queda fija y, mientras bajas, las
  // tarjetas se recorren de lado. Antes esto dejaba las tarjetas flotando encima de otras
  // secciones porque la distancia se calculaba UNA sola vez, antes de que cargaran fuentes,
  // imágenes y videos. Ahora:
  //   · la distancia se calcula con funciones (start/end/x) → GSAP la vuelve a pedir,
  //   · invalidateOnRefresh: true → se recalcula en cada refresh (load, fuentes, resize),
  //   · gsap.matchMedia → en celular ni se monta y se limpia solo al cambiar de tamaño.
  const galPin = document.querySelector('.horiz-gallery');
  const trackPin = galPin && galPin.querySelector('.horiz-track');
  if (galPin && trackPin && !reduceMotion) {
    gsap.matchMedia().add('(min-width: 769px)', () => {
      galPin.classList.add('is-pinned');
      galPin.scrollLeft = 0;                       // sale del scroll nativo en cero
      const distancia = () => Math.max(0, trackPin.scrollWidth - galPin.clientWidth);

      const tw = gsap.to(trackPin, {
        x: () => -distancia(),
        ease: 'none',
        scrollTrigger: {
          trigger: galPin,
          start: 'center center',                  // se ancla cuando la tira queda centrada
          end: () => '+=' + distancia(),           // baja tanto como falte por recorrer
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });

      // Limpieza si el visitante achica la ventana a tamaño celular.
      return () => {
        galPin.classList.remove('is-pinned');
        if (tw.scrollTrigger) tw.scrollTrigger.kill(true);
        tw.kill();
        gsap.set(trackPin, { clearProps: 'transform' });
      };
    });
  }

  // Al cargar las fuentes web, las imágenes y los videos, el alto de las secciones cambia.
  // Refrescamos las animaciones de scroll cuando el layout ya se estabilizó.
  const refreshST = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshST);
  window.addEventListener('load', refreshST);

  // LINE-MASK — títulos que se "dibujan" de izquierda a derecha (efecto cortina).
  // Revisamos la posición en cada scroll (confiable en TODO celular; nunca se queda sin animar).
  const lmItems = [...document.querySelectorAll('.line-mask')];
  function checkLineMask(){
    let pend = false;
    for(const el of lmItems){
      if(el.classList.contains('in')) continue;
      if(el.getBoundingClientRect().top < innerHeight * 0.96) el.classList.add('in');
      else pend = true;
    }
    if(!pend) removeEventListener('scroll', checkLineMask);
  }
  addEventListener('scroll', checkLineMask, { passive: true });
  checkLineMask();

  // NÚMEROS — cuentan desde 0 al entrar en vista (si no hay GSAP, quedan en su valor final).
  document.querySelectorAll('.stat-num[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const suf = el.dataset.suffix || '';
    const render = v => { el.textContent = v.toFixed(dec) + suf; };
    if (reduceMotion) { render(target); return; }
    const obj = { v: 0 };
    render(0);
    gsap.to(obj, {
      v: target, duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
      onUpdate() { render(obj.v); }
    });
  });

  // TIRA DE PROMESAS — entran en cascada y las palomitas se dibujan solas.
  const trustStrip = document.querySelector('.trust-strip');
  if (trustStrip) {
    if (reduceMotion) {
      gsap.set('.trust-item', { opacity: 1, y: 0 });
      gsap.set('.trust-item svg path', { strokeDashoffset: 0 });
    } else {
      gsap.timeline({
        scrollTrigger: { trigger: trustStrip, start: 'top 88%', toggleActions: 'play none none none' }
      })
      .to('.trust-item', { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' })
      .to('.trust-item svg path', { strokeDashoffset: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, '-=0.35');
    }
  }

  // PROPUESTA DE VALOR — entrada cinematográfica coordinada (una timeline).
  // Eyebrow + línea → frases con desenfoque→nítido → subrayado que se traza → texto y enlace.
  const introEl = document.querySelector('#intro');
  if (introEl) {
    if (reduceMotion) {
      gsap.set('#intro .intro-eyebrow, #intro .intro-dim, #intro .intro-strong, #intro .intro-text, #intro .intro-link',
        { opacity: 1, y: 0, filter: 'none' });
      gsap.set('#intro .intro-rule, #intro .intro-underline', { scaleX: 1 });
    } else {
      gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: introEl, start: 'top 82%', toggleActions: 'play none none none' }
      })
      .to('.intro-eyebrow', { opacity: 1, y: 0, duration: 0.35 })
      .to('.intro-rule',    { scaleX: 1, duration: 0.4 }, '<')
      .to('.intro-dim',     { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4 }, '-=0.2')
      .to('.intro-strong',  { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4 }, '-=0.28')
      .to('.intro-underline', { scaleX: 1, duration: 0.45, ease: 'power2.out' }, '-=0.12')
      .to('.intro-text',    { opacity: 1, y: 0, duration: 0.4 }, '-=0.3')
      .to('.intro-link',    { opacity: 1, y: 0, duration: 0.35 }, '-=0.25');
    }
  }

  // Premium: viñetas de la OFERTA en cascada
  gsap.to('#ofertas .offer-features li', {
    opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.06,
    scrollTrigger: { trigger: '.offer-card', start: 'top 88%', toggleActions: 'play none none none' }
  });

  // Premium: el PRECIO de la oferta entra con un "pop" llamativo
  gsap.from('#ofertas .offer-price', {
    scale: 0.7, opacity: 0, duration: 0.7, ease: 'back.out(1.7)',
    scrollTrigger: { trigger: '.offer-card', start: 'top 80%', toggleActions: 'play none none none' }
  });

  // Premium: viñetas de cada PAQUETE de precios en cascada (incluye el de $7,000)
  document.querySelectorAll('.pricing-card').forEach(card => {
    gsap.to(card.querySelectorAll('.pricing-features li'), {
      opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none none' }
    });
  });
}
// CARRUSEL DE PROYECTOS — arrastrar con el mouse (en compu) y deslizar de lado
// con el trackpad. En celular funciona solo, porque las tarjetas van en columna.
(function initCarruselProyectos(){
  function montar(){
    const gal = document.querySelector('.horiz-gallery');
    if (!gal) return;

    let abajo = false, xInicio = 0, scrollInicio = 0, movio = false;

    gal.addEventListener('pointerdown', e => {
      if (gal.classList.contains('is-pinned')) return; // con pin, manda el scroll de la página
      if (e.pointerType !== 'mouse') return;          // en táctil deja el swipe nativo
      abajo = true; movio = false;
      xInicio = e.clientX;
      scrollInicio = gal.scrollLeft;
      gal.classList.add('is-dragging');
    });

    gal.addEventListener('pointermove', e => {
      if (!abajo) return;
      const dx = e.clientX - xInicio;
      if (Math.abs(dx) > 4) movio = true;
      gal.scrollLeft = scrollInicio - dx;
    });

    const soltar = () => {
      if (!abajo) return;
      abajo = false;
      gal.classList.remove('is-dragging');
    };
    gal.addEventListener('pointerup', soltar);
    gal.addEventListener('pointerleave', soltar);

    // Si arrastró, NO abrimos el link (si no, cada arrastre te sacaba a otra página).
    gal.addEventListener('click', e => { if (movio) { e.preventDefault(); movio = false; } }, true);

    // Trackpad: gesto horizontal. Solo lo tomamos cuando el movimiento es más
    // de lado que de arriba-abajo, para no bloquear el scroll normal de la página.
    gal.addEventListener('wheel', e => {
      if (gal.classList.contains('is-pinned')) return; // con pin no robamos el gesto
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        gal.scrollLeft += e.deltaX;
        e.preventDefault();
      }
    }, { passive: false });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();
})();

// SCROLL SUAVE PREMIUM (Lenis) — inercia tipo estudio.
// Solo se enciende si la librería cargó y el visitante NO pidió menos movimiento.
// Si no carga (o hay reduce-motion), queda el scroll nativo: nada se rompe.
function initLenis() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    duration: 1.1,                                   // qué tan largo es el "deslizamiento"
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });

  // Con Lenis al mando, apagamos el suavizado nativo del CSS para que no compitan.
  document.documentElement.style.scrollBehavior = 'auto';

  // Mantener las animaciones de scroll (GSAP) perfectamente sincronizadas con Lenis.
  if (window.gsap && window.ScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // Enlaces internos (#sección): desplazamiento suave de Lenis, respetando la barra fija.
  // El scroll va a velocidad ~constante (proporcional a la distancia) y con arranque/frenado
  // suaves, para que el cliente ALCANCE A VER las secciones por las que va pasando.
  const navEl = document.getElementById('navbar');
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const id = a.getAttribute('href');
    if (!id || id.length <= 1) return;
    a.addEventListener('click', e => {
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = (navEl ? navEl.offsetHeight : 80) + 12;
      // Distancia real a recorrer (px) → tiempo, para que la velocidad sea pareja.
      const dist = Math.abs(target.getBoundingClientRect().top - offset);
      // ~950 px/seg: lento pero no tedioso. Mínimo 1.1s, máximo 3.4s.
      const duration = Math.min(3.4, Math.max(1.1, dist / 950));
      lenis.scrollTo(target, {
        offset: -offset,
        duration,
        // easeInOutCubic: empieza despacio, mantiene el recorrido visible, frena suave.
        easing: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
      });
    });
  });
}

// Los scripts GSAP/Lenis usan defer, así que ya están listos en DOMContentLoaded.
// MATERIAL plateado UNIFORME — se lo aplicamos a TODAS las piezas del logo por igual
// (así no queda "una parte de un color y otra de otro"). Cromo plateado pulido.
(function(){
  const mv = document.querySelector('model-viewer.hero-3d');
  if (!mv) return;
  mv.addEventListener('load', () => {
    try {
      mv.model.materials.forEach(m => {
        m.pbrMetallicRoughness.setMetallicFactor(1);
        m.pbrMetallicRoughness.setRoughnessFactor(0.14);   // bajo = espejo/cromo brillante
        m.pbrMetallicRoughness.setBaseColorFactor([0.90, 0.91, 0.94, 1]); // plateado claro
      });
    } catch (e) {}
  });
})();

// RED DE SEGURIDAD DEL CONTENIDO
// Regla de la casa: NUNCA se puede quedar algo invisible por culpa de una animación.
// El CSS esconde cosas solo cuando el <html> trae la marca .has-gsap. Si GSAP carga
// pero después truena a medio camino (o Chrome congela la pestaña por estar en
// segundo plano), esa marca se queda puesta y la sección nunca aparece: página vacía.
// Estas dos redes lo evitan.
//
// Red 1: si initGsapAnimations revienta, quitamos la marca al instante.
// Red 2: a los 4 segundos revisamos de verdad si algo quedó invisible. Si sí,
//        lo mostramos a la fuerza. Cuesta casi nada y salva la página entera.
function redDeSeguridadContenido() {
  const OCULTOS = '.reveal, .intro-dim, .intro-strong, .intro-text, .intro-eyebrow, ' +
                  '.intro-link, .trust-item, .hero-title .line span, #heroTag, ' +
                  '#heroSub, .hero-social, .pricing-features li, #ofertas .offer-features li';
  let rescatados = 0;
  document.querySelectorAll(OCULTOS).forEach(el => {
    // Solo tocamos lo que de verdad no se ve y sí está en el layout.
    if (parseFloat(getComputedStyle(el).opacity) < 0.05 && el.offsetParent !== null) {
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('transform', 'none', 'important');
      el.style.setProperty('filter', 'none', 'important');
      el.style.setProperty('clip-path', 'none', 'important');
      rescatados++;
    }
  });
  // Los títulos usan un efecto cortina (clip-path) aparte del opacity.
  document.querySelectorAll('.line-mask:not(.in)').forEach(el => {
    if (getComputedStyle(el).clipPath !== 'none') {
      el.style.setProperty('clip-path', 'none', 'important');
      rescatados++;
    }
  });
  if (rescatados) console.warn('[Noel Studio] Red de seguridad: ' + rescatados + ' elementos rescatados.');
}

function initAfterLoad() {
  try {
    initGsapAnimations();
  } catch (err) {
    // Si las animaciones truenan, quitamos la marca: todo vuelve a verse al instante.
    document.documentElement.classList.remove('has-gsap');
    console.warn('[Noel Studio] Animaciones desactivadas por un error, contenido intacto:', err);
  }
  try { initLenis(); } catch (err) { console.warn('[Noel Studio] Scroll suave desactivado:', err); }

  // Segunda red, por si nada tronó pero aun así algo se quedó escondido.
  setTimeout(redDeSeguridadContenido, 4000);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAfterLoad);
} else {
  initAfterLoad();
}

// Tercera red: si el visitante vuelve a la pestaña y algo sigue invisible
// (Chrome congela las animaciones en pestañas de fondo), lo revisamos otra vez.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) setTimeout(redDeSeguridadContenido, 600);
});

// HERO CANVAS — partículas.
// Si el hero trae video de fondo, las partículas NO se encienden: las dos cosas
// juntas compiten y ninguna se aprecia. El canvas se queda en el documento por si
// el video no puede reproducirse (ahí sí vuelven a servir).
const canvas = document.getElementById('heroCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];

let lastCanvasW = 0;
function resizeCanvas() {
  if (!canvas) return;
  // En celular, al hacer scroll la barra del navegador aparece/desaparece y dispara
  // 'resize' aunque solo cambie la ALTURA. Recalcular el canvas en cada uno de esos
  // eventos traba el scroll, así que solo reaccionamos a cambios reales de ANCHO.
  if (window.innerWidth === lastCanvasW) return;
  lastCanvasW = window.innerWidth;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.4 + 0.05;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
    ctx.fill();
  }
}

// En celular usamos menos partículas (más fluido, no traba el scroll ni gasta batería).
const PARTICLE_COUNT = window.innerWidth < 768 ? 14 : 80;
// Solo si esta página trae el canvas del hero: sin él, Particle() truena y el script
// entero se detiene (y el menú del celular se queda sin funcionar).
if (ctx) { for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle()); }

// Pausar el dibujado cuando el hero sale de la pantalla (ahorra batería/CPU)
let heroVisible = true;
const heroSection = document.querySelector('.hero');
if (heroSection && 'IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
  }, { threshold: 0 }).observe(heroSection);
}

function animParticles() {
  if (!heroVisible) { requestAnimationFrame(animParticles); return; }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  // Líneas entre partículas cercanas
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(255,255,255,${0.05 * (1 - dist/100)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animParticles);
}
if (ctx) animParticles();

// Mouse influence on particles
if (ctx) document.addEventListener('mousemove', e => {
  particles.forEach(p => {
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 120) {
      p.x -= dx * 0.008;
      p.y -= dy * 0.008;
    }
  });
});

// WHATSAPP FORM
function sendWhatsApp(e) {
  e.preventDefault();
  const name = document.getElementById('fname').value;
  const business = document.getElementById('fbusiness').value;
  const message = document.getElementById('fmessage').value;
  const text = `Hola, soy ${name}${business ? ' de ' + business : ''}. ${message || 'Me interesa una página web.'}`;
  // Abrimos WhatsApp de inmediato (dentro del clic) para que el navegador no bloquee la ventana.
  window.open(`https://wa.me/526142251419?text=${encodeURIComponent(text)}`, '_blank');
  // Micro-feedback visual en el botón mientras abre WhatsApp.
  const btn = e.target.querySelector('.btn-submit');
  if (btn && !btn.classList.contains('is-sending')) {
    const original = btn.innerHTML;
    btn.classList.add('is-sending');
    btn.innerHTML = 'Abriendo WhatsApp <span class="btn-spinner"></span>';
    setTimeout(() => {
      btn.classList.remove('is-sending');
      btn.innerHTML = original;
    }, 1600);
  }
}

// MENÚ HAMBURGUESA (celular)
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  // Cerrar el menú al tocar un enlace
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// BARRA DE PROGRESO DE LECTURA + NAV SÓLIDO AL BAJAR
const navbar = document.getElementById('navbar');
const progressBar = document.getElementById('scrollProgress');
function onScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
  if (navbar) navbar.classList.toggle('scrolled', scrollTop > 40);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// INDICADOR DE SECCIÓN ACTIVA EN EL MENÚ
const sectionLinks = [...document.querySelectorAll('.nav-links a')].filter(a => a.getAttribute('href') && a.getAttribute('href').startsWith('#') && a.getAttribute('href').length > 1);
const sectionMap = sectionLinks
  .map(a => ({ link: a, section: document.querySelector(a.getAttribute('href')) }))
  .filter(o => o.section);
if (sectionMap.length && 'IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        sectionMap.forEach(o => o.link.classList.toggle('active', o.link.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sectionMap.forEach(o => navObserver.observe(o.section));
}

/* —— CARRUSEL DE VIDEOS APILADOS (portafolio) —— */
(function () {
  const stack = document.getElementById('vpStack');
  if (!stack) return;
  const cards = Array.from(stack.querySelectorAll('.vp-card'));
  const dotsWrap = document.getElementById('vpDots');
  const volBtn = document.getElementById('vpVol');
  const player = stack.closest('.video-promo-player');
  const total = cards.length;
  let current = 0; // índice de la card que va al frente
  let soundOn = false;

  const ICON_MUTE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
  const ICON_SOUND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>';

  // crear puntos indicadores
  cards.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Ver video ' + (i + 1));
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  function playSafe(vid) {
    // intenta reproducir; si el video aún no cargó, reintenta cuando ya tenga datos
    const attempt = () => vid.play().catch(() => {});
    attempt();
    if (vid.readyState < 3) {
      vid.addEventListener('canplay', attempt, { once: true });
      vid.load(); // fuerza la carga si estaba en preload="none"
    }
  }

  function render() {
    cards.forEach((card, i) => {
      let offset = (i - current + total) % total; // 0 = frente
      const pos = offset > 2 ? 'hidden' : String(offset);
      card.setAttribute('data-pos', pos);
      const vid = card.querySelector('video');
      vid.muted = !(offset === 0 && soundOn); // solo el frente suena, si está activado
      if (pos !== 'hidden') {
        if (vid.preload !== 'auto') vid.preload = 'auto';
        playSafe(vid);
      } else {
        vid.pause();
      }
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    volBtn.innerHTML = soundOn ? ICON_SOUND : ICON_MUTE;
    volBtn.setAttribute('aria-label', soundOn ? 'Silenciar' : 'Activar sonido');
  }

  volBtn.addEventListener('click', () => { soundOn = !soundOn; render(); });

  function goTo(i) { current = (i + total) % total; render(); }
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  player.querySelector('.vp-next').addEventListener('click', next);
  player.querySelector('.vp-prev').addEventListener('click', prev);
  // clic en una card de atrás la trae al frente
  cards.forEach((card, i) => card.addEventListener('click', () => { if (i !== current) goTo(i); }));

  // swipe táctil
  let sx = 0;
  stack.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  stack.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) (dx < 0 ? next() : prev());
  }, { passive: true });

  render();
})();

/* EN CELULAR: "Para quién es" se vuelve desplegable.
   Ese párrafo son cinco renglones dentro de CADA tarjeta de precio. Con
   tres tarjetas apiladas el visitante hace scroll sin fin antes de ver el
   siguiente precio. Aquí se cierra por defecto y quien quiera lo abre.
   En computadora no se toca: ahí sí hay espacio y el texto vende.
   Si algo falla, el párrafo se queda visible como estaba. */
(function () {
  var CHICO = window.matchMedia('(max-width: 768px)');
  function plegar() {
    if (!CHICO.matches) return;
    var bloques = document.querySelectorAll('.plan-para');
    Array.prototype.forEach.call(bloques, function (b) {
      if (b.querySelector('details')) return;                 // ya está hecho
      var etiqueta = b.querySelector('.plan-para-label');
      var texto    = b.querySelector('p');
      if (!etiqueta || !texto) return;
      var d = document.createElement('details');
      var s = document.createElement('summary');
      s.textContent = etiqueta.textContent;
      d.appendChild(s);
      d.appendChild(texto);
      etiqueta.remove();
      b.appendChild(d);
    });
  }
  function arrancar() { try { plegar(); } catch (e) {} }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else { arrancar(); }
  /* Si gira el teléfono o cambia el ancho, se revisa otra vez. */
  if (CHICO.addEventListener) CHICO.addEventListener('change', arrancar);
})();

/* PRECIOS QUE SE DESLIZAN — el aviso y los puntos.
   En celular las tarjetas van de lado. Mucha gente no lo nota si no se
   le dice, así que debajo de cada juego se ponen puntos (en cuál va) y
   un renglón que lo explica. El renglón se borra en cuanto desliza:
   ya entendió y estorbaría. En computadora nada de esto aparece. */
(function () {
  function montar() {
    var rejillas = document.querySelectorAll('.pricing-grid, .pricing-grid-3, .pricing-grid--duo');
    Array.prototype.forEach.call(rejillas, function (g) {
      if (g.nextElementSibling && g.nextElementSibling.classList.contains('pricing-nav')) return;
      var tarjetas = g.querySelectorAll('.pricing-card');
      if (tarjetas.length < 2) return;

      var nav = document.createElement('div');
      nav.className = 'pricing-nav';
      var dots = document.createElement('div');
      dots.className = 'pricing-nav-dots';
      Array.prototype.forEach.call(tarjetas, function (_, i) {
        var d = document.createElement('span');
        if (i === 0) d.className = 'on';
        dots.appendChild(d);
      });
      var txt = document.createElement('span');
      txt.className = 'pricing-nav-txt';
      txt.textContent = 'Desliza para comparar →';
      nav.appendChild(dots);
      nav.appendChild(txt);
      g.parentNode.insertBefore(nav, g.nextSibling);

      var puntos = dots.children;
      var pintando = false;
      g.addEventListener('scroll', function () {
        nav.classList.add('usado');
        if (pintando) return;
        pintando = true;
        requestAnimationFrame(function () {
          pintando = false;
          var paso = g.scrollWidth / tarjetas.length;
          var i = Math.min(tarjetas.length - 1, Math.round(g.scrollLeft / paso));
          for (var k = 0; k < puntos.length; k++) {
            puntos[k].className = (k === i) ? 'on' : '';
          }
        });
      }, { passive: true });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montar);
  } else { montar(); }
})();

/* ============================================================
   CHAT EN VIVO — reproduce la conversación cuando entra en pantalla.
   Regla: el HTML ya trae la conversación completa y visible. Este código
   SOLO la reproduce por pasos; si no corre, se lee igual de completa.
   Los tiempos imitan a una persona real: leer, escribir, contestar.
   ============================================================ */
(function chatVivo(){
  const cuerpo = document.querySelector('#chatVivo .chat-cuerpo');
  if (!cuerpo || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const msgs = [...cuerpo.querySelectorAll('.chat-msg')];
  if (!msgs.length) return;

  cuerpo.classList.add('is-reproduciendo');          // recién aquí se ocultan

  const puntos = document.createElement('div');
  puntos.className = 'chat-escribiendo';
  puntos.innerHTML = '<i></i><i></i><i></i>';
  puntos.style.display = 'none';
  cuerpo.appendChild(puntos);

  const espera = ms => new Promise(r => setTimeout(r, ms));

  // Baja hasta el final DESPUÉS de que el navegador ya dibujó lo nuevo (doble cuadro),
  // así el chat nunca se queda a media burbuja ni se desfasa de la animación.
  function abajo(){
    requestAnimationFrame(() => requestAnimationFrame(() => {
      cuerpo.scrollTop = cuerpo.scrollHeight;
    }));
  }

  // Ritmo de la demostración: alrededor de UN SEGUNDO entre mensaje y mensaje.
  // Ni tan rápido que parezca falso, ni tan lento que el visitante se vaya.
  const tiempoEscritura = txt => Math.min(1100, Math.max(550, txt.length * 6));
  // Cuánto tarda el otro en leerlo antes de contestar.
  const tiempoLectura  = txt => Math.min(550, Math.max(300, txt.length * 2.5));

  let terminado = false;

  async function reproducir(){
    await espera(150);
    for (let k = 0; k < msgs.length; k++) {
      const msg = msgs[k];
      const esAgente = msg.classList.contains('is-agente');
      const parrafo = msg.querySelector('p');
      const texto = parrafo ? parrafo.textContent : msg.textContent;

      if (esAgente) {
        // El agente "escribe" y enseguida suelta su respuesta.
        puntos.style.display = 'inline-flex';
        cuerpo.appendChild(puntos);
        abajo();
        await espera(tiempoEscritura(texto));
        puntos.style.display = 'none';
      } else if (k > 0) {
        // El cliente entra directo, sin puntitos.
        await espera(450);
      }

      msg.classList.add('is-visible');
      abajo();

      // El otro lee antes de responder. En el último no hay a quién esperar.
      if (k < msgs.length - 1) await espera(tiempoLectura(texto));
    }
    puntos.remove();
    terminado = true;
    boton.classList.add('is-on');
  }

  // Botón discreto para volver a verla desde el principio.
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'chat-repetir';
  boton.textContent = 'Ver otra vez';
  boton.addEventListener('click', () => {
    if (!terminado) return;
    terminado = false;
    boton.classList.remove('is-on');
    msgs.forEach(m => m.classList.remove('is-visible'));
    cuerpo.appendChild(puntos);
    cuerpo.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(reproducir, 500);
  });
  // Va justo debajo del teléfono, fuera del marco.
  const tel = cuerpo.closest('.chat-tel');
  tel.parentElement.insertBefore(boton, tel.nextSibling);

  // Arranca cuando el TELÉFONO COMPLETO está a la vista, no antes: si empieza
  // con el aparato a medias, la conversación termina fuera de la pantalla.
  // El umbral se calcula: si el teléfono no cabe entero en la ventana, se pide
  // menos, porque si no NUNCA arrancaría y el chat se quedaría vacío.
  let arrancado = false;
  const umbral = Math.max(0.2, Math.min(0.92, (window.innerHeight - 60) / (tel.offsetHeight || 1)));

  function arrancar(obs){
    if (arrancado) return;
    arrancado = true;
    if (obs) obs.disconnect();
    reproducir();
  }

  const observador = new IntersectionObserver((entradas, obs) => {
    entradas.forEach(e => { if (e.isIntersecting) arrancar(obs); });
  }, { threshold: umbral });
  observador.observe(tel);

  // Red de seguridad: Chrome no avisa de intersecciones en pestañas de fondo.
  // Si el visitante abrió el sitio en otra pestaña, al volver revisamos a mano.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || arrancado) return;
    const r = tel.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) arrancar(observador);
  });

  // Última red: si por lo que sea no arrancó, la conversación se muestra completa
  // en vez de dejar el teléfono en blanco.
  setTimeout(() => {
    if (arrancado) return;
    const r = tel.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) arrancar(observador);
  }, 6000);
})();

/* ============================================================
   CALCULADORA — cuánto se pierde al mes por no contestar.
   ============================================================ */
(function calculadora(){
  const caja = document.getElementById('calc');
  if (!caja) return;

  const sin    = document.getElementById('calcSin');
  const ticket = document.getElementById('calcTicket');
  const tasa   = document.getElementById('calcTasa');
  if (!sin || !ticket || !tasa) return;

  const $ = id => document.getElementById(id);
  const pesos = n => '$' + Math.round(n).toLocaleString('es-MX');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Los tres planes reales, para recomendar el que alcanza.
  const PLANES = [
    { tope: 12, nombre: 'Esencial', costo: 1499 },
    { tope: 35, nombre: 'Negocio',  costo: 2499 },
    { tope: Infinity, nombre: 'Voz 250', costo: 3999 }
  ];

  // Conteo animado: la cifra sube en vez de brincar.
  function contar(el, desde, hasta){
    if (reduce || Math.abs(hasta - desde) < 1) { el.textContent = pesos(hasta); return; }
    const t0 = performance.now(), dur = 420;
    (function paso(t){
      const p = Math.min(1, (t - t0) / dur);
      const suave = 1 - Math.pow(1 - p, 3);
      el.textContent = pesos(desde + (hasta - desde) * suave);
      if (p < 1) requestAnimationFrame(paso);
    })(t0);
  }

  function pista(input){
    const p = (input.value - input.min) / (input.max - input.min) * 100;
    input.style.background =
      `linear-gradient(to right, var(--white) 0 ${p}%, rgba(255,255,255,0.18) ${p}% 100%)`;
  }

  let anteriores = { anual: 0, mensual: 0, diario: 0 };

  function calcular(){
    const s = +sin.value, t = +ticket.value, r = +tasa.value;
    const diario  = s * (r / 10) * t;
    const mensual = diario * 30;
    const anual   = mensual * 12;

    $('calcSinVal').textContent    = s + ' al día';
    $('calcTicketVal').textContent = pesos(t);
    $('calcTasaVal').textContent   = r + ' de 10';

    contar($('calcAnual'),   anteriores.anual,   anual);
    contar($('calcMensual'), anteriores.mensual, mensual);
    contar($('calcDiario'),  anteriores.diario,  diario);
    anteriores = { anual, mensual, diario };

    $('calcDetalle').textContent =
      `${s} sin contestar al día · ${r} de cada 10 compraban · ${pesos(t)} cada uno`;

    // Plan que alcanza para ese volumen y cuántos clientes lo pagan.
    const plan = PLANES.find(p => s <= p.tope);
    const clientes = Math.max(1, Math.ceil(plan.costo / t));
    $('calcBarraPerdida').textContent = pesos(mensual);
    $('calcBarraCosto').textContent   = pesos(plan.costo) + ' al mes';

    // La barra del costo se dibuja a escala real contra la pérdida: ahí se ve el tamaño.
    const proporcion = Math.max(0.6, Math.min(100, plan.costo / mensual * 100));
    $('calcBarraC').style.width = proporcion + '%';
    $('calcBarraP').style.width = '100%';

    $('calcPlan').innerHTML =
      `Con tu volumen, el plan <strong>${plan.nombre}</strong> te alcanza. ` +
      `Recuperando <strong>${clientes} cliente${clientes === 1 ? '' : 's'} al mes</strong> ya se pagó solo.`;

    [sin, ticket, tasa].forEach(pista);
  }

  // Botones de giro: cargan números típicos de ese negocio.
  const giros = [...document.querySelectorAll('.calc-giro')];
  giros.forEach(b => b.addEventListener('click', () => {
    giros.forEach(o => o.classList.toggle('is-on', o === b));
    sin.value    = b.dataset.sin;
    ticket.value = b.dataset.ticket;
    tasa.value   = b.dataset.tasa;
    calcular();
  }));

  // Si mueve un control a mano, ya no es un giro "de catálogo".
  [sin, ticket, tasa].forEach(i => i.addEventListener('input', () => {
    giros.forEach(o => o.classList.remove('is-on'));
    calcular();
  }));

  calcular();
})();

/* ============================================================
   VIDA DEL SITIO — reacción al cursor.
   Nada de esto cambia el contenido: si no corre, la página se ve igual,
   solo más quieta. Todo se apaga en equipos táctiles y con reduce-motion.
   ============================================================ */
(function vidaDelSitio(){
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce      = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reduce) return;

  // --- Resplandor que sigue al cursor ---------------------------------
  const aura = document.createElement('div');
  aura.className = 'aura';
  document.body.prepend(aura);

  let destinoX = innerWidth / 2, destinoY = innerHeight / 2, x = destinoX, y = destinoY;
  addEventListener('pointermove', e => {
    destinoX = e.clientX; destinoY = e.clientY;
    if (!aura.classList.contains('is-on')) aura.classList.add('is-on');
  }, { passive: true });

  function seguir(){
    x += (destinoX - x) * 0.08;                 // el retraso es lo que lo hace sentir vivo
    y += (destinoY - y) * 0.08;
    aura.style.setProperty('--aura-x', x + 'px');
    aura.style.setProperty('--aura-y', y + 'px');
    requestAnimationFrame(seguir);
  }
  requestAnimationFrame(seguir);

  // --- Imán: los botones se acercan un poco al cursor -------------------
  const imanes = document.querySelectorAll('.demo-cta, .nav-cta, .hero-btn, .btn-offer, .btn-pricing, .cta-final-link');
  imanes.forEach(el => {
    el.classList.add('iman');
    let dentro = false;
    el.addEventListener('pointerenter', () => { dentro = true; });
    el.addEventListener('pointermove', e => {
      if (!dentro) return;
      const c = el.getBoundingClientRect();
      const dx = (e.clientX - (c.left + c.width / 2)) / c.width;
      const dy = (e.clientY - (c.top + c.height / 2)) / c.height;
      el.style.transform = `translate(${dx * 14}px, ${dy * 10}px)`;
    });
    el.addEventListener('pointerleave', () => {
      dentro = false;
      el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      el.style.transform = '';
      setTimeout(() => { el.style.transition = ''; }, 520);
    });
  });

  // --- Inclinación de las tarjetas del portafolio ------------------------
  document.querySelectorAll('.portfolio-item').forEach(card => {
    const thumb = card.querySelector('.portfolio-thumb, .portfolio-placeholder');
    if (!thumb) return;
    card.addEventListener('pointermove', e => {
      const c = card.getBoundingClientRect();
      const dx = (e.clientX - (c.left + c.width / 2)) / c.width;
      const dy = (e.clientY - (c.top + c.height / 2)) / c.height;
      thumb.style.transform = `scale(1.06) translate(${dx * -12}px, ${dy * -10}px)`;
    });
    card.addEventListener('pointerleave', () => {
      thumb.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      thumb.style.transform = '';
      setTimeout(() => { thumb.style.transition = ''; }, 620);
    });
  });

  // --- El título del hero se mueve un poco con el cursor -----------------
  const hero = document.querySelector('.hero');
  if (hero) {
    const capas = hero.querySelectorAll('.hero-title, .hero-sub, .hero-tag, .hero-3d');
    hero.addEventListener('pointermove', e => {
      const dx = (e.clientX / innerWidth - 0.5);
      const dy = (e.clientY / innerHeight - 0.5);
      capas.forEach((capa, i) => {
        const f = (i + 1) * 5;
        capa.style.transform = `translate(${dx * f}px, ${dy * f * 0.6}px)`;
      });
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      capas.forEach(c => { c.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)'; c.style.transform = ''; });
      setTimeout(() => capas.forEach(c => { c.style.transition = ''; }), 720);
    });
  }
})();
