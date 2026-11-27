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
// Convierte el formulario en un mensaje de WhatsApp.
(function () {
  const formulario = document.querySelector('[data-formulario]');
  if (!formulario) return;
  const avisos = { nombre: 'Escribe tu nombre', negocio: 'Escribe el nombre de tu negocio', mensaje: 'Cuéntanos qué necesitas' };
  // Al volver a escribir se quita el aviso, para que el navegador deje enviar.
  formulario.addEventListener('input', (evento) => evento.target.setCustomValidity && evento.target.setCustomValidity(''));
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    // required del navegador acepta "   ": se recorta cada campo y se avisa si quedo vacio.
    const valores = {};
    for (const nombre of Object.keys(avisos)) {
      const campo = formulario.elements[nombre];
      valores[nombre] = (campo ? campo.value : '').trim();
      if (campo && !valores[nombre]) {
        campo.setCustomValidity(avisos[nombre]);
        campo.reportValidity();
        return;
      }
    }
    const texto = 'Hola, soy ' + valores.nombre + ' de ' + valores.negocio + '. ' + valores.mensaje;
    window.location.href = formulario.dataset.whatsapp + '?text=' + encodeURIComponent(texto);
  });
})();
