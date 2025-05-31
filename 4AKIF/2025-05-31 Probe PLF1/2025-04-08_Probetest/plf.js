class Person {
    constructor(name,gender,groesseM,gewichtKG) 
    {
    this.name = name; // Name der Person
    this.groesseM = groesseM; // Größe in Meter
    if (gender === "m" || gender === "f") {
      this.gender = gender;
    } else {
      throw new Error("wrong gender");
    } 
    this.gewichtKG = gewichtKG; // Gewicht in KG
  }

    groesseCM() {
        return this.groesseM * 100;
    }
    vorName() {
        return this.name.split(' ')[0];
    }
    nachName() {
        return this.name.split(' ')[1];
    }

    getBmi() {
        return this.gewichtKG / (this.groesseM * this.groesseM);
    }

    toString() {
        return`${this.vorName()} ${this.nachName()} (${this.groesseCM()}cm, ${this.gewichtKG}kg)`;              
    }

    getGender() { 
        return this.gender;
    }

    getGewichtType() {
        let bmi = this.getBmi();
        let gender = this.getGender();
        if(gender === "m") {
            if (bmi < 20) {
                return 'Untergewicht';
            } else if (bmi > 25) {
                return 'Übergewicht';
            } else if (bmi >=20 && bmi <= 25) {
                return 'Normalgewicht';
            } 
        }
        if(gender === "f") {
            if (bmi < 19) {
                return 'Untergewicht';
            } else if (bmi > 24) {
                return 'Übergewicht';
            } else if (bmi >=19 && bmi <= 24) {
                return 'Normalgewicht';
            } 
        }
    }
}
export {Person};  
