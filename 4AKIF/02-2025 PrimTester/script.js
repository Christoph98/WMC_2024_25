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
function checkPrime() 
{
    const number = parseInt(document.getElementById("numberInput").value, 10);
    let resultText = "";
    if (isNaN(number)) 
    {
      resultText = "Bitte geben Sie eine gültige Zahl ein!";
    } else if (isPrime(number)) 
    {
      resultText = number + " ist eine Primzahl.";
    } else {
      resultText = number + " ist keine Primzahl.";
    }
    document.getElementById("result").textContent = resultText;
  }