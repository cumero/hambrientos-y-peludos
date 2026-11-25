// Hambrientos y Peludos · v0
(() => {
  // Horario real (0 = domingo … 6 = sábado), en minutos desde medianoche.
  const HOURS = {
    0: [[630, 810]],
    1: [[600, 810], [1050, 1200]],
    2: [[600, 810], [1050, 1200]],
    3: [[600, 810], [1050, 1200]],
    4: [[600, 810], [1050, 1200]],
    5: [[600, 810], [1050, 1200]],
    6: [[630, 810]],
  };
  const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

  // Hora de Madrid, aunque el visitante esté en otra zona.
  function madridNow() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day, mins: Number(get('hour')) % 24 * 60 + Number(get('minute')) };
  }

  function status() {
    const { day, mins } = madridNow();
    const open = HOURS[day].find(([a, b]) => mins >= a && mins < b);
    if (open) return { open: true, day, text: `Abierto ahora · hasta las ${fmt(open[1])}` };
    const later = HOURS[day].find(([a]) => mins < a);
    if (later) return { open: false, day, text: `Cerrado ahora · abrimos a las ${fmt(later[0])}` };
    const next = (day + 1) % 7;
    return { open: false, day, text: `Cerrado ahora · mañana ${DAY_NAMES[next]} desde las ${fmt(HOURS[next][0][0])}` };
  }

  function paint() {
    const s = status();
    document.querySelectorAll('[data-open-now]').forEach((el) => {
      el.textContent = el.classList.contains('badge') ? (s.open ? 'Abierto ahora' : 'Cerrado ahora') : s.text;
      el.dataset.state = s.open ? 'open' : 'closed';
    });
    document.querySelectorAll('.hours tr[data-days]').forEach((tr) => {
      tr.classList.toggle('is-today', tr.dataset.days.split(',').map(Number).includes(s.day));
    });
  }
  paint();
  setInterval(paint, 60_000);

  // Año del pie.
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Barra de contacto en móvil: aparece cuando el botón del hero ya no se ve.
  const bar = document.querySelector('.actionbar');
  const heroActions = document.querySelector('.hero__actions');
  if (bar && heroActions && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => bar.classList.toggle('is-visible', !e.isIntersecting && e.boundingClientRect.top < 0))
      .observe(heroActions);
  }

  // Marca la sección activa en el menú.
  const links = [...document.querySelectorAll('.nav__links a')];
  const targets = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (targets.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.toggleAttribute('aria-current', a.getAttribute('href') === `#${e.target.id}`));
        links.forEach((a) => { if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'true'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach((t) => io.observe(t));
  }
})();
