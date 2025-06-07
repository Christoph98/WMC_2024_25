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
  const cityInput = document.getElementById('city-input').value.trim();
  const resultEl = document.getElementById('forecast-result');

  // --- 1) Kein Stadt-Name eingegeben? ---
  if (!cityInput) {
    resultEl.innerHTML = `
      <p class="error">
        ⚠️ Bitte gib zuerst eine Stadt im Wetter-Tab ein!
      </p>
    `;
    return;
  }

  // URL zusammenbauen
  const url = `https://api.openweathermap.org/data/2.5/forecast` +
              `?q=${encodeURIComponent(cityInput)}` +
              `&units=metric&lang=de&appid=${OWM_API_KEY}`;

  try {
    const res = await fetch(url);

    // --- 2) API liefert Fehler (z. B. Stadt nicht gefunden) ---
    if (!res.ok) {
      resultEl.innerHTML = `
        <p class="error">
          ⚠️ Leider konnte für „${cityInput}“ keine Vorhersage abgerufen werden.
        </p>
      `;
      return;
    }

    const data = await res.json();

    // Stadtdaten
    const cityName    = data.city.name;
    const countryCode = data.city.country;

    // Nur 12:00-Einträge je Tag
    const days = {};
    data.list.forEach(item => {
      const [date, time] = item.dt_txt.split(' ');
      if (time === '12:00:00' && !days[date]) {
        days[date] = item;
      }
    });

    // HTML für die Vorhersage
    let html = `
      <h2>5-Tage-Vorhersage für ${cityName} (${countryCode})</h2>
      <div class="forecast-grid">
    `;
    Object.entries(days).forEach(([date, it]) => {
      html += `
        <div class="card">
          <strong>${date}</strong><br>
          ${it.weather[0].description}<br>
          ${it.main.temp.toFixed(1)}°C
        </div>
      `;
    });
    html += `</div>`;

    resultEl.innerHTML = html;

  } catch (err) {
    // --- 3) Netzwerk- oder andere Fehler ---
    console.error('Fehler Forecast:', err);
    resultEl.innerHTML = `
      <p class="error">
        ⚠️ Unerwarteter Fehler. Bitte versuche es später noch einmal.
      </p>
    `;
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
  // Referenz auf das Ergebnis-Element holen
  const output = document.getElementById('joke-result');
  // Zwischenmeldung für bessere Nutzererfahrung
  output.textContent = 'Lade Witz… 🤔';

  try {
    // Anfrage an die öffentliche Joke-API
    const res = await fetch('https://official-joke-api.appspot.com/jokes/programming/random');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // Die API liefert ein Array mit einem Witz-Objekt
    const [joke] = await res.json();

    // Ausgabe des Witzes mit lachendem Emoji am Ende
    output.innerHTML = `
      <div class="card">
        <p><strong>Setup:</strong> ${joke.setup}</p>
        <p><strong>Punchline:</strong> ${joke.punchline} 😂</p>
      </div>
    `;
  } catch (err) {
    console.error('Joke-Fehler:', err);
    // Fehlermeldung im UI
    output.textContent = 'Fehler beim Laden des Witzes – bitte später erneut probieren.';
  }
});


// 8) GRAPH-SECTION: CSV einlesen und Floyd–Warshall
// -------------------------------------------------------------------------------
// CSV-Input:
// - Format: Semikolon-separierte Zahlen, jede Zeile = eine Matrix-Zeile
// - Wir speichern zunächst als "matrix" (Array von Number-Arrays)
// - Anzeige: Matrix-Inhalt in Pre-Form (Zeilenumbruch-getrennt)

