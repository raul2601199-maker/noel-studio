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
(function () {
  const nav = document.querySelector('[data-nav]');
  const hero = document.querySelector('.hero');
  if (!nav) return;
  function marcarActiva() {}

  function revisar() {
    nav.classList.toggle('nav--solida', scrollY > 40);
    marcarActiva();
  }
  addEventListener('scroll', revisar, { passive: true });
  revisar();
  const menu = nav.querySelector('.nav__menu');
  menu.addEventListener('toggle', () => {
    document.documentElement.classList.toggle('menu-abierto', menu.open);
    menu.querySelector('summary').setAttribute('aria-label', menu.open ? 'Cerrar menú' : 'Abrir menú');
    if (window.NS && NS.lenis) NS.lenis[menu.open ? 'stop' : 'start']();
  });
  menu.querySelectorAll('.nav__panel a').forEach((liga) => {
    liga.addEventListener('click', () => {
      menu.open = false;
      document.documentElement.classList.remove('menu-abierto');
      if (window.NS && NS.lenis) NS.lenis.start();
    });
  });
  addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') menu.open = false;
  });
})();
