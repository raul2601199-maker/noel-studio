/* =========================================================
   DEMO · Sitio para inmobiliaria de terrenos — Noel Studio
   Todo el catálogo sale de terrenos.json.
   Para cambiar precios NO se toca este archivo.
   ========================================================= */

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

let DATOS = null;
let modo = 'mensual';
let filtroDinero = 'todos';
let filtroRumbo  = 'todos';

/* ---------- utilidades ---------- */

const pesos = n => '$' + Number(n).toLocaleString('es-MX', {
  minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
  maximumFractionDigits: 2
});

const planBajo = d => d.planes.reduce((a, b) => (b.mensualidad < a.mensualidad ? b : a));

function ligaWa(texto) {
  const tel = DATOS?.asesor?.whatsapp || '5216142251419';
  return `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
}

const MSJ_GENERAL =
  'Hola, le escribo desde su página. Me interesa conocer los terrenos que tiene disponibles.';

const msjTerreno = nombre =>
  `Hola, me interesa el terreno de ${nombre} que vi en su página. ` +
  `¿Me puede compartir disponibilidad y opciones para apartarlo?`;

/* ---------- rangos ---------- */

const RANGOS = {
  mensual: {
    etiqueta: '¿Cuánto puede pagar al mes?',
    opciones: [['todos','Todos'],['bajo','Hasta $1,500'],['medio','$1,500 a $2,500'],['alto','Más de $2,500']],
    cae: d => { const m = planBajo(d).mensualidad; return m <= 1500 ? 'bajo' : m <= 2500 ? 'medio' : 'alto'; }
  },
  contado: {
    etiqueta: '¿Cuánto tiene para pagar de contado?',
    opciones: [['todos','Todos'],['bajo','Hasta $50,000'],['medio','$50,000 a $100,000'],['alto','Más de $100,000']],
    cae: d => d.contado <= 50000 ? 'bajo' : d.contado <= 100000 ? 'medio' : 'alto'
  }
};

const pasaFiltro = d =>
  (filtroDinero === 'todos' || RANGOS[modo].cae(d) === filtroDinero) &&
  (filtroRumbo  === 'todos' || d.rumbo === filtroRumbo);

const calza = d => filtroDinero !== 'todos' && RANGOS[modo].cae(d) === filtroDinero;

/* ---------- filtros ---------- */

function pintarFiltros() {
  const r = RANGOS[modo];
  $('#lblDinero').textContent = r.etiqueta;
  $('#opcionesDinero').innerHTML = r.opciones.map(([v, t]) => `
    <button type="button" class="chip${filtroDinero === v ? ' is-activo' : ''}"
            data-dinero="${v}" aria-pressed="${filtroDinero === v}">${t}</button>`).join('');
  $$('[data-modo]').forEach(b => {
    const activo = b.dataset.modo === modo;
    b.classList.toggle('is-activo', activo);
    b.setAttribute('aria-pressed', activo);
  });
}

/* ---------- cinta ---------- */

function pintarCinta() {
  const pista = $('#cintaPista');
  if (!pista) return;
  const fichas = DATOS.desarrollos.map(d => {
    const plan = planBajo(d);
    return `<span class="cinta__ficha">
      <span class="cinta__nombre">${d.nombre}</span>
      <span class="cinta__m2">${d.m2} m²</span>
      <span class="cinta__precio">${plan.desde || d.planes.length > 1 ? 'desde ' : ''}${pesos(plan.mensualidad)}/mes</span>
    </span>`;
  }).join('');
  pista.innerHTML = fichas + fichas;
}

/* ---------- tarjetas ---------- */

const grados = (v, pos, neg) => `${Math.abs(v).toFixed(4)}° ${v >= 0 ? pos : neg}`;

function tarjeta(d, i, principal) {
  const plan = planBajo(d);
  const desde = (plan.desde || d.planes.length > 1) ? '<em>desde</em>' : '';
  const folio = String(i + 1).padStart(2, '0');

  const cifra = modo === 'contado'
    ? `<p class="tarjeta__mensual">${pesos(d.contado)}<small>de contado</small></p>
       <p class="tarjeta__contado">${desde ? 'Desde ' : ''}${pesos(plan.mensualidad)} al mes · enganche ${pesos(d.enganche)}</p>`
    : `<p class="tarjeta__mensual">${desde}${pesos(plan.mensualidad)}<small>al mes</small></p>
       <p class="tarjeta__contado">${pesos(d.contado)} de contado · enganche ${pesos(d.enganche)}</p>`;

  const foto = d.imagen
    ? `<img src="${d.imagen}" width="1200" height="750" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async"
            alt="Terreno de ${d.nombre}">`
    : `<div class="tarjeta__sinfoto reticula"><b>${d.nombre}</b><span>Fotografía del desarrollo</span></div>`;

  return `
  <article class="tarjeta mojon${principal ? ' tarjeta--principal' : ''}${calza(d) ? ' is-calza' : ''}"
           data-abrir="${d.id}" style="animation-delay:${Math.min(i * 60, 300)}ms">
    <div class="tarjeta__foto">
      ${foto}
      <span class="sello">${d.sello}</span>
    </div>
    <div class="tarjeta__cuerpo">
      <p class="tarjeta__folio">
        <span class="folio">LOTE ${folio}</span>
        <span class="coord">${grados(d.lat,'N','S')} · ${grados(d.lon,'E','O')}</span>
      </p>
      ${calza(d) ? '<p class="calza"><svg viewBox="0 0 24 24"><use href="#i-check"/></svg> Entra en lo que puede pagar</p>' : ''}
      <h3>${d.nombre}</h3>
      <p class="cota"><span class="cota__linea"></span>${d.m2} m²<span class="cota__linea"></span></p>
      <p class="tarjeta__rumbo">Rumbo ${d.rumbo} · ${d.referencia}</p>
      <div class="tarjeta__precio">
        ${cifra}
        <p class="tarjeta__apartado">Se aparta con ${pesos(DATOS.apartado)}</p>
      </div>
      <button class="btn btn--linea" type="button" data-abrir="${d.id}">
        Ver terreno y opciones de pago
      </button>
    </div>
  </article>`;
}

function pintar() {
  const lista = DATOS.desarrollos.filter(pasaFiltro);
  const total = DATOS.desarrollos.length;

  if (!lista.length) {
    $('#rejilla').innerHTML = `
      <p class="vacio">
        No hay terrenos en ese rango por ese rumbo.
        <a class="btn btn--linea" href="${ligaWa(MSJ_GENERAL)}" target="_blank" rel="noopener">
          Preguntar qué se le acerca
        </a>
      </p>`;
    $('#conteo').textContent = 'Sin resultados';
    return;
  }

  $('#rejilla').innerHTML =
    lista.map((d, i) => tarjeta(d, i, i === 0 && lista.length > 2)).join('');

  $('#conteo').textContent = lista.length === total
    ? `${total} terrenos disponibles`
    : `${lista.length} de ${total} terrenos`;
}

/* ---------- ficha ---------- */

let ultimoFoco = null;
let fichaActiva = null;

function bloquePlazos(d) {
  if (d.planes.length === 1) {
    const p = d.planes[0];
    return `
      <div class="plazo__resultado">
        <span class="plazo__mensual">${p.desde ? 'Desde ' : ''}${pesos(p.mensualidad)}</span>
        <span class="plazo__pie">al mes durante ${p.meses} meses</span>
      </div>`;
  }
  const bajo = planBajo(d);
  return `
    <div class="plazos" role="group" aria-label="Escoja su plazo">
      ${d.planes.map(p => `
        <button type="button" class="plazo${p.meses === bajo.meses ? ' is-activo' : ''}"
                data-plazo="${p.meses}" aria-pressed="${p.meses === bajo.meses}">
          ${p.meses}<span>meses</span>
        </button>`).join('')}
    </div>
    <div class="plazo__resultado" id="plazoResultado"></div>`;
}

function pintarPlazo(d, meses) {
  const p = d.planes.find(x => x.meses === Number(meses));
  const caja = $('#plazoResultado');
  if (!p || !caja) return;
  caja.innerHTML = `
    <span class="plazo__mensual">${pesos(p.mensualidad)}</span>
    <span class="plazo__pie">al mes durante ${p.meses} meses${p.total ? ` · paga en total ${pesos(p.total)}` : ''}</span>`;
}

function abrirFicha(id, silencioso) {
  const d = DATOS?.desarrollos.find(x => x.id === id);
  if (!d) return;

  const plan = planBajo(d);
  const i = DATOS.desarrollos.indexOf(d);
  const folio = String(i + 1).padStart(2, '0');

  const foto = d.imagen
    ? `<figure class="ficha__foto"><img src="${d.imagen}" alt="Terreno de ${d.nombre}"></figure>`
    : `<div class="ficha__sinfoto reticula">${d.nombre}</div>`;

  const confirmado = d.confirmado.map(t =>
    `<li><svg viewBox="0 0 24 24"><use href="#i-check"/></svg> ${t}</li>`).join('');

  const largo = d.planes[d.planes.length - 1];
  const totalPlazo = largo.total || Math.round(d.enganche + largo.mensualidad * largo.meses);

  $('#fichaCuerpo').innerHTML = `
    ${foto}
    <div class="ficha__contenido">
      <p class="ficha__folio">
        <span class="folio">LOTE ${folio}</span>
        <span class="ficha__sello">${d.sello}</span>
      </p>
      <h2 id="fichaTitulo">${d.nombre}</h2>
      <p class="cota ficha__cota"><span class="cota__linea"></span>${d.m2} m²<span class="cota__linea"></span></p>
      <p class="ficha__ubi">
        <svg viewBox="0 0 24 24"><use href="#i-pin"/></svg>
        <span>${d.ubicacion}</span>
      </p>
      <p class="ficha__ref">${d.referencia}</p>

      <dl class="decision">
        <div class="destacado"><dt>De contado</dt><dd>${pesos(d.contado)}</dd></div>
        <div><dt>Apartado</dt><dd>${pesos(DATOS.apartado)}</dd></div>
        <div><dt>Enganche${d.enganche_desde ? ' desde' : ''}</dt><dd>${pesos(d.enganche)}</dd></div>
        <div><dt>Superficie</dt><dd>${d.m2} m²</dd></div>
      </dl>

      <h3>${d.planes.length > 1 ? 'Escoja su plazo' : 'Su opción de pago'}</h3>
      ${bloquePlazos(d)}

      <dl class="ficha__resumen">
        <div><dt>Precio por metro</dt><dd>${pesos(Math.round(d.contado / d.m2))} / m²</dd></div>
        <div><dt>Pagando a ${largo.meses} meses</dt><dd>${pesos(totalPlazo)} en total</dd></div>
        <div><dt>Rumbo</dt><dd>${d.rumbo}</dd></div>
      </dl>

      <h3>Información confirmada</h3>
      <ul class="confirmado">${confirmado}</ul>
      ${d.nota ? `<p class="ficha__nota">${d.nota}</p>` : ''}

      <h3>Antes de decidir</h3>
      <p class="ficha__consejo">
        Ningún terreno se aparta a ciegas. Agende y vaya a caminarlo:
        va a ver el acceso, el tipo de suelo y qué tan cerca queda de verdad.
      </p>

      <div class="ficha__acciones">
        <a class="btn btn--linea" href="${d.maps}" target="_blank" rel="noopener">
          Ver ubicación y referencias
        </a>
        <button class="btn btn--linea" type="button" data-copiar="${d.id}">
          Copiar liga de este terreno
        </button>
      </div>
    </div>
    <div class="ficha__pie">
      <a class="btn btn--oro" href="${ligaWa(msjTerreno(d.nombre))}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24"><use href="#i-wa"/></svg> Cotizar ${d.nombre}
      </a>
    </div>`;

  if (d.planes.length > 1) pintarPlazo(d, plan.meses);

  fichaActiva = d;
  ultimoFoco = document.activeElement;
  $('#ficha').hidden = false;
  document.body.classList.add('sin-scroll');
  $('.ficha__cerrar').focus();
  $('#fichaCuerpo').scrollTop = 0;

  $('#barraWaTexto').textContent = `Cotizar ${d.nombre}`;
  $('#barraWaLink').href = ligaWa(msjTerreno(d.nombre));

  if (!silencioso) history.pushState({ id: d.id }, '', '#' + d.id);
}

function cerrarFicha(silencioso) {
  $('#ficha').hidden = true;
  document.body.classList.remove('sin-scroll');
  fichaActiva = null;
  $('#barraWaTexto').textContent = 'Cotizar por WhatsApp';
  $('#barraWaLink').href = ligaWa(MSJ_GENERAL);
  if (ultimoFoco) ultimoFoco.focus();
  if (!silencioso && location.hash) history.pushState({}, '', location.pathname);
}

/* ---------- mapa ---------- */

let MAPA = null;
const marcas = {};

function montarMapa() {
  if (typeof L === 'undefined') { $('#mapaCaida').hidden = false; return; }

  const puntos = DATOS.desarrollos.map(d => [d.lat, d.lon])
    .concat(DATOS.referencias.map(r => [r.lat, r.lon]));

  // En celular el mapa no debe atrapar el dedo: la página sigue bajando.
  const enCelular = matchMedia('(hover: none) and (pointer: coarse)').matches;

  MAPA = L.map('mapa', {
    scrollWheelZoom: false, dragging: !enCelular, tap: false, zoomControl: true
  }).fitBounds(puntos, { padding: [50, 50] });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 17, attribution: '© OpenStreetMap'
  }).addTo(MAPA);

  if (enCelular) {
    const capa = $('#mapaCandado');
    capa.hidden = false;
    capa.addEventListener('click', () => {
      MAPA.dragging.enable(); capa.hidden = true; $('#mapaSalir').hidden = false;
    });
    $('#mapaSalir').addEventListener('click', () => {
      MAPA.dragging.disable(); capa.hidden = false; $('#mapaSalir').hidden = true;
    });
  }

  DATOS.referencias.forEach(r => {
    L.marker([r.lat, r.lon], {
      icon: L.divIcon({
        className: 'refe refe--' + r.tipo,
        html: `<span class="refe__punto"></span><span class="refe__nombre">${r.nombre}</span>`,
        iconSize: [12, 12], iconAnchor: [6, 6]
      }),
      interactive: false, zIndexOffset: -500
    }).addTo(MAPA);
  });

  DATOS.desarrollos.forEach((d, i) => {
    const plan = planBajo(d);
    const m = L.marker([d.lat, d.lon], {
      icon: L.divIcon({
        className: 'alfiler alfiler--aprox',
        html: `<span class="alfiler__punto">${i + 1}</span><span class="alfiler__aro"></span>`,
        iconSize: [30, 30], iconAnchor: [15, 15]
      }),
      title: d.nombre
    }).addTo(MAPA);

    m.bindPopup(`
      <p class="globo__ref">${d.m2} m² · Rumbo ${d.rumbo}</p>
      <p class="globo__nombre">${d.nombre}</p>
      <p class="globo__cifra">${plan.desde || d.planes.length > 1 ? 'Desde ' : ''}${pesos(plan.mensualidad)}<span>al mes</span></p>
      <p class="globo__ubi">${d.nota_ubicacion}</p>
      <button type="button" class="lote-liga" data-abrir="${d.id}">Ver este terreno</button>
    `, { className: 'globo', maxWidth: 250, autoPanPadding: [20, 20] });

    m.on('popupopen',  () => resaltarLote(d.id));
    m.on('popupclose', () => resaltarLote(null));
    marcas[d.id] = m;
  });
}

function resaltarLote(id) {
  $$('.zona-tarjeta').forEach(t => t.classList.toggle('is-viva', t.dataset.zona === id));
}

function pintarZonas() {
  $('#zonas').innerHTML = DATOS.desarrollos.map((d, i) => `
    <button type="button" class="zona-tarjeta" data-zona="${d.id}" data-ir="${d.id}">
      <span class="zona-tarjeta__num">${i + 1}</span>
      <span class="zona-tarjeta__datos">
        <span class="zona-tarjeta__nombre">${d.nombre}</span>
        <span class="zona-tarjeta__ref">${d.nota_ubicacion}</span>
      </span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-pin"/></svg>
    </button>`).join('');
}

function volarA(id) {
  const d = DATOS.desarrollos.find(x => x.id === id);
  if (!d || !MAPA) return;
  MAPA.flyTo([d.lat, d.lon], 13, { duration: 0.9 });
  setTimeout(() => marcas[id]?.openPopup(), 640);
  $('.mapa').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ---------- eventos ---------- */

document.addEventListener('click', e => {
  const abrir = e.target.closest('[data-abrir]');
  if (abrir) { abrirFicha(abrir.dataset.abrir); return; }

  if (e.target.closest('[data-cerrar]')) { cerrarFicha(); return; }

  const plazo = e.target.closest('[data-plazo]');
  if (plazo && fichaActiva) {
    $$('.plazo').forEach(b => {
      const activo = b === plazo;
      b.classList.toggle('is-activo', activo);
      b.setAttribute('aria-pressed', activo);
    });
    pintarPlazo(fichaActiva, plazo.dataset.plazo);
    return;
  }

  const copiar = e.target.closest('[data-copiar]');
  if (copiar) {
    const liga = location.origin + location.pathname + '#' + copiar.dataset.copiar;
    navigator.clipboard?.writeText(liga).then(() => {
      const antes = copiar.textContent;
      copiar.textContent = 'Liga copiada';
      setTimeout(() => { copiar.textContent = antes; }, 1800);
    });
    return;
  }

  const ir = e.target.closest('[data-ir]');
  if (ir) { volarA(ir.dataset.ir); return; }

  const cambiaModo = e.target.closest('[data-modo]');
  if (cambiaModo) {
    modo = cambiaModo.dataset.modo;
    filtroDinero = 'todos';
    pintarFiltros(); pintar();
    return;
  }

  const chip = e.target.closest('.chip');
  if (chip) {
    $$('.chip', chip.parentElement).forEach(c => {
      c.classList.toggle('is-activo', c === chip);
      c.setAttribute('aria-pressed', c === chip);
    });
    if (chip.dataset.dinero) filtroDinero = chip.dataset.dinero;
    if (chip.dataset.rumbo)  filtroRumbo  = chip.dataset.rumbo;
    pintar();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#ficha').hidden) cerrarFicha();
});

addEventListener('popstate', () => {
  const id = location.hash.slice(1);
  if (id && DATOS?.desarrollos.some(d => d.id === id)) abrirFicha(id, true);
  else if (!$('#ficha').hidden) cerrarFicha(true);
});

const barra = $('#barraWa');
new IntersectionObserver(([e]) => { barra.hidden = e.isIntersecting; }, { threshold: 0 })
  .observe($('.portada'));

$('#waCerrar')?.addEventListener('click', () => {
  barra.classList.add('is-callado');
  try { sessionStorage.setItem('waCallado', '1'); } catch {}
});
try { if (sessionStorage.getItem('waCallado')) barra.classList.add('is-callado'); } catch {}

/* ---------- foto de portada, si existe ---------- */

// Se intenta cargar img/obelisco.jpg. Si no está, la portada se queda con su
// retícula y no se ve ningún hueco roto.
(function fotoPortada() {
  const prueba = new Image();
  prueba.onload = () => {
    const lienzo = document.querySelector('.portada__lienzo');
    lienzo.classList.remove('reticula');
    lienzo.innerHTML =
      '<img src="img/obelisco.jpg" alt="Vista aérea de un obelisco sobre la carretera, con los sembradíos y la sierra al fondo">';
    document.querySelector('.portada').classList.add('con-foto');
  };
  prueba.src = 'img/obelisco.jpg';
})();

/* ---------- arranque ---------- */

fetch('terrenos.json')
  .then(r => r.json())
  .then(datos => {
    DATOS = datos;
    $$('[data-wa-general]').forEach(a => {
      a.href = ligaWa(MSJ_GENERAL); a.target = '_blank'; a.rel = 'noopener';
    });
    pintarFiltros();
    pintarCinta();
    pintar();
    pintarZonas();
    try { montarMapa(); } catch { $('#mapaCaida').hidden = false; }

    const id = location.hash.slice(1);
    if (id && datos.desarrollos.some(d => d.id === id)) abrirFicha(id, true);
  })
  .catch(() => {
    $('#rejilla').innerHTML =
      `<p class="vacio">No se pudo cargar el catálogo. Actualice la página.</p>`;
  });