let matrix = [];

    document.getElementById("csvFileInput").addEventListener("change", function(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        matrix = e.target.result
          .trim()
          .split(/\r?\n/)
          .filter(line => line.trim() !== "")
          .map(line => line.split(";").map(cell => Number(cell.trim())));
        document.getElementById("ausgabe").textContent =
          "Adjazenzmatrix geladen:\n" +
          matrix.map(row => row.join(", ")).join("\n");
      };
      reader.readAsText(file);
    });

    function rechnen() {
      const out = document.getElementById("ausgabe");
      if (matrix.length === 0) {
        out.textContent = "Eyyy, ich brauch ne Matrix!";
        return;
      }

      const n = matrix.length;
      const distanzen = Array.from({ length: n }, () => Array(n).fill(Infinity));
      const exzenti = [];
      let text = "";

      // BFS + DFS und Exzentrizitäten
      const bfsOrders = [];
      const dfsOrders = [];

      for (let start = 0; start < n; start++) {
        // BFS
        const queue = [start];
        const visitedB = Array(n).fill(false);
        const d = Array(n).fill(Infinity);
        const orderB = [];
        visitedB[start] = true;
        d[start] = 0;
        orderB.push(start);
        while (queue.length > 0) {
          const u = queue.shift();
          for (let v = 0; v < n; v++) {
            if (matrix[u][v] === 1 && !visitedB[v]) {
              visitedB[v] = true;
              d[v] = d[u] + 1;
              queue.push(v);
              orderB.push(v);
            }
          }
        }
        distanzen[start] = d;
        const maxd = Math.max(...d.filter(x => x < Infinity));
        exzenti.push(maxd);
        bfsOrders.push(orderB);

        // DFS
        const visitedD = Array(n).fill(false);
        const orderD = [];
        (function dfs(u) {
          visitedD[u] = true;
          orderD.push(u);
          for (let v = 0; v < n; v++) {
            if (matrix[u][v] === 1 && !visitedD[v]) dfs(v);
          }
        })(start);
        dfsOrders.push(orderD);

        // Ausgabe pro Knoten
        text += `Knoten ${start}: Exzentrizität = ${maxd}\n`;
        text += `BFS: ${orderB.join(" → ")}\n`;
        text += `DFS: ${orderD.join(" → ")}\n\n`;
      }

      // Radius, Durchmesser, Zentrum
      const radius = Math.min(...exzenti);
      const durchmesser = Math.max(...exzenti);
      const zentrum = exzenti.map((e, i) => e === radius ? i : null).filter(x => x !== null);
      text += `Radius = ${radius}\nDurchmesser = ${durchmesser}\nZentrum = ${zentrum.join(", ")}\n\n`;

      // Komponenten
      const components = (() => {
        const vis = Array(n).fill(false);
        const comps = [];
        for (let i = 0; i < n; i++) {
          if (!vis[i]) {
            const comp = [];
            const q = [i];
            vis[i] = true;
            while (q.length > 0) {
              const u = q.shift();
              comp.push(u);
              for (let v = 0; v < n; v++) {
                if (matrix[u][v] === 1 && !vis[v]) {
                  vis[v] = true;
                  q.push(v);
                }
              }
            }
            comps.push(comp);
          }
        }
        return comps;
      })();
      text += `Komponenten (${components.length}): ${components.map(c => '[' + c.join(',') + ']').join(' ')}\n`;

      // Artikulationen und Brücken
      const { aps, bridges } = (() => {
        const adj = matrix.map((row, i) => row.map((v, j) => v === 1 ? j : -1).filter(j => j >= 0));
        const disc = Array(n).fill(-1);
        const low = Array(n).fill(-1);
        const parent = Array(n).fill(-1);
        const apSet = new Set();
        const bridgeList = [];
        let time = 0;
        function dfsTarjan(u) {
          disc[u] = low[u] = time++;
          let children = 0;
          for (const v of adj[u]) {
            if (disc[v] === -1) {
              children++;
              parent[v] = u;
              dfsTarjan(v);
              low[u] = Math.min(low[u], low[v]);
              if ((parent[u] === -1 && children > 1) ||
                  (parent[u] !== -1 && low[v] >= disc[u])) apSet.add(u);
              if (low[v] > disc[u]) bridgeList.push([u, v]);
            } else if (v !== parent[u]) {
              low[u] = Math.min(low[u], disc[v]);
            }
          }
        }
        for (let i = 0; i < n; i++) if (disc[i] === -1) dfsTarjan(i);
        return { aps: Array.from(apSet), bridges: bridgeList };
      })();
      text += `Artikulationspunkte: ${aps.join(', ')}\n`;
      text += `Brücken: ${bridges.map(b => '(' + b[0] + '-' + b[1] + ')').join(', ')}\n\n`;

      // Dijkstra
      const s = Number(prompt('Startknoten für Dijkstra (0–' + (n-1) + '):'));
      if (!isNaN(s) && s >= 0 && s < n) {
        const distD = Array(n).fill(Infinity);
        const used = Array(n).fill(false);
        distD[s] = 0;
        for (let i = 0; i < n; i++) {
          let u = -1;
          for (let j = 0; j < n; j++) if (!used[j] && (u < 0 || distD[j] < distD[u])) u = j;
          if (distD[u] === Infinity) break;
          used[u] = true;
          for (let v = 0; v < n; v++) {
            const w = matrix[u][v];
            if (w > 0 && distD[u] + w < distD[v]) {
              distD[v] = distD[u] + w;
            }
          }
        }
        text += `Dijkstra-Distanzen von ${s}: ${distD.map(d => d===Infinity?'∞':d).join(', ')}\n\n`;
      } else {
        text += 'Dijkstra-Start ungültig oder abgebrochen.\n\n';
      }

      // Distanzmatrix
      text += 'Distanzmatrix:\n   ' + [...Array(n).keys()].join(' ') + '\n';
      distanzen.forEach((row, i) => {
        text += `${i} | ${row.map(d => d === Infinity ? '∞' : d).join(' ')}\n`;
      });

      // Ergebnis ins <pre> schreiben
        document.getElementById("ausgabe").textContent = text;  
    }


