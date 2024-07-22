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
    const table = new Table({
        head: ['Fecha de cálculo', 'Nombre del equipo', 'Partidos jugados MP', 'Partidos ganados W', 'n Ensayos', 'Éxitos deseados', 'Probabilidad. (último desempeño)', 'Por historia entre equipos', 'Por ponderación', 'Probabilidad de empate', 'Probabilidad que pierda el encuentro', 'Prob de ganar ponderando todos los resultados anteriores']
    });

    do {
        opt = await inquirerMenu();
        switch (opt) {
            case '0':
                const teamA = await readInput('Nombre del equipo A:');
                const teamB = await readInput('Nombre del equipo B:');
                //NOTA almacenar nombre del equipo en excel y también un identificador para futuras referencias

                proyections.toTable().forEach(row => {
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
                proyections.addPrediction({
                    Date: new Date(),
                    teamName: teamA
                })
                proyections.addPrediction({
                    Date: new Date(),
                    teamName: teamB
                })
                await pause();
                break
            case '1':
                const nTrials = await readInput("Número de ensayos en los que te gustaría hacer la predicción ?")
                const desiredSuccesses = await readInput("Cuántos encuentros deseas que gane el equipo ?")
                const prevMatches = await readInput("Basado en datos reales. Cuántos partidos ha ganado el equipo A. De preferencia de la actual jornada?");
                const gamesPlayed = await readInput("Número de encuentros de ambos equipos sobre los que se hará el cálculo. Ejemplo 3 partidos que han jugado ambos en la jornada actual");

                const pA = proyections.calculateProbabilityOfP(prevMatches, gamesPlayed);
                const probabilityA = parseFloat(proyections.binomialProbability(nTrials, desiredSuccesses, pA));

                const prevMatchesB = await readInput("Basado en datos reales. Cuántos partidos ha ganado el equipo B ?");
                const pB = proyections.calculateProbabilityOfP(prevMatchesB, gamesPlayed);
                const probabilityB = parseFloat(proyections.binomialProbability(nTrials, desiredSuccesses, pB));

                proyections.addPrediction({
                    matchesPlayed: gamesPlayed,
                    victories: prevMatches,
                    trials: nTrials,
                    desiredSuccesses: desiredSuccesses,
                    probabilityLastPerformance: probabilityA
                });
                proyections.addPrediction({
                    matchesPlayed: gamesPlayed,
                    victories: prevMatchesB,
                    trials: nTrials,
                    desiredSuccesses: desiredSuccesses,
                    probabilityLastPerformance: probabilityB
                });
                await pause();
                break;

            case '2':


                const gamesPlayedHistoryMatches = await readInput("Número de encuentros de ambos equipos sobre los que se hará el cálculo. Ejemplo 3 partidos que han sido encuentros directos");
                const winsA = await readInput("Basado en datos reales. Cuántos partidos ha ganado el equipo A cuando juega contra el equipo B?");
                const winsB = await readInput("Basado en datos reales . Cuántos partidos ha ganado el equipo B cuando juega contra el equipo A")
                // Historia entre equipos
                const historyProbabilityA = winsA / gamesPlayedHistoryMatches;
                const historyProbabilityB = winsB / gamesPlayedHistoryMatches;

                // peso de probabilidades de último desempeno y encuentros directos
                const weightRecent = 0.6;
                const weightHeadToHead = 0.4;

                const weightedProbA = proyections.weightedProbability(probabilityA / 100, historyProbabilityA, weightRecent, weightHeadToHead);
                const weightedProbB = proyections.weightedProbability(probabilityB / 100, historyProbabilityB, weightRecent, weightHeadToHead);

                // Probabilidad de empate
                const drawProbability = (weightedProbA + weightedProbB) / 2;

                proyections.addPrediction({
                    historyProbability: weightedProbA,
                    drawProbability
                });

                proyections.addPrediction({
                    historyProbability: weightedProbB,
                    drawProbability
                });

                //console.log(table.toString());
                proyections.exportToExcel('predictions.xlsx');
                await pause();
                break;
            case '3':

                const probRecenTeamA = probabilityA;
                const probRecentTeamB = prevMatchesB;

                // Probabilidades basadas en encuentros directos
                const probHeadToHeadTeamA = weightedProbA;
                const probHeadToHeadTeamB = weightedProbB;

                const weightedProbTeamA = proyections.weightedProbability(probRecenTeamA, probHeadToHeadTeamA, weightRecent, weightHeadToHead);
                const weightedProbTeamB = proyections.weightedProbability(probRecentTeamB, probHeadToHeadTeamB, weightRecent, weightHeadToHead);

                proyections.addPrediction({
                    weightedProbability: weightedProbTeamA
                });
                proyections.addPrediction({
                    weightedProbability: weightedProbTeamB
                });

                await pause()
                break;
            case '4':
                const draws = await readInput("Número de empates que han tenido ambos equipos en encuentros directos.")
                const totalMachesIn = await readInput("Numero de encuentros en los que surgieron dichos empates");
                const probHeadToHeadDraw = proyections.historicalDrawProbability(draws, totalMachesIn);

                const drawProbCurentJornalTeamA = await readInput(`Número de empates que tuvo ${teamA} en los pertidos que ha disputado en la actual jornada`);
                const drawProbCurentJornalTeamB = await readInput(`Número de empates que tuvo ${teamA} en los pertidos que ha disputado en la actual jornada`);
                const totalMachesCurrentJornay = await readInput("Numero de encuentros en los que surgieron dichos empates. NTA: debe ser mismo numero de juegos para ambos equipos");

                const probRecentDrawTeamA = proyections.historicalDrawProbability(drawProbCurentJornalTeamA, totalMachesCurrentJornay);
                const probRecentDrawTeamB = proyections.historicalDrawProbability(drawProbCurentJornalTeamB, totalMachesCurrentJornay);

                const probRecentDraw = (probRecentDrawTeamA + probRecentDrawTeamB) / 2;

                const weightedProbDraw = proyections.weightedProbability(probRecentDraw, probHeadToHeadDraw, weightRecent, weightHeadToHead);
                const resultWeigtedProbDraw = weightedProbDraw * 100
                proyections.addPrediction({
                    drawProbability: resultWeigtedProbDraw.toFixed(2)
                });
                await pause()
                break;
            case '5':
                const losseTheGametotalMatches = await readInput(`Número de partidos perdidos de ${teamA}`);
                const probLosseInNmatches = await readInput(`Número de partidos disputados dónde perdió ${teamA}`);
                const lossesByTeamB = await readInput(`Número de partidos perdidos de ${teamB}`);
                const probLossesInMachesB = await readInput(`Número de partidos disputados donde perdió ${teamB}`);

                // Calcula la probabilidad de perder (q)
                const teamALossesPrediction = proyections.calculateProbabilityOfQ(losseTheGametotalMatches, probLosseInNmatches);
                const teamBLossesPrediction = proyections.calculateProbabilityOfQ(lossesByTeamB, probLossesInMachesB);

                const probabilityOfLossA = proyections.binomialProbability(nTrials, desiredSuccesses, teamALossesPrediction);
                const probabilityOfLossB = proyections.binomialProbability(nTrials, desiredSuccesses, teamBLossesPrediction);

                proyections.addPrediction({
                    losseProbability: probabilityOfLossA
                });
                proyections.addPrediction({
                    losseProbability: probabilityOfLossB
                });
                
                await pause()
                break;
            case '6':

                

                const ponderateProbRecentTeamA = probabilityA;   
                const ponderateProbRecentTeamB = probabilityB;   

                const ponderateProbHeadToHeadTeamA = weightedProbA; 
                const ponderateProbHeadToHeadTeamB = weightedProbB; 

                const probDraw = resultWeigtedProbDraw.toFixed(2); 


                const { weightedProbWinA, weightedProbWinB } = proyections.weightedProbabilityAllResults(
                    ponderateProbRecentTeamA,
                    ponderateProbRecentTeamB,
                    ponderateProbHeadToHeadTeamA,
                    ponderateProbHeadToHeadTeamB,
                    probDraw,
                    weightRecent,
                    weightHeadToHead
                );

                proyections.addPrediction({
                    ProbabilityToWinTakenInConsiderationAllPrevData: weightedProbWinA
                });
                proyections.addPrediction({
                    ProbabilityToWinTakenInConsiderationAllPrevData: weightedProbWinB
                });

                saveFile(proyections.toArray());

                await pause();
                break;

        }
    } while (opt !== '0');
}

main();
