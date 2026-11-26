// =========================================================
// Capa de datos: la página solo habla con "RA_DB".
// Por dentro usa Supabase (modo real) o el navegador (modo demo).
// =========================================================
(function () {
  'use strict';

  var cfg = window.RA_CONFIG || {};
  var MODO_REAL = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);

  // ---------- Utilidades ----------
  function folioNuevo() {
    var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = 'RA-';
    for (var i = 0; i < 5; i++) s += c[Math.floor(Math.random() * c.length)];
    return s;
  }
  function uid() {
    return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function horasDesdeAhora(h) { return new Date(Date.now() + h * 3600e3).toISOString(); }
  function diasDesdeAhora(d, hora) {
    var f = new Date(); f.setDate(f.getDate() + d); f.setHours(hora || 21, 0, 0, 0);
    return f.toISOString();
  }
  function recortarNombre(n) {
    var p = String(n || '').trim().split(/\s+/);
    return p[0] + (p[1] ? ' ' + p[1][0] + '.' : '');
  }

  // =========================================================
  // MODO DEMO (localStorage)
  // =========================================================
  var KEY = 'ra_demo_v2'; // al cambiar la versión, la demo arranca de cero

  function semilla() {
    var r1 = uid(), r2 = uid() + 'b', r3 = uid() + 'c', r0 = uid() + 'd';
    var rifas = [
      {
        id: r1, titulo: 'Express $1,500 en efectivo', premio: '$1,500 en efectivo',
        descripcion: 'Rifa express: se juega en cuanto se venda. El dinero se entrega en mano o por transferencia el mismo día.',
        imagen: '', precio: 30, total_numeros: 100, fecha_sorteo: diasDesdeAhora(2),
        sorteo_loteria: 'Sorteo Mayor de la Lotería Nacional', estado: 'activa', minimo_venta_pct: 80,
        horas_apartado: 12, bono_minutos: 30, bono_texto: 'Entras a la rifita de $200 extra',
        combos: [{ cantidad: 5, precio: 130, etiqueta: '5 boletos' }, { cantidad: 10, precio: 250, etiqueta: '10 boletos' }],
        numero_ganador: null, ganador_nombre: null, orden: 1
      },
      {
        id: r2, titulo: 'Bocina JBL PartyBox', premio: 'Bocina JBL PartyBox 110 nueva en caja',
        descripcion: 'Nueva, sellada, con garantía. Si eres de fuera de Aldama te la mandamos por paquetería.',
        imagen: '', precio: 50, total_numeros: 100, fecha_sorteo: diasDesdeAhora(5),
        sorteo_loteria: 'Sorteo Superior de la Lotería Nacional', estado: 'activa', minimo_venta_pct: 80,
        horas_apartado: 12, bono_minutos: 30, bono_texto: 'Te regalamos un boleto para la siguiente rifa',
        combos: [{ cantidad: 3, precio: 100, etiqueta: '3x2' }],
        numero_ganador: null, ganador_nombre: null, orden: 2
      },
      {
        id: r3, titulo: 'Express $1,000', premio: '$1,000 en efectivo',
        descripcion: 'La más rápida: 100 números a $20.',
        imagen: '', precio: 20, total_numeros: 100, fecha_sorteo: diasDesdeAhora(1),
        sorteo_loteria: 'Sorteo Mayor de la Lotería Nacional', estado: 'activa', minimo_venta_pct: 80,
        horas_apartado: 6, bono_minutos: 0, bono_texto: '',
        combos: [{ cantidad: 3, precio: 40, etiqueta: '3x2' }],
        numero_ganador: null, ganador_nombre: null, orden: 3
      }
    ];

    // Números ya ocupados para que la demo se vea viva
    var boletos = [];
    var nombres = ['Juan Pérez', 'María López', 'Carlos Ruiz', 'Ana Torres', 'Luis Chávez', 'Sofía Díaz', 'Pedro Gómez', 'Karla Núñez'];
    function ocupar(rifaId, cuantos, semillaNum) {
      var s = semillaNum;
      function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
      var usados = {};
      for (var i = 0; i < cuantos; i++) {
        var n; do { n = Math.floor(rnd() * 100); } while (usados[n]);
        usados[n] = 1;
        var pagado = rnd() > 0.3;
        var nom = nombres[Math.floor(rnd() * nombres.length)];
        boletos.push({
          rifa_id: rifaId, numero: n, estado: pagado ? 'pagado' : 'apartado', nombre: nom,
          telefono: '614' + String(1000000 + Math.floor(rnd() * 8999999)), folio: folioNuevo(),
          apartado_en: new Date().toISOString(), expira_en: pagado ? null : horasDesdeAhora(8),
          pagado_en: pagado ? new Date().toISOString() : null
        });
      }
    }
    // Arranca en ceros: sin boletos apartados ni pagados

    return {
      rifas: rifas,
      boletos: boletos,
      premios: [],
      ajustes: cfg.DEMO_AJUSTES || { whatsapp: '', cuentas: [] }
    };
  }

  function leer() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { d = null; }
    if (!d || !d.rifas) { d = semilla(); guardar(d); }
    // Si la demo se creó con el número de ejemplo, usa el de config.js
    if (d.ajustes && d.ajustes.whatsapp === '526140000000' && cfg.DEMO_AJUSTES) {
      d.ajustes.whatsapp = cfg.DEMO_AJUSTES.whatsapp; guardar(d);
    }
    // Igual con las cuentas de ejemplo: se cambian por las reales de config.js
    if (d.ajustes && JSON.stringify(d.ajustes.cuentas || []).indexOf('Nombre del titular') > -1 && cfg.DEMO_AJUSTES) {
      d.ajustes.cuentas = cfg.DEMO_AJUSTES.cuentas; guardar(d);
    }
    return d;
  }
  function guardar(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* sin almacenamiento: la demo vive en memoria */ }
    demoMem = d;
  }
  var demoMem = null;
  function db() { return demoMem || leer(); }

  function liberarVencidosDemo(d) {
    return; // ya no se liberan solos: el admin decide desde el panel
    var ahora = Date.now(), antes = d.boletos.length;
    d.boletos = d.boletos.filter(function (b) {
      return !(b.estado === 'apartado' && b.expira_en && new Date(b.expira_en).getTime() < ahora);
    });
    if (d.boletos.length !== antes) guardar(d);
  }

  var Demo = {
    modo: 'demo',
    listRifas: function (opts) {
      var d = db(); liberarVencidosDemo(d);
      var lista = d.rifas.filter(function (r) {
        if (opts && opts.admin) return true;
        if (r.estado === 'borrador') return false;
        return !(opts && opts.soloActivas) || r.estado === 'activa';
      }).map(function (r) {
        var bs = d.boletos.filter(function (b) { return b.rifa_id === r.id; });
        return Object.assign({}, r, {
          apartados: bs.filter(function (b) { return b.estado === 'apartado'; }).length,
          pagados: bs.filter(function (b) { return b.estado === 'pagado'; }).length
        });
      });
      lista.sort(function (a, b) { return (a.orden || 0) - (b.orden || 0); });
      return Promise.resolve(lista);
    },
    getRifa: function (id) {
      var r = db().rifas.filter(function (x) { return x.id === id; })[0];
      return Promise.resolve(r ? Object.assign({}, r) : null);
    },
    estadoBoletos: function (rifaId) {
      var d = db(); liberarVencidosDemo(d);
      var m = {};
      d.boletos.forEach(function (b) { if (b.rifa_id === rifaId) m[b.numero] = b.estado; });
      return Promise.resolve(m);
    },
    apartar: function (rifaId, numeros, nombre, telefono) {
      var d = db(); liberarVencidosDemo(d);
      var r = d.rifas.filter(function (x) { return x.id === rifaId; })[0];
      if (!r || r.estado !== 'activa') return Promise.reject(new Error('RIFA_CERRADA'));
      var tomados = numeros.filter(function (n) {
        return d.boletos.some(function (b) { return b.rifa_id === rifaId && b.numero === n; });
      });
      if (tomados.length) return Promise.resolve({ ok: false, tomados: tomados });
      var folio = folioNuevo(), ahora = new Date().toISOString(), expira = horasDesdeAhora(r.horas_apartado);
      numeros.forEach(function (n) {
        d.boletos.push({ rifa_id: rifaId, numero: n, estado: 'apartado', nombre: nombre.trim(), telefono: telefono,
          folio: folio, apartado_en: ahora, expira_en: expira, pagado_en: null });
      });
      guardar(d);
      return Promise.resolve({ ok: true, folio: folio, expira_en: expira, apartado_en: ahora });
    },
    verificar: function (telefono) {
      var d = db(); liberarVencidosDemo(d);
      var res = d.boletos.filter(function (b) { return b.telefono === telefono; }).map(function (b) {
        var r = d.rifas.filter(function (x) { return x.id === b.rifa_id; })[0] || {};
        return { rifa_id: b.rifa_id, rifa_titulo: r.titulo, numero: b.numero, estado: b.estado, folio: b.folio,
          nombre: recortarNombre(b.nombre), expira_en: b.expira_en, total_numeros: r.total_numeros, fecha_sorteo: r.fecha_sorteo };
      });
      return Promise.resolve(res);
    },
    premios: function () {
      var p = db().premios.slice().sort(function (a, b) { return String(b.fecha).localeCompare(String(a.fecha)); });
      return Promise.resolve(p);
    },
    ajustes: function () { return Promise.resolve(Object.assign({}, db().ajustes)); },

    // ----- Panel -----
    session: function () {
      var ok = false; try { ok = sessionStorage.getItem('ra_demo_admin') === '1'; } catch (e) {}
      return Promise.resolve(ok ? { email: 'demo' } : null);
    },
    login: function (email, pass) {
      if (pass !== 'demo') return Promise.reject(new Error('En modo demo la contraseña es: demo'));
      try { sessionStorage.setItem('ra_demo_admin', '1'); } catch (e) {}
      return Promise.resolve({ email: email || 'demo' });
    },
    logout: function () { try { sessionStorage.removeItem('ra_demo_admin'); } catch (e) {} return Promise.resolve(); },
    saveRifa: function (r) {
      var d = db();
      if (!r.id) { r.id = uid(); d.rifas.push(r); }
      else d.rifas = d.rifas.map(function (x) { return x.id === r.id ? Object.assign({}, x, r) : x; });
      guardar(d); return Promise.resolve(r);
    },
    deleteRifa: function (id) {
      var d = db();
      d.rifas = d.rifas.filter(function (x) { return x.id !== id; });
      d.boletos = d.boletos.filter(function (b) { return b.rifa_id !== id; });
      guardar(d); return Promise.resolve();
    },
    boletosAdmin: function (rifaId) {
      var d = db(); liberarVencidosDemo(d);
      return Promise.resolve(d.boletos.filter(function (b) { return b.rifa_id === rifaId; })
        .map(function (b) { return Object.assign({}, b); }));
    },
    marcarPagado: function (rifaId, numeros) {
      var d = db(), ahora = new Date().toISOString();
      d.boletos.forEach(function (b) {
        if (b.rifa_id === rifaId && numeros.indexOf(b.numero) > -1) { b.estado = 'pagado'; b.expira_en = null; b.pagado_en = ahora; }
      });
      guardar(d); return Promise.resolve();
    },
    liberar: function (rifaId, numeros) {
      var d = db();
      d.boletos = d.boletos.filter(function (b) { return !(b.rifa_id === rifaId && numeros.indexOf(b.numero) > -1); });
      guardar(d); return Promise.resolve();
    },
    precioEspecial: function (rifaId, numeros, monto, nota) {
      var d = db();
      d.boletos.forEach(function (b) { if (b.rifa_id === rifaId && numeros.indexOf(b.numero) > -1) { b.monto_folio = monto; b.nota = nota || ''; } });
      guardar(d); return Promise.resolve();
    },
    extenderApartado: function (rifaId, numeros, horas) {
      var d = db();
      d.boletos.forEach(function (b) {
        if (b.rifa_id === rifaId && numeros.indexOf(b.numero) > -1 && b.estado === 'apartado') b.expira_en = horasDesdeAhora(horas);
      });
      guardar(d); return Promise.resolve();
    },
    savePremio: function (p) {
      var d = db();
      if (!p.id) { p.id = uid(); d.premios.push(p); }
      else d.premios = d.premios.map(function (x) { return x.id === p.id ? p : x; });
      guardar(d); return Promise.resolve(p);
    },
    deletePremio: function (id) {
      var d = db(); d.premios = d.premios.filter(function (x) { return x.id !== id; });
      guardar(d); return Promise.resolve();
    },
    saveAjustes: function (a) { var d = db(); d.ajustes = a; guardar(d); return Promise.resolve(a); },
    subirImagen: function (file) {
      // En demo la foto se guarda dentro del navegador, reducida para que quepa
      return reducirImagen(file, 900).then(function (dataUrl) { return dataUrl; });
    },
    reiniciarDemo: function () { try { localStorage.removeItem(KEY); } catch (e) {} demoMem = null; leer(); return Promise.resolve(); }
  };

  function reducirImagen(file, max) {
    return new Promise(function (ok, fail) {
      var fr = new FileReader();
      fr.onerror = fail;
      fr.onload = function () {
        var img = new Image();
        img.onerror = fail;
        img.onload = function () {
          var k = Math.min(1, max / Math.max(img.width, img.height));
          var c = document.createElement('canvas');
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          ok(c.toDataURL('image/jpeg', 0.82));
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  // =========================================================
  // MODO REAL (Supabase)
  // =========================================================
  var Real = null;
  if (MODO_REAL) {
    var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    var check = function (res) { if (res.error) throw res.error; return res.data; };

    Real = {
      modo: 'real',
      listRifas: function (opts) {
        var q = sb.from('rifas').select('*').order('orden', { ascending: true }).order('fecha_sorteo', { ascending: true });
        if (opts && opts.soloActivas) q = q.eq('estado', 'activa');
        return Promise.all([q.then(check), sb.rpc('resumen_rifas').then(check)]).then(function (res) {
          var conteo = {};
          (res[1] || []).forEach(function (c) { conteo[c.rifa_id] = c; });
          return res[0].filter(function (r) { return (opts && opts.admin) || r.estado !== 'borrador'; }).map(function (r) {
            var c = conteo[r.id] || {};
            return Object.assign({}, r, { precio: Number(r.precio), apartados: Number(c.apartados || 0), pagados: Number(c.pagados || 0) });
          });
        });
      },
      getRifa: function (id) {
        return sb.from('rifas').select('*').eq('id', id).maybeSingle().then(check).then(function (r) {
          if (r) r.precio = Number(r.precio);
          return r;
        });
      },
      estadoBoletos: function (rifaId) {
        return sb.rpc('estado_boletos', { p_rifa: rifaId }).then(check).then(function (rows) {
          var m = {}; (rows || []).forEach(function (b) { m[b.numero] = b.estado; }); return m;
        });
      },
      apartar: function (rifaId, numeros, nombre, telefono) {
        return sb.rpc('apartar_boletos', { p_rifa: rifaId, p_numeros: numeros, p_nombre: nombre, p_telefono: telefono })
          .then(function (res) {
            if (res.error) {
              var m = String(res.error.message || '');
              var code = ['RIFA_CERRADA', 'SIN_NUMEROS', 'DATOS_INVALIDOS', 'NUMERO_INVALIDO'].filter(function (c) { return m.indexOf(c) > -1; })[0];
              throw new Error(code || m);
            }
            return res.data;
          });
      },
      verificar: function (telefono) { return sb.rpc('verificar_boletos', { p_telefono: telefono }).then(check); },
      premios: function () { return sb.from('premios_entregados').select('*').order('fecha', { ascending: false }).then(check); },
      ajustes: function () { return sb.from('ajustes').select('*').eq('id', 1).maybeSingle().then(check).then(function (a) { return a || { cuentas: [] }; }); },

      session: function () { return sb.auth.getSession().then(function (r) { return r.data.session ? r.data.session.user : null; }); },
      login: function (email, pass) {
        return sb.auth.signInWithPassword({ email: email, password: pass }).then(function (r) {
          if (r.error) throw new Error('Correo o contraseña incorrectos');
          return r.data.user;
        });
      },
      logout: function () { return sb.auth.signOut(); },
      saveRifa: function (r) {
        var datos = Object.assign({}, r); delete datos.apartados; delete datos.pagados;
        if (!datos.id) delete datos.id;
        return sb.from('rifas').upsert(datos).select().single().then(check);
      },
      deleteRifa: function (id) { return sb.from('rifas').delete().eq('id', id).then(check); },
      boletosAdmin: function (rifaId) {
        return sb.rpc('estado_boletos', { p_rifa: rifaId }).then(function () {
          return sb.from('boletos').select('*').eq('rifa_id', rifaId).order('numero').then(check);
        });
      },
      marcarPagado: function (rifaId, numeros) {
        return sb.from('boletos').update({ estado: 'pagado', expira_en: null, pagado_en: new Date().toISOString() })
          .eq('rifa_id', rifaId).in('numero', numeros).then(check);
      },
      liberar: function (rifaId, numeros) { return sb.from('boletos').delete().eq('rifa_id', rifaId).in('numero', numeros).then(check); },
      precioEspecial: function (rifaId, numeros, monto, nota) {
        return sb.from('boletos').update({ monto_folio: monto, nota: nota || '' }).eq('rifa_id', rifaId).in('numero', numeros).then(check);
      },
      extenderApartado: function (rifaId, numeros, horas) {
        return sb.from('boletos').update({ expira_en: horasDesdeAhora(horas) })
          .eq('rifa_id', rifaId).eq('estado', 'apartado').in('numero', numeros).then(check);
      },
      savePremio: function (p) {
        var datos = Object.assign({}, p); if (!datos.id) delete datos.id;
        return sb.from('premios_entregados').upsert(datos).select().single().then(check);
      },
      deletePremio: function (id) { return sb.from('premios_entregados').delete().eq('id', id).then(check); },
      saveAjustes: function (a) { return sb.from('ajustes').upsert(Object.assign({}, a, { id: 1 })).then(check); },
      subirImagen: function (file) {
        return reducirImagen(file, 1400).then(function (dataUrl) {
          return fetch(dataUrl).then(function (r) { return r.blob(); });
        }).then(function (blob) {
          var ruta = Date.now() + '-' + Math.random().toString(36).slice(2, 7) + '.jpg';
          return sb.storage.from('imagenes').upload(ruta, blob, { contentType: 'image/jpeg' }).then(function (r) {
            if (r.error) throw r.error;
            return sb.storage.from('imagenes').getPublicUrl(ruta).data.publicUrl;
          });
        });
      }
    };
  }

  window.RA_DB = Real || Demo;
})();
