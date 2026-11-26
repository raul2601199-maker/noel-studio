// =========================================================
// Funciones compartidas por todas las páginas
// =========================================================
(function () {
  'use strict';

  var LOGO = 'img/logo-640.webp';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function dinero(n) {
    var v = Number(n) || 0;
    return '$' + v.toLocaleString('es-MX', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }

  // 100 números -> 2 cifras (00-99); 1000 -> 3 cifras
  function cifras(total) { return String((total || 100) - 1).length; }
  function pad(n, total) { return String(n).padStart(cifras(total), '0'); }

  // Precio más barato para N boletos usando los combos (ej. 3x2)
  function mejorPrecio(cantidad, precio, combos) {
    var dp = [0], uso = [null];
    combos = (combos || []).filter(function (c) { return c && c.cantidad > 0 && c.precio > 0; });
    for (var i = 1; i <= cantidad; i++) {
      dp[i] = dp[i - 1] + precio; uso[i] = null;
      combos.forEach(function (c) {
        if (c.cantidad <= i && dp[i - c.cantidad] + Number(c.precio) < dp[i]) { dp[i] = dp[i - c.cantidad] + Number(c.precio); uso[i] = c; }
      });
    }
    var normal = cantidad * precio;
    return { total: dp[cantidad], normal: normal, ahorro: normal - dp[cantidad] };
  }

  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  function fechaLarga(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()];
  }
  function hora(iso) {
    var d = new Date(iso);
    var h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0');
    return (h % 12 || 12) + ':' + m + (h < 12 ? ' a. m.' : ' p. m.');
  }
  // "raul parra" -> "Raul Parra"
  function capitalizar(t) {
    return String(t || '').toLowerCase().replace(/(^|\s)(\S)/g, function (x, e, l) { return e + l.toUpperCase(); });
  }
  // "6142251419" -> "614 225 1419"
  function telefono(t) {
    t = String(t || '').replace(/\D/g, '');
    return t.length === 10 ? t.slice(0, 3) + ' ' + t.slice(3, 6) + ' ' + t.slice(6) : t;
  }
  function fechaCorta(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.getDate() + ' ' + MESES[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear();
  }

  // Contador regresivo. Devuelve una función para detenerlo.
  function contador(el, iso, alTerminar) {
    var fin = new Date(iso).getTime();
    function dos(n) { return String(n).padStart(2, '0'); }
    function pinta() {
      var ms = fin - Date.now();
      if (ms <= 0) {
        el.innerHTML = '<span class="contador-fin">Hoy se juega</span>';
        clearInterval(t); if (alTerminar) alTerminar();
        return;
      }
      var s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
      el.innerHTML =
        '<div><b>' + d + '</b><span>días</span></div>' +
        '<div><b>' + dos(h) + '</b><span>hrs</span></div>' +
        '<div><b>' + dos(m) + '</b><span>min</span></div>' +
        '<div><b>' + dos(s % 60) + '</b><span>seg</span></div>';
    }
    el.classList.add('contador');
    el.setAttribute('aria-label', 'Tiempo para el sorteo');
    var t = setInterval(pinta, 1000); pinta();
    return function () { clearInterval(t); };
  }

  function waLink(numero, texto) {
    var n = String(numero || '').replace(/\D/g, '');
    // api.whatsapp.com en lugar de wa.me: la redirección de wa.me rompe los emojis
    return 'https://api.whatsapp.com/send?phone=' + n + (texto ? '&text=' + encodeURIComponent(texto) : '');
  }

  var toastT;
  function toast(msg) {
    var el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, 2600);
  }

  function copiar(texto) {
    var ok = function () { toast('Copiado: ' + texto); };
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto).then(ok, function () { copiarViejo(texto); ok(); });
    copiarViejo(texto); ok();
  }
  function copiarViejo(texto) {
    var t = document.createElement('textarea'); t.value = texto; t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove();
  }

  function imgPremio(src, alt) {
    if (src) return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" onerror="this.src=\'' + LOGO + '\';this.className=\'es-logo\'">';
    return '<img class="es-logo" src="' + LOGO + '" alt="Aldama Rifa" loading="lazy">';
  }

  function avanceHTML(r) {
    var total = r.total_numeros || 100;
    // Para el público, apartados y pagados cuentan igual como vendidos
    var pv = Math.round((r.pagados + r.apartados) / total * 100), pa = 0;
    var vendido = Math.min(100, Math.round((r.pagados + r.apartados) / total * 100));
    var libres = total - r.pagados - r.apartados;
    return '<div class="avance">' +
      '<div class="avance-barra" role="img" aria-label="' + vendido + '% vendido"><i class="v" style="width:' + pv + '%"></i><i class="a" style="width:' + pa + '%"></i></div>' +
      '<div class="avance-datos"><span><b>' + vendido + '%</b> vendido</span><span>' +
      (libres <= 0 ? '<b>Agotado</b>' : (libres <= 15 ? '¡Quedan <b>' + libres + '</b>!' : 'Quedan <b>' + libres + '</b>')) + '</span></div></div>';
  }

  // Íconos (trazos simples, se pintan con currentColor)
  var ICON = {
    wa: '<svg class="icono" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m7.5 12.5 3 3 6-6.5"/></svg>',
    trebol: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 11.2C10.6 8 6.2 7.9 6.2 10.9c0 2.2 3 1.9 5.8.3zM12.8 12c3.2-1.4 3.3-5.8.3-5.8-2.2 0-1.9 3-.3 5.8zM12 12.8c1.4 3.2 5.8 3.3 5.8.3 0-2.2-3-1.9-5.8-.3zM11.2 12c-3.2 1.4-3.3 5.8-.3 5.8 2.2 0 1.9-3 .3-5.8z"/><path d="M12 12c2 3 3.5 6.5 3 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    reloj: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg>',
    envivo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/></svg>',
    regalo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>',
    fb: '<svg class="icono" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.2h2.8V22h3.4z"/></svg>',
    ig: '<svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
    tt: '<svg class="icono" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.8 5.8 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z"/></svg>'
  };

  // Ajustes (WhatsApp, cuentas) se cargan una vez y se comparten
  var ajustesP = null;
  function ajustes() {
    if (!ajustesP) ajustesP = window.RA_DB.ajustes().catch(function () { return { whatsapp: '', cuentas: [] }; });
    return ajustesP;
  }

  // Pinta enlaces de WhatsApp/redes en cualquier página
  function pintarContacto() {
    return ajustes().then(function (a) {
      document.querySelectorAll('[data-wa]').forEach(function (el) {
        el.href = waLink(a.whatsapp, el.getAttribute('data-wa') || 'Hola, quiero información de las rifas');
        el.target = '_blank'; el.rel = 'noopener';
      });
      document.querySelectorAll('[data-fb]').forEach(function (el) {
        if (a.facebook) { el.href = a.facebook; el.hidden = false; } else el.hidden = true;
      });
      document.querySelectorAll('[data-ig]').forEach(function (el) {
        if (a.instagram) { el.href = a.instagram; el.hidden = false; } else el.hidden = true;
      });
      document.querySelectorAll('[data-tt]').forEach(function (el) {
        if (a.tiktok) { el.href = a.tiktok; el.hidden = false; } else el.hidden = true;
      });
      return a;
    });
  }

  function cuentasHTML(cuentas) {
    if (!cuentas || !cuentas.length) return '<p class="vacio">Pide los datos de pago por WhatsApp.</p>';
    return cuentas.map(function (c) {
      var filas = '';
      if (c.clabe) filas += fila('CLABE', c.clabe);
      if (c.tarjeta) filas += fila('Tarjeta', c.tarjeta);
      if (c.cuenta) filas += fila('Cuenta', c.cuenta);
      return '<div class="cuenta"><h3>' + esc(c.banco) + '</h3>' +
        (c.titular ? '<div class="cuenta-fila"><div><span>A nombre de</span><b style="font-size:17px;letter-spacing:0">' + esc(c.titular) + '</b></div></div>' : '') +
        filas + '</div>';
    }).join('');
    function fila(et, val) {
      return '<div class="cuenta-fila"><div><span>' + et + '</span><b>' + esc(val) + '</b></div>' +
        '<button class="copiar" type="button" data-copiar="' + esc(String(val).replace(/\s/g, '')) + '">Copiar</button></div>';
    }
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copiar]');
    if (b) copiar(b.getAttribute('data-copiar'));
  });

  function avisoDemo() {
    if (window.RA_DB.modo !== 'demo') return;
    var d = document.createElement('div');
    d.className = 'demo-aviso';
    d.innerHTML = '<b>Modo demo:</b> todo se guarda solo en este navegador. Los datos son de ejemplo.';
    var top = document.querySelector('.topbar');
    if (top) top.after(d); else document.body.prepend(d);
  }

  window.RA = {
    LOGO: LOGO, esc: esc, dinero: dinero, cifras: cifras, pad: pad, mejorPrecio: mejorPrecio,
    fechaLarga: fechaLarga, fechaCorta: fechaCorta, hora: hora, capitalizar: capitalizar, telefono: telefono, contador: contador, waLink: waLink,
    toast: toast, copiar: copiar, imgPremio: imgPremio, avanceHTML: avanceHTML, ICON: ICON,
    ajustes: ajustes, pintarContacto: pintarContacto, cuentasHTML: cuentasHTML, avisoDemo: avisoDemo
  };

  // <span data-icon="wa"></span> se convierte en el ícono
  function iconos(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
      var k = el.getAttribute('data-icon');
      if (ICON[k]) { el.outerHTML = ICON[k]; }
    });
  }
  window.RA.iconos = iconos;

  document.addEventListener('DOMContentLoaded', function () {
    try { iconos(); } catch (e) {}
    try { avisoDemo(); } catch (e) {}
    pintarContacto().catch(function () {});
    var y = document.getElementById('anio'); if (y) y.textContent = new Date().getFullYear();
  });
})();
