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
  if (!nav || !hero) return;
  const ligas = [...nav.querySelectorAll('.nav__ligas a')];
  const destinos = ligas.map((liga) => document.querySelector(liga.getAttribute('href')));
  function marcarActiva() {
    const linea = innerHeight * 0.4;
    let actual = -1;
    destinos.forEach((destino, i) => {
      if (destino && destino.getBoundingClientRect().top <= linea) actual = i;
    });
    ligas.forEach((liga, i) => liga.classList.toggle('activa', i === actual));
  }

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