//F1 Section 
 // Liste der freien Seasons, die man ausklappen möchte
    const seasons = [2025, 2024, 2023];

    const container = document.getElementById('seasons-container');

    seasons.forEach(season => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = season;
      details.appendChild(summary);

      const content = document.createElement('div');
      details.appendChild(content);

      details.addEventListener('toggle', () => {
        if (!details.open || content.hasChildNodes()) return;

        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.textContent = 'Lade Daten…';
        content.appendChild(loading);

        // 1) Meetings (Rennen) der Saison
        fetch(`https://api.openf1.org/v1/meetings?year=${season}`)
          .then(res => res.json()) // :contentReference[oaicite:0]{index=0}
          .then(meetings => {
            // 2) Sessions der Saison (Practice, Quali, Race)
            return Promise.all([
              meetings,
              fetch(`https://api.openf1.org/v1/sessions?year=${season}`)
                .then(res => res.json()) // :contentReference[oaicite:1]{index=1}
            ]);
          })
          .then(([meetings, sessions]) => {
            content.removeChild(loading);

            // A) Fahrer- und Team-Übersicht
            const raceSessions = sessions.filter(s => s.session_type === 'Race');
            const driverPromises = raceSessions.map(s =>
              fetch(`https://api.openf1.org/v1/drivers?session_key=${s.session_key}`)
                .then(res => res.json()) // :contentReference[oaicite:2]{index=2}
            );
            Promise.all(driverPromises).then(arrays => {
              // Fahrer und Teams deduplizieren
              const driversMap = {};
              arrays.flat().forEach(d => {
                driversMap[d.driver_number] = d;
              });

              const drvHeader = document.createElement('h2');
              drvHeader.textContent = 'Fahrer & Teams';
              content.appendChild(drvHeader);

              const drvTable = document.createElement('table');
              drvTable.innerHTML = `
                <thead>
                  <tr><th>#</th><th>Name</th><th>Team</th></tr>
                </thead>
                <tbody>
                  ${Object.values(driversMap).sort((a,b)=>
                      a.driver_number - b.driver_number
                    ).map(d => `
                      <tr>
                        <td>${d.driver_number}</td>
                        <td>${d.full_name}</td>
                        <td style="color:#${d.team_colour}">${d.team_name}</td>
                      </tr>
                    `).join('')}
                </tbody>
              `;
              content.appendChild(drvTable);
            });

            // B) Session-Übersicht pro Meeting
            const sessHeader = document.createElement('h2');
            sessHeader.textContent = 'Sessions';
            content.appendChild(sessHeader);

            meetings.forEach(meet => {
              const meetDiv = document.createElement('div');
              meetDiv.style.marginBottom = '1rem';
              meetDiv.innerHTML = `<strong>${meet.meeting_name}</strong>`;
              
              const tbl = document.createElement('table');
              tbl.innerHTML = `
                <thead>
                  <tr><th>Session</th><th>Typ</th><th>Start</th><th>Ende</th></tr>
                </thead>
                <tbody>
                  ${sessions
                    .filter(s => s.meeting_key === meet.meeting_key)
                    .map(s => {
                      const start = new Date(s.date_start)
                        .toLocaleString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
                      const end = new Date(s.date_end)
                        .toLocaleString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
                      return `
                        <tr>
                          <td>${s.session_name}</td>
                          <td>${s.session_type}</td>
                          <td>${start}</td>
                          <td>${end}</td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
              `;
              meetDiv.appendChild(tbl);
              content.appendChild(meetDiv);
            });
          })
          .catch(err => {
            content.removeChild(loading);
            content.textContent = 'Fehler beim Laden.';
            console.error(err);
          });
      });

      container.appendChild(details);
    });

// Nintendo

async function fetchRandomNintendo() {
      const card = document.getElementById('characterCard');
      card.style.display = 'block';
      card.innerHTML = '<p>Lade zufälligen Charakter ...</p>';

      try {
        const res = await fetch('https://www.amiiboapi.com/api/amiibo/');
        const data = await res.json();
        const allCharacters = data.amiibo;

        const randomIndex = Math.floor(Math.random() * allCharacters.length);
        const character = allCharacters[randomIndex];

        card.innerHTML = `
          <h2>${character.character}</h2>
          <img src="${character.image}" alt="Bild von ${character.character}" />
          <p><strong>Name der Figur:</strong> ${character.name}</p>
          <p><strong>Serie:</strong> ${character.amiiboSeries}</p>
          <p><strong>Spiel-Serie:</strong> ${character.gameSeries}</p>
          <p><strong>Typ:</strong> ${character.type}</p>
        `;
      } catch (error) {
        card.innerHTML = `<p>Fehler beim Laden der Daten.</p>`;
      }
    }