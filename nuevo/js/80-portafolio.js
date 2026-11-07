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
// Escena fija 3: los proyectos pasan de lado.
(function () {
  if (!window.NS) return;
  NS.escenas.portafolio = function (seccion) {
    const carril = seccion.querySelector('.carril');
    carril.classList.add('carril--fijo');
    const distancia = () => Math.max(0, carril.scrollWidth - innerWidth);
    const linea = gsap.timeline({
      scrollTrigger: {
        trigger: seccion,
        start: 'top top',
        end: () => '+=' + distancia(),
        pin: true,
        scrub: 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    linea.to(carril, { x: () => -distancia(), ease: 'none', duration: 1, force3D: true }, 0);
    return () => carril.classList.remove('carril--fijo');
  };
})();
