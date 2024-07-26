const XLSX = require('xlsx');
class Forecast {
    constructor() {
        this.predictions = [];
        this.generalData = {
            0 : '',
            1 : '' ,
            2 : 0.6,
            3 : 0.4,
            4 : 0,
            5 : 0,
            6 : 0,
            7 : 0,
            8 : 0,
            9 : 0,
            10:0 ,
            11 : 0,
            12 : 0,
            13 : 0,
            14 : 0,
            15 : 0,
            16 : 0,
            17 : 0,
            18 : 0,
            19 : 0,
            20 : 0
        }
    }

    addPrediction(prediction) {
        this.predictions.push(prediction);
    }

    addTeamName( 
        teamA , 
        teamB , 
        probabilityA , 
        probabilityB , 
        prevMatchesB , 
        weightedProbA,
        weightedProbB,
        nTrials,
        resultWeigtedProbDraw,
        gamesPlayed,
        prevMatches,
        desiredSuccesses,
        drawProbability,
        weightedProbTeamA,
        probabilityOfLossA,
        weightedProbWinA,
        weightedProbWinB,
        weightedProbTeamB,
        probabilityOfLossB    
    ){
        if( teamA !== '' ) this.generalData[0] = teamA;
        if( teamB !== '' ) this.generalData[1] = teamB;
        if( probabilityA !== '' ) this.generalData[4] = probabilityA;
        if(probabilityB !== '' ) this.generalData[5] = probabilityB;
        if( prevMatchesB !== '' ) this.generalData[6] = prevMatchesB;

        if( weightedProbA !== '' ) this.generalData[7] = weightedProbA;
        if( weightedProbB !== '' ) this.generalData[8] = weightedProbB;
        if( nTrials !== '' ) this.generalData[9] = nTrials;
        if( resultWeigtedProbDraw !== '' ) this.generalData[10] = resultWeigtedProbDraw;
        if( gamesPlayed !== '') this.generalData[11] = gamesPlayed;
        if( prevMatches !== '' ) this.generalData[12] = prevMatches;
        if( desiredSuccesses !== '' ) this.generalData[13] = desiredSuccesses;
        if( drawProbability !== '' ) this.generalData[14] = drawProbability;
        if( weightedProbTeamA !== '' ) this.generalData[15] = weightedProbTeamA;
        if( probabilityOfLossA !== '' ) this.generalData[16] = probabilityOfLossA;
        if( weightedProbWinA !== '' ) this.generalData[17] = weightedProbWinA;
        if( weightedProbWinB !== '' ) this.generalData[18] = weightedProbWinB;
        if( weightedProbTeamB !== '' ) this.generalData[19] = weightedProbTeamB;
        if( probabilityOfLossB !== '' ) this.generalData[20] = probabilityOfLossB
    }
    cleanGralData(){
        return this.generalData = {};
    }

    loadFromArray(predictions = []) {
        this.predictions = predictions;
    }
    calculateProbabilityOfP(victories, matches) {
        return victories / matches;
    }

    binomialProbability(n, k, p) {
        const coefficient = this.binomialCoefficient(n, k);
        const probability = coefficient * Math.pow(p, k) * Math.pow(1 - p, n - k);
        return probability * 100;
    }

    binomialCoefficient(n, k) {
        return this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
    }

    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    goalsAverage(goalsFor, matches) {
        return goalsFor / matches;
    }

    poissonProbability(k, lambda) {
        const e = Math.E;
        const probability = (Math.pow(lambda, k) * Math.pow(e, -lambda)) / this.factorial(k);
        return probability * 100;
    }

