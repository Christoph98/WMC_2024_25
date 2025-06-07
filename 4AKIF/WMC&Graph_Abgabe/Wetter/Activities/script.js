// 1) API-Konfiguration:
// Hier wird der persönliche API-Schlüssel für die OpenWeatherMap-API hinterlegt.
// Achtung: Niemals öffentlich posten! In dieser Demo-Kommentar-Version zeige ich,
// welcher Zweck dahintersteckt und wie man ihn beschafft.
const OWM_API_KEY = 'b41ab4b76492afa1d2d3cc37440970eb';

// 2) Aktivitäten-Array:
// Dieses Array enthält verschiedene Freizeit-Tätigkeiten. Beim Klick auf "Aktivität holen"
// wählen wir hier zufällig eine davon aus. Die Liste ist bewusst vielfältig:
// - Draußen (Spaziergang, Fotospaziergang)
// - Drinnen (Lesen, Yoga)
// - Soziale Aktivitäten (Kaffee, Museumsbesuch)
// - Kreative Challenges (Koch-Challenge)
// So kann man im Vortrag auch auf mögliche Erweiterungen eingehen.
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

// 3) Navigation: Tab-System aufbauen
// a) Wir selektieren alle Listenelemente (<li>) innerhalb des <nav>-Elements.
// b) Jedem davon fügen wir einen Klick-Listener hinzu, um folgende Aufgaben zu erfüllen:
//    1) Entferne die CSS-Klasse "active" von allen Nav-Items.
//    2) Füge die Klasse "active" zum aktuell geklickten Nav-Item hinzu.
//    3) Rufe die Funktion showSection() auf, um den korrespondierenden Bereich anzuzeigen.
document.querySelectorAll('nav li').forEach(item => {
  item.addEventListener('click', () => {
    // Entfernen aller bisherigen Hervorhebungen
    document.querySelectorAll('nav li').forEach(i => i.classList.remove('active'));
    // Hervorheben des gerade geklickten Elements
    item.classList.add('active');
    // Sichtbarkeitsmanagement für die Sektionen
    showSection(item.dataset.section);
  });
});

// Hilfsfunktion: Sichtbarkeit der Sektionen umschalten
// - id: String, z.B. "weather" oder "activity"
// - Alle Sektionen mit class="section" durchlaufen
// - Diejenige, deren id mit dem übergebenen Wert übereinstimmt,
//   bekommt class "active"; alle anderen verlieren sie.
function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.toggle('active', sec.id === id);
  });
}

