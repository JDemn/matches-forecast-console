require('colors');
const { inquirerMenu, pause, readInput, confirm } = require('./helpers/inquirer');
const { saveFile, readDb } = require('./helpers/saveFile');

const Table = require('cli-table3');
const Forecast = require('./models/Forecast');

const main = async () => {
    let opt = '';
    const proyections = new Forecast();

    const proyectionsDb = readDb();
    if (proyectionsDb) {
        proyections.loadFromArray(proyectionsDb);
    } else {
        console.log('No se encontraron predicciones anteriores.'.yellow);
    }

    do {
        opt = await inquirerMenu();
        switch (opt) {
            case '1':
                const teamName1 = await readInput('Nombre del equipo A:');
                const teamName2 = await readInput('Nombre del equipo B:');
                const nGamesPlayed = await readInput('Número total de ensayos:');
                const desiredSuccesses = await readInput('Número de éxitos deseados:');
                const dataVictoriesMatchesA = await readInput(`Número de victorias del equipo ${teamName1}:`);
                const dataGamesPlayedA = await readInput(`Número de partidos jugados por el equipo ${teamName1}:`);
                const dataVictoriesMatchesB = await readInput(`Número de victorias del equipo ${teamName2}:`);
                const dataGamesPlayedB = await readInput(`Número de partidos jugados por el equipo ${teamName2}:`);

                const pA = proyections.calculateProbabilityOfP(dataVictoriesMatchesA, dataGamesPlayedA);
                const probabilityA = parseFloat(proyections.binomialProbability(nGamesPlayed, desiredSuccesses, pA));

                const pB = proyections.calculateProbabilityOfP(dataVictoriesMatchesB, dataGamesPlayedB);
                
                const probabilityB = parseFloat(proyections.binomialProbability(nGamesPlayed, desiredSuccesses, pB));

                // Historia entre equipos
                const historyProbabilityA = 0.5; // ejemplo, ajustar según los datos reales
                const historyProbabilityB = 0.4; // ejemplo, ajustar según los datos reales

                const weightRecent = 0.6;
                const weightHeadToHead = 0.4;

                const weightedProbA = proyections.weightedProbability(probabilityA / 100, historyProbabilityA, weightRecent, weightHeadToHead);
                const weightedProbB = proyections.weightedProbability(probabilityB / 100, historyProbabilityB, weightRecent, weightHeadToHead);

                // Probabilidad de empate
                const drawProbability = (weightedProbA + weightedProbB) / 2;

                proyections.addPrediction({
                    teamName: teamName1,
                    nGamesPlayed,
                    desiredSuccesses,
                    dataVictoriesMatches: dataVictoriesMatchesA,
                    dataGamesPlayed: dataGamesPlayedA,
                    probability: probabilityA,
                    historyProbability: historyProbabilityA,
                    weightedProbability: weightedProbA,
                    drawProbability
                });

                proyections.addPrediction({
                    teamName: teamName2,
                    nGamesPlayed,
                    desiredSuccesses,
                    dataVictoriesMatches: dataVictoriesMatchesB,
                    dataGamesPlayed: dataGamesPlayedB,
                    probability: probabilityB,
                    historyProbability: historyProbabilityB,
                    weightedProbability: weightedProbB,
                    drawProbability
                });

                saveFile(proyections.toArray());

                const table = new Table({
                    head: ['Nombre del equipo', 'Partidos jugados', 'Partidos ganados', 'n Ensayos', 'Éxitos deseados', 'Probabilidad. (último desempeño)', 'Por historia entre equipos', 'Por ponderación', 'Probabilidad de empate']
                });

                proyections.toTable().forEach(row => {
                    table.push([
                        row.teamName,
                        row.matchesPlayed,
                        row.victories,
                        row.trials,
                        row.desiredSuccesses,
                        row.probabilityLastPerformance,
                        row.historyProbability,
                        row.weightedProbability,
                        row.drawProbability
                    ]);
                });

                console.log(table.toString());
                proyections.exportToExcel('predictions.xlsx');
                await pause();
                break;

            // Aquí irían los otros casos
        }
    } while (opt !== '0');
}

main();
