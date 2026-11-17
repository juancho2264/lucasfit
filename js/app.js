// Configuración: lo único que hay que cambiar para pasarla a la versión final.
const CONFIG = {
  // Número de WhatsApp con código de país, sin + ni espacios. Ej.: '5491123456789'
  whatsapp: '',
  // Mientras no haya número, los botones llevan al Instagram
  instagram: 'https://www.instagram.com/lucaas_fit/',
};

const linkWhatsapp = (texto) => (CONFIG.whatsapp
  ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`
  : CONFIG.instagram);

// ---------- Botones de WhatsApp con el mensaje ya escrito ----------
document.querySelectorAll('[data-whatsapp]').forEach((boton) => {
  boton.href = linkWhatsapp(boton.dataset.whatsapp);
  boton.target = '_blank';
  boton.rel = 'noopener';
});

const sinAnimaciones = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Aparición de elementos al bajar ----------
const observador = new IntersectionObserver((entradas) => {
  for (const e of entradas) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('visible');
    observador.unobserve(e.target);
  }
}, { threshold: 0.15 });
document.querySelectorAll('.revelar').forEach((el, i) => {
  // Los elementos hermanos aparecen uno detrás del otro
  const hermanos = [...el.parentElement.children].filter((h) => h.classList.contains('revelar'));
  el.style.transitionDelay = `${Math.min(hermanos.indexOf(el), 5) * 90}ms`;
  observador.observe(el);
});

// ---------- Contador "0 → 90 días" ----------
document.querySelectorAll('.contador').forEach((el) => {
  const hasta = Number(el.dataset.hasta);
  if (sinAnimaciones) { el.textContent = hasta; return; }
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    obs.disconnect();
    const inicio = performance.now();
    const paso = (ahora) => {
      const t = Math.min((ahora - inicio) / 1400, 1);
      el.textContent = Math.round(hasta * (1 - (1 - t) ** 3));
      if (t < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }, { threshold: 0.6 }).observe(el);
});

// ---------- Línea de tiempo que se llena al bajar ----------
const linea = document.getElementById('linea-tiempo');
const llenarLinea = () => {
  const caja = linea.getBoundingClientRect();
  const avance = (innerHeight * 0.6 - caja.top) / caja.height;
  linea.style.setProperty('--avance', Math.max(0, Math.min(1, avance)));
};
addEventListener('scroll', llenarLinea, { passive: true });
llenarLinea();

// ---------- Comparador antes / después ----------
const comparador = document.getElementById('comparador');
const rango = comparador.querySelector('input');
rango.addEventListener('input', () => comparador.style.setProperty('--corte', `${rango.value}%`));

// ---------- Test "¿Qué plan es para vos?" ----------
const form = document.getElementById('form-test');
const pasos = [...form.querySelectorAll('.test__paso')];
const progreso = [...form.querySelectorAll('.test__progreso span')];
const resultado = document.getElementById('test-resultado');

const PLANES = {
  personalizado: { nombre: 'Personalizado', porque: 'Uno a uno, a tu ritmo y en tus horarios. Ideal para arrancar con confianza.', id: 'plan-personalizado' },
  noventa: { nombre: 'Plan 90 días', porque: 'El programa completo con seguimiento: el camino más directo a ver el cambio.', id: 'plan-90' },
  grupal: { nombre: 'Grupal', porque: 'Vas a progresar con un grupo que te motiva y te aprendés los trucos.', id: 'plan-grupal' },
};

function recomendar({ nivel, objetivo, modo }) {
  if (modo === 'Solo con el profe') return PLANES.personalizado;
  if (objetivo === 'Aprender trucos de calistenia' && nivel === 'Entreno un poco') return PLANES.grupal;
  return PLANES.noventa;
}

function mostrarPaso(n) {
  pasos.forEach((p, i) => { p.hidden = i !== n; });
  progreso.forEach((s, i) => s.classList.toggle('lleno', i <= n));
}

form.addEventListener('change', (e) => {
  const actual = pasos.findIndex((p) => !p.hidden);
  if (actual === -1) return;
  // Pequeña pausa para que se vea la opción elegida antes de pasar
  setTimeout(() => {
    if (actual < pasos.length - 1) return mostrarPaso(actual + 1);
    const datos = Object.fromEntries(new FormData(form));
    const plan = recomendar(datos);
    pasos.forEach((p) => { p.hidden = true; });
    document.getElementById('test-plan').textContent = plan.nombre;
    document.getElementById('test-porque').textContent = plan.porque;
    document.getElementById('test-whatsapp').href = linkWhatsapp(
      `Hola Lucas! Hice el test de tu página:\n• ${datos.nivel}\n• Quiero: ${datos.objetivo}\n• Prefiero: ${datos.modo}\nMe recomendó el plan "${plan.nombre}". ¿Me pasás info?`,
    );
    document.getElementById('test-whatsapp').target = '_blank';
    resultado.hidden = false;
    progreso.forEach((s) => s.classList.add('lleno'));
    document.querySelectorAll('.plan').forEach((p) => p.classList.toggle('recomendado', p.id === plan.id));
  }, e.target.type === 'radio' ? 250 : 0);
});

document.getElementById('test-reiniciar').addEventListener('click', () => {
  form.reset();
  resultado.hidden = true;
  document.querySelectorAll('.plan').forEach((p) => p.classList.remove('recomendado'));
  mostrarPaso(0);
});
mostrarPaso(0);
