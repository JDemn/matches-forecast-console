/*
    Distribución binomial
    Cuántos partidos gana en promedio un equipo.
    Definición: Se usa para modelar el número de éxitos en una serie de ensayos independientes, donde cada ensayo tiene dos posibles resultados (éxito o fracaso).
    Fórmula de la distribución binomial:
    P(X = k) = (nCk) * p^k * (1 - p)^(n - k)
    donde:
    n es el número de ensayos.
    k es el número de éxitos.
    p es la probabilidad de éxito en cada ensayo.
*/

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
  
  // probabilidad de exito en cada ensayo sobre equipo o persona
  
  const calculateProbabilityOfP =( victories , nMaches )=>{
      let p = victories / nMaches
      return p
  }
  // Función para calcular la probabilidad binomial
  function binomialProbability(n, k, p) {
    const coefficient = binomialCoefficient(n, k);
    const probability = coefficient * Math.pow(p, k) * Math.pow(1 - p, n - k);
    return probability * 100;
  }
  
  // Ejemplo de uso
  const n = 1;    // Número total de ensayos
  const k = 1;     // Número de éxitos deseados
  const p = calculateProbabilityOfP(18,30);   // Probabilidad de éxito en cada ensayo
  
  const probability = binomialProbability(n, k, p);
  console.log(`La probabilidad de tener exactamente ${k} éxitos en ${n} ensayos es: ${probability.toFixed(2)}%`);