// 1) API-Konfiguration
// Hier wird der persönliche API-Schlüssel für die OpenWeatherMap-API hinterlegt.
// Wichtig: Niemals öffentlich posten! In dieser Demo-Version zeigen wir, wie man ihn sicher verwendet.
const OWM_API_KEY = 'b41ab4b76492afa1d2d3cc37440970eb';

// 2) Aktivitäten-Array:
// Enthält verschiedene Freizeit-Tätigkeiten für zufällige Vorschläge.
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
// Selektiere alle <li> im <nav> und füge Klick-Listener hinzu.
document.querySelectorAll('nav li').forEach(item => {
  item.addEventListener('click', () => {
    // a) Entferne "active" von allen Nav-Items
    document.querySelectorAll('nav li').forEach(i => i.classList.remove('active'));
    // b) Füge "active" zum geklickten Item hinzu
    item.classList.add('active');
    // c) Zeige die entsprechende Sektion an
    showSection(item.dataset.section);
  });
});

/**
 * Hilfsfunktion: Sichtbarkeit der Sektionen umschalten
 * @param {string} id - ID der anzuzeigenden Sektion (z.B. "weather" oder "activity")
 */
function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => {
    // Sec hat class "active" nur, wenn sec.id === id
    sec.classList.toggle('active', sec.id === id);
  });
}

// 4) AKTUELLES WETTER abrufen
// Workflow: Nutzer gibt Stadt ein -> fetch -> JSON -> UI-Update
document.getElementById('get-weather').addEventListener('click', async () => {
  const city = document.getElementById('city-input').value.trim(); // Eingabe trimmen
  if (!city) return alert('Bitte Stadt eingeben!');             // Fehlerfall: keine Eingabe

  // API-URL mit Parametern: Stadt, Einheiten, Sprache, API-Key
  const url = `https://api.openweathermap.org/data/2.5/weather` +
              `?q=${encodeURIComponent(city)}` +
              `&units=metric&lang=de&appid=${OWM_API_KEY}`;
  try {
    const res = await fetch(url);                               //behandeln
    const data = await res.json();                              // JSON parse GET-Anfrage
    if (!res.ok) return alert('Stadt nicht gefunden.');         // HTTP-Fehler n
    // UI-Update mit Stadtname, Beschreibung und Temperatur
    document.getElementById('weather-result').innerHTML = `
      <h3>${data.name}</h3>
      <p>${data.weather[0].description}, ${data.main.temp.toFixed(1)}°C</p>
    `;
  } catch (networkError) {
    console.error('Netzwerkfehler:', networkError);
    alert('Fehler beim Abrufen der Wetterdaten.');              // Netzwerkfehler
  }
});

