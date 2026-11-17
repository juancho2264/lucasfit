// Configuración: lo único que hay que cambiar para pasarla a la versión final.
const CONFIG = {
  // Número de WhatsApp con código de país, sin + ni espacios. Ej.: '5491123456789'
  whatsapp: '',
  // Si todavía no hay número, los botones llevan al Instagram
  instagram: 'https://www.instagram.com/lucaas_fit/',
};

// Todos los botones con data-whatsapp abren el chat con el mensaje ya escrito
document.querySelectorAll('[data-whatsapp]').forEach((boton) => {
  boton.href = CONFIG.whatsapp
    ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(boton.dataset.whatsapp)}`
    : CONFIG.instagram;
  boton.target = '_blank';
  boton.rel = 'noopener';
});