// 4) AKTUELLES WETTER abrufen
// Workflow:
// 1) Nutzer gibt einen Stadtnamen im Eingabefeld ein.
// 2) Klick auf Button löst diesen asynchronen Callback aus.
// 3) Wir trimmen den Input und prüfen, ob etwas eingegeben wurde.
// 4) Fehlerfall: Ohne Eingabe => Alert.
// 5) URL mit Query-Parametern für Stadt, Einheiten (°C), Sprache (Deutsch) und API-Key.
// 6) fetch() sendet GET-Anfrage an OpenWeatherMap.
// 7) Bei HTTP-Fehler (z.B. 404, 401) => Alert "Stadt nicht gefunden".
// 8) JSON-Antwort parsen => Zugriff auf data.weather[0], data.main.temp.
// 9) UI-Update: Stadtname (<h3>) + Beschreibung + Temperatur (<p>).
document.getElementById('get-weather').addEventListener('click', async () => {
  const city = document.getElementById('city-input').value.trim();
  if (!city) return alert('Bitte Stadt eingeben!');

  const url = `https://api.openweathermap.org/data/2.5/weather` +
              `?q=${encodeURIComponent(city)}` +
              `&units=metric&lang=de&appid=${OWM_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return alert('Stadt nicht gefunden.');
    const data = await res.json();
    document.getElementById('weather-result').innerHTML = `
      <h3>${data.name}</h3>
      <p>${data.weather[0].description}, ${data.main.temp.toFixed(1)}°C</p>
    `;
  } catch (networkError) {
    console.error('Netzwerkfehler:', networkError);
    alert('Fehler beim Abrufen der Wetterdaten.');
  }
});

// 5) 5-Tage-Vorhersage (Forecast)
// Unterschied: API-Endpunkt "forecast" liefert Daten im 3-Stunden-Takt:
// - Wir filtern jeweils den Eintrag um 12:00 Uhr, um pro Tag nur einen
//   repräsentativen Snapshot zu zeigen.
// - Tage-Objekt: Key = Datum (YYYY-MM-DD), Value = Forecast-Objekt
// - HTML: Grid-Layout mit Karte je Tag (Datum, Beschreibung, Temp).

document.getElementById('get-forecast').addEventListener('click', async () => {
  const city = document.getElementById('city-input').value.trim();
  if (!city) return alert('Bitte erst im Wetter-Tab Stadt abrufen!');

  const url = `https://api.openweathermap.org/data/2.5/forecast` +
              `?q=${encodeURIComponent(city)}` +
              `&units=metric&lang=de&appid=${OWM_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return console.warn('Forecast nicht verfügbar');
    const data = await res.json();

    const days = {};
    data.list.forEach(item => {
      // dt_txt: "2025-06-08 12:00:00"
      const date = item.dt_txt.split(' ')[0];
      if (!days[date] && item.dt_txt.endsWith('12:00:00')) {
        days[date] = item;
      }
    });

    let html = '<div class="forecast-grid">';
    Object.keys(days).forEach(d => {
      const it = days[d];
      html += `<div class="card">
        <strong>${d}</strong><br>
        ${it.weather[0].description}<br>
        ${it.main.temp.toFixed(1)}°C
      </div>`;
    });
    html += '</div>';

    document.getElementById('forecast-result').innerHTML = html;
  } catch (err) {
    console.error('Fehler Forecast:', err);
  }
});

// 6) Zufalls-Aktivität anzeigen
// - Klick auf Button => einfacher, synchroner Callback
// - Math.random() erzeugt Fließkommazahl [0,1)
// - Multiplikation mit Länge des Arrays und Math.floor() für Index [0..len-1]
// - Ausgabe in Card-Container

document.getElementById('get-activity').addEventListener('click', () => {
  const output = document.getElementById('activity-result');
  const idx = Math.floor(Math.random() * activities.length);
  output.innerHTML = `<div class="card">
      <p><strong>${activities[idx]}</strong></p>
    </div>`;
});

// 7) Witze-Bereich: Zufälliger Programmier-Witz
// - API: https://official-joke-api.appspot.com/jokes/programming/random
// - Antwort: Array mit einem Objekt [{ id, type, setup, punchline }]
// - Promise-Handling mit try/catch für Fehlertoleranz
// - Zwischennachricht "Lade Witz…" für bessere UX

document.getElementById('get-joke').addEventListener('click', async () => {
  const output = document.getElementById('joke-result');
  output.textContent = 'Lade Witz…';
  try {
    const res = await fetch('https://official-joke-api.appspot.com/jokes/programming/random');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const [joke] = await res.json();
    output.innerHTML = `<div class="card">
        <p><strong>Setup:</strong> ${joke.setup}</p>
        <p><strong>Punchline:</strong> ${joke.punchline}</p>
      </div>`;
  } catch (err) {
    console.error('Joke-Fehler:', err);
    output.textContent = 'Fehler beim Laden des Witzes – mehr in Konsole.';
  }
});

// 8) GRAPH-SECTION: CSV einlesen und Floyd–Warshall
// -------------------------------------------------------------------------------
// CSV-Input:
// - Format: Semikolon-separierte Zahlen, jede Zeile = eine Matrix-Zeile
// - Wir speichern zunächst als "matrix" (Array von Number-Arrays)
// - Anzeige: Matrix-Inhalt in Pre-Form (Zeilenumbruch-getrennt)

let matrix = [];
document.getElementById('csvFileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    matrix = e.target.result
      .trim()
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => line.split(';').map(Number));
    document.getElementById('ausgabe').textContent =
      'Adjazenzmatrix geladen:\n' + matrix.map(row => row.join(', ')).join('\n');
  };
  reader.readAsText(file);
});

// Kernfunktion: rechnen()
// 1) Initialisierung einer Distanzmatrix D:
//    - Unendliche Distanzen (Infinity) für alle Paare,
//    - Null auf der Diagonale (Abstand zu sich selbst)
//    - Ein-Kanten (1) bei Eintrag matrix[i][j] === 1
// 2) Floyd–Warshall Algorithmus:
//    - Drei geschachtelte Schleifen über k, i, j
//    - Relaxation: D[i][j] = min(D[i][j], D[i][k] + D[k][j])
// 3) Exzentrizitäten, Radius, Durchmesser, Zentrum:
//    - Exzentrizität jedes Knotens: Maximum der erreichbaren Distanzen
//    - Radius: Minimum aller Exzentrizitäten
//    - Durchmesser: Maximum aller Exzentrizitäten
//    - Zentrum: Knoten mit Exzentrizität == Radius
// 4) Ausgabe: Textuelle Darstellung aller Werte + komplette Distanzmatrix

function rechnen() {
  if (matrix.length === 0) {
    document.getElementById('ausgabe').textContent =
      'Gib mir eine Matrix habe ich gesagt!';
    return;
  }

  const n = matrix.length;
  const D = Array.from({ length: n }, () => Array(n).fill(Infinity));
  for (let i = 0; i < n; i++) {
    D[i][i] = 0;
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] === 1) D[i][j] = 1;
    }
  }

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (D[i][k] + D[k][j] < D[i][j]) {
          D[i][j] = D[i][k] + D[k][j];
        }
      }
    }
  }

  const exz = new Array(n);
  let ausgabe = '';
  for (let i = 0; i < n; i++) {
    const reachable = D[i].filter(d => d < Infinity);
    const maxDist = reachable.length ? Math.max(...reachable) : Infinity;
    exz[i] = maxDist;
    ausgabe += `Knoten ${i}: Exzentrizität = ${maxDist < Infinity ? maxDist : '∞'}\n`;
  }

  const radius = Math.min(...exz);
  const durchmesser = Math.max(...exz);
  const zentrum = exz.map((e, i) => e === radius ? i : null).filter(x => x !== null);

  ausgabe += `\nRadius = ${radius < Infinity ? radius : '∞'}\n`;
  ausgabe += `Durchmesser = ${durchmesser < Infinity ? durchmesser : '∞'}\n`;
  ausgabe += `Zentrum = ${zentrum.length ? zentrum.join(', ') : '(keins)'}\n\n`;

  ausgabe += `Distanzmatrix:\n    ${[...Array(n).keys()].join(' ')}\n`;
  for (let i = 0; i < n; i++) {
    ausgabe += `${i} | ${D[i].map(x => x === Infinity ? '∞' : x).join(' ')}\n`;
  }

  document.getElementById('ausgabe').textContent = ausgabe;
}
