/*
 Probabilidad de que un equipo pierda el siguiente encuentro
*/
/////////////////PERDER UN ENCUENTRO////////////////////////////

// Función para calcular el factorial de un número
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }
  
  // Función para calcular el coeficiente binomial (n choose k)
  function binomialCoefficient(n, k) {
    return factorial(n) / (factorial(k) * factorial(n - k));
  }
  
  // Función para calcular la probabilidad binomial
  function binomialProbability(n, k, p) {
    const coefficient = binomialCoefficient(n, k);
    const probability = coefficient * Math.pow(p, k) * Math.pow(1 - p, n - k);
    return probability * 100;
  }
  
  // Probabilidad de éxito en cada ensayo (victorias)
  const calculateProbabilityOfP = (victories, matches) => {
    return victories / matches;
  }
  
  // Probabilidad de fracaso en cada ensayo (pérdidas)
  const calculateProbabilityOfQ = (losses, matches) => {
    return losses / matches;
  }
  
  // Ejemplo de uso
  const n = 1;    // Número total de ensayos
  const k = 1;    // Número de fracasos deseados
  const totalMatches = 30;    // Número total de partidos
  const losses = 6;    // Número de pérdidas
  
  // Calcula la probabilidad de perder (q)
  const q = calculateProbabilityOfQ(losses, totalMatches);
  
  // Calcula la probabilidad de exactamente k pérdidas en n partidos
  const probabilityOfLoss = binomialProbability(n, k, q);
  console.log(`La probabilidad de tener exactamente ${k} pérdidas en ${n} partidos es: ${probabilityOfLoss.toFixed(2)}%`);