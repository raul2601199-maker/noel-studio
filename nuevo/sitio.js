(function () {
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: 'expo.out' });

  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null;
  if (window.Lenis && !quieto) {
    lenis = new Lenis({ smoothWheel: true, lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((tiempo) => lenis.raf(tiempo * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  document.addEventListener('click', (evento) => {
    const liga = evento.target.closest('a[href]');
    if (!liga) return;
    const url = new URL(liga.href, location.href);
    const destino = url.pathname === location.pathname && url.hash ? document.querySelector(url.hash) : null;
    if (!destino || !lenis) return;
    evento.preventDefault();
    lenis.scrollTo(destino, { offset: -72, duration: 1.3 });
  });

  window.NS = {
    lenis,
    mm: gsap.matchMedia(),
    escenas: {},
    escritorio: '(min-width: 861px) and (min-height: 660px) and (prefers-reduced-motion: no-preference)',
    movil: '(max-width: 860px) and (prefers-reduced-motion: no-preference)',
    conMovimiento: '(prefers-reduced-motion: no-preference)',
  };

  document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
  // En computadora los proyectos se cargan antes para que el carril fijo no se trabe.
  if (matchMedia('(min-width: 861px)').matches) document.querySelectorAll('.carril img[loading="lazy"]').forEach((imagen) => {
    imagen.loading = 'eager';
    imagen.decode && imagen.decode().catch(() => {});
  });
})();

(function () {
  const lienzo = document.querySelector('[data-viaje]');
  const ctx = lienzo && lienzo.getContext('2d');
  if (!ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Cuanta luz da el tunel en cada momento de la pagina.
  const MUNDOS = {
    pleno: { luz: 0.85, velo: 0 },
    escena: { luz: 0.75, velo: 0.08 },
    lectura: { luz: 0.6, velo: 0.42 },
    tenue: { luz: 0.45, velo: 0.55 },
  };
  const SEPARACION = 7;
  const RADIO = 19;
  const RIEL = 0.42;
  let ancho = 0, alto = 0, foco = 0, aros = 42, focos = 72, chispas = [];
  let pos = 0, velocidad = 0, fuerza = 1, metaFuerza = 1, sombra = null, anchoAnterior = 0, metaX = 0, metaY = 0, velo = 0, metaVelo = 0;

  const orbeVivo = document.querySelector('.orbe__centro');

  // Un punto de luz dibujado una vez y reutilizado en cada LED.
  const led = document.createElement('canvas');
  led.width = led.height = 64;
  const ledCtx = led.getContext('2d');
  const halo = ledCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  halo.addColorStop(0, 'rgba(230,255,240,1)');
  halo.addColorStop(0.14, 'rgba(170,255,205,.9)');
  halo.addColorStop(0.32, 'rgba(60,240,140,.2)');
  halo.addColorStop(1, 'rgba(40,255,140,0)');
  ledCtx.fillStyle = halo;
  ledCtx.fillRect(0, 0, 64, 64);

  function ajustar() {
    const movil = innerWidth < 861;
    const escala = Math.min(devicePixelRatio || 1, movil ? 1.5 : 2);
    ancho = innerWidth;
    alto = lienzo.clientHeight;
    sombra = null;
    const orbe = document.querySelector('.orbe');
    const caja = orbe && orbe.getBoundingClientRect();
    metaX = caja && caja.width ? caja.left + caja.width / 2 : ancho * 0.63;
    metaY = caja && caja.width ? caja.top + scrollY + caja.height / 2 : alto * 0.5;
    lienzo.width = ancho * escala;
    lienzo.height = alto * escala;
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    foco = Math.min(ancho, alto) * 0.95;
    aros = movil ? 26 : 42;
    focos = movil ? 18 : 36;
    chispas = Array.from({ length: movil ? 14 : 70 }, () => ({
      angulo: Math.random() * Math.PI * 2,
      radio: 5 + Math.random() * (RADIO - 6),
      z: Math.random() * aros * SEPARACION,
    }));
  }

  const rutaX = (z) => Math.sin(z * 0.03) * 5 + Math.sin(z * 0.012) * 8;
  const rutaY = (z) => Math.cos(z * 0.024) * 3.5;

  // En el inicio la curva se apaga para que el tunel nazca justo detras del circulo.
  let curva = 1;
  function proyectar(x, y, z) {
    const zoom = (foco * (1 - Math.min(velocidad, 3) * 0.07)) / (z - pos);
    return {
      x: (x + (rutaX(z) - rutaX(pos + 5)) * curva) * zoom,
      y: (y + (rutaY(z) - rutaY(pos + 5)) * curva) * zoom,
      zoom,
    };
  }

  const visibilidad = (profundidad, lejos) => Math.max(0, Math.min(1, profundidad / 5) * Math.min(1, (lejos - profundidad) / (lejos * 0.75)));

  function punto(x, y, tamano, brillo) {
    if (brillo < 0.015 || Math.abs(x) > ancho * 0.8 || Math.abs(y) > alto * 0.8) return;
    ctx.globalAlpha = Math.min(1, brillo);
    ctx.drawImage(led, x - tamano / 2, y - tamano / 2, tamano, tamano);
  }

  function dibujar(tiempo) {
    fuerza += (metaFuerza - fuerza) * 0.05;
    velo += (metaVelo - velo) * 0.05;
    const luz = Math.min(1.15, fuerza + velocidad * 0.25);
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#030305';
    ctx.fillRect(0, 0, ancho, alto);
    // En telefono el tunel arranca arriba y baja al centro con el scroll.
    const inicio = Math.max(0, 1 - scrollY / (alto * 0.7));
    if (inicio > 0 && orbeVivo) {
      const caja = orbeVivo.getBoundingClientRect();
      metaX = caja.left + caja.width / 2;
      metaY = caja.top + caja.height / 2;
    }
    const finalX = ancho * (ancho < 861 ? 0.5 : 0.63);
    ctx.translate(finalX + (metaX - finalX) * inicio, alto * 0.5 + (metaY - alto * 0.5) * inicio);
    const movil = ancho < 861;
    curva = 1 - inicio;
    ctx.rotate(movil ? pos * 0.006 + Math.sin(pos * 0.02) * 0.25 : Math.sin(pos * 0.009) * 0.14);
    ctx.globalCompositeOperation = 'lighter';

    const lejos = aros * SEPARACION;
    const primero = Math.floor(pos / SEPARACION) + 1;

    for (let i = aros - 1; i >= 0; i--) {
      const z = (primero + i) * SEPARACION;
      const profundidad = z - pos;
      const vista = visibilidad(profundidad, lejos);
      const corrida = Math.pow(0.5 + 0.5 * Math.sin(z * 0.2 - tiempo * 0.0042), 4);
      const p = proyectar(0, 0, z);
      const radio = RADIO * p.zoom;

      // Tres pasadas dan el brillo de un aro de LED: halo, cuerpo y nucleo.
      ctx.strokeStyle = '#a8ffd0';
      [[0.95, 0.07], [0.32, 0.24], [0.09, 1]].forEach(([grosor, intensidad]) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, radio, 0, Math.PI * 2);
        ctx.globalAlpha = Math.min(1, vista * luz * intensidad * (0.5 + corrida * 0.5));
        ctx.lineWidth = Math.max(0.8, grosor * p.zoom);
        ctx.stroke();
      });

      if (profundidad < lejos * 0.42) {
        const tamano = Math.max(6, 0.9 * p.zoom);
        const brillo = vista * luz * (0.55 + corrida * 0.45);
        for (let f = 0; f < focos; f++) {
          const angulo = (f / focos) * Math.PI * 2;
          punto(p.x + Math.cos(angulo) * radio, p.y + Math.sin(angulo) * radio, tamano, brillo);
        }
      }

      // Rieles y linea central: forman el camino blanco en el piso.
      for (let medio = 0; medio < 2; medio++) {
        const zc = z + medio * SEPARACION * 0.5;
        [Math.PI / 2 - RIEL, Math.PI / 2 + RIEL].forEach((angulo) => {
          const c = proyectar(Math.cos(angulo) * RADIO * 0.98, Math.sin(angulo) * RADIO * 0.98, zc);
          punto(c.x, c.y, Math.max(5, 0.8 * c.zoom), vista * luz);
        });
      }
      const centro = proyectar(0, RADIO * 0.98, z);
      punto(centro.x, centro.y, Math.max(5, 1.1 * centro.zoom), vista * luz * 0.9);
    }

    chispas.forEach((chispa) => {
      while (chispa.z < pos + 2) chispa.z += lejos;
      const x = Math.cos(chispa.angulo) * chispa.radio;
      const y = Math.sin(chispa.angulo) * chispa.radio;
      const a = proyectar(x, y, chispa.z);
      const b = proyectar(x, y, chispa.z + 0.4 + velocidad * 4);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.globalAlpha = visibilidad(chispa.z - pos, lejos) * luz * 0.7;
      ctx.strokeStyle = '#b6ffd3';
      ctx.lineWidth = Math.max(0.8, 0.06 * a.zoom);
      ctx.stroke();
    });
    ctx.restore();
    oscurecerTexto();
  }

  // Sombra para que el texto se lea sobre las luces.
  function oscurecerTexto() {
    ctx.save();
    ctx.globalAlpha = 1;
    if (ancho < 861) {
      const inicio = Math.max(0, 1 - scrollY / (alto * 0.7));
      ctx.fillStyle = 'rgba(3,3,5,' + (0.34 * (1 - inicio)) + ')';
      ctx.fillRect(0, 0, ancho, alto);
      if (inicio > 0) {
        const sombraHero = ctx.createLinearGradient(0, alto * 0.34, 0, alto * 0.54);
        sombraHero.addColorStop(0, 'rgba(3,3,5,0)');
        sombraHero.addColorStop(1, 'rgba(3,3,5,' + (0.9 * inicio) + ')');
        ctx.fillStyle = sombraHero;
        ctx.fillRect(0, alto * 0.34, ancho, alto * 0.66);
      }
    } else {
      if (!sombra) {
        sombra = ctx.createLinearGradient(0, 0, ancho * 0.62, 0);
        sombra.addColorStop(0, 'rgba(3,3,5,.86)');
        sombra.addColorStop(0.62, 'rgba(3,3,5,.62)');
        sombra.addColorStop(1, 'rgba(3,3,5,0)');
      }
      ctx.fillStyle = sombra;
      ctx.fillRect(0, 0, ancho, alto);
      ctx.fillStyle = 'rgba(3,3,5,' + velo + ')';
      ctx.fillRect(0, 0, ancho, alto);
    }
    ctx.restore();
  }

  function ciclo(tiempo) {
    if (!document.hidden) {
      const meta = scrollY * (ancho < 861 ? 0.09 : 0.055) + tiempo * 0.0016;
      const nuevo = pos + (meta - pos) * 0.09;
      velocidad += (Math.max(0, nuevo - pos) - velocidad) * 0.12;
      pos = nuevo;
      dibujar(tiempo);
    }
    requestAnimationFrame(ciclo);
  }

  ajustar();
  addEventListener('load', ajustar);
  document.fonts && document.fonts.ready.then(ajustar);
  setTimeout(ajustar, 1600);
  document.documentElement.classList.add('viaje');
  // En telefono la barra del navegador cambia el alto; solo importa el ancho.
  addEventListener('resize', () => {
    if (innerWidth !== anchoAnterior) {
      anchoAnterior = innerWidth;
      ajustar();
    }
  });
  anchoAnterior = innerWidth;
  requestAnimationFrame(ciclo);

  window.NSViaje = {
    mundo(nombre) {
      const mundo = MUNDOS[nombre];
      if (!mundo) return;
      metaFuerza = mundo.luz;
      metaVelo = mundo.velo;
    },
  };
})();

(function () {
  if (!window.NS) return;
  const hero = document.querySelector('.hero');
  if (!hero) return;
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

(function () {
  document.querySelectorAll('[data-foto]').forEach((elemento) => {
    const imagen = new Image();
    imagen.onload = () => {
      elemento.style.setProperty('--foto', 'url("' + elemento.dataset.foto + '")');
      elemento.classList.add('con-foto');
      document.dispatchEvent(new CustomEvent('foto-lista', { detail: elemento }));
    };
    imagen.src = elemento.dataset.foto;
  });
})();

(function () {
  const seccion = document.querySelector('[data-prueba]');
  if (!seccion) return;
  const boton = seccion.querySelector('[data-hablar]');
  const texto = seccion.querySelector('[data-hablar-texto]');
  const estado = seccion.querySelector('[data-estado]');
  const voces = [...seccion.querySelectorAll('[data-voz-id]')];
  const inicial = estado.textContent;
  const SDK = 'https://cdn.jsdelivr.net/npm/retell-client-js-sdk@3.0.4/+esm';
  const SEGUNDOS = 120;
  let elegida = voces[0];
  let cliente = null;
  let llamada = null;
  let reloj = null;

  function preparar() {
    if (cliente) return Promise.resolve(cliente);
    return import(SDK).then(({ RetellClient }) => {
      cliente = new RetellClient({ key: seccion.dataset.llave });
      return cliente;
    });
  }

  function mostrar(mensaje, fase) {
    estado.textContent = mensaje;
    seccion.dataset.fase = fase;
  }

  function bloquear(activo) {
    voces.forEach((voz) => { voz.disabled = activo; });
  }

  function terminar(mensaje) {
    clearInterval(reloj);
    llamada = null;
    bloquear(false);
    boton.disabled = false;
    texto.textContent = 'Hablar con ' + elegida.dataset.nombre;
    mostrar(mensaje, 'fin');
  }

  function colgar() {
    clearInterval(reloj);
    if (llamada) llamada.end();
  }

  function contar() {
    let restante = SEGUNDOS;
    const pintar = () => {
      const seg = String(restante % 60).padStart(2, '0');
      mostrar('En llamada con ' + elegida.dataset.nombre + ' · ' + Math.floor(restante / 60) + ':' + seg, 'viva');
    };
    pintar();
    reloj = setInterval(() => {
      restante -= 1;
      if (restante <= 0) colgar();
      else pintar();
    }, 1000);
  }

  function error(detalle) {
    const micro = /permission|notallowed|microphone/i.test(String(detalle && (detalle.name + detalle.message)));
    terminar(micro ? 'Necesito permiso del micrófono para hablar contigo.' : 'No se pudo conectar. Intenta otra vez.');
  }

  async function hablar() {
    if (llamada) {
      colgar();
      return;
    }
    boton.disabled = true;
    bloquear(true);
    mostrar('Conectando con ' + elegida.dataset.nombre + '…', 'conectando');
    try {
      const listo = await preparar();
      llamada = listo.createWebCall({
        agent_id: seccion.dataset.agente,
        agent_override: { agent: { voice_id: elegida.dataset.vozId } },
        retell_llm_dynamic_variables: { nombre: elegida.dataset.nombre },
        hooks: {
          onStatus(valor) {
            if (valor === 'live') {
              boton.disabled = false;
              texto.textContent = 'Colgar';
              contar();
            }
          },
          onEnd() { if (llamada) terminar('Llamada terminada. ¿La quieres en tu negocio?'); },
          onError: error,
        },
      });
    } catch (fallo) {
      error(fallo);
    }
  }

  voces.forEach((voz) => {
    voz.addEventListener('click', () => {
      elegida = voz;
      voces.forEach((v) => v.setAttribute('aria-pressed', String(v === voz)));
      texto.textContent = 'Hablar con ' + voz.dataset.nombre;
      estado.textContent = inicial;
      delete seccion.dataset.fase;
    });
  });
  boton.addEventListener('click', hablar);

  if (seccion.dataset.llave) {
    new IntersectionObserver((entradas, vigia) => {
      if (entradas[0].isIntersecting) {
        vigia.disconnect();
        preparar().catch(() => {});
      }
    }, { rootMargin: '600px' }).observe(seccion);
  } else {
    boton.disabled = true;
    estado.textContent = 'La prueba en vivo estará disponible pronto.';
  }
})();

(function () {
  const elector = document.querySelector('[data-elector]');
  if (!elector) return;
  const hero = document.querySelector('[data-llamada]');
  const orbe = elector.querySelector('[data-hablar]');
  const titulo = elector.querySelector('[data-orbe-texto]');
  const sub = elector.querySelector('[data-estado]');
  const foto = elector.querySelector('[data-orbe-foto]');
  const personas = [...elector.querySelectorAll('[data-persona]')];
  const audio = new Audio();
  audio.preload = 'none';
  let turno = 0;
  let reloj = null;

  function detenerAudio() {
    audio.pause();
    hero.classList.remove('voz-sonando');
  }

  function pintar() {
    const persona = personas[turno];
    const nombre = persona.dataset.nombre;
    hero.dataset.persona = persona.dataset.persona;
    personas.forEach((p) => p.setAttribute('aria-pressed', String(p === persona)));
    titulo.textContent = 'Escucha a ' + nombre;
    sub.textContent = 'Ejemplo de voz';
    foto.style.backgroundImage = persona.classList.contains('con-foto') ? 'url("' + persona.dataset.foto + '")' : 'none';
    orbe.classList.toggle('orbe--con-foto', persona.classList.contains('con-foto'));
    orbe.setAttribute('aria-label', 'Escuchar ejemplo de voz de ' + nombre);
  }

  function elegir(indice) {
    turno = indice;
    detenerAudio();
    pintar();
  }

  function detenerGiro() {
    clearInterval(reloj);
    reloj = null;
  }

  personas.forEach((persona, i) => {
    persona.addEventListener('click', () => {
      detenerGiro();
      elegir(i);
    });
  });

  orbe.addEventListener('click', () => {
    detenerGiro();
    const persona = personas[turno];
    if (!persona.dataset.audio) return;
    if (!audio.paused) {
      detenerAudio();
      sub.textContent = 'Ejemplo de voz';
      return;
    }
    audio.src = persona.dataset.audio;
    hero.classList.add('voz-sonando');
    sub.textContent = 'Sonando…';
    audio.play().catch(() => {
      hero.classList.remove('voz-sonando');
      sub.textContent = 'Toca otra vez';
    });
  });
  audio.addEventListener('ended', () => {
    hero.classList.remove('voz-sonando');
    sub.textContent = 'Ejemplo de voz';
  });

  document.addEventListener('foto-lista', (evento) => { if (evento.detail === personas[turno]) pintar(); });
  pintar();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  reloj = setInterval(() => {
    if (!document.hidden && scrollY < innerHeight * 0.6) elegir((turno + 1) % personas.length);
  }, 3200);
})();

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

(function () {
  const panel = document.querySelector('[data-panel-agente]');
  const abrir = document.querySelector('[data-agente-abrir]');
  if (!panel || !abrir || !panel.showModal) return;
  const formulario = panel.querySelector('[data-agente-formulario]');

  function detenerScroll(detener) {
    document.documentElement.classList.toggle('agente-abierto', detener);
    if (window.NS && NS.lenis) NS.lenis[detener ? 'stop' : 'start']();
  }

  function cerrar() {
    panel.close();
  }

  function irA(destino) {
    cerrar();
    detenerScroll(false);
    const url = new URL(destino, location.href);
    const aqui = url.pathname === location.pathname;
    const objetivo = aqui && url.hash ? document.querySelector(url.hash) : null;
    if (!objetivo) {
      location.href = url.href;
      return;
    }
    if (window.NS && NS.lenis) NS.lenis.scrollTo(objetivo, { offset: -72, duration: 1.2 });
    else objetivo.scrollIntoView();
  }


  function mostrar() {
    panel.showModal();
    detenerScroll(true);
  }
  abrir.addEventListener('click', mostrar);
  document.querySelectorAll('[data-agente-abrir-extra]').forEach((boton) => boton.addEventListener('click', mostrar));
  panel.addEventListener('close', () => detenerScroll(false));
  panel.querySelector('[data-agente-cerrar]').addEventListener('click', cerrar);
  panel.addEventListener('click', (evento) => {
    if (evento.target === panel) cerrar();
  });
  panel.querySelectorAll('[data-destino]').forEach((opcion) => {
    opcion.addEventListener('click', () => irA(opcion.dataset.destino));
  });
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const texto = 'Hola, tengo una duda: ' + new FormData(formulario).get('mensaje');
    window.location.href = formulario.dataset.whatsapp + '?text=' + encodeURIComponent(texto);
  });

  // Se esconde donde estorbaria con formularios y controles principales.
  const zonas = ['#contacto', '#prueba'].map((selector) => document.querySelector(selector)).filter(Boolean);
  const visibles = new Set();
  const vigia = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) visibles.add(entrada.target);
      else visibles.delete(entrada.target);
    });
    abrir.classList.toggle('agente-boton--oculto', visibles.size > 0);
  }, { rootMargin: '-20% 0px -20% 0px' });
  zonas.forEach((zona) => vigia.observe(zona));
})();

