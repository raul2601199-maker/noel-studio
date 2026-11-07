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
// Fondo fijo: camino de circulos LED blancos sobre negro.
(function () {
  const lienzo = document.querySelector('[data-viaje]');
  const ctx = lienzo && lienzo.getContext('2d');
  if (!ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Cuanta luz da el tunel en cada momento de la pagina.
  const MUNDOS = {
    pleno: { luz: 1, velo: 0 },
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
  halo.addColorStop(0, 'rgba(255,255,255,1)');
  halo.addColorStop(0.14, 'rgba(255,255,255,.95)');
  halo.addColorStop(0.32, 'rgba(225,235,255,.26)');
  halo.addColorStop(1, 'rgba(225,235,255,0)');
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
      ctx.strokeStyle = '#e8eeff';
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
      ctx.strokeStyle = '#ffffff';
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
