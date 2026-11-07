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
// Entrada de las paginas internas: titulo por lineas, texto y emblema.
(function () {
  const cabecera = document.querySelector('.cabecera');
  if (!cabecera || !window.NS) return;
  NS.mm.add(NS.conMovimiento, () => {
    const entrar = () => {
      SplitText.create(cabecera.querySelector('h1'), {
        type: 'lines,words', mask: 'lines', linesClass: 'linea', autoSplit: true,
        onSplit: (partes) => gsap.from(partes.lines, { yPercent: 112, duration: 1.1, stagger: 0.09 }),
      });
      gsap.from(cabecera.querySelectorAll('.migas, .cabecera__texto p'), { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.1, delay: 0.25 });
      gsap.from(cabecera.querySelector('.emblema'), { scale: 0.4, autoAlpha: 0, duration: 1.2, delay: 0.15 });
    };
    if (document.hidden) document.addEventListener('visibilitychange', entrar, { once: true });
    else entrar();
  });
})();
