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
// Escena fija 2: el scroll recorre las horas y cambia el mundo.
(function () {
  const seccion = document.querySelector('[data-dia]');
  if (!seccion) return;
  const botones = [...seccion.querySelectorAll('[data-hora]')];
  const lugar = seccion.querySelector('[data-lugar-texto]');
  const accion = seccion.querySelector('[data-accion-texto]');
  const avance = seccion.querySelector('.dia__avance');
  const reloj = seccion.querySelector('[data-reloj]');
  const MUNDO = { manana: 'escena', comida: 'lectura', tarde: 'escena', noche: 'tenue' };
  let turno = -1;
  let disparador = null;

  function elegir(indice) {
    if (indice === turno) return;
    turno = indice;
    const boton = botones[indice];
    botones.forEach((b) => b.setAttribute('aria-selected', String(b === boton)));
    seccion.dataset.momento = boton.dataset.hora;
    lugar.textContent = boton.dataset.lugar;
    accion.textContent = boton.dataset.accion;
    const [hora, periodo] = boton.textContent.split(' ');
    reloj.innerHTML = hora + '<small>' + periodo + '</small>';
    seccion.dataset.mundo = MUNDO[boton.dataset.hora];
    if (window.gsap && window.NS) {
      gsap.fromTo([reloj, lugar, accion], { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.07, overwrite: true });
    }
    if (!disparador && avance) avance.style.transform = 'scaleX(' + indice / (botones.length - 1) + ')';
  }

  botones.forEach((boton, i) => {
    boton.addEventListener('click', () => {
      if (disparador && window.NS && NS.lenis) {
        NS.lenis.scrollTo(disparador.start + (disparador.end - disparador.start) * ((i + 0.45) / botones.length), { duration: 1 });
      } else {
        elegir(i);
      }
    });
    boton.addEventListener('keydown', (evento) => {
      const cambio = { ArrowRight: 1, ArrowLeft: -1 }[evento.key];
      if (!cambio) return;
      evento.preventDefault();
      const siguiente = (i + cambio + botones.length) % botones.length;
      botones[siguiente].focus();
      botones[siguiente].click();
    });
  });

  if (!window.NS) return;
  NS.escenas.dia = function (zona) {
    const linea = gsap.timeline({
      scrollTrigger: {
        trigger: zona,
        start: 'top top',
        end: '+=260%',
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        onUpdate(estado) {
          const parte = Math.min(0.999, estado.progress);
          elegir(Math.floor(parte * botones.length));
        },
        onRefresh(estado) { disparador = estado; },
      },
    });
    linea.fromTo(avance, { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0);
    return () => { disparador = null; };
  };
})();
