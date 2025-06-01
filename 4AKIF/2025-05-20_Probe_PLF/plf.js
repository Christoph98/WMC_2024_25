export class Frage {
    constructor(frage, optionen, antwort) {
        if (typeof frage !== "string") {
            throw new Error("frage muss ein String sein");
        }
        if (!Array.isArray(optionen) || optionen.length === 0) {
            throw new Error("optionen muss ein nicht-leeres Array sein");
        }
        if (typeof antwort !== "string") {
            throw new Error("antwort muss ein String sein");
        }
        if (!optionen.includes(antwort)) {
            throw new Error("antwort ist nicht in den optionen enthalten");
        }
        this.frage = frage;
        this.optionen = optionen;
        this.antwort = antwort;
    }
}

export class Quiz {
    constructor(fragen) {
        // Bestehende Prüfung: Konstruktor erwartet genau 1 Argument
        if (arguments.length !== 1) {
            throw new Error("Quiz constructor erwartet genau 1 Argument");
        }
        // Bestehende Prüfung: fragen muss ein nicht-leeres Array sein
        if (!Array.isArray(fragen) || fragen.length === 0) {
            throw new Error("fragen muss ein nicht-leeres Array sein");
        }
        this.fragen = fragen.map(f =>
            f instanceof Frage ? f : new Frage(f.frage, f.optionen, f.antwort)
        );
    }

    // Task 8: Fragen mit minimaler Länge (>= length)
    getFragenByLength(length) {
        if (typeof length !== "number") {
            throw new Error("Länge muss eine Zahl sein");
        }
        return this.fragen.filter(f => f.frage.length >= length);
    }

    // Task 9: Sortiert nach Länge (Methodenname entspricht Testanforderung)
    getFragenSortedByLength() {
        return [...this.fragen].sort((a, b) => a.frage.length - b.frage.length);
    }

    // Alias für ältere Tests
    sortFragenByLength() {
        return this.getFragenSortedByLength();
    }

    // Task 10: Fragen mit bestimmter Option
    getFragenWithOption(option) {
        return this.fragen.filter(f => f.optionen.includes(option));
    }

    // Task 11: Durchschnittliche Anzahl an Optionen
    getAverageOptions() {
        if (this.fragen.length === 0) return 0;
        const sum = this.fragen.reduce((acc, f) => acc + f.optionen.length, 0);
        return sum / this.fragen.length;
    }

    // Task 12: Alle Optionen ohne Duplikate
    getAllOptions() {
        return [...new Set(this.fragen.flatMap(f => f.optionen))];
    }
}




import { assertEquals } from "@std/assert";

export class Frage {
  constructor(frage, optionen, antwort) {
    assertEquals(typeof frage, "string", "Frage muss vom Typ String sein"); // Überprüft ob die Frage vom Typ String ist, falls nicht throwt es einen Error
    assertEquals(
      Array.isArray(optionen) && optionen.length > 0,
      true,
      "Muss Array sein und mindestens 1 Objekt beinhalten"
    ); // Überprüft ob Optionen ein Array sind und mindestens 1 Objekt beinhalten, falls nicht throwt es einen Error
    assertEquals(typeof antwort, "string", "Antwort muss vom Typ String sein"); // Selbes Prinzip wie bei Frage (siehe oben)
    assertEquals(
      optionen.includes(antwort),
      true,
      "Antwort nicht in Optionen enthalten"
    ); // Überprüft ob im Array Optionen die Antwort inkludiert ist (Antwort in Optionen == true), falls nicht throwt es einen Error
    this.frage = frage;
    this.optionen = optionen;
    this.antwort = antwort;
  }
}

export class Quiz {
  constructor(fragen) {
    this.fragen = [];
    assertEquals(
      arguments.length == 1,
      true,
      "Es muss genau ein Argument übergeben werden"
    ); // Überprüft ob genau ein Argument übergeben wird, falls nicht: Error
    for (const frage of fragen) {
      // Für jede Frage in der Liste der Fragen wird folgendes ausgeführt:
      this.fragen.push(new Frage(frage.frage, frage.optionen, frage.antwort)); // Pusht pro Frage ein neues Frage-Objekt in das Array
    }
  }

  getFragenByLength(l) {
    return this.fragen.filter((frage) => frage.frage.length >= l); // sucht und returnt alle Fragen aus den Frage Objekten, die mindestens der übergebenen Länge entsprechen
  }

  getFragenSortedByLength() {
    return this.fragen.sort((f1, f2) => f1.frage.length - f2.frage.length); // sortriert die Fragen nach aufsteigender Länge
  }

  getFragenWithOption(option) {
    return this.fragen.filter((frage) => frage.optionen.includes(option)); // Überprüft ob die Optionen in irgendeiner Frage die als Parameter übergebene Option beinhalten
  }

  getAverageOptions() {
    let optCount = 0; // zuerst 0 Optionen gezählt

    for (const f of this.fragen) {
      optCount += f.optionen.length; // für jede Frage im Fragen-Array wird der Optionen counter um die Anzahl an Optionen bei dieser Frage erhöht
    }
    return optCount / this.fragen.length; // abschließend wird der Optionen Counter durch die Anzahl an Fragen dividiert
  }

  getAllOptions() {
    const allOps = []; // zuerst leeres Array ohne Optionen

    for (const f of this.fragen) {
      allOps.push(f.optionen); // für jede Frage im Fragen-Array werden alle Optionen dieser Frage in das allOps Array gepusht
    }

    return allOps; // returnt das Array mit allen Optionen
  }
}
