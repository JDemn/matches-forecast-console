require('colors');
const { inquirerMenu, pause, readInput, confirm } = require('./helpers/inquirer');
const { saveFile, readDb } = require('./helpers/saveFile');

const Table = require('cli-table3');
const Forecast = require('./models/Forecast');
const GamePronostic = require('./models/game');

const main = async () => {
    let opt = '';
    const projections = new Forecast();

    const projectionsDb = readDb();
    if (projectionsDb) {
        projections.loadFromArray(projectionsDb);
    } else {
        console.log('No se encontraron predicciones anteriores.'.yellow);
    }

    const table = new Table({
        head: ['Fecha de cálculo', 'Nombre del equipo', 'Partidos jugados MP', 'Partidos ganados W', 'n Ensayos', 'Éxitos deseados', 'Probabilidad (último desempeño)', 'Por historia entre equipos', 'Por ponderación', 'Probabilidad de empate', 'Probabilidad que pierda el encuentro', 'Prob de ganar ponderando todos los resultados anteriores']
    });

    do {
        opt = await inquirerMenu();
        switch (opt) {
            case '1':
                const teamA = await readInput('Nombre del equipo A:');
                const teamB = await readInput('Nombre del equipo B:');

                projections.toTable().forEach(row => {
                    table.push([
                        row.Date,
                        row.teamName,
                        row.matchesPlayed,
                        row.victories,
                        row.trials,
                        row.desiredSuccesses,
                        row.probabilityLastPerformance,
                        row.historyProbability,
                        row.weightedProbability,
                        row.drawProbability,
                        row.losseProbability,
                        row.ProbabilityToWinTakenInConsiderationAllPrevData
                    ]);
                });

                projections.addPrediction({
                    Date: new Date(),
                    teamName: teamA
                });
                projections.addPrediction({
                    Date: new Date(),
                    teamName: teamB
                });

                const nTrials = parseFloat(await readInput("Número de ensayos en los que te gustaría hacer la predicción ?"));
                const desiredSuccesses = parseFloat(await readInput("Números de casos de éxito a predecir. Ejemplo: 1 significa el siguiente encuentro etc."));
                const prevMatches = parseFloat(await readInput("Ingresar número de Partidos ganados (W)"));
                const gamesPlayed = parseFloat(await readInput("Ingresar número de Partidos jugados MP"));

                const pA = projections.calculateProbabilityOfP(prevMatches, gamesPlayed);
                const probabilityA = parseFloat(projections.binomialProbability(nTrials, desiredSuccesses, pA));

                const prevMatchesB = parseInt(await readInput("Partidos ganados Equipo B?"));
                const pB = projections.calculateProbabilityOfP(prevMatchesB, gamesPlayed);
                const probabilityB = parseFloat(projections.binomialProbability(nTrials, desiredSuccesses, pB));

                projections.addTeamName(
                    teamA,
                    teamB,
                    probabilityA,
                    probabilityB,
                    prevMatchesB,
                    '',
                    '',
                    nTrials,
                    '',
                    gamesPlayed,
                    prevMatches,
                    desiredSuccesses
                );
                await pause();
                break;

            case '2':
                const gamesPlayedHistoryMatches = parseInt(await readInput("Partidos disputados que hayan sido directos (MP); es decir, TEAM A VS TEAM B"));
                const winsA = parseInt(await readInput("Partidos ganados por equipo A (W)"));
                const winsB = parseInt(await readInput("Partidos ganados por el equipo B (W)"));

                const historyProbabilityA = winsA / gamesPlayedHistoryMatches;
                const historyProbabilityB = winsB / gamesPlayedHistoryMatches;

                const weightRecent = projections.generalData[2];
                const weightHeadToHead = projections.generalData[3];

                const probA = projections.generalData[4];
                const probB = projections.generalData[5];
                const weightedProbA = projections.weightedProbability(probA / 100, historyProbabilityA, weightRecent, weightHeadToHead);
                const weightedProbB = projections.weightedProbability(probB / 100, historyProbabilityB, weightRecent, weightHeadToHead);

                const drawProbability = (weightedProbA + weightedProbB) / 2;

                projections.addTeamName(
                    '',
                    '',
                    '',
                    '',
                    '',
                    weightedProbA,
                    weightedProbB,
                    '',
                    '',
                    '',
                    '',
                    '',
                    drawProbability
                );
                await pause();
                break;

            case '3':
                const probRecenTeamA = projections.generalData[4];
                const probRecentTeamB = projections.generalData[5];
                const weightR = projections.generalData[2];
                const weightFtF = projections.generalData[3];

                const probHeadToHeadTeamA = projections.generalData[7];
                const probHeadToHeadTeamB = projections.generalData[8];

                const weightedProbTeamA = projections.weightedProbability(probRecenTeamA, probHeadToHeadTeamA, weightR, weightFtF);
                const weightedProbTeamB = projections.weightedProbability(probRecentTeamB, probHeadToHeadTeamB, weightR, weightFtF);

                projections.addTeamName(
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
                    weightedProbTeamA,
                    '',
                    '',
                    '',
                    weightedProbTeamB
                );
                await pause();
                break;

            case '4':
                const draws = parseInt(await readInput("Número de empates que han tenido ambos equipos en encuentros directos."));
                const totalMatchesIn = parseInt(await readInput("Número de encuentros en los que surgieron dichos empates."));
                const probHeadToHeadDraw = projections.historicalDrawProbability(draws, totalMatchesIn);

                const drawProbCurentJornalTeamA = parseInt(await readInput(`Número de empates que tuvo ${projections.generalData[0]} en los partidos que ha disputado en la actual jornada`));
                const drawProbCurentJornalTeamB = parseInt(await readInput(`Número de empates que tuvo ${projections.generalData[1]} en los partidos que ha disputado en la actual jornada`));
                const totalMatchesCurrentJornada = parseInt(await readInput("Número de encuentros en los que surgieron dichos empates. NTA: debe ser el mismo número de juegos para ambos equipos"));

                const probRecentDrawTeamA = projections.historicalDrawProbability(drawProbCurentJornalTeamA, totalMatchesCurrentJornada);
                const probRecentDrawTeamB = projections.historicalDrawProbability(drawProbCurentJornalTeamB, totalMatchesCurrentJornada);

                const probRecentDraw = (probRecentDrawTeamA + probRecentDrawTeamB) / 2;

                const weightedProbDraw = projections.weightedProbability(probRecentDraw, probHeadToHeadDraw, projections.generalData[2], projections.generalData[3]);
                const resultWeightedProbDraw = weightedProbDraw * 100;

                projections.addTeamName(
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    resultWeightedProbDraw
                );
                await pause();
                break;

            case '5':
                const desiredSuccesses1 = parseFloat(await readInput("Fracasos a predecir. Ejemplo: 1 significa el siguiente encuentro etc."));
                const losseTheGameTotalMatches = parseFloat(await readInput(`Número de partidos perdidos de ${projections.generalData[0]}`));
                const probLossesInMatches = parseFloat(await readInput(`Número de partidos disputados donde perdió ${projections.generalData[0]}`));
                const lossesByTeamB = parseFloat(await readInput(`Número de partidos perdidos de ${projections.generalData[1]}`));
                const probLossesInMatchesB = parseFloat(await readInput(`Número de partidos disputados donde perdió ${projections.generalData[1]}`));

                const teamALossesPrediction = projections.calculateProbabilityOfQ(losseTheGameTotalMatches, probLossesInMatches);
                const teamBLossesPrediction = projections.calculateProbabilityOfQ(lossesByTeamB, probLossesInMatchesB);

                const probabilityOfLossA = projections.binomialProbability(projections.generalData[9], desiredSuccesses1, teamALossesPrediction);
                const probabilityOfLossB = projections.binomialProbability(projections.generalData[9], desiredSuccesses1, teamBLossesPrediction);

                projections.addTeamName(
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
                    probabilityOfLossA,
                    '',
                    '',
                    '',
                    probabilityOfLossB
                );
                await pause();
                break;

            case '6':
                const ponderateProbRecentTeamA = projections.generalData[4];
                const ponderateProbRecentTeamB = projections.generalData[5];

                const ponderateProbHeadToHeadTeamA = projections.generalData[7];
                const ponderateProbHeadToHeadTeamB = projections.generalData[8];

                const probDraw = projections.generalData[10];

                projections.weightedProbabilityAllResults(
                    ponderateProbRecentTeamA,
                    ponderateProbRecentTeamB,
                    ponderateProbHeadToHeadTeamA,
                    ponderateProbHeadToHeadTeamB,
                    probDraw,
                    projections.generalData[2],
                    projections.generalData[3]
                );

                projections.addPrediction({
                    matchesPlayed: parseFloat(projections.generalData[11]),
                    victories: parseFloat(projections.generalData[12]),
                    trials: parseFloat(projections.generalData[9]),
                    desiredSuccesses: parseFloat(projections.generalData[13]),
                    probabilityLastPerformance: parseFloat(projections.generalData[4]),
                    historyProbability: parseFloat(projections.generalData[7]),
                    drawProbability: parseFloat(projections.generalData[14]),
                    weightedProbability: parseFloat(projections.generalData[15]),
                    drawProbability: parseFloat(projections.generalData[10]),
                    losseProbability: parseFloat(projections.generalData[16]),
                    ProbabilityToWinTakenInConsiderationAllPrevData: parseFloat(projections.generalData[17]),
                });

                projections.addPrediction({
                    matchesPlayed: parseFloat(projections.generalData[11]),
                    victories: parseFloat(projections.generalData[6]),
                    trials: parseFloat(projections.generalData[9]),
                    desiredSuccesses: parseFloat(projections.generalData[13]),
                    probabilityLastPerformance: parseFloat(projections.generalData[5]),
                    historyProbability: parseFloat(projections.generalData[8]),
                    drawProbability: parseFloat(projections.generalData[14]),
                    weightedProbability: parseFloat(projections.generalData[19]),
                    drawProbability: parseFloat(projections.generalData[10]),
                    losseProbability: parseFloat(projections.generalData[20]),
                    ProbabilityToWinTakenInConsiderationAllPrevData: parseFloat(projections.generalData[18])
                });

                saveFile(projections.toArray());
                projections.exportToExcel('predictions.xlsx');
                projections.cleanGralData();
                console.log("La data del primer pronóstico se ha limpiado".red, projections.generalData);
                await pause();
                break;
            case '11':
                const game = new GamePronostic();
                // Ejemplo de uso
                const n = 1;    // Número total de ensayos
                const k = 1;     // Número de éxitos deseados

                const teamAa = await readInput("Nombre del equipo A".bgCyan);
                const match = parseFloat(await readInput("Partidos jugados del equipo A (MP)".bgCyan));
                const vict = parseFloat(await readInput("Victorias equipo A (W)".bgCyan));
                const p = game.calculateProbabilityOfP(vict, match);
                const probAa = game.binomialProbability(n, k, p);

                const teambB = await readInput("Nombre del equipo B".bgBlue);
                const matchc = parseFloat(await readInput("Partidos jugados equipo B  (MP)".bgBlue));
                const victt = parseFloat(await readInput("Victorias equipo B (W)".bgBlue));
                const p2 = game.calculateProbabilityOfP(victt, matchc);
                const probBb = game.binomialProbability(n, k, p2);

                console.log(`La probabilidad de tener exactamente ${k} éxitos en ${n} ensayos es: ${probAa.toFixed(2)}% `.cyan);
                console.log(`La probabilidad de que B tenga exactamente ${k} éxitos en ${n} ensayos es: ${probBb.toFixed(2)}% `.cyan);

                // Quién gana en base a encuentros directos
                const headToHeadMatches = parseFloat(await readInput("Número de encuentros directos (MP)".blue));
                const headToheadAwin = parseFloat(await readInput("Encuentros directos ganados por equipo A (W)".bgCyan));
                const t = game.calculateProbabilityOfP(headToheadAwin, headToHeadMatches);
                const headToheadBwin = parseFloat(await readInput("Encuentros directos ganados por equipo B".bgBlue));
                const j = game.calculateProbabilityOfP(headToheadBwin, headToHeadMatches);

                const probtoWinAhTh = game.binomialProbability(n, k, t);
                const probtoWinBhTh = game.binomialProbability(n, k, j);

                const probHeadToHeadA = probtoWinAhTh;
                const probHeadToHeadB = probtoWinBhTh;

                const weightRecentt = 0.6;
                const weightHeadToHeadd = 0.4;

                const weightedProbA1 = game.weightedProbability(probAa, probHeadToHeadA, weightRecentt, weightHeadToHeadd);
                const weightedProB2 = game.weightedProbability(probBb, probHeadToHeadB, weightRecentt, weightHeadToHeadd);

                console.log(`Probabilidad ponderada de que el EQUIPO A gane: ${weightedProbA1}%`.yellow);
                console.log(`Probabilidad ponderada de que el EQUIPO B gane: ${weightedProB2}%`.yellow);

                const totalMatches = parseFloat(await readInput("Ingresa el Número total de encuentros directos MP. predecir empate"));
                const drawsNumber = parseFloat(await readInput("Número de empates en encuentros directos"));

                const probHeadToHeadDraww = game.historicalDrawProbability(drawsNumber, totalMatches);

                console.log("Calcular prob de empate en base a ultimos encuentros no directos".yellow)
                const totalMatchesA = parseFloat(await readInput("Número total de partidos jugados por equipo A (MP)".bgCyan));
                const drawsNumberA = parseFloat(await readInput("Número de empates equipo A".bgCyan));
                const totalMatchesB = parseFloat(await readInput("Número total de partidos jugados por equipo B (MP)".bgBlue));
                const drawsNumberB = parseFloat(await readInput("Número de empates equipo B (D)".bgBlue));

                const probRecentDrawA = game.historicalDrawProbability(drawsNumberA, totalMatchesA);
                const probRecentDrawB = game.historicalDrawProbability(drawsNumberB, totalMatchesB);

                const probRecentDraw1 = (probRecentDrawA + probRecentDrawB) / 2;

                // Calcular la probabilidad ponderada de empate
                const weightedProbDraww = game.weightedProbability(probRecentDraw1, probHeadToHeadDraww, weightRecentt, weightHeadToHeadd);

                // Probabilidad de pérdida
                console.log("probabilidad de perder el siguiente encuentro".yellow);

                const MpA = parseFloat(await readInput("Número de partidos jugados donde perdió el quipo A (MP)".bgCyan));
                const lossesA = parseFloat(await readInput("Número de partidos perdidos por A (L)".bgCyan));

                const q = game.calculateProbabilityOfQ(lossesA, MpA);
                const probabilityOfLossAa = game.binomialProbability(n, k, q);

                console.log(`La probabilidad de tener exactamente ${k} pérdidas en ${n} partidos es: ${probabilityOfLossAa.toFixed(2)}%`.yellow);

                console.log("probabilidad de perder el siguiente encuentro del equipo B".yellow)
                const MpB = parseFloat(await readInput("Número de partidos jugados donde perdió B (MP)".bgBlue));
                const lossesB = parseFloat(await readInput("Número de partidos perdidos por B".bgBlue));
        
                const rl = game.calculateProbabilityOfQ(lossesB, MpB);
                const probabilityOfLossBb = game.binomialProbability(n, k, rl);
                console.log(`La probabilidad de B , de tener exactamente ${k} pérdidas en ${n} partidos es: ${probabilityOfLossBb.toFixed(2)}%`.yellow);
                
                // Goles por partido
                console.log("Calcular el número de goles por partidos".yellow);
                const Nmatches = parseFloat(await readInput("Número de partidos jugados. (mínimo últimos 5 partidos) . **(MP)**".bgCyan));
                const goalsFa = parseFloat(await readInput("Goles a favor de A (GF) ".bgCyan));
                const goalsToPredictA = parseFloat(await readInput("Número de goles que quiera predecir en el siguiente partido".bgCyan));

                const lambda = game.goalsAverage(goalsFa, Nmatches);
                const golesFor = goalsToPredictA;

                const NmatchesB = parseFloat(await readInput("Número de partidos equipo B".bgBlue));
                const goalsFb = parseFloat(await readInput("Goles a favor de B".bgBlue));
                const goalsToPredictB = parseFloat(await readInput("Número de goles que quiera predecir en el siguiente partido".bgBlue));

                const lambdaB = game.goalsAverage(goalsFb, NmatchesB);
                const golesForb = goalsToPredictB;

                const poisonTeamA = game.poissonProbability(golesFor, lambda);
                const poisonTeamB = game.poissonProbability(golesForb, lambdaB);

                console.log(`La probabilidad de que el equipo A anote exactamente ${k} goles es: ${poisonTeamA.toFixed(3)}`.yellow);
                console.log(`La probabilidad de que el equipo B anote exactamente ${k} goles es: ${poisonTeamB.toFixed(3)}`.yellow);


                // ponderacion 
                const weightWin = 0.5; // Peso para la probabilidad de ganar
                const weightDraw = 0.3; // Peso para la probabilidad de empate
                const weightLose = 0.2; // Peso para la probabilidad de perder

                const weightedProbWinA = game.weightedWinningProbability(probAa, weightedProbDraww * 100, probabilityOfLossAa, weightWin, weightDraw, weightLose);
                const weightedProbWinB = game.weightedWinningProbability(probBb, weightedProbDraww * 100, probabilityOfLossBb,weightWin, weightDraw, weightLose);

                game.match['teamName'] = teamAa;
                game.match['probTowinLastPerformance'] = (probAa).toFixed(2);
                game.match['probtoWinHeadToHead'] = weightedProbA1;
                game.match['probToDraw'] = (weightedProbDraww * 100).toFixed(2);
                game.match['probToLost'] = (probabilityOfLossAa).toFixed(2);
                game.match['probToWinAponderada'] = (weightedProbWinA).toFixed(2);
                game.match['goalsPerMatchAverage'] = (lambda).toFixed(2);
            
                game.matchB['teamName'] = teambB;
                game.matchB['probTowinLastPerformance'] = (probBb).toFixed(2);
                game.matchB['probtoWinHeadToHead'] = weightedProB2;
                game.matchB['probToDraw'] = (weightedProbDraww * 100).toFixed(2);
                game.matchB['probToLost'] = (probabilityOfLossBb).toFixed(2);
                game.matchB['probToWinBponderada'] = (weightedProbWinB).toFixed(2);
                game.matchB['goalsPerMatchAverage'] = (lambdaB).toFixed(2);

                console.log("Probabilidad de que gane el equipo A:", game.match);
                console.log("Probabilidad de que gane el equipo B:", game.matchB);

                game.cleanGralData();
                await pause();
                break;
        }
    } while (opt !== '0');
}

main();
