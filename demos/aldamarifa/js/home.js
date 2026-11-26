// Página principal: cartelera, ganadores y formas de pago
(function () {
  'use strict';
  var RA = window.RA, DB = window.RA_DB;
  var $id = function (i) { return document.getElementById(i); };

  function tarjeta(r) {
    var total = r.total_numeros || 100;
    var vendidos = r.pagados + r.apartados, libres = total - vendidos;
    var pct = Math.min(100, Math.round(vendidos / total * 100));
    var fin = r.estado === 'finalizada';
    var estado = '';
    if (fin) estado = '<span class="tab-estado gris">Finalizada</span>';
    else if (r.estado === 'cerrada') estado = '<span class="tab-estado gris">Venta cerrada</span>';
    else if (libres <= 0) estado = '<span class="tab-estado gris">Agotada</span>';
    else if (libres <= 15) estado = '<span class="tab-estado">Se va express</span>';
    else estado = '<span class="tab-estado verde"><i></i>A la venta</span>';

    var combos = (r.combos || []).slice(0, 3).map(function (c) {
      var tag = c.etiqueta && !/boleto/i.test(c.etiqueta) ? '<b>' + RA.esc(c.etiqueta) + '</b> · ' : '';
      return '<span class="tab-combo">' + tag + c.cantidad + ' por ' + RA.dinero(c.precio) + '</span>';
    }).join('');

    var cuerpo = fin
      ? '<div class="tab-ganador"><span>Número ganador</span><b>' + (r.numero_ganador != null ? RA.pad(r.numero_ganador, total) : '—') + '</b>' +
        (r.ganador_nombre ? '<em>' + RA.esc(r.ganador_nombre) + '</em>' : '') + '</div>'
      : '<div class="tab-avance">' +
          '<div class="tab-avance-top"><b>' + pct + '%</b><span>vendido</span><em>' +
            (libres <= 0 ? 'Agotado' : 'Quedan <b>' + libres + '</b> de ' + total) + '</em></div>' +
          '<div class="tab-barra" role="img" aria-label="' + pct + '% vendido"><i style="width:' + pct + '%"></i></div>' +
        '</div>' +
        (combos ? '<div class="tab-combos">' + combos + '</div>' : '') +
        '<div class="tab-cuenta" data-cuenta="' + RA.esc(r.fecha_sorteo) + '"></div>' +
        '<span class="btn btn-rojo btn-bloque tab-btn">' + (r.estado === 'activa' && libres > 0 ? 'Apartar mis boletos' : 'Ver la rifa') + '</span>';

    return '<a class="tablilla' + (fin ? ' es-fin' : '') + '" href="rifa.html?id=' + encodeURIComponent(r.id) + '">' +
      '<div class="tab-cartel">' + RA.imgPremio(r.imagen, r.premio) + estado +
        '<span class="tab-precio"><small>Boleto</small>' + RA.dinero(r.precio) + '</span>' +
        '<div class="tab-titulo"><h3>' + RA.esc(r.titulo) + '</h3><p>' + RA.esc(r.premio) + '</p></div>' +
      '</div>' +
      '<div class="tab-talon">' +
        '<div class="tab-fecha">' + RA.ICON.reloj + '<span>Sorteo: <b>' + RA.fechaLarga(r.fecha_sorteo) + '</b> · <span style="white-space:nowrap">' + RA.hora(r.fecha_sorteo) + '</span></span></div>' +
        cuerpo +
      '</div>' +
    '</a>';
  }

  function cargarRifas() {
    var cont = document.getElementById('cartelera');
    DB.listRifas().then(function (rifas) {
      var activas = rifas.filter(function (r) { return r.estado === 'activa' || r.estado === 'cerrada'; });
      var pasadas = rifas.filter(function (r) { return r.estado === 'finalizada'; }).slice(0, 3);
      if (!activas.length) {
        cont.innerHTML = '<div class="vacio" style="grid-column:1/-1"><img src="' + RA.LOGO + '" alt="">' +
          '<p><b>Por ahora no hay rifas abiertas.</b><br>Escríbenos por WhatsApp y te avisamos de la siguiente.</p>' +
          '<a class="btn btn-verde" data-wa="Hola, avísenme de la siguiente rifa" href="#">Avísame de la próxima</a></div>';
        RA.pintarContacto();
      } else {
        cont.innerHTML = activas.map(tarjeta).join('');
        // Con una sola rifa abierta, el botón grande lleva directo a sus boletos
        var abiertas = activas.filter(function (r) { return r.estado === 'activa'; });
        if (abiertas.length === 1) $id('ctaDisponibles').href = 'rifa.html?id=' + encodeURIComponent(abiertas[0].id);
      }
      if (pasadas.length) {
        cont.insertAdjacentHTML('afterend',
          '<h3 class="mt" style="margin-top:40px;margin-bottom:16px">Rifas pasadas</h3><div class="cartelera">' + pasadas.map(tarjeta).join('') + '</div>');
      }
      document.querySelectorAll('[data-cuenta]').forEach(function (el) { RA.contador(el, el.getAttribute('data-cuenta')); });
    }).catch(function (e) {
      console.error(e);
      cont.innerHTML = '<p class="vacio">No se pudieron cargar las rifas. Recarga la página o escríbenos por WhatsApp.</p>';
    });
  }

  function cargarGanadores() {
    var cont = document.getElementById('listaGanadores');
    DB.premios().then(function (lista) {
      if (!lista.length) {
        cont.innerHTML = '<p class="vacio" style="grid-column:1/-1">Aquí aparecerán las fotos de cada premio entregado.</p>';
        return;
      }
      document.getElementById('cuantosGanadores').textContent = lista.length + (lista.length === 1 ? ' premio entregado' : ' premios entregados');
      cont.innerHTML = lista.slice(0, 8).map(function (p) {
        return '<figure class="ganador" style="margin:0">' +
          '<div class="ganador-foto">' + RA.imgPremio(p.foto, 'Entrega de ' + p.titulo + ' a ' + p.ganador) + '</div>' +
          '<figcaption class="ganador-info">' + (p.numero ? '<span class="ganador-num">#' + RA.esc(p.numero) + '</span>' : '') +
          '<b>' + RA.esc(p.ganador) + '</b><span>' + RA.esc(p.titulo) + ' · ' + RA.fechaCorta(p.fecha + 'T12:00:00') + '</span></figcaption></figure>';
      }).join('');
    }).catch(function () { cont.innerHTML = ''; });
  }

  function cargarPagos() {
    RA.ajustes().then(function (a) {
      document.getElementById('cuentas').innerHTML = RA.cuentasHTML(a.cuentas);
    });
  }

  function sellos() {
    var el = document.getElementById('heroSellos');
    el.innerHTML =
      '<span>' + RA.ICON.trebol + 'Ganador con Lotería Nacional</span>' +
      '<span>' + RA.ICON.envivo + 'Sorteo en vivo</span>' +
      '<span>' + RA.ICON.check + 'Premios entregados</span>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    try { sellos(); } catch (e) {}
    cargarRifas();
    cargarGanadores();
    cargarPagos();
  });
})();
