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
// Bloques de telefono: barra inferior, carruseles y entrada ligera.
(function () {
  const barra = document.querySelector('[data-barra-movil]');
  const hero = document.querySelector('.hero');
  const contacto = document.querySelector('#contacto');
  if (barra && hero && contacto) {
    let enHero = true, enContacto = false;
    const actualizar = () => barra.classList.toggle('barra-movil--visible', !enHero && !enContacto);
    new IntersectionObserver(([e]) => { enHero = e.isIntersecting; actualizar(); }).observe(hero);
    new IntersectionObserver(([e]) => { enContacto = e.isIntersecting; actualizar(); }).observe(contacto);
  }

  // Puntos que dicen en que tarjeta vas.
  document.querySelectorAll('.dia-movil, .grupo__planes, .carril, .voces__lista').forEach((carril) => {
    const tarjetas = [...carril.children];
    if (tarjetas.length < 2) return;
    const puntos = document.createElement('div');
    puntos.className = 'puntos';
    puntos.setAttribute('aria-hidden', 'true');
    tarjetas.forEach(() => puntos.appendChild(document.createElement('i')));
    carril.after(puntos);
    const marcas = [...puntos.children];
    marcas[0].classList.add('activo');
    tarjetas[0].classList.add('en-foco');
    const vigia = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        const indice = tarjetas.indexOf(entrada.target);
        marcas.forEach((marca, i) => marca.classList.toggle('activo', i === indice));
        tarjetas.forEach((tarjeta, i) => tarjeta.classList.toggle('en-foco', i === indice));
      });
    }, { root: carril, threshold: 0.6 });
    tarjetas.forEach((tarjeta) => vigia.observe(tarjeta));
  });

  if (!window.NS) return;

  // Animaciones de telefono: se mueven con el dedo y nunca dejan una hoja vacia.
  NS.mm.add(NS.movil, () => {
    const dedo = (trigger, inicio = 'top 96%', fin = 'top 68%') => ({ trigger, start: inicio, end: fin, scrub: 0.35 });

    gsap.to('.barra-avance', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });

    // Cada seccion llega desde el fondo del tunel.
    gsap.utils.toArray('main > section:not(.hero)').forEach((seccion) => {
      gsap.fromTo(seccion.children, { scale: 0.88, y: 34 }, { scale: 1, y: 0, ease: 'power2.out', scrollTrigger: dedo(seccion, 'top 104%', 'top 62%') });
    });

    // Titulos: las lineas suben desde abajo.
    document.querySelectorAll('main h2:not(.problema h2)').forEach((titulo) => {
      SplitText.create(titulo, {
        type: 'lines,words',
        mask: 'lines',
        linesClass: 'linea',
        autoSplit: true,
        onSplit(partes) {
          return gsap.from(partes.lines, { yPercent: 108, duration: 0.8, stagger: 0.07, scrollTrigger: { trigger: titulo, start: 'top 94%', once: true } });
        },
      });
    });

    // Palabras que se encienden con el dedo.
    document.querySelectorAll('.problema h2, .resena--grande p').forEach((texto) => {
      const partes = SplitText.create(texto, { type: 'words', aria: 'none' });
      gsap.from(partes.words, { color: '#85868f', ease: 'none', stagger: 0.1, scrollTrigger: { trigger: texto, start: 'top 84%', end: 'bottom 48%', scrub: 0.4 } });
    });

    // La conversacion entra de cada lado.
    gsap.utils.toArray('.globo, .recado').forEach((globo) => {
      const lado = globo.classList.contains('globo--claudia') || globo.classList.contains('recado') ? -1 : 1;
      gsap.from(globo, { x: 54 * lado, scale: 0.9, opacity: 0.68, ease: 'power2.out', scrollTrigger: dedo(globo) });
    });

    // Tarjetas con giro 3D.
    gsap.from('.voz', { x: 80, stagger: 0.08, duration: 0.8, scrollTrigger: { trigger: '.voces__lista', start: 'top 90%', once: true } });

    gsap.utils.toArray('.servicio').forEach((tarjeta) => {
      gsap.from(tarjeta, { y: 72, rotationX: -18, scale: 0.92, opacity: 0.68, transformOrigin: 'center top', ease: 'power2.out', scrollTrigger: dedo(tarjeta, 'top 100%', 'top 66%') });
    });

    gsap.utils.toArray('.giros__lista li, .pasos li').forEach((fila, i) => {
      gsap.from(fila, { x: i % 2 ? 42 : -42, opacity: 0.68, ease: 'power2.out', scrollTrigger: dedo(fila, 'top 98%', 'top 74%') });
    });

    gsap.utils.toArray('.grupo, .acordeon details, .creativos__lista li').forEach((fila) => {
      gsap.from(fila, { y: 26, opacity: 0.68, ease: 'power2.out', scrollTrigger: dedo(fila, 'top 98%', 'top 82%') });
    });

    gsap.from('.dia-movil li', { x: 80, stagger: 0.08, duration: 0.8, scrollTrigger: { trigger: '.dia-movil', start: 'top 90%', once: true } });
    gsap.from('.proyecto', { x: 90, stagger: 0.08, duration: 0.8, scrollTrigger: { trigger: '.carril', start: 'top 90%', once: true } });
    gsap.fromTo('.cierre h2', { scale: 1.16 }, { scale: 1, ease: 'none', transformOrigin: 'left center', scrollTrigger: dedo('.cierre', 'top 100%', 'top 45%') });
  });
})();
