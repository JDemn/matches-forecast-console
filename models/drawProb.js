/*
PRObabilidad ponderada de empate
Resumen de los datos utilizados
Probabilidad histórica de empate en encuentros directos: 40%
Probabilidad reciente de empate para América: 20%
Probabilidad reciente de empate para Juárez: 40%
*/

//Calcular probabilidad historica de empates
function historicalDrawProbability(draws, totalMatches) {
    if (totalMatches === 0) {
        console.log("No hay data de encuentros directos");
        return 0;
    }
    return (draws / totalMatches);
}

// Función para calcular el promedio ponderado
function weightedProbability(probRecent, probHeadToHead, weightRecent, weightHeadToHead) {
    const totalWeight = weightRecent + weightHeadToHead;
    return (probRecent * weightRecent + probHeadToHead * weightHeadToHead) / totalWeight;
}

// Datos de ejemplo
// Probabilidad histórica de empate en encuentros directos
const probHeadToHeadDraw = historicalDrawProbability(0, 0);

// Probabilidad reciente de empate para América y Juárez en sus otros partidos
const probRecentDrawAmerica = historicalDrawProbability(5, 30); // x de n partidos recientes terminó en empate
const probRecentDrawJuarez = historicalDrawProbability(5, 30);  // x de n partidos recientes terminaron en empate

// Promedio de probabilidades recientes de empate
const probRecentDraw = (probRecentDrawAmerica + probRecentDrawJuarez) / 2;

// Pesos para las probabilidades (ajusta según la importancia)
const weightRecent = 1; // Más peso a los resultados recientes
const weightHeadToHead = 0; // Menos peso a los encuentros directos

// Calcular la probabilidad ponderada de empate
const weightedProbDraw = weightedProbability(probRecentDraw, probHeadToHeadDraw, weightRecent, weightHeadToHead);

console.log(`Probabilidad ponderada de empate: ${(weightedProbDraw * 100).toFixed(2)}%`);