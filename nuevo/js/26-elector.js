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
// Cambia la persona del circulo: gira sola hasta que alguien elige una.
(function () {
  const elector = document.querySelector('[data-elector]');
  if (!elector) return;
  const hero = document.querySelector('[data-llamada]');
  const orbe = elector.querySelector('[data-hablar]');
  const titulo = elector.querySelector('[data-orbe-texto]');
  const sub = elector.querySelector('[data-estado]');
  const foto = elector.querySelector('[data-orbe-foto]');
  const personas = [...elector.querySelectorAll('[data-persona]')];
  const audio = new Audio();
  audio.preload = 'none';
  let turno = 0;
  let reloj = null;

  // Si existe la foto, reemplaza la inicial. Si no, se queda la inicial.
  document.querySelectorAll('[data-foto]').forEach((elemento) => {
    const imagen = new Image();
    imagen.onload = () => {
      elemento.style.setProperty('--foto', 'url("' + elemento.dataset.foto + '")');
      elemento.classList.add('con-foto');
      if (elemento === personas[turno]) pintar();
    };
    imagen.src = elemento.dataset.foto;
  });

  function detenerAudio() {
    audio.pause();
    hero.classList.remove('voz-sonando');
  }

  function pintar() {
    const persona = personas[turno];
    const nombre = persona.dataset.nombre;
    hero.dataset.persona = persona.dataset.persona;
    personas.forEach((p) => p.setAttribute('aria-pressed', String(p === persona)));
    titulo.textContent = 'Escucha a ' + nombre;
    sub.textContent = 'Ejemplo de voz';
    foto.style.backgroundImage = persona.classList.contains('con-foto') ? 'url("' + persona.dataset.foto + '")' : 'none';
    orbe.classList.toggle('orbe--con-foto', persona.classList.contains('con-foto'));
    orbe.setAttribute('aria-label', 'Escuchar ejemplo de voz de ' + nombre);
  }

  function elegir(indice) {
    turno = indice;
    detenerAudio();
    pintar();
  }

  function detenerGiro() {
    clearInterval(reloj);
    reloj = null;
  }

  personas.forEach((persona, i) => {
    persona.addEventListener('click', () => {
      detenerGiro();
      elegir(i);
    });
  });

  orbe.addEventListener('click', () => {
    detenerGiro();
    const persona = personas[turno];
    if (!persona.dataset.audio) return;
    if (!audio.paused) {
      detenerAudio();
      sub.textContent = 'Ejemplo de voz';
      return;
    }
    audio.src = persona.dataset.audio;
    hero.classList.add('voz-sonando');
    sub.textContent = 'Sonando…';
    audio.play().catch(() => {
      hero.classList.remove('voz-sonando');
      sub.textContent = 'Toca otra vez';
    });
  });
  audio.addEventListener('ended', () => {
    hero.classList.remove('voz-sonando');
    sub.textContent = 'Ejemplo de voz';
  });

  pintar();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  reloj = setInterval(() => {
    if (!document.hidden && scrollY < innerHeight * 0.6) elegir((turno + 1) % personas.length);
  }, 3200);
})();