    weightedProbability(probRecent, probHeadToHead, weightRecent, weightHeadToHead) {
        const totalWeight = weightRecent + weightHeadToHead;
        return (probRecent * weightRecent + probHeadToHead * weightHeadToHead) / totalWeight;
    }
    historicalDrawProbability(draws, totalMatches) {
        return (draws / totalMatches);
    }
    calculateProbabilityOfQ = (losses, matches) => {
        return losses / matches;
    }
    toTable() {
        return this.predictions.map(pred => ({
            teamDate: pred.Date,
            teamName: pred.teamName,
            matchesPlayed: pred.dataGamesPlayed,
            victories: pred.dataVictoriesMatches,
            trials: pred.nGamesPlayed,
            desiredSuccesses: pred.desiredSuccesses,
            probabilityLastPerformance: `${parseFloat(pred.probability).toFixed(2)}%`,
            historyProbability: `${(parseFloat(pred.historyProbability) * 100).toFixed(2)}%`,
            weightedProbability: `${(parseFloat(pred.weightedProbability) * 100).toFixed(2)}%`,
            drawProbability: `${(parseFloat(pred.drawProbability) * 100).toFixed(2)}%`,
            losseProbability: `${(parseFloat(pred.losseProbability) * 100).toFixed(2)}%`,
            ProbabilityToWinTakenInConsiderationAllPrevData: `${(parseFloat(pred.ProbabilityToWinTakenInConsiderationAllPrevData) * 100).toFixed(2)}%`,
        }));
    }

    // Ponderar todos los resultados anteriores para predecir éxito de un equipo
    weightedProbabilityAllResults(
        probRecentA,   // Probabilidad reciente de ganar para el Equipo A
        probRecentB,   // Probabilidad reciente de ganar para el Equipo B
        probHeadToHeadA, // Probabilidad histórica de ganar para el Equipo A contra el Equipo B
        probHeadToHeadB, // Probabilidad histórica de ganar para el Equipo B contra el Equipo A
        probDraw,      // Probabilidad de empate
        weightRecent,  // Peso para la probabilidad reciente
        weightHeadToHead // Peso para la probabilidad de enfrentamientos directos
    ) {
    
        // Calcula la probabilidad de ganar ajustada
        const adjustedProbA = probRecentA * weightRecent + probHeadToHeadA * weightHeadToHead;
        const adjustedProbB = probRecentB * weightRecent + probHeadToHeadB * weightHeadToHead;

        // Normaliza la probabilidad para obtener una distribución válida
        const totalProb = adjustedProbA + adjustedProbB + probDraw;

        // Probabilidades ponderadas de ganar
        const weightedProbWinA = (adjustedProbA / totalProb) * 100;
        const weightedProbWinB = (adjustedProbB / totalProb) * 100;
        this.addTeamName(
            '', 
            '', 
            '', 
            '', 
            '', 
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            weightedProbWinA,
            weightedProbWinB    
        )
        return { weightedProbWinA, weightedProbWinB };
    }

    exportToExcel(filename) {
        // Organiza los datos en un formato adecuado para Excel
        const data = [
            {
                "Fecha de cálculo": new Date(),
                "Nombre del equipo": this.generalData[0], // Equipo A
                "Partidos jugados MP": this.generalData[11],
                "Partidos ganados W": this.generalData[12],
                "n Ensayos": this.generalData[9],
                "Éxitos deseados": this.generalData[13],
                "Probabilidad. (último desempeño)": this.generalData[4],
                "Por historia entre equipos": this.generalData[7],
                "Por ponderación": this.generalData[15],
                "Probabilidad de empate": this.generalData[14],
                "Probabilidad que pierda el encuentro": this.generalData[16],
                "Prob de ganar ponderando todos los resultados anteriores": this.generalData[17]
            },
            {
                "Fecha de cálculo": new Date(),
                "Nombre del equipo": this.generalData[1], // Equipo B
                "Partidos jugados MP": this.generalData[11],
                "Partidos ganados W": this.generalData[12],
                "n Ensayos": this.generalData[9],
                "Éxitos deseados": this.generalData[13],
                "Probabilidad. (último desempeño)": this.generalData[5],
                "Por historia entre equipos": this.generalData[8],
                "Por ponderación": this.generalData[19],
                "Probabilidad de empate": this.generalData[14],
                "Probabilidad que pierda el encuentro": this.generalData[20],
                "Prob de ganar ponderando todos los resultados anteriores": this.generalData[18]
            }
        ];
    
        // Convertir datos a una hoja de Excel
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Predicciones');
    
        // Guardar archivo Excel
        console.log(`Exportando a ${filename}...`);
        XLSX.writeFile(wb, filename);
        console.log(`Archivo ${filename} exportado exitosamente.`);
    }
    

    toArray() {
        return this.predictions;
    }
}

module.exports = Forecast;
