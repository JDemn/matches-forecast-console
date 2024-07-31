class GamePronostic {
    constructor() {
        this.match = {
            teamName: '',            
            probTowinLastPerformance: 0,
            probtoWinHeadToHead: 0,
            probToDraw: 0,
            probToLost: 0,
            goalsPerMatchAverage: 0,
            probToWinAponderada : 0,
            goalsProb: {
                0: 0,
                1: 0,
                2: 0,
                3: 0
            },
            ponderationProbToWin: 0
        }
        this.matchB = {            
            teamName : '',
            probTowinLastPerformance: 0,
            probtoWinHeadToHead: 0,
            probToDraw: 0,
            probToLost: 0,
            goalsPerMatchAverage: 0,
            probToWinBponderada : 0,
            goalsProb: {
                0: 0,
                1: 0,
                2: 0,
                3: 0
            },
            ponderationProbToWin: 0
        }
    }

    cleanGralData() {
        this.match = {}
        this.matchB = {} 
        return 
    }

    // Función para calcular el factorial de un número
    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    // Función para calcular el coeficiente binomial (n choose k)
    binomialCoefficient(n, k) {
        return this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
    }

    // Probabilidad de éxito en cada ensayo sobre equipo o persona
    calculateProbabilityOfP(victories, nMatches) {
        if(nMatches === 0 || victories === 0) return 0
        return victories / nMatches;
    }

    // Función para calcular la probabilidad binomial
    binomialProbability(n, k, p) {
        if (p === 0 || p === 1) return p * 100;
        let coeff = this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
        return coeff * Math.pow(p, k) * Math.pow(1 - p, n - k) * 100;
    }

    weightedProbability(probRecent, probHeadToHead, weightRecent, weightHeadToHead) {
        const totalWeight = weightRecent + weightHeadToHead;
        if (totalWeight === 0) return 0;
        return (probRecent * weightRecent + probHeadToHead * weightHeadToHead) / totalWeight;
    }

    historicalDrawProbability(draws, totalMatches) {
        if (totalMatches === 0 || draws === 0) return 0;
        return draws / totalMatches;
    }

    calculateProbabilityOfQ(losses, matches) {
        if (matches === 0 || losses === 0) return 0;
        return losses / matches;
    }

    goalsAverage(goalsFor, matches) {
        return goalsFor / matches;
    }

    poissonProbability(k, lambda) {
        const e = Math.E;
        const probability = (Math.pow(lambda, k) * Math.pow(e, -lambda)) / this.factorial(k);  // Cambiar aquí
        return probability * 100;
    }
    weightedWinningProbability(probToWin, probToDraw, probToLose, weightWin, weightDraw, weightLose ) {
    
        probToWin = probToWin || 0;
        probToDraw = probToDraw || 0;
        probToLose = probToLose || 0;

        const totalProbability = probToWin + probToDraw + probToLose;

        if (totalProbability > 100) {
            probToWin = (probToWin / totalProbability) * 100;
            probToDraw = (probToDraw / totalProbability) * 100;
            probToLose = (probToLose / totalProbability) * 100;
        }

        const totalWeight = weightWin + weightDraw + weightLose;
        if (totalWeight === 0) return 0;
        return (probToWin * weightWin + probToDraw * weightDraw + probToLose * weightLose) / totalWeight;
    }
}

module.exports = GamePronostic;