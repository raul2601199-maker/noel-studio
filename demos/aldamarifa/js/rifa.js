// Página de una rifa: cuadrícula, maquinita, combos y apartado por WhatsApp
(function () {
  'use strict';
  var RA = window.RA, DB = window.RA_DB;

  var rifa = null;          // datos de la rifa
  var estado = {};          // { numero: 'apartado' | 'pagado' }
  var sel = [];             // números elegidos
  var pagina = 0;           // para rifas de 1,000 o más
  var POR_PAGINA = 100;
  var ajustes = { whatsapp: '', cuentas: [] };
  var ultimoApartado = null;

  var $ = function (id) { return document.getElementById(id); };
  var id = new URLSearchParams(location.search).get('id');

  function abierta() { return rifa && rifa.estado === 'activa' && new Date(rifa.fecha_sorteo).getTime() > Date.now() - 3600e3; }

  // ---------- Cabeza ----------
  function pintarCabeza() {
    var r = rifa, total = r.total_numeros;
    document.title = r.titulo + ' — Aldama Rifa';
    var ganador = r.estado === 'finalizada' && r.numero_ganador != null;
    $('cabeza').innerHTML =
      '<div class="rifa-foto' + (r.imagen ? '' : ' sin-foto') + '">' + RA.imgPremio(r.imagen, r.premio) + '</div>' +
      '<div class="rifa-info">' +
        (r.minimo_venta_pct && r.estado === 'activa' ? '<span class="sello-minimo">Sujeto al ' + r.minimo_venta_pct + '% de venta</span>' : '') +
        '<h1>' + RA.esc(r.titulo) + '</h1>' +
        '<p class="premio-txt">' + RA.esc(r.premio) + '</p>' +
        '<div class="rifa-datos">' +
          '<div class="dato"><span>Boleto</span><b>' + RA.dinero(r.precio) + '</b></div>' +
          '<div class="dato"><span>Sorteo</span><b>' + RA.fechaLarga(r.fecha_sorteo) + '</b></div>' +
          '<div class="dato"><span>Números</span><b>' + RA.pad(0, total) + '–' + RA.pad(total - 1, total) + '</b></div>' +
          (r.estado === 'activa' ? '<div class="dato"><span>Apartado</span><b>' + r.horas_apartado + ' horas</b></div>' : '') +
        '</div>' +
        (ganador
          ? '<div class="dato" style="border-color:var(--oro)"><span>Número ganador</span><b style="font-size:34px">' + RA.pad(r.numero_ganador, total) + '</b>' +
            (r.ganador_nombre ? ' <span style="text-transform:none;letter-spacing:0;font-size:16px;color:#fff">· ' + RA.esc(r.ganador_nombre) + '</span>' : '') + '</div>'
          : '<div id="avanceCabeza"></div><div id="cuentaCabeza"></div>') +
        (r.descripcion ? '<p style="margin:0;color:#CFD7F0">' + RA.esc(r.descripcion) + '</p>' : '') +
        (abierta() ? '<a class="btn btn-verde" href="#elegir" style="justify-self:start">Elegir mis números</a>' : '') +
      '</div>';
    if (!ganador) RA.contador($('cuentaCabeza'), r.fecha_sorteo);
    pintarAvance();
  }

  function pintarAvance() {
    var el = $('avanceCabeza'); if (!el) return;
    var ap = 0, pa = 0;
    Object.keys(estado).forEach(function (k) { if (estado[k] === 'apartado') ap++; else pa++; });
    el.innerHTML = RA.avanceHTML({ total_numeros: rifa.total_numeros, apartados: ap, pagados: pa });
  }

  // ---------- Combos y bono ----------
  function pintarCombos() {
    var combos = rifa.combos || [];
    var hayBono = rifa.bono_minutos > 0 && rifa.bono_texto;
    if (!combos.length && !hayBono) return;
    $('seccionCombos').hidden = false;
    $('combos').innerHTML = combos.map(function (c, i) {
      var antes = c.cantidad * rifa.precio;
      return '<div class="combo">' +
        (c.etiqueta ? '<span class="combo-tag">' + RA.esc(c.etiqueta) + '</span>' : '') +
        '<span class="combo-linea">' + c.cantidad + ' boletos por <em>' + RA.dinero(c.precio) + '</em></span>' +
        (antes > c.precio ? '<span class="combo-antes">Antes ' + RA.dinero(antes) + '</span>' : '') +
        (abierta() ? '<button class="btn btn-verde btn-chico" type="button" data-combo="' + i + '">Elegir</button>' : '') +
      '</div>';
    }).join('');
    if (!combos.length) $('combos').hidden = true;
    if (hayBono) {
      $('bono').innerHTML = '<div class="bono">' + RA.ICON.regalo +
        '<div><b>Bono por pronto pago</b>Paga en los primeros ' + rifa.bono_minutos + ' minutos después de apartar: ' + RA.esc(rifa.bono_texto) + '.</div></div>';
    }
  }

  // ---------- Tablero ----------
  function pintarPaginas() {
    var total = rifa.total_numeros;
    if (total <= POR_PAGINA) return;
    var n = Math.ceil(total / POR_PAGINA), el = $('paginas');
    el.hidden = false;
    if (n <= 10) {
      var h = '';
      for (var i = 0; i < n; i++) {
        h += '<button type="button" data-pag="' + i + '" aria-pressed="' + (i === pagina) + '">' +
          RA.pad(i * POR_PAGINA, total) + '–' + RA.pad(i * POR_PAGINA + POR_PAGINA - 1, total) + '</button>';
      }
      el.innerHTML = h;
    } else {
      var opts = '';
      for (var j = 0; j < n; j++) opts += '<option value="' + j + '"' + (j === pagina ? ' selected' : '') + '>' + RA.pad(j * POR_PAGINA, total) + '–' + RA.pad(j * POR_PAGINA + POR_PAGINA - 1, total) + '</option>';
      el.innerHTML = '<label>Rango: <select class="campo" id="selPagina" style="width:auto;min-height:40px">' + opts + '</select></label>';
    }
  }

  function pintarTablero() {
    var total = rifa.total_numeros, t = $('tablero');
    t.classList.toggle('mil', total > 100);
    var desde = total > POR_PAGINA ? pagina * POR_PAGINA : 0;
    var hasta = Math.min(total, desde + POR_PAGINA);
    var h = '', cerrada = !abierta();
    for (var n = desde; n < hasta; n++) {
      // Para el público, apartado y pagado se ven igual: ocupado
      var e = estado[n] ? 'pagado' : null, esSel = sel.indexOf(n) > -1;
      var cls = 'num' + (e ? ' ' + e : '') + (esSel ? ' sel' : '');
      var etiqueta = 'Número ' + RA.pad(n, total) + (e ? ', ocupado' : esSel ? ', seleccionado' : ', libre');
      h += '<button type="button" class="' + cls + '" data-n="' + n + '" aria-label="' + etiqueta + '"' +
        (e || cerrada ? ' disabled' : '') + ' aria-pressed="' + esSel + '">' + RA.pad(n, total) + '</button>';
    }
    t.innerHTML = h;
  }

  function pintarEstadoVenta() {
    var el = $('estadoVenta'), r = rifa;
    if (abierta()) { el.innerHTML = ''; return; }
    var msg = r.estado === 'finalizada' ? 'Esta rifa ya se jugó.' + (r.numero_ganador != null ? ' Ganó el número <b>' + RA.pad(r.numero_ganador, r.total_numeros) + '</b>.' : '')
      : r.estado === 'cerrada' ? 'La venta de esta rifa está cerrada.' : 'Esta rifa ya no está a la venta.';
    el.innerHTML = '<p class="aviso-concepto" style="margin:0 0 16px;background:var(--crema);border-color:var(--oro);color:var(--azul-tinta)">' + msg +
      ' <a href="index.html#rifas">Ver rifas activas</a></p>';
    document.querySelector('.herramientas').hidden = true;
  }

  function libres() {
    var l = [];
    for (var n = 0; n < rifa.total_numeros; n++) if (!estado[n] && sel.indexOf(n) < 0) l.push(n);
    return l;
  }

  // ---------- Selección y carrito ----------
  function alternar(n) {
    if (estado[n] || !abierta()) return;
    var i = sel.indexOf(n);
    if (i > -1) sel.splice(i, 1); else sel.push(n);
    actualizar();
  }

  function actualizar() {
    pintarTablero();
    var c = $('carrito');
    if (!sel.length) { c.classList.remove('visible'); document.body.classList.remove('con-carrito'); return; }
    var orden = sel.slice().sort(function (a, b) { return a - b; });
    var p = RA.mejorPrecio(sel.length, rifa.precio, rifa.combos);
    $('carritoNums').textContent = sel.length + (sel.length === 1 ? ' boleto: ' : ' boletos: ') +
      orden.map(function (n) { return RA.pad(n, rifa.total_numeros); }).join(', ');
    $('carritoTotal').innerHTML = RA.dinero(p.total) + (p.ahorro > 0 ? '<small>Ahorras ' + RA.dinero(p.ahorro) + '</small>' : '');
    c.classList.add('visible'); document.body.classList.add('con-carrito');
  }

  function azar(cuantos, conEfecto) {
    var l = libres();
    if (!l.length) { RA.toast('Ya no quedan números libres'); return; }
    cuantos = Math.min(cuantos, l.length);
    var elegidos = [];
    for (var i = 0; i < cuantos; i++) {
      var k = Math.floor(Math.random() * l.length);
      elegidos.push(l.splice(k, 1)[0]);
    }
    if (!conEfecto || matchMedia('(prefers-reduced-motion: reduce)').matches) { sel = sel.concat(elegidos); actualizar(); irA(elegidos[0]); return; }
    // Pequeña "tómbola" visual antes de mostrar los números
    var botones = Array.prototype.slice.call(document.querySelectorAll('.num:not([disabled])'));
    var vueltas = 0;
    var t = setInterval(function () {
      botones.forEach(function (b) { b.classList.remove('sel'); });
      for (var j = 0; j < cuantos && botones.length; j++) botones[Math.floor(Math.random() * botones.length)].classList.add('sel');
      if (++vueltas > 9) {
        clearInterval(t);
        sel = sel.concat(elegidos); actualizar(); irA(elegidos[0]);
        RA.toast('La maquinita eligió: ' + elegidos.map(function (n) { return RA.pad(n, rifa.total_numeros); }).join(', '));
      }
    }, 70);
  }

  function irA(n) {
    if (rifa.total_numeros > POR_PAGINA) {
      var p = Math.floor(n / POR_PAGINA);
      if (p !== pagina) { pagina = p; pintarPaginas(); pintarTablero(); }
    }
    var b = document.querySelector('.num[data-n="' + n + '"]');
    if (b) {
      b.scrollIntoView({ behavior: 'smooth', block: 'center' });
      b.classList.remove('brilla'); void b.offsetWidth; b.classList.add('brilla');
    }
  }

  function buscar(e) {
    e.preventDefault();
    var v = $('buscarNum').value.replace(/\D/g, '');
    if (v === '') return;
    var n = parseInt(v, 10);
    if (n >= rifa.total_numeros) { RA.toast('Los números van del ' + RA.pad(0, rifa.total_numeros) + ' al ' + RA.pad(rifa.total_numeros - 1, rifa.total_numeros)); return; }
    $('soloLibres').checked = false; $('tablero').classList.remove('oculta-ocupados');
    var e2 = estado[n];
    if (e2) { irA(n); RA.toast('El ' + RA.pad(n, rifa.total_numeros) + ' ya está ocupado. Prueba otro.'); return; }
    if (sel.indexOf(n) < 0) { sel.push(n); actualizar(); }
    irA(n);
    RA.toast('¡El ' + RA.pad(n, rifa.total_numeros) + ' está libre! Ya lo agregamos.');
  }

  // ---------- Apartar ----------
  function abrirModal(html) {
    $('modalCaja').innerHTML = html;
    $('modal').hidden = false;
    document.body.style.overflow = 'hidden';
    var f = $('modalCaja').querySelector('input, .btn'); if (f) setTimeout(function () { f.focus(); }, 50);
  }
  function cerrarModal() {
    $('modal').hidden = true; document.body.style.overflow = '';
  }

  function guardado(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }

  function formApartar() {
    if (!sel.length) return;
    var orden = sel.slice().sort(function (a, b) { return a - b; });
    var p = RA.mejorPrecio(sel.length, rifa.precio, rifa.combos);
    abrirModal(
      '<button class="modal-cerrar" type="button" data-cerrar aria-label="Cerrar">×</button>' +
      '<h2 id="modalTitulo">Apartar boletos</h2>' +
      '<p style="margin:0;color:var(--gris)">' + RA.esc(rifa.titulo) + '</p>' +
      '<div class="resumen">' +
        '<div class="resumen-nums">' + orden.map(function (n) { return '<span>' + RA.pad(n, rifa.total_numeros) + '</span>'; }).join('') + '</div>' +
        '<div style="display:flex;justify-content:space-between;margin-top:8px"><span>' + sel.length + ' boleto' + (sel.length > 1 ? 's' : '') + '</span>' +
        '<b style="font-family:var(--f-num);font-size:24px">' + RA.dinero(p.total) + '</b></div>' +
        (p.ahorro > 0 ? '<div style="color:var(--verde);font-weight:700;text-align:right">Ahorras ' + RA.dinero(p.ahorro) + ' con el combo</div>' : '') +
      '</div>' +
      '<form class="form" id="formApartar" novalidate>' +
        '<label>Nombre completo<input class="campo" name="nombre" autocomplete="name" required minlength="3" value="' + RA.esc(guardado('ra_nombre')) + '"></label>' +
        '<label>Tu WhatsApp <span class="ayuda">10 dígitos, sin lada del país</span>' +
          '<input class="campo" name="tel" inputmode="numeric" autocomplete="tel-national" maxlength="14" placeholder="614 123 4567" required value="' + RA.esc(guardado('ra_tel')) + '"></label>' +
        '<label class="filtro" style="font-weight:600"><input type="checkbox" name="edad" required> Soy mayor de 18 años</label>' +
        '<p class="error" id="errorApartar" hidden></p>' +
        '<button class="btn btn-rojo btn-bloque" type="submit" id="btnConfirmar">Apartar y enviar por WhatsApp</button>' +
        '<p style="margin:0;font-size:14px;color:var(--gris);text-align:center">Tienes ' + rifa.horas_apartado + ' horas para pagar. Si no pagas a tiempo, tus números pueden liberarse para otra persona.</p>' +
      '</form>'
    );
    $('formApartar').addEventListener('submit', enviarApartado);
  }

  function enviarApartado(e) {
    e.preventDefault();
    var f = e.target, err = $('errorApartar');
    var nombre = RA.capitalizar(f.nombre.value.trim().replace(/\s+/g, ' '));
    var tel = f.tel.value.replace(/\D/g, '');
    if (tel.length === 12 && tel.indexOf('52') === 0) tel = tel.slice(2);
    var msg = '';
    if (nombre.length < 3 || nombre.indexOf(' ') < 0) msg = 'Escribe tu nombre y apellido.';
    else if (tel.length !== 10) msg = 'Tu WhatsApp debe tener 10 dígitos.';
    else if (!f.edad.checked) msg = 'Confirma que eres mayor de 18 años.';
    if (msg) { err.textContent = msg; err.hidden = false; return; }
    err.hidden = true;

    var btn = $('btnConfirmar'); btn.disabled = true; btn.textContent = 'Apartando…';
    var numeros = sel.slice().sort(function (a, b) { return a - b; });

    DB.apartar(rifa.id, numeros, nombre, tel).then(function (res) {
      if (!res.ok) {
        var tomados = res.tomados || [];
        sel = sel.filter(function (n) { return tomados.indexOf(n) < 0; });
        return refrescar().then(function () {
          actualizar();
          err.innerHTML = 'Alguien te ganó ' + (tomados.length > 1 ? 'los números ' : 'el número ') +
            '<b>' + tomados.map(function (n) { return RA.pad(n, rifa.total_numeros); }).join(', ') + '</b>. Ya los quitamos de tu lista' +
            (sel.length ? '; puedes apartar los demás.' : '. Elige otros.');
          err.hidden = false; btn.disabled = !sel.length; btn.textContent = 'Apartar y enviar por WhatsApp';
          if (!sel.length) setTimeout(cerrarModal, 2500);
        });
      }
      try { localStorage.setItem('ra_nombre', nombre); localStorage.setItem('ra_tel', tel); } catch (x) {}
      var p = RA.mejorPrecio(numeros.length, rifa.precio, rifa.combos);
      ultimoApartado = { folio: res.folio, numeros: numeros, total: p.total, ahorro: p.ahorro, nombre: nombre, tel: tel,
        expira: res.expira_en, apartado: res.apartado_en || new Date().toISOString() };
      sel = []; actualizar(); refrescar();
      mostrarExito();
    }).catch(function (x) {
      var m = String(x && x.message || '');
      err.textContent = m === 'RIFA_CERRADA' ? 'La venta de esta rifa ya se cerró.' :
        m === 'DATOS_INVALIDOS' ? 'Revisa tu nombre y tu WhatsApp.' : 'No se pudo apartar. Revisa tu internet e intenta otra vez.';
      err.hidden = false; btn.disabled = false; btn.textContent = 'Apartar y enviar por WhatsApp';
    });
  }

  function mensajeWhatsApp(a) {
    var r = rifa, n = a.numeros.length;
    var nums = a.numeros.map(function (x) { return RA.pad(x, r.total_numeros); }).join(' · ');
    var raya = '━━━━━━━━━━━━━━';
    var lineas = [
      '\u{1F340} *ALDAMA RIFA* \u{1F340}',
      '¡Hola! Acabo de apartar boletos en la página.',
      '',
      raya,
      '\u{1F3AB} *' + r.titulo + '*',
      '\u{1F522} Números: *' + nums + '*',
      '\u{1F4B5} Total: *' + RA.dinero(a.total) + '* (' + n + ' boleto' + (n > 1 ? 's' : '') + ')' + (a.ahorro > 0 ? ' · ahorré ' + RA.dinero(a.ahorro) : ''),
      '\u{1F9FE} Folio: *' + a.folio + '*',
      '\u{1F4C5} Sorteo: ' + RA.fechaLarga(r.fecha_sorteo) + ' · Lotería Nacional',
      raya,
      '',
      '\u{1F464} ' + a.nombre,
      '\u{1F4F1} ' + RA.telefono(a.tel),
      '',
      '⏳ Pago antes del *' + RA.fechaLarga(a.expira) + ', ' + RA.hora(a.expira) + '*'
    ];
    if (r.bono_minutos > 0 && r.bono_texto) {
      var limite = new Date(new Date(a.apartado).getTime() + r.bono_minutos * 60e3).toISOString();
      lineas.push('\u{1F381} *BONO:* si pago antes de las *' + RA.hora(limite) + '* → ' + r.bono_texto);
    }
    if (ajustes.cuentas && ajustes.cuentas.length) {
      lineas.push('', '\u{1F4B3} *DATOS DE PAGO*');
      ajustes.cuentas.forEach(function (c) {
        lineas.push('', '*' + c.banco + '*' + (c.titular ? ' — ' + c.titular : ''));
        if (c.clabe) lineas.push('CLABE: ```' + c.clabe + '```');
        if (c.tarjeta) lineas.push('Tarjeta: ```' + c.tarjeta + '```');
        if (c.cuenta) lineas.push('Cuenta: ```' + c.cuenta + '```');
      });
      lineas.push('', '✍️ En el concepto pongo mi *nombre completo*.');
    }
    lineas.push('', '\u{1F4F8} Ahorita mando mi comprobante por aquí.');
    if (/^https:/.test(location.protocol)) {
      lineas.push('', 'Mis boletos: ' + location.origin + location.pathname.replace(/rifa\.html.*$/, 'verificador.html?tel=' + a.tel));
    }
    return lineas.join('\n');
  }

  function mostrarExito() {
    var a = ultimoApartado;
    var link = RA.waLink(ajustes.whatsapp, mensajeWhatsApp(a));
    var bono = '';
    if (rifa.bono_minutos > 0 && rifa.bono_texto) {
      bono = '<div class="bono" style="margin:0;text-align:left">' + RA.ICON.reloj +
        '<div><b>Paga en <span id="bonoReloj">' + rifa.bono_minutos + ':00</span></b>y entras al bono: ' + RA.esc(rifa.bono_texto) + '.</div></div>';
    }
    abrirModal(
      '<button class="modal-cerrar" type="button" data-cerrar aria-label="Cerrar">×</button>' +
      '<div class="ok-caja">' +
        '<img src="' + RA.LOGO + '" alt="" width="120" height="120">' +
        '<h2 id="modalTitulo">¡Números apartados!</h2>' +
        '<div class="folio">' + RA.esc(a.folio) + '</div>' +
        '<div class="resumen-nums" style="justify-content:center">' + a.numeros.map(function (n) { return '<span>' + RA.pad(n, rifa.total_numeros) + '</span>'; }).join('') + '</div>' +
        '<p style="margin:0">Total: <b>' + RA.dinero(a.total) + '</b> · Paga antes del ' + RA.fechaLarga(a.expira) + ' a las ' + RA.hora(a.expira) + '.</p>' +
        bono +
        '<p style="margin:0;font-weight:700">Último paso: manda tu apartado por WhatsApp.</p>' +
        '<a class="btn btn-verde btn-bloque" href="' + link + '" target="_blank" rel="noopener" id="btnWa">' + RA.ICON.wa + 'Enviar por WhatsApp</a>' +
        '<a href="verificador.html?tel=' + encodeURIComponent(a.tel) + '" style="font-size:15px">Revisar mis boletos después</a>' +
      '</div>'
    );
    if (bono) relojBono(new Date(a.apartado).getTime() + rifa.bono_minutos * 60e3);
  }

  var relojT;
  function relojBono(fin) {
    clearInterval(relojT);
    relojT = setInterval(function () {
      var el = $('bonoReloj'); if (!el) { clearInterval(relojT); return; }
      var s = Math.max(0, Math.floor((fin - Date.now()) / 1000));
      el.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
      if (!s) clearInterval(relojT);
    }, 1000);
  }

  // ---------- Reglas ----------
  function pintarReglas() {
    var c = RA.cifras(rifa.total_numeros);
    var ej = { 2: ['483', '52'], 3: ['48', '352'], 4: ['4', '8352'], 5: ['', '48352'] }[c] || ['483', '52'];
    $('billeteNum').innerHTML = ej[0] + '<em>' + ej[1] + '</em>';
    var esTris = /tris/i.test(rifa.sorteo_loteria || '');
    $('billetePie').innerHTML = 'Ejemplo: si ' + (esTris ? 'el Tris' : 'el premio mayor') + ' sale <b>48352</b>, gana el boleto <b>' + ej[1] + '</b>.';
    $('billeteSorteo').textContent = esTris ? 'Tris' : 'Premio mayor';
    var reglas = [
      'Gana el número que coincide con las <b>últimas ' + c + ' cifras ' + (esTris ? 'del resultado' : 'del premio mayor') + '</b> del ' + RA.esc(rifa.sorteo_loteria || 'sorteo de la Lotería Nacional') + ' del ' + RA.fechaLarga(rifa.fecha_sorteo) + '.',
      'Tu número debe estar <b>pagado</b> antes del sorteo. Los apartados sin pagar no juegan.',
      (esTris ? 'Si sale un número que no se vendió, se juega con el <b>siguiente Tris</b> (2 horas después). ¡Siempre hay ganador!' : 'Si sale un número que no se vendió, se juega con el siguiente sorteo de la Lotería.'),
      rifa.minimo_venta_pct ? 'Rifa sujeta al ' + rifa.minimo_venta_pct + '% de boletos vendidos. Si no se llega, la fecha se recorre y te avisamos.' : '',
      'El resultado y la entrega del premio se transmiten en vivo.'
    ].filter(Boolean);
    $('reglasRifa').innerHTML = reglas.map(function (t) { return '<li>' + RA.ICON.check + '<span>' + t + '</span></li>'; }).join('');
  }

  // ---------- Datos ----------
  function refrescar() {
    return DB.estadoBoletos(rifa.id).then(function (m) {
      estado = m;
      // Si alguien apartó algo que yo tenía seleccionado, lo quito
      var antes = sel.length;
      sel = sel.filter(function (n) { return !estado[n]; });
      if (sel.length !== antes) RA.toast('Algunos de tus números los apartó alguien más');
      actualizar(); pintarAvance();
    });
  }

  function iniciar() {
    if (!id) { sinRifa(); return; }
    Promise.all([DB.getRifa(id), RA.ajustes()]).then(function (res) {
      rifa = res[0]; ajustes = res[1] || ajustes;
      if (!rifa || rifa.estado === 'borrador') { sinRifa(); return; }
      rifa.total_numeros = rifa.total_numeros || 100;
      rifa.combos = rifa.combos || [];
      pintarCabeza(); pintarCombos(); pintarPaginas(); pintarEstadoVenta(); pintarReglas();
      $('cuentas').innerHTML = RA.cuentasHTML(ajustes.cuentas);
      return refrescar();
    }).then(function () {
      setInterval(function () { if (!document.hidden && rifa) refrescar().catch(function () {}); }, 20000);
    }).catch(function (e) {
      console.error(e);
      $('cabeza').innerHTML = '<p class="vacio" style="color:#fff">No se pudo cargar la rifa. Recarga la página.</p>';
    });
  }

  function sinRifa() {
    $('cabeza').innerHTML = '<div class="vacio" style="color:#fff;grid-column:1/-1"><img src="' + RA.LOGO + '" alt="">' +
      '<p>No encontramos esta rifa.</p><a class="btn btn-verde" href="index.html#rifas">Ver rifas activas</a></div>';
    document.getElementById('elegir').hidden = true;
  }

  // ---------- Eventos ----------
  document.addEventListener('DOMContentLoaded', function () {
    iniciar();
    $('tablero').addEventListener('click', function (e) {
      var b = e.target.closest('.num'); if (b) alternar(parseInt(b.getAttribute('data-n'), 10));
    });
    $('paginas').addEventListener('click', function (e) {
      var b = e.target.closest('[data-pag]'); if (!b) return;
      pagina = parseInt(b.getAttribute('data-pag'), 10); pintarPaginas(); pintarTablero();
    });
    $('paginas').addEventListener('change', function (e) {
      if (e.target.id === 'selPagina') { pagina = parseInt(e.target.value, 10); pintarTablero(); }
    });
    $('formBuscar').addEventListener('submit', buscar);
    $('btnAzar').addEventListener('click', function () { azar(parseInt($('cuantosAzar').value, 10), true); });
    $('soloLibres').addEventListener('change', function (e) { $('tablero').classList.toggle('oculta-ocupados', e.target.checked); });
    $('btnLimpiar').addEventListener('click', function () { sel = []; actualizar(); });
    $('btnApartar').addEventListener('click', formApartar);
    $('combos').addEventListener('click', function (e) {
      var b = e.target.closest('[data-combo]'); if (!b) return;
      var c = rifa.combos[parseInt(b.getAttribute('data-combo'), 10)];
      var faltan = c.cantidad - sel.length;
      if (faltan <= 0) { RA.toast('Ya llevas ' + sel.length + ' boletos: el combo se aplica solo'); return; }
      document.getElementById('elegir').scrollIntoView({ behavior: 'smooth' });
      setTimeout(function () { azar(faltan, true); }, 450);
    });
    $('modal').addEventListener('click', function (e) {
      if (e.target.id === 'modal' || e.target.closest('[data-cerrar]')) cerrarModal();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('modal').hidden) cerrarModal(); });
  });
})();
