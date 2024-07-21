class Forecast {
    constructor() {
        this.predictions = [];
    }

    loadFromArray(data = []) {
        this.predictions = data;
    }

    toArray() {
        return this.predictions;
    }

    addPrediction(prediction) {
        this.predictions.push(prediction);
    }

    calculateProbabilityOfP(victories, nMatches) {
        return victories / nMatches;
    }

    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    binomialCoefficient(n, k) {
        return this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
    }

    binomialProbability(n, k, p) {
        const coefficient = this.binomialCoefficient(n, k);
        return coefficient * Math.pow(p, k) * Math.pow(1 - p, n - k) * 100;
    }

    goalsAverage(goalsFor, nMatches) {
        return goalsFor / nMatches;
    }

    poissonProbability(k, lambda) {
        const e = Math.E;
        return (Math.pow(lambda, k) * Math.pow(e, -lambda) / this.factorial(k)) * 100;
    }

    weightedProbability(probRecent, probHeadToHead, weightRecent, weightHeadToHead) {
        const totalWeight = weightRecent + weightHeadToHead;
        return (probRecent * weightRecent + probHeadToHead * weightHeadToHead) / totalWeight;
    }

    getHistory() {
        return this.predictions;
    }
}

module.exports = Forecast;
