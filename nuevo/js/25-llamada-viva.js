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
// Prueba maestra: llamada real con la voz elegida.
(function () {
  const seccion = document.querySelector('[data-prueba]');
  if (!seccion) return;
  const boton = seccion.querySelector('[data-hablar]');
  const texto = seccion.querySelector('[data-hablar-texto]');
  const estado = seccion.querySelector('[data-estado]');
  const voces = [...seccion.querySelectorAll('[data-voz-id]')];
  const inicial = estado.textContent;
  const SDK = 'https://cdn.jsdelivr.net/npm/retell-client-js-sdk@3.0.4/+esm';
  const SEGUNDOS = 300;
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

  // reCAPTCHA v3: si hay llave de sitio, se carga el script de Google al primer clic
  // y se pide un token nuevo antes de cada llamada (Retell lo exige si esta activado).
  const SITIO = seccion.dataset.recaptcha || '';
  let google = null;
  function cargarGoogle() {
    if (!SITIO) return Promise.resolve(null);
    if (google) return google;
    google = new Promise((listo, falla) => {
      const s = document.createElement('script');
      s.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(SITIO);
      s.async = true;
      s.onload = () => window.grecaptcha.ready(() => listo(window.grecaptcha));
      s.onerror = falla;
      document.head.appendChild(s);
    });
    return google;
  }
  async function boleto() {
    const g = await cargarGoogle();
    return g ? g.execute(SITIO, { action: 'llamada' }) : undefined;
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
      const [listo, recaptchaToken] = await Promise.all([preparar(), boleto()]);
      llamada = listo.createWebCall({
        agent_id: seccion.dataset.agente,
        ...(recaptchaToken ? { recaptchaToken } : {}),
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
