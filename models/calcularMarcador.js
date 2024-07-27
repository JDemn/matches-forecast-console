// Probabilidades de goles para el Equipo A y B
const probGolesA = {
    0: 0.14, // Probabilidad de anotar 0 goles
    1: 0.27, // Probabilidad de anotar 1 gol
    2: 0.27  // Probabilidad de anotar 2 goles
};
  
const probGolesB = {
    0: 0.13534,   // Probabilidad de anotar 0 goles
    1: 0.27067,   // Probabilidad de anotar 1 gol
    2: 0.27067  // Probabilidad de anotar 2 goles
};
  
// Probabilidades de goles basadas en enfrentamientos directos
const probEnfrentamientos = {
    'A0-B0': 0,
    'A0-B1': 0,
    'A0-B2': 0,
    'A1-B0': 0,
    'A1-B1': 0,
    'A1-B2': 0,
    'A2-B0': 0,
    'A2-B1': 0,
    'A2-B2': 0
};
  
// Calcular la probabilidad de cada combinación de marcador
function calcularProbabilidadMarcador(probGolesA, probGolesB, probEnfrentamientos) {
    const combinaciones = ['0-0', '0-1', '0-2', '1-0', '1-1', '1-2', '2-0', '2-1', '2-2'];
    const probabilidades = {};
  
    combinaciones.forEach(comb => {
        const [golesA, golesB] = comb.split('-').map(Number);
        const probGolesAEquipo = probGolesA[golesA];
        const probGolesBEquipo = probGolesB[golesB];
        // Usa 1 si no hay datos en probEnfrentamientos
        const probEnfrentamiento = probEnfrentamientos[`A${golesA}-B${golesB}`] || 1;
        
        probabilidades[comb] = probGolesAEquipo * probGolesBEquipo * probEnfrentamiento;
    });
  
    return probabilidades;
}
  
// Calcular la probabilidad de cada marcador
const probabilidadesMarcador = calcularProbabilidadMarcador(probGolesA, probGolesB, probEnfrentamientos);
  
// Imprimir las probabilidades de cada marcador
Object.keys(probabilidadesMarcador).forEach(marcador => {
    console.log(`Probabilidad de marcador ${marcador}: ${(probabilidadesMarcador[marcador] * 100).toFixed(2)}%`);
});