// 5) 5-Tage-Vorhersage (Forecast) abrufen und filtern
document.getElementById('get-forecast').addEventListener('click', async () => {
  const cityInput = document.getElementById('city-input').value.trim();
  const resultEl = document.getElementById('forecast-result');

  // 1) Validierung: Stadt eingegeben?
  if (!cityInput) {
    resultEl.innerHTML = `<p class="error">⚠️ Bitte gib zuerst eine Stadt im Wetter-Tab ein!</p>`;
    return;
  }

  // 2) API-URL für Forecast
  const url = `https://api.openweathermap.org/data/2.5/forecast` +
              `?q=${encodeURIComponent(cityInput)}` +
              `&units=metric&lang=de&appid=${OWM_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      // Stadt nicht gefunden oder anderer HTTP-Fehler
      resultEl.innerHTML = `<p class="error">⚠️ Leider konnte für „${cityInput}“ keine Vorhersage abgerufen werden.</p>`;
      return;
    }
    const data = await res.json();

    // Extrahiere Stadtdaten
    const cityName    = data.city.name;
    const countryCode = data.city.country;

    // Filtere nur Einträge um 12:00 Uhr für jeden Tag
    const days = {};
    data.list.forEach(item => {
      const [date, time] = item.dt_txt.split(' ');
      if (time === '12:00:00' && !days[date]) {
        days[date] = item;
      }
    });

    // Baue HTML-Grid mit je einer Karte pro Tag
    let html = `<h2>5-Tage-Vorhersage für ${cityName} (${countryCode})</h2><div class="forecast-grid">`;
    Object.entries(days).forEach(([date, it]) => {
      html += `<div class="card">
          <strong>${date}</strong><br>
          ${it.weather[0].description}<br>
          ${it.main.temp.toFixed(1)}°C
        </div>`;
    });
    html += `</div>`;

    resultEl.innerHTML = html;  // Ergebnis in DOM
  } catch (err) {
    console.error('Fehler Forecast:', err);
    resultEl.innerHTML = `<p class="error">⚠️ Unerwarteter Fehler. Bitte versuche es später noch einmal.</p>`;
  }
});

// 6) Zufalls-Aktivität anzeigen
document.getElementById('get-activity').addEventListener('click', () => {
  const output = document.getElementById('activity-result');    // Ergebnis-Container
  const idx = Math.floor(Math.random() * activities.length);    // Zufallsindex
  output.innerHTML = `<div class="card"><p><strong>${activities[idx]}</strong></p></div>`; // Ausgabe
});

// 7) Programmier-Witz abrufen
document.getElementById('get-joke').addEventListener('click', async () => {
  const output = document.getElementById('joke-result');
  output.textContent = 'Lade Witz… 🤔';                           // Ladehinweis
  try {
    const res = await fetch('https://official-joke-api.appspot.com/jokes/programming/random');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const [joke] = await res.json();                             // Entpacke Array mit einem Objekt
    output.innerHTML = `<div class="card">
        <p><strong>Setup:</strong> ${joke.setup}</p>
        <p><strong>Punchline:</strong> ${joke.punchline} 😂</p>
      </div>`;       // Witz ausgeben
  } catch (err) {
    console.error('Joke-Fehler:', err);
    output.textContent = 'Fehler beim Laden des Witzes – bitte später erneut probieren.';
  }
});

// 8) GRAPH-SECTION: CSV einlesen und Floyd–Warshall & weitere Algorithmen
let matrix = []; // Globale Variable für die Adjazenzmatrix

// CSV-Datei-Input listener
// Jedes Mal, wenn der Benutzer eine Datei auswählt:
document.getElementById('csvFileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];                        // Nimm das erste File
  if (!file) return;                                         // Abbruch, wenn keine Datei
  const reader = new FileReader();                           // FileReader für asynchrone Leseoperation

  // Callback beim erfolgreichen Einlesen:
  reader.onload = function(e) {
    const text = e.target.result;                             // Gesamter CSV-Text als String
    // Parsen: String trimmen, splitten nach Zeilen, leere Zeilen filtern, Zeilen in Zahlen umwandeln
    matrix = text
      .trim()                                                // Entferne führende und abschließende Leerzeichen
      .split(/\r?\n/)                                      // Aufteilen bei Zeilenumbrüchen (Windows/Linux)
      .filter(line => line.trim() !== '')                    // Leere Zeilen entfernen
      .map(line =>                                          
        line.split(';')                                      // Semikolon-getrennte Werte
            .map(cell => Number(cell.trim()))                // String-Trim & Nummern-Umwandlung
      );

    // Zeige geladene Matrix im <pre id="ausgabe">
    document.getElementById('ausgabe').textContent =
      'Adjazenzmatrix geladen:\n' + matrix.map(r => r.join(', ')).join('\n');
  };

  reader.readAsText(file);                                   // Starte Lesevorgang
});

/**
 * Funktion `rechne()`: Berechnet und gibt verschiedene Graph-Metriken und -Algorithmen aus
 */
function rechne() {
  const out = document.getElementById('ausgabe');            // Referenz auf das Ausgabeelement
  if (matrix.length === 0) {                                 // Wenn keine Matrix geladen
    out.textContent = 'Bitte lade zuerst eine CSV-Datei mit einer Adjazenzmatrix.';
    return;                                                  // Abbruch
  }

  const n = matrix.length;                                   // Anzahl der Knoten im Graph
  // `distanzen`: n x n Matrix, initialisiert mit Infinity für unendliche Distanz
  const distanzen = Array.from({length: n}, () => Array(n).fill(Infinity));
  const exzenti = [];                                        // Array für Exzentrizitäten
  let textOut = '';                                          // Akkumuliert den Ausgabetext

  // Arrays für BFS- und DFS-Besuchsreihenfolgen (optional für spätere Nutzung)
  const bfsOrders = [];
  const dfsOrders = [];

  // Schleife für jeden Startknoten
  for (let start = 0; start < n; start++) {
    // -- Breitensuche (BFS) --
    const queue = [start];                                   // FIFO-Queue initialisiert mit Startknoten
    const visitedB = Array(n).fill(false);                  // Besuchsstatus-Array
    const distB = Array(n).fill(Infinity);                  // Distanz-Array
    const orderB = [];                                       // Besuchsreihenfolge
    visitedB[start] = true; distB[start] = 0;                // Startknoten: besucht, Distanz 0
    orderB.push(start);

    while (queue.length > 0) {
      const u = queue.shift();                              // Nimm vorderstes Element aus der Queue
      for (let v = 0; v < n; v++) {
        // Wenn es eine Kante von u nach v gibt und v unbesucht ist
        if (matrix[u][v] === 1 && !visitedB[v]) {
          visitedB[v] = true;                               // Markiere v als besucht
          distB[v] = distB[u] + 1;                          // Distanz zum Start erhöhen
          queue.push(v);                                    // v zur Queue hinzufügen
          orderB.push(v);                                   // In Reihenfolge aufnehmen
        }
      }
    }
    distanzen[start] = distB;                                // Speichere Distanz-Array
    const maxDist = Math.max(...distB.filter(d => d < Infinity)); // Exzentrizität = Maximum endlicher Distanzen
    exzenti.push(maxDist);                                   // Speichere Exzentrizität
    bfsOrders.push(orderB);                                  // Speichere BFS-Reihenfolge

    // -- Tiefensuche (DFS) --
    const visitedD = Array(n).fill(false);                  // Besuchsstatus für DFS
    const orderD = [];                                      // DFS-Reihenfolge
    (function dfs(u) {                                      // Rekursive DFS-Funktion
      visitedD[u] = true; orderD.push(u);                   // Markiere u und füge zu Reihenfolge hinzu
      for (let v = 0; v < n; v++) {
        if (matrix[u][v] === 1 && !visitedD[v]) dfs(v);     // Falls Kante existiert und v unbesucht
      }
    })(start);
    dfsOrders.push(orderD);                                  // Speichere DFS-Reihenfolge

    // Ausgabe für diesen Startknoten
    textOut += `Startknoten ${start}: Exzentrizität = ${maxDist}\n`;
    textOut += `BFS-Reihenfolge: ${orderB.join(' → ')}\n`;
    textOut += `DFS-Reihenfolge: ${orderD.join(' → ')}\n\n`;
  }

  // -- Radius, Durchmesser und Zentrum --
  const radius = Math.min(...exzenti);                      // Kleinste Exzentrizität
  const diameter = Math.max(...exzenti);                    // Größte Exzentrizität
  const centers = exzenti
    .map((e, i) => e === radius ? i : null)                 // Finde Knoten mit Exzentrizität == radius
    .filter(i => i !== null);                               // Entferne null
  textOut += `Radius = ${radius}\nDurchmesser = ${diameter}\nZentrum = ${centers.join(', ')}\n\n`;

  // -- Zusammenhangskomponenten --
  // Finde alle Zusammenhangskomponenten (zusammenhängende Teilgraphen) mittels BFS
  const components = (function() {
    const visited = Array(n).fill(false);      // Array, um zu markieren, welche Knoten bereits besucht wurden
    const comps = [];                           // Speicher für gefundene Komponenten (Arrays von Knoten)
    for (let i = 0; i < n; i++) {               // Iteriere über jeden Knoten als potenziellen Start
      if (!visited[i]) {                       // Wenn Knoten i noch nicht besucht wurde, gehört er zu einer neuen Komponente
        const comp = [];                       // Aktuelle Komponente: leeres Array
        const queue = [i];                     // BFS-Queue initialisieren mit Knoten i
        visited[i] = true;                    // Markiere Knoten i als besucht
        while (queue.length > 0) {            // Solange noch Knoten in der Queue sind
          const u = queue.shift();            // Nimm vordersten Knoten aus der Queue
          comp.push(u);                       // Füge Knoten u zur aktuellen Komponente hinzu
          // Untersuche alle Nachbarn von u
          for (let v = 0; v < n; v++) {
            if (matrix[u][v] === 1 && !visited[v]) { // Wenn es eine Kante u->v gibt und v unbesucht ist
              visited[v] = true;             // Markiere v als besucht
              queue.push(v);                 // Füge v der Queue hinzu für weitere BFS
            }
          }
        }
        comps.push(comp);                     // Füge die fertig erkundete Komponente der Liste hinzu
      }
    }
    return comps;                             // Gib alle gefundenen Komponenten zurück
  })();
  // Ausgabe: Anzahl und Liste der Komponenten
  textOut += `Komponenten (${components.length}): ` +
             components
 .map(c => '[' + c.join(',') + ']') // Formatiere jede Komponente als [Knoten1,Knoten2,...]
 .join(' ') + '\n\n';

    // -- Artikulationspunkte und Brücken (Tarjan-Algorithmus) --
  // Erstelle aus der Adjazenzmatrix eine Adjazenzliste für effizientere Durchläufe
  const adjList = matrix.map((row, i) =>
    row.map((v, j) => v === 1 ? j : -1)  // Wenn Kante vorhanden, gib Nachbarindex zurück, sonst -1
       .filter(j => j >= 0)              // Entferne alle -1, nur echte Nachbarn bleiben
  );
  // Arrays zur Speicherung von Besuchszeiten und Low-Link-Werten
  const disc = Array(n).fill(-1);        // Discovery-Zeit jedes Knotens, -1 = unbesucht
  const low = Array(n).fill(-1);         // Niedrigster erreichbarer Disc-Wert
  const parent = Array(n).fill(-1);      // Elternelement im DFS-Baum
  const apSet = new Set();               // Set zur Speicherung der Artikulationspunkte
  const bridgeList = [];                 // Liste der gefundenen Brücken
  let time = 0;                          // Laufende Zeit für Disc-Werte

  // Rekursive Tarjan-Funktion für Artikulationspunkte und Brücken
  function tarjan(u) {
    disc[u] = low[u] = time++;           // Setze Disc und Low auf aktuelle Zeit, inkrementiere Zeit
    let childCount = 0;                  // Anzahl der Kinder im DFS-Baum für Wurzelprüfung

    // Durchlaufe alle Nachbarn von u
    adjList[u].forEach(v => {
      if (disc[v] === -1) {              // Wenn v noch nicht besucht
        childCount++;                    // Kind-Zähler erhöhen
        parent[v] = u;                   // Setze u als Elternteil von v
        tarjan(v);                       // Rekursiver Aufruf für v
        // Nach Rückkehr: Update des Low-Werts von u
        low[u] = Math.min(low[u], low[v]);
        // Artikulationspunkt-Bedingung:
        // 1. u ist Wurzel und hat mehr als ein Kind
        // 2. u ist kein Wurzel und low[v] >= disc[u]
        if ((parent[u] === -1 && childCount > 1) ||
            (parent[u] !== -1 && low[v] >= disc[u])) {
          apSet.add(u);
        }
        // Brücken-Bedingung: low[v] > disc[u]
        if (low[v] > disc[u]) {
          bridgeList.push([u, v]);
        }
      } else if (v !== parent[u]) {
        // Rückwärtskante: Update low[u]
        low[u] = Math.min(low[u], disc[v]);
      }
    });
  }
  // Starte Tarjan an allen unbesuchten Knoten (Graph kann nicht zusammenhängend sein)
  for (let i = 0; i < n; i++) {
    if (disc[i] === -1) tarjan(i);
  }
  // Konvertiere Set und Liste in Arrays für Ausgabe
  const aps = Array.from(apSet);         // Artikulationspunkte
  const bridges = bridgeList;            // Brücken-Paare
  // Füge Ausgabestring hinzu
  textOut += `Artikulationspunkte: ${aps.join(', ')}
`;
  textOut += `Brücken: ${bridges.map(b => `(${b[0]}-${b[1]})`).join(', ')}

`;

  textOut += `Artikulationspunkte: ${aps.join(', ')}\nBrücken: ${bridges.map(b=>'(' + b[0] + '-' + b[1] + ')').join(', ')}\n\n`;

    // -- Dijkstra-Algorithmus (für gewichtete Graphen) --
  // Frage den Benutzer nach dem Startknoten
  const startNode = Number(prompt('Startknoten für Dijkstra (0-' + (n-1) + '):'));
  if (!isNaN(startNode) && startNode >= 0 && startNode < n) {
    // Arrays für Distanzen und Nutzung
    const distD = Array(n).fill(Infinity); // kürzeste bekannte Distanzen initial unendlich
    const used = Array(n).fill(false);     // markiert, ob Knoten bereits verarbeitet wurde
    distD[startNode] = 0;                  // Distanz zum Startknoten = 0

    // Iteriere über alle Knoten
    for (let i = 0; i < n; i++) {
      let u = -1;
      // Finde ungenutzten Knoten mit kleinster Distanz
      for (let j = 0; j < n; j++) {
        if (!used[j] && (u < 0 || distD[j] < distD[u])) {
          u = j;
        }
      }
      if (distD[u] === Infinity) break;    // Wenn verbleibende Knoten unerreichbar sind, abbrechen
      used[u] = true;                      // Markiere u als verarbeitet

      // Aktualisiere Distanzen der Nachbarn von u
      for (let v = 0; v < n; v++) {
        const w = matrix[u][v];            // Gewicht der Kante u->v
        if (w > 0 && distD[u] + w < distD[v]) {
          // Wenn neuer Pfad über u kürzer ist, aktualisiere Distanz
          distD[v] = distD[u] + w;
        }
      }
    }
    // Füge Ergebnisse des Dijkstra zur Ausgabestring hinzu
    textOut += `Dijkstra-Distanzen von ${startNode}: ${distD.map(d => d === Infinity ? '∞' : d).join(', ')}

`;

  } else {
    // Ungültige Eingabe oder Abbruch
    textOut += 'Dijkstra-Start ungültig oder abgebrochen.';
  }


  //Distanzmatrix ausgabe 
  textOut += `\nDistanzmatrix:\n    ${[...Array(n).keys()].join(" ")}\n`;
  for (let i = 0; i < n; i++) {
      textOut += `${i} | ${distanzen[i].map(d => (d === Infinity ? "∞" : d)).join(" ")}\n`;
  }

  document.getElementById('ausgabe').textContent = textOut;
  
}

// F1 Section: Auflistung der verfügbaren Seasons mit Lazy-Loading
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
    if (!details.open || content.hasChildNodes()) return; // Nur einmal laden

    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.textContent = 'Lade Daten…';
    content.appendChild(loading);

    // 1) Meetings der Saison abrufen
    fetch(`https://api.openf1.org/v1/meetings?year=${season}`)
      .then(res => res.json())
      .then(meetings => Promise.all([
        meetings,
        // 2) Sessions abrufen
        fetch(`https://api.openf1.org/v1/sessions?year=${season}`).then(res => res.json())
      ]))
      .then(([meetings, sessions]) => {
        content.removeChild(loading);

        // A) Fahrer- und Team-Übersicht
        const raceSessions = sessions.filter(s => s.session_type === 'Race');
        const driverPromises = raceSessions.map(s =>
          fetch(`https://api.openf1.org/v1/drivers?session_key=${s.session_key}`).then(res => res.json())
        );
        Promise.all(driverPromises).then(arrays => {
          const driversMap = {};
          arrays.flat().forEach(d => { driversMap[d.driver_number] = d; });
          const drvHeader = document.createElement('h2'); drvHeader.textContent = 'Fahrer & Teams'; content.appendChild(drvHeader);
          const drvTable = document.createElement('table');
          // Beispiel für Fahrertabelle
        let html = '<tr><th>Nummer</th><th>Name</th><th>Team</th></tr>';
        Object.values(driversMap).forEach(driver => {
        html += `<tr>
        <td>${driver.driver_number}</td>
        <td>${driver.full_name}</td>
        <td>${driver.team_name}</td>
        </tr>`;
       });
        drvTable.innerHTML = html;
          content.appendChild(drvTable);
        });

        // B) Session-Übersicht pro Meeting
        const sessHeader = document.createElement('h2'); sessHeader.textContent = 'Sessions'; content.appendChild(sessHeader);
        meetings.forEach(meet => {
          const meetDiv = document.createElement('div');
          meetDiv.style.marginBottom = '1rem';
          meetDiv.innerHTML = `<strong>${meet.meeting_name}</strong>`;
          const tbl = document.createElement('table');
          // Sessions zu diesem Meeting filtern
          const meetSessions = sessions.filter(s => s.meeting_key === meet.meeting_key);
          let tblHtml = '<tr><th>Session</th><th>Typ</th><th>Start</th><th>Ende</th></tr>';
          meetSessions.forEach(sess => {
            tblHtml += `<tr>
              <td>${sess.session_name}</td>
              <td>${sess.session_type}</td>
              <td>${sess.date_start ? sess.date_start.replace('T', ' ').slice(0, 16) : ''}</td>
              <td>${sess.date_end ? sess.date_end.replace('T', ' ').slice(0, 16) : ''}</td>
            </tr>`;
          });
          tbl.innerHTML = tblHtml;
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

async function fetchRandomNintendo() {
  const card = document.getElementById('characterCard');
  card.style.display = 'block';
  card.innerHTML = '<p>Lade zufälligen Charakter ...</p>';
  try {
    const res = await fetch('https://www.amiiboapi.com/api/amiibo/');
    const data = await res.json();
    const randomIndex = Math.floor(Math.random() * data.amiibo.length);
    const character = data.amiibo[randomIndex];
    card.innerHTML = `
      <h2>${character.character}</h2>
      <img src="${character.image}" alt="Bild von ${character.character}" />
      <p><strong>Name:</strong> ${character.name}</p>
      <p><strong>Serie:</strong> ${character.amiiboSeries}</p>
      <p><strong>Spiel-Serie:</strong> ${character.gameSeries}</p>
      <p><strong>Typ:</strong> ${character.type}</p>
    `;
  } catch (error) {
    console.error(error);
    card.innerHTML = `<p>Fehler beim Laden der Daten.</p>`;
  }
}
