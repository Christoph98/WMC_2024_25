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

// 1) Aktuelles Wetter
document.getElementById('get-weather').addEventListener('click', async () => {
  const city = document.getElementById('city-input').value.trim();
  if (!city) return alert('Bitte Stadt eingeben!');
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=de&appid=${OWM_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return alert('Stadt nicht gefunden.');
  const data = await res.json();
  document.getElementById('weather-result').innerHTML = `
    <h3>${data.name}</h3>
    <p>${data.weather[0].description}, ${data.main.temp.toFixed(1)}°C</p>
  `;
});

// 2) 5-Tage-Vorhersage
document.getElementById('get-forecast').addEventListener('click', async () => {
  const city = document.getElementById('city-input').value.trim();
  if (!city) return alert('Bitte erst im Wetter-Tab Stadt abrufen!');
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&lang=de&appid=${OWM_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return;
  const data = await res.json();
  // je Tag einen Eintrag
  const days = {};
  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!days[date] && item.dt_txt.includes('12:00:00')) {
      days[date] = item;
    }
  });
  let html = '<div class="forecast-grid">';
  for (let d in days) {
    const it = days[d];
    html += `
      <div class="card">
        <strong>${d}</strong><br>
        ${it.weather[0].description}<br>
        ${it.main.temp.toFixed(1)}°C
      </div>
    `;
  }
  html += '</div>';
  document.getElementById('forecast-result').innerHTML = html;
});

// 3) Event-Listener für den Button “Aktivität holen”
document.getElementById('get-activity').addEventListener('click', () => {
  const output = document.getElementById('activity-result');
  // 4) Zufälligen Index zwischen 0 und activities.length-1 wählen
  const idx = Math.floor(Math.random() * activities.length);
  // ) Ausgabe im UI
  output.innerHTML = `
    <div class="card">
      <p><strong>${activities[idx]}</strong></p>
    </div>
  `;
});

// 5) “Witze”-Section ins Navigation-Handling aufnehmen
document.querySelectorAll('nav li').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('nav li').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    showSection(item.dataset.section);
  });
});

// 6) Joke-Button anlegen
document.getElementById('get-joke').addEventListener('click', async () => {
  const output = document.getElementById('joke-result');
  output.innerHTML = 'Lade Witz…';
  try {
    const res = await fetch('https://official-joke-api.appspot.com/jokes/programming/random');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const [joke] = await res.json(); 
    // Ausgabe:
    output.innerHTML = `
      <div class="card">
        <p><strong>Setup:</strong> ${joke.setup}</p>
        <p><strong>Punchline:</strong> ${joke.punchline}</p>
      </div>
    `;
  } catch (err) {
    console.error(err);
    output.textContent = 'Fehler beim Laden des Witzes – schau in die Konsole.';
  }
});


// 7) Graph-Section
let matrix = []
document.getElementById("csvFileInput").addEventListener("change", function(event) {

    const file = event.target.files[0];
    if (!file) 
        return;
    const reader = new FileReader();
    reader.onload = function(event) {
        matrix = event.target.result
        .trim()
        .split("\n")
        .filter(line => line.trim() !== "")
        .map(line => line.split(";").map(Number));
        
        document.getElementById("ausgabe").textContent = "Adjazenzmatrix geladen:\n" + matrix.map(row => row.join(", ")).join("\n");
    };
    reader.readAsText(file);
});

function rechnen() {
    if (matrix.length === 0) {
        document.getElementById("ausgabe").textContent = "Gib mir eine Matrix habe ich gesagt!";
        return;
    }

    const n = matrix.length;
    // 1. Distanzmatrix D aus der Adjazenzmatrix initialisieren
    const D = Array.from({ length: n }, () => Array(n).fill(Infinity));
    for (let i = 0; i < n; i++) {
        D[i][i] = 0;
        for (let j = 0; j < n; j++) {
            if (matrix[i][j] === 1) {
                D[i][j] = 1;
            }
        }
    }

    // 2 kürzeste Distanzen berechnen
    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (D[i][k] + D[k][j] < D[i][j]) {
                    D[i][j] = D[i][k] + D[k][j];
                }
            }
        }
    }

    // 3. Exzentrizität, Radius, Durchmesser, Zentrum berechnen
    const exzentizitritaet = new Array(n);
    let ausgabe = "";

    for (let i = 0; i < n; i++) {
        // Alle erreichbaren Distanzen (< Infinity) heraussuchen
        const reachable = D[i].filter(d => d < Infinity);
        const maxDist = reachable.length > 0 ? Math.max(...reachable) : Infinity;
        exzentizitritaet[i] = maxDist;
        ausgabe += `Knoten ${i}: Exzentrizität = ${maxDist < Infinity ? maxDist : "∞"}\n`;
    }

    const radius = Math.min(...exzentizitritaet);
    const durchmesser = Math.max(...exzentizitritaet);
    const zentrum = exzenti
        .map((e, i) => (e === radius ? i : null))
        .filter(x => x !== null);

    ausgabe += `\nRadius = ${radius < Infinity ? radius : "∞"}\n`;
    ausgabe += `Durchmesser = ${durchmesser < Infinity ? durchmesser : "∞"}\n`;
    ausgabe += `Zentrum = ${zentrum.length > 0 ? zentrum.join(", ") : "(keins)"}\n\n`;

    // 4. Distanzmatrix ausgeben
    ausgabe += `Distanzmatrix:\n    ${[...Array(n).keys()].join(" ")}\n`;
    for (let i = 0; i < n; i++) {
        ausgabe += `${i} | ${D[i].map(x => (x === Infinity ? "∞" : x)).join(" ")}\n`;
    }

    document.getElementById("ausgabe").textContent = ausgabe;
}
