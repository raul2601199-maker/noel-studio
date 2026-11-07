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
// Vista previa del agente: orienta a la persona, sin fingir respuestas.
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
