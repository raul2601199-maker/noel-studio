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
// Escena fija 1: la conversacion avanza con el scroll.
(function () {
  if (!window.NS) return;
  NS.escenas.llamada = function (seccion) {
    const piezas = seccion.querySelectorAll('.globo, .recado');
    const linea = gsap.timeline({ scrollTrigger: { trigger: seccion, start: 'top top', end: '+=170%', scrub: 0.7, pin: true, anticipatePin: 1 } });
    piezas.forEach((pieza, i) => {
      linea.from(pieza, { y: 34, scale: 0.94, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, i + 0.2);
    });
  };
})();