(function () {
  const formulario = document.querySelector('[data-formulario]');
  if (!formulario) return;
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const datos = new FormData(formulario);
    const texto = 'Hola, soy ' + datos.get('nombre') + ' de ' + datos.get('negocio') + '. ' + datos.get('mensaje');
    window.location.href = formulario.dataset.whatsapp + '?text=' + encodeURIComponent(texto);
  });
})();

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
      gsap.fromTo(capas, { scale: 0.8, y: 70, opacity: 0.6 }, { scale: 1, y: 0, opacity: 1, ease: 'power2.out', immediateRender: false, scrollTrigger: dedo(seccion, 'top 100%', 'top 55%') });
      gsap.fromTo(capas, { scale: 1, opacity: 1 }, { scale: 1.08, opacity: 0.6, ease: 'power1.in', immediateRender: false, scrollTrigger: { trigger: seccion, start: 'bottom 40%', end: 'bottom 0%', scrub: 0.35 } });
    });
    gsap.to('.hero__texto', { y: -60, opacity: 0.4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.3 } });
    gsap.to('.elector', { y: -110, scale: 0.85, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.3 } });

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

    gsap.utils.toArray('.servicio').forEach((tarjeta) => {
      gsap.from(tarjeta, { y: 72, rotationX: -18, scale: 0.92, opacity: 0.85, transformOrigin: 'center top', ease: 'power2.out', scrollTrigger: dedo(tarjeta, 'top 100%', 'top 66%') });
    });

    gsap.utils.toArray('.giros__lista li, .pasos li').forEach((fila, i) => {
      gsap.from(fila, { x: i % 2 ? 42 : -42, opacity: 0.68, ease: 'power2.out', scrollTrigger: dedo(fila, 'top 98%', 'top 74%') });
    });

    gsap.utils.toArray('.grupo, .acordeon details, .creativos__lista li').forEach((fila) => {
      gsap.from(fila, { y: 26, opacity: 0.68, ease: 'power2.out', scrollTrigger: dedo(fila, 'top 98%', 'top 82%') });
    });

    gsap.fromTo('.cierre h2', { scale: 1.16 }, { scale: 1, ease: 'none', transformOrigin: 'left center', scrollTrigger: dedo('.cierre', 'top 100%', 'top 45%') });
  });
})();

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
