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

// 7) Graph-Tab

function parseCSVtoMatrix(csvText) {
  const lines = csvText
    .trim()
    .split(/\r?\n/); // Zeilen umbrechen (auch CRLF)
  const matrix = lines.map(line =>
    line
      .split(';')
      .map(cell => {
        const num = parseFloat(cell.trim());
        return isNaN(num) ? 0 : num;
      })
  );
  return matrix;
}


function buildAdjList(matrix) {
  const n = matrix.length;
  const adjList = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] !== 0) {
        adjList[i].push(j);
      }
    }
  }
  return adjList;
}

/**
 * Führt Breitensuche (BFS) ab Startknoten 'src' durch und 
 * gibt ein Array distances[] zurück, wobei distances[v] 
 * die kürzeste Distanz (Anzahl Kanten) von src zu v ist.
 * Unverbundene Knoten werden mit Infinity markiert.
 */
function bfsDistances(adjList, src) {
  const n = adjList.length;
  const dist = Array(n).fill(Infinity);
  const queue = [];
  dist[src] = 0;
  queue.push(src);

  while (queue.length > 0) {
    const u = queue.shift();
    for (const v of adjList[u]) {
      if (dist[v] === Infinity) {
        dist[v] = dist[u] + 1;
        queue.push(v);
      }
    }
  }
  return dist;
}

/**
 * Berechnet für jeden Knoten die Exzentrizität:
 * Exzentrizität(u) = max dist(u, v) über alle v.
 * Wenn ein Knoten unverbunden ist, bleibt die Exzentri-
 * zität = Infinity.
 */
function computeEccentricities(adjList) {
  const n = adjList.length;
  const exz = Array(n).fill(0);

  for (let u = 0; u < n; u++) {
    const dists = bfsDistances(adjList, u);
    // Maximaldistanz (ohne Infinity, wenn vollständig verbunden)
    let maxd = 0;
    for (const d of dists) {
      if (d === Infinity) {
        maxd = Infinity;
        break;
      }
      if (d > maxd) maxd = d;
    }
    exz[u] = maxd;
  }
  return exz;
}

/**
 * Bestimmt Radius, Durchmesser und Zentrum.
 * - Radius = min exz(u)
 * - Durchmesser = max exz(u)
 * - Zentrum = alle Knoten u mit exz(u) == Radius
 */
function computeRadiusDiameterCenter(eccentricities) {
  const finiteExz = eccentricities.filter(e => e !== Infinity);
  const radius = Math.min(...finiteExz);
  const diameter = Math.max(...finiteExz);
  const center = [];
  eccentricities.forEach((e, idx) => {
    if (e === radius) center.push(idx);
  });
  return { radius, diameter, center };
}

/**
 * Hauptfunktion: Wird aufgerufen, wenn der Nutzer die CSV-Datei ausgewählt 
 * und auf “Graph verarbeiten” geklickt hat.
 */
document.getElementById('process-graph').addEventListener('click', () => {
  const fileInput = document.getElementById('graph-file-input');
  const resultsDiv = document.getElementById('graph-results');
  resultsDiv.innerHTML = ''; // Ergebnisbereich leeren

  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Bitte wähle erst eine CSV-Datei mit der Adjazenzmatrix aus.');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    try {
      // 1) CSV-Text parsen
      const text = event.target.result;
      const matrix = parseCSVtoMatrix(text);

      // 2) Validierung: quadratische Matrix?
      const n = matrix.length;
      let isSquare = true;
      for (const row of matrix) {
        if (row.length !== n) {
          isSquare = false;
          break;
        }
      }
      if (!isSquare) {
        resultsDiv.innerHTML = `<div class="graph-card">
          <strong>Fehler:</strong> Die CSV muss eine quadratische Adjazenzmatrix sein (gleiche Anzahl Zeilen und Spalten).
        </div>`;
        return;
      }

      // 3) Adjazenzliste bauen
      const adjList = buildAdjList(matrix);

      // 4) Exzentrizitäten berechnen
      const exz = computeEccentricities(adjList);

      // 5) Radius, Durchmesser, Zentrum berechnen
      const { radius, diameter, center } = computeRadiusDiameterCenter(exz);

      // 6) Ergebnisse formatieren und anzeigen
      let html = '';

      // 6a) Adjazenzmatrix als Tabelle (optional)
      html += '<h3>Adjazenzmatrix</h3>';
      html += '<table><thead><tr><th></th>';
      for (let j = 0; j < n; j++) {
        html += `<th>${j}</th>`;
      }
      html += '</tr></thead><tbody>';
      for (let i = 0; i < n; i++) {
        html += `<tr><th>${i}</th>`;
        for (let j = 0; j < n; j++) {
          html += `<td>${matrix[i][j]}</td>`;
        }
        html += '</tr>';
      }
      html += '</tbody></table>';

      // 6b) Exzentrizitäten-Liste
      html += '<h3>Exzentrizitäten</h3>';
      html += '<ul>';
      exz.forEach((e, idx) => {
        const displayE = e === Infinity ? '∞ (nicht verbunden)' : e;
        html += `<li>Knoten ${idx}: Exzentrizität = ${displayE}</li>`;
      });
      html += '</ul>';

      // 6c) Radius, Durchmesser, Zentrum
      html += '<div class="graph-card">';
      html += `<p><strong>Radius:</strong> ${radius === Infinity ? '∞' : radius}</p>`;
      html += `<p><strong>Durchmesser:</strong> ${diameter === Infinity ? '∞' : diameter}</p>`;
      html += `<p><strong>Zentrum:</strong> ${center.length > 0 ? center.join(', ') : '—'}</p>`;
      html += '</div>';

      resultsDiv.innerHTML = html;
    } catch (err) {
      console.error(err);
      resultsDiv.innerHTML = `<div class="graph-card">
        <strong>Fehler beim Verarbeiten:</strong> ${err.message}
      </div>`;
    }
  };

  reader.onerror = function() {
    alert('Konnte die Datei nicht lesen.');
  };

  reader.readAsText(file);
});

