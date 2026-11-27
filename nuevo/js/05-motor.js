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

  // En telefono la barra del navegador aparece y se esconde al subir: no recalcular por eso.
  ScrollTrigger.config({ ignoreMobileResize: true });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());

  // Ancla desde otra pagina (llamadas.html#planes): el navegador salta antes de que
  // ScrollTrigger termine de medir y a veces queda arriba. Tras cada refresh de los
  // primeros segundos se vuelve a llevar al destino, salvo que la persona ya haya movido
  // la pagina o este recargando / regresando (ahi el navegador recuerda su posicion).
  (function () {
    const id = location.hash.slice(1);
    if (!id) return;
    let destino = null;
    try { destino = document.getElementById(decodeURIComponent(id)); } catch (e) { return; }
    const navegacion = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (!destino || (navegacion && navegacion.type !== 'navigate')) return;
    let tocado = false;
    const marcar = () => { tocado = true; };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((tipo) => addEventListener(tipo, marcar, { once: true, passive: true }));
    const ajustar = () => {
      if (tocado || location.hash.slice(1) !== id) return;
      // scrollIntoView respeta scroll-padding-top (92px) igual que el salto nativo.
      if (Math.abs(destino.getBoundingClientRect().top - 92) > 4) destino.scrollIntoView({ block: 'start', behavior: 'instant' });
    };
    ScrollTrigger.addEventListener('refresh', ajustar);
    addEventListener('load', () => {
      requestAnimationFrame(ajustar);
      setTimeout(() => { ajustar(); ScrollTrigger.removeEventListener('refresh', ajustar); }, 2500);
    });
  })();
  // En computadora los proyectos se cargan antes para que el carril fijo no se trabe.
  if (matchMedia('(min-width: 861px)').matches) document.querySelectorAll('.carril img[loading="lazy"]').forEach((imagen) => {
    imagen.loading = 'eager';
    imagen.decode && imagen.decode().catch(() => {});
  });
})();
