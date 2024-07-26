// Función para calcular la probabilidad de ganar un partido usando la distribución binomial
function calcularProbabilidadVictoria(pctEquipo, pctOponente) {
    // Convertir porcentaje a una probabilidad
    const probEquipo = pctEquipo;
    const probOponente = pctOponente;

    // Calcular probabilidad de victoria
    // La fórmula simplificada es usar la probabilidad directa basada en el porcentaje de victorias
    const probVictoriaEquipo = probEquipo / (probEquipo + probOponente);

    return probVictoriaEquipo;
}

// Datos de los equipos
const equipos = [
    {
        nombre: 'Royals',
        pct: 0.544
    },
    {
        nombre: 'Cubs',
        pct: 0.471
    }
];

// Obtener los porcentajes de victoria de cada equipo
const pctConspiradores = equipos[0].pct;
const pctPericos = equipos[1].pct;

// Calcular las probabilidades de victoria
const probVictoriaConspiradores = calcularProbabilidadVictoria(pctConspiradores, pctPericos);
const probVictoriaPericos = calcularProbabilidadVictoria(pctPericos, pctConspiradores);

// Mostrar resultados
console.log(`Probabilidad de que los ${equipos[0].nombre} ganen el encuentro: ${(probVictoriaConspiradores * 100).toFixed(2)}%`);
console.log(`Probabilidad de que los ${equipos[1].nombre} ganen el encuentro: ${(probVictoriaPericos * 100).toFixed(2)}%`);

// Decidir el ganador basado en la mayor probabilidad
if (probVictoriaConspiradores > probVictoriaPericos) {
    console.log(`El equipo con más probabilidad de ganar es ${equipos[0].nombre}.`);
} else if (probVictoriaPericos > probVictoriaConspiradores) {
    console.log(`El equipo con más probabilidad de ganar es ${equipos[1].nombre}.`);
} else {
    console.log('Ambos equipos tienen la misma probabilidad de ganar.');
}
