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
