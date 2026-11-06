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
// Regla unica: el contenido llega desde lejos y pasa junto a la camara.
(function () {
  if (!window.NS) return;
  const secciones = [...document.querySelectorAll('[data-mundo]')];

  // El brillo sale de la seccion que cruza la linea de lectura.
  function revisarMundo() {
    if (!window.NSViaje) return;
    const linea = innerHeight * 0.72;
    const actual = secciones.find((seccion) => {
      const caja = seccion.getBoundingClientRect();
      return caja.top <= linea && caja.bottom > linea;
    });
    NSViaje.mundo((actual || secciones[secciones.length - 1]).dataset.mundo);
  }
  gsap.ticker.add(revisarMundo);

  NS.mm.add(NS.escritorio, () => {
    const limpiar = [];
    secciones.forEach((seccion, i) => {
      const capas = [...seccion.children];
      const ultimo = i === secciones.length - 1;
      if (i > 0) {
        gsap.fromTo(capas, { scale: 0.74, autoAlpha: 0 }, {
          scale: 1,
          autoAlpha: 1,
          ease: 'power2.out',
          scrollTrigger: { trigger: seccion, start: 'top 100%', end: 'top 56%', scrub: 0.5 },
        });
      }
      const escena = NS.escenas[seccion.dataset.escena];
      if (escena) {
        const quitar = escena(seccion);
        if (quitar) limpiar.push(quitar);
      }
      if (!ultimo) {
        gsap.fromTo(capas, { scale: 1, autoAlpha: 1 }, {
          scale: 1.14,
          autoAlpha: 0,
          ease: 'power1.in',
          immediateRender: false,
          scrollTrigger: { trigger: seccion, start: 'bottom 34%', end: 'bottom 0%', scrub: 0.5 },
        });
      }
    });
    gsap.to('.barra-avance', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });
    ScrollTrigger.sort();
    return () => limpiar.forEach((quitar) => quitar());
  });
})();
