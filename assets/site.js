/* ====================================================================
   COMPONENTES COMPARTIDOS DE NOEL STUDIO
   El menú y el pie de página viven aquí UNA sola vez y se insertan en
   todas las páginas. Si cambias un teléfono o un enlace, lo cambias
   aquí y se actualiza en todo el sitio.

   NOTA: durante el rediseño, "Inicio" apunta a index-v2.html (la copia
   de trabajo). Cuando esté todo listo, index-v2.html pasa a ser el
   index.html oficial y cambiamos estos enlaces a "index.html".
   ==================================================================== */
(function () {
  var HOME = 'index-v2.html';

  // --- MENÚ (igual en todas las páginas) ---
  var navHTML = ''
    + '<nav id="navbar">'
    + '  <ul class="nav-links">'
    + '    <li><a href="' + HOME + '">Inicio</a></li>'
    + '    <li><a href="' + HOME + '#servicios">Servicios</a></li>'
    + '    <li><a href="' + HOME + '#portafolio">Portafolio</a></li>'
    + '    <li><a href="precios.html">Precios</a></li>'
    + '    <li><a href="' + HOME + '#contacto" class="nav-cta">Contacto</a></li>'
    + '  </ul>'
    + '  <a href="' + HOME + '" class="nav-brand" aria-label="Noel Studio — inicio">'
    + '    <span class="nav-brand-name">NOEL STUDIO</span>'
    + '  </a>'
    + '  <button class="nav-toggle" id="navToggle" aria-label="Abrir menú" aria-expanded="false">'
    + '    <span></span><span></span><span></span>'
    + '  </button>'
    + '</nav>';

  // --- PIE DE PÁGINA ---
  var igPath = 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z';
  var ttPath = 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z';
  var waPath = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';
  var waLink = 'https://wa.me/526142251419?text=Hola,%20me%20interesa%20una%20p%C3%A1gina%20web';

  var footerHTML = ''
    + '<footer>'
    + '  <div class="footer-top">'
    + '    <div class="footer-col">'
    + '      <div class="footer-brand">NOEL STUDIO</div>'
    + '      <p class="footer-tagline">Diseño web profesional para negocios en Chihuahua. Páginas modernas, rápidas y pensadas para convertir visitantes en clientes.</p>'
    + '      <div class="social-links footer-social">'
    + '        <a href="https://www.instagram.com/noelstudioweb" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="' + igPath + '"/></svg></a>'
    + '        <a href="https://www.tiktok.com/@noelstudio_" target="_blank" rel="noopener" aria-label="TikTok"><svg viewBox="0 0 24 24"><path d="' + ttPath + '"/></svg></a>'
    + '        <a href="' + waLink + '" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24"><path d="' + waPath + '"/></svg></a>'
    + '      </div>'
    + '    </div>'
    + '    <div class="footer-col">'
    + '      <span class="footer-heading">Navegación</span>'
    + '      <a href="' + HOME + '">Inicio</a>'
    + '      <a href="' + HOME + '#servicios">Servicios</a>'
    + '      <a href="' + HOME + '#portafolio">Portafolio</a>'
    + '      <a href="precios.html">Precios</a>'
    + '      <a href="' + HOME + '#preguntas">Preguntas</a>'
    + '    </div>'
    + '    <div class="footer-col">'
    + '      <span class="footer-heading">Contacto</span>'
    + '      <a href="' + waLink + '" target="_blank" rel="noopener">WhatsApp · 614 225 1419</a>'
    + '      <a href="mailto:contacto.noelstudio@gmail.com">contacto.noelstudio@gmail.com</a>'
    + '      <span class="footer-muted">Chihuahua, México</span>'
    + '    </div>'
    + '  </div>'
    + '  <div class="footer-bottom">'
    + '    <div class="footer-copy">© 2026 Noel Studio · Todos los derechos reservados</div>'
    + '    <a href="#" class="footer-top-link">Volver arriba ↑</a>'
    + '  </div>'
    + '</footer>';

  var waFloatHTML = '<a href="' + waLink + '" class="wa-float" target="_blank" aria-label="WhatsApp"><svg viewBox="0 0 24 24"><path d="' + waPath + '"/></svg></a>';
  var progressHTML = '<div class="scroll-progress" id="scrollProgress"></div>';

  // --- INSERTAR EN LA PÁGINA ---
  var navMount = document.getElementById('site-nav');
  if (navMount) navMount.innerHTML = navHTML;
  var footMount = document.getElementById('site-footer');
  if (footMount) footMount.innerHTML = footerHTML;
  document.body.insertAdjacentHTML('afterbegin', progressHTML);
  document.body.insertAdjacentHTML('beforeend', waFloatHTML);

  // --- MENÚ HAMBURGUESA (celular) ---
  var toggle = document.getElementById('navToggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- BARRA SÓLIDA AL BAJAR + BARRA DE PROGRESO ---
  var navbar = document.getElementById('navbar');
  var progress = document.getElementById('scrollProgress');
  function onScroll() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
    if (progress) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- MARCAR EL APARTADO ACTUAL EN EL MENÚ ---
  var current = (location.pathname.split('/').pop() || HOME);
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (href === current) a.classList.add('active');
  });
})();
