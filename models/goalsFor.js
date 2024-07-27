const goalsAverage=(GoalsFor,nmaches)=>{
    let average = GoalsFor/nmaches
    console.log("Promedio de goles por partido",average)
    return average
}
// Función para calcular el factorial de un número
function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Función para calcular la probabilidad usando la distribución de Poisson
function poissonProbability(k, lambda) {
  // P(X = k) = (lambda^k * e^(-lambda)) / k!
  const e = Math.E;
  const probability = (Math.pow(lambda, k) * Math.pow(e, -lambda)) / factorial(k);
  return probability *100;
}

// Ejemplo de uso
const lambda = goalsAverage(2,1); // Tasa promedio de goles por partido
const k = 2;       // Número de goles que queremos calcular la probabilidad

const probability = poissonProbability(k, lambda);
console.log(`La probabilidad de que el equipo anote exactamente ${k} goles es: ${probability.toFixed(3)}`);