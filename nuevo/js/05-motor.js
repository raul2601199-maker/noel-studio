//  ███╗   ██╗ ██████╗ ███████╗██╗
//  ████╗  ██║██╔═══██╗██╔════╝██║
//  ██╔██╗ ██║██║   ██║█████╗  ██║
//  ██║╚██╗██║██║   ██║██╔══╝  ██║
//  ██║ ╚████║╚██████╔╝███████╗███████╗
//  ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚══════╝
//  ███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗
//  ██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗
//  ███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║
//  ╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║
//  ███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝
//  ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝
//  ──────── by Raúl · Chihuahua, MX ────────
// Prepara GSAP, Lenis y funciones compartidas por las secciones.
(function () {
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: 'expo.out' });

  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null;
  if (window.Lenis && !quieto) {
    lenis = new Lenis({ smoothWheel: true, lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((tiempo) => lenis.raf(tiempo * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  document.addEventListener('click', (evento) => {
    const liga = evento.target.closest('a[href]');
    if (!liga) return;
    const url = new URL(liga.href, location.href);
    const destino = url.pathname === location.pathname && url.hash ? document.querySelector(url.hash) : null;
    if (!destino || !lenis) return;
    evento.preventDefault();
    lenis.scrollTo(destino, { offset: -72, duration: 1.3 });
  });

  window.NS = {
    lenis,
    mm: gsap.matchMedia(),
    escenas: {},
    escritorio: '(min-width: 861px) and (min-height: 660px) and (prefers-reduced-motion: no-preference)',
    movil: '(max-width: 860px) and (prefers-reduced-motion: no-preference)',
    conMovimiento: '(prefers-reduced-motion: no-preference)',
  };

  document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
})();
