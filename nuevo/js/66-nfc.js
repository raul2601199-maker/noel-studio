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
(() => {
  // Tablilla NFC: se arrastra la linea verde de abajo hacia arriba para "imprimir" el diseño.
  const escena = document.querySelector('[data-nfc-escena]');
  if (!escena) return;
  const foto = escena.querySelector('.nfc-escena__foto');
  const agarre = escena.querySelector('.nfc-escena__agarre');
  const control = escena.querySelector('.nfc-escena__control');
  let arrastrando = false;

  const pintar = (p) => {
    p = Math.min(1, Math.max(0, p));
    escena.style.setProperty('--p', p.toFixed(4));
    escena.classList.toggle('es-blanca', p < 0.5);
    control.value = Math.round(p * 100);
  };
  // La linea vive entre el 80.5% (abajo) y el 17% (arriba) del alto de la foto.
  const desdeY = (y) => {
    const caja = foto.getBoundingClientRect();
    return (0.805 - (y - caja.top) / caja.height) / 0.635;
  };
  const empezar = (e) => {
    arrastrando = true;
    escena.classList.add('ya-movio');
    pintar(desdeY(e.clientY));
    e.preventDefault();
  };
  // Mouse: se arrastra desde cualquier parte de la foto. Dedo: solo desde el botón,
  // para que deslizar sobre la foto siga bajando la página.
  foto.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || e.target === agarre) empezar(e);
  });
  addEventListener('pointermove', (e) => { if (arrastrando) pintar(desdeY(e.clientY)); });
  addEventListener('pointerup', () => { arrastrando = false; });
  addEventListener('pointercancel', () => { arrastrando = false; });
  // Teclado: flechas sobre el control oculto.
  control.addEventListener('input', () => { escena.classList.add('ya-movio'); pintar(control.value / 100); });
  // Cambiar entre diseño propio y reseñas de Google; se muestra completo al elegir.
  const disenos = escena.querySelectorAll('[data-diseno]');
  escena.querySelectorAll('[data-ver]').forEach((boton) => {
    boton.addEventListener('click', () => {
      disenos.forEach((img) => { img.hidden = img.dataset.diseno !== boton.dataset.ver; });
      escena.querySelectorAll('[data-ver]').forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
      escena.classList.add('ya-movio');
      pintar(1);
    });
  });
  pintar(0.15);
})();
