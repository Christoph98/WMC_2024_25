function isPrime(num) 
{
    if (num <= 1) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
      if (num % i === 0) return false;
    }
    return true;
}

function checkPrime() {
  const number = parseInt(document.getElementById("numberInput").value, 10);
  const resultEl = document.getElementById("result");
  let resultText = "";
  resultEl.className = "";


if (isNaN(number)) {
  resultText = "Bitte geben Sie eine gültige Zahl ein.";
  resultEl.classList.add("box-red");
} else if (isPrime(number)) {
  resultText = number + " ist eine Primzahl.";
  resultEl.classList.add("box-green");
} else {
  resultText = number + " ist keine Primzahl.";
  resultEl.classList.add("box-red");
}

resultEl.textContent = resultText;
}

const inputField = document.getElementById("numberInput");
inputField.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    checkPrime();
  }
});