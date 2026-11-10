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
  // Videos del estudio: se reproducen sin sonido al verse y se pausan al salir.
  const videos = document.querySelectorAll('video[data-auto]');
  if (!videos.length) return;
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!quieto && 'IntersectionObserver' in window) {
    const ojo = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
      });
    }, { threshold: 0.4 });
    videos.forEach((v) => ojo.observe(v));
  }
  // Boton de sonido: solo un video suena a la vez.
  document.querySelectorAll('[data-sonido]').forEach((boton) => {
    const v = boton.parentElement.querySelector('video');
    boton.setAttribute('aria-pressed', 'false');
    boton.addEventListener('click', () => {
      const activar = v.muted;
      videos.forEach((otro) => { otro.muted = true; });
      document.querySelectorAll('[data-sonido]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      v.muted = !activar;
      if (activar) { v.play().catch(() => {}); boton.setAttribute('aria-pressed', 'true'); }
    });
  });
})();
