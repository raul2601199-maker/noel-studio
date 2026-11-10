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
// Prepara GSAP y funciones compartidas por las secciones.
(function () {
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: 'expo.out' });

  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Scroll nativo: mas fluido en pantallas de 120 Hz y en celular (Lenis se quito).
  const lenis = null;

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
  // En computadora los proyectos se cargan antes para que el carril fijo no se trabe.
  if (matchMedia('(min-width: 861px)').matches) document.querySelectorAll('.carril img[loading="lazy"]').forEach((imagen) => {
    imagen.loading = 'eager';
    imagen.decode && imagen.decode().catch(() => {});
  });
})();
