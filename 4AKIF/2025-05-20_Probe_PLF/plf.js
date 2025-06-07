import { assertEquals } from "@std/assert";

export class Frage {
  constructor(frage, optionen, antwort) {
    if (typeof frage !== "string") {
      throw new Error("Frage muss ein nicht-leerer String sein.");
    }
    if (!Array.isArray(optionen) || optionen.length < 1) {
      throw new Error("Optionen müssen ein Array mit mindestens zwei Elementen sein.");
    }
    if(typeof antwort !== "string" ) {
      throw new Error("Antwort muss ein String sein und in den Optionen enthalten sein.");
    }
    if (!optionen.includes(antwort)) {
      throw new Error("Antwort muss in den Optionen enthalten sein.");
    }
    this.frage = frage;
    this.optionen = optionen;
    this.antwort = antwort;
  }
}

