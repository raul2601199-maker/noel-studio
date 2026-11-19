/*
  ███╗   ██╗ ██████╗ ███████╗██╗        NOEL STUDIO
  ──────── by Raúl · Chihuahua, MX ────────
*/
// La onda de voz de la tarjeta de llamadas solo corre cuando se ve.
(function () {
  const tarjeta = document.querySelector(".servicio--llamadas");
  if (!tarjeta || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(([e]) => tarjeta.classList.toggle("en-pantalla", e.isIntersecting)).observe(tarjeta);
})();
