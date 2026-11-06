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
// Entrada unica de la pagina y circulo de llamada.
(function () {
  if (!window.NS) return;
  const hero = document.querySelector('.hero');
  const orbe = hero.querySelector('.orbe');

  function entrada() {
    SplitText.create(hero.querySelector('h1'), {
      type: 'lines,words',
      mask: 'lines',
      linesClass: 'linea',
      autoSplit: true,
      onSplit(partes) {
        return gsap.from(partes.lines, { yPercent: 115, duration: 1.3, stagger: 0.11, delay: 0.1 });
      },
    });
    gsap.timeline({ delay: 0.45 })
      .from('.hero__sub', { y: 28, autoAlpha: 0, duration: 0.9 })
      .from('.hero .btn', { y: 22, autoAlpha: 0, stagger: 0.09, duration: 0.8 }, '-=.65')
      .from(orbe, { scale: 0.3, autoAlpha: 0, duration: 1.6 }, 0);
  }

  NS.mm.add(NS.conMovimiento, () => {
    if (document.hidden) {
      document.addEventListener('visibilitychange', entrada, { once: true });
    } else {
      entrada();
    }
  });
})();
