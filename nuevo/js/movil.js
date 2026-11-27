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
  // La barra sale en TODAS las paginas en cuanto se deja atras la primera pantalla
  // (antes exigia .hero y #contacto a la vez y ninguna pagina tenia los dos).
  // Se esconde mientras se escribe en un campo para no tapar el teclado ni el boton de enviar.
  if (barra) {
    const telefono = window.matchMedia('(max-width: 860px)');
    let escribiendo = false;
    let pendiente = false;
    const actualizar = () => {
      pendiente = false;
      const mostrar = telefono.matches && !escribiendo && window.scrollY > window.innerHeight * 0.6;
      barra.classList.toggle('barra-movil--visible', mostrar);
    };
    const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } };
    const esCampo = (el) => el && el.matches && el.matches('input, textarea, select');
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir, { passive: true });
    document.addEventListener('focusin', (e) => { if (esCampo(e.target) && !barra.contains(e.target)) { escribiendo = true; pedir(); } });
    document.addEventListener('focusout', (e) => { if (esCampo(e.target)) { escribiendo = false; pedir(); } });
    actualizar();
  }

  // Puntos que dicen en que tarjeta vas.
  document.querySelectorAll('.grupo__planes').forEach((carril) => {
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
      const capas = seccion.children;
      // Entrada suave y salida solo con brillo: nada crece mas que la pantalla
      // (antes salia a 108% y las tarjetas se cortaban por los lados).
      gsap.fromTo(capas, { scale: 0.96, y: 36, opacity: 0.6 }, { scale: 1, y: 0, opacity: 1, ease: 'power2.out', immediateRender: false, scrollTrigger: dedo(seccion, 'top 100%', 'top 62%') });
      gsap.fromTo(capas, { opacity: 1 }, { opacity: 0.55, ease: 'power1.in', immediateRender: false, scrollTrigger: { trigger: seccion, start: 'bottom 40%', end: 'bottom 0%', scrub: 0.35 } });
    });
    if (document.querySelector('.hero')) gsap.to('.hero__texto', { y: -60, opacity: 0.4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.3 } });
    if (document.querySelector('.hero')) gsap.to('.elector', { y: -110, scale: 0.85, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.3 } });

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
    // Se parte hasta que carga la tipografia: asi las palabras miden lo que deben.
    document.fonts.ready.then(() => document.querySelectorAll('.problema h2, .resena--grande p').forEach((texto) => {
      const partes = SplitText.create(texto, { type: 'words', aria: 'none' });
      gsap.from(partes.words, { color: '#85868f', ease: 'none', stagger: 0.1, scrollTrigger: { trigger: texto, start: 'top 84%', end: 'bottom 48%', scrub: 0.4 } });
    }));

    // La conversacion entra de cada lado.
    gsap.utils.toArray('.globo, .recado').forEach((globo) => {
      const lado = globo.classList.contains('globo--claudia') || globo.classList.contains('recado') ? -1 : 1;
      gsap.from(globo, { x: 54 * lado, scale: 0.9, opacity: 0.68, ease: 'power2.out', scrollTrigger: dedo(globo) });
    });

    // Tarjetas con giro 3D.

    gsap.utils.toArray('.servicio').forEach((tarjeta) => {
      gsap.from(tarjeta, { y: 72, rotationX: -18, scale: 0.92, opacity: 0.85, transformOrigin: 'center top', ease: 'power2.out', scrollTrigger: dedo(tarjeta, 'top 100%', 'top 66%') });
    });

    gsap.utils.toArray('.giros__lista li, .pasos li').forEach((fila, i) => {
      gsap.from(fila, { x: i % 2 ? 42 : -42, opacity: 0.68, ease: 'power2.out', scrollTrigger: dedo(fila, 'top 98%', 'top 74%') });
    });

    gsap.utils.toArray('.grupo, .acordeon details, .creativos__lista li').forEach((fila) => {
      gsap.from(fila, { y: 26, opacity: 0.68, ease: 'power2.out', scrollTrigger: dedo(fila, 'top 98%', 'top 82%') });
    });

    if (document.querySelector('.cierre')) gsap.fromTo('.cierre h2', { scale: 1.16 }, { scale: 1, ease: 'none', transformOrigin: 'left center', scrollTrigger: dedo('.cierre', 'top 100%', 'top 45%') });
  });
})();
