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
  // Agenda de visita: pinta los proximos dias habiles y arma el mensaje de WhatsApp.
  const form = document.querySelector('[data-agenda]');
  if (!form) return;
  const dias = form.querySelector('[data-agenda-dias]');
  const direccion = form.querySelector('[data-agenda-direccion]');
  const NOMBRES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  // Desde mañana, 8 dias de lunes a sabado (los domingos no se atiende).
  const html = [];
  const d = new Date();
  while (html.length < 8) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) continue;
    const valor = LARGOS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()];
    html.push('<label><input type="radio" name="dia" value="' + valor + '"' + (html.length ? '' : ' required') + '><span><small>' + NOMBRES[d.getDay()] + '</small><b>' + d.getDate() + '</b></span></label>');
  }
  dias.innerHTML = html.join('');

  // La direccion solo se pide si la visita es en el negocio.
  const revisarModo = () => {
    const enNegocio = form.modo.value === 'En mi negocio';
    direccion.hidden = !enNegocio;
    direccion.querySelector('input').required = enNegocio;
  };
  form.querySelectorAll('input[name="modo"]').forEach((r) => r.addEventListener('change', revisarModo));
  revisarModo();

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const datos = new FormData(form);
    const intereses = datos.getAll('interes');
    const lineas = [
      'Hola Raúl, quiero agendar una cita.',
      '',
      'Modo: ' + datos.get('modo'),
      'Día: ' + datos.get('dia') + ', ' + datos.get('hora'),
      'Nombre: ' + datos.get('nombre'),
      'Negocio: ' + datos.get('negocio'),
    ];
    if (datos.get('modo') === 'En mi negocio') lineas.push('Dirección: ' + datos.get('direccion'));
    if (intereses.length) lineas.push('Me interesa: ' + intereses.join(', '));
    window.location.href = form.dataset.whatsapp + '?text=' + encodeURIComponent(lineas.join('\n'));
  });
})();
