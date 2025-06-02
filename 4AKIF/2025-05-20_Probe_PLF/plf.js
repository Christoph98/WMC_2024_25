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
