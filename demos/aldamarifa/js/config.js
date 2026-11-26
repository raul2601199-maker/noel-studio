// =========================================================
// Configuración de Aldama Rifa — COPIA DEMO para el portafolio de Noel Studio
// Mientras SUPABASE_URL esté vacío, la página corre en MODO DEMO:
// todo se guarda en tu navegador para que la puedas probar.
// =========================================================
window.RA_CONFIG = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '', // DEMO del portafolio de Noel Studio: sin base de datos

  // Solo se usan en modo demo (en modo real salen de la tabla "ajustes")
  DEMO_AJUSTES: {
    whatsapp: '526142251419', // Noel Studio (demo)
    facebook: 'https://www.facebook.com/',
    tiktok: '',
    aviso: 'Si ya apartaste, manda tu comprobante por WhatsApp con tu folio.',
    cuentas: [
      { banco: 'Banco de ejemplo', titular: 'Cuenta de demostración', clabe: '000000000000000000', tarjeta: '' }
    ]
  }
};
