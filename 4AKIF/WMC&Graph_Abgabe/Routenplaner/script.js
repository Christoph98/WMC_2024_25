//API-Key von OpenWeatherMap hier eintragen:
const OWM_API_KEY = 'b41ab4b76492afa1d2d3cc37440970eb';
const activities = [
  'Spaziergang im Park',
  'Lesen eines Buches',
  'Kaffee in deinem Lieblingscafé',
  'Yoga zu Hause',
  'Fahrradtour',
  'Filmabend',
  'Koch-Challenge: Neues Rezept ausprobieren',
  'Fotospaziergang in der Stadt',
  'Meditation für 10 Minuten',
  'Museumsbesuch'
];

// Navigation
document.querySelectorAll('nav li').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('nav li').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    showSection(item.dataset.section);
  });
});

function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.toggle('active', sec.id === id);
  });
}

