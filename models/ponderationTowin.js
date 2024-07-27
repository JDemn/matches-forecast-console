/*
PROBABILIDAD PARA PONDERERACION. cuando se tiene duda porque dos calculos dicen cosas diferentes , como el resultado historico entre equipos y resultado segun resultados recientes
POR HISTORIA ENTRE EQUIPOS
*/

function weightedProbability(probRecent, probHeadToHead, weightRecent, weightHeadToHead) {
    const totalWeight = weightRecent + weightHeadToHead;
    return (probRecent * weightRecent + probHeadToHead * weightHeadToHead) / totalWeight;
  }
  /*
      RESULTADOS DE PROBABILIDAD DE SUS ULTIMOS ENCUENTROS EN LA TABLA
      Y 
      RESULTADOS DE SUS PORCENTAJES ENTRE ENCUENTROS ENTRE ELLOS
  */
  // Probabilidades basadas en el rendimiento reciente
  const probRecentAmerica = 0.63;
  const probRecentJuarez = 0.60;
  
  // Probabilidades basadas en encuentros directos
  const probHeadToHeadAmerica = 0;
  const probHeadToHeadJuarez = 0;
  
  // Pesos para las probabilidades (ajusta según la importancia)
  const weightRecent = 1; // Más peso al rendimiento reciente
  const weightHeadToHead = 0; // Menos peso a los encuentros directos
  
  // Calcular la probabilidad ponderada para América
  const weightedProbAmerica = weightedProbability(probRecentAmerica, probHeadToHeadAmerica, weightRecent, weightHeadToHead);
  const weightedProbJuarez = weightedProbability(probRecentJuarez, probHeadToHeadJuarez, weightRecent, weightHeadToHead);
  
  console.log(`Probabilidad ponderada de que el EQUIPO A gane: ${(weightedProbAmerica * 100).toFixed(2)}%`);
  console.log(`Probabilidad ponderada de que el EQUIPO B gane: ${(weightedProbJuarez * 100).toFixed(2)}%`);