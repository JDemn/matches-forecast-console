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
            case '1':

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

                const nTrials = await readInput("Número de ensayos en los que te gustaría hacer la predicción ?")
                const desiredSuccesses = await readInput("Números de casos de éxito a predecir . Ejemplo . 1: significa el siguiente encuentro etc ...")
                const prevMatches = await readInput("Ingresar número Partidos ganados (W)");
                const gamesPlayed = await readInput("Ingresar número de Partidos jugados MP");

                const pA = proyections.calculateProbabilityOfP(prevMatches, gamesPlayed);
                const probabilityA = parseFloat(proyections.binomialProbability(nTrials, desiredSuccesses, pA));

                const prevMatchesB = await readInput("Partidos ganados Equipo B?");
                const pB = proyections.calculateProbabilityOfP(prevMatchesB, gamesPlayed);
                const probabilityB = parseFloat(proyections.binomialProbability(nTrials, desiredSuccesses, pB));

                console.log("MP type ", typeof(gamesPlayed));
                

                proyections.addTeamName( 
                    teamA ,
                    teamB , 
                    probabilityA , 
                    probabilityB , 
                    prevMatchesB ,
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
                const gamesPlayedHistoryMatches = await readInput(" partidos disputados que hayan sido directos (MP) ; es decir  TEAM A VS TEAM B ");
                const winsA = await readInput("Partidos ganados por equipo A (W)");
                const winsB = await readInput("Partidos ganados por el quipo B (W)");
                // Historia entre equipos
                const historyProbabilityA = winsA / gamesPlayedHistoryMatches;
                const historyProbabilityB = winsB / gamesPlayedHistoryMatches;

                // peso de probabilidades de último desempeno y encuentros directos
                const weightRecent = proyections.generalData[2]; //0.6
                const weightHeadToHead = proyections.generalData[3];  //0.4

                const probA = proyections.generalData[4]
                const probB = proyections.generalData[5]
                const weightedProbA = proyections.weightedProbability( probA / 100, historyProbabilityA, weightRecent, weightHeadToHead);
                const weightedProbB = proyections.weightedProbability(probB / 100, historyProbabilityB, weightRecent, weightHeadToHead);

                // Probabilidad de empate
                const drawProbability = (weightedProbA + weightedProbB) / 2;
                
                console.log("peso ", typeof(weightedProbA));
                        
                proyections.addTeamName( 
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
                //console.log(table.toString());
                
                await pause();
                break;
            case '3':

                const probRecenTeamA = proyections.generalData[4];
                const probRecentTeamB = proyections.generalData[6];
                const weigthR = proyections.generalData[2];
                const weigthFtF = proyections.generalData[3];

                // Probabilidades basadas en encuentros directos
                const probHeadToHeadTeamA = proyections.generalData[7];
                const probHeadToHeadTeamB = proyections.generalData[8];

                const weightedProbTeamA = proyections.weightedProbability(probRecenTeamA, probHeadToHeadTeamA, weigthR, weigthFtF );
                const weightedProbTeamB = proyections.weightedProbability(probRecentTeamB, probHeadToHeadTeamB, weigthR, weigthFtF );

                
                proyections.addTeamName(
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
                )
                await pause()
                break;
            case '4':
                const draws = await readInput("Número de empates que han tenido ambos equipos en encuentros directos.")
                const totalMachesIn = await readInput("Numero de encuentros en los que surgieron dichos empates");
                const probHeadToHeadDraw = proyections.historicalDrawProbability(draws, totalMachesIn);

                const drawProbCurentJornalTeamA = await readInput(`Número de empates que tuvo ${proyections.generalData[0]} en los partidos que ha disputado en la actual jornada`);
                const drawProbCurentJornalTeamB = await readInput(`Número de empates que tuvo ${proyections.generalData[1]} en los pertidos que ha disputado en la actual jornada`);
                const totalMachesCurrentJornay = await readInput("Numero de encuentros en los que surgieron dichos empates. NTA: debe ser mismo numero de juegos para ambos equipos");

                const probRecentDrawTeamA = proyections.historicalDrawProbability(drawProbCurentJornalTeamA, totalMachesCurrentJornay);
                const probRecentDrawTeamB = proyections.historicalDrawProbability(drawProbCurentJornalTeamB, totalMachesCurrentJornay);

                const probRecentDraw = (probRecentDrawTeamA + probRecentDrawTeamB) / 2;

                const weightedProbDraw = proyections.weightedProbability(probRecentDraw, probHeadToHeadDraw, proyections.generalData[2], proyections.generalData[3]);
                const resultWeigtedProbDraw = weightedProbDraw * 100
                
                proyections.addTeamName( '','' ,'' ,'' ,'' , '' ,'' ,'',resultWeigtedProbDraw);
                await pause()
                break;
            case '5':
                const desiredSuccesses1 = await readInput("Fracasos a predecir . Ejemplo . 1: significa el siguiente encuentro etc ...")
                const losseTheGametotalMatches = await readInput(`Número de partidos perdidos de ${ proyections.generalData[0]}`);
                const probLosseInNmatches = await readInput(`Número de partidos disputados dónde perdió ${proyections.generalData[0]}`);
                const lossesByTeamB = await readInput(`Número de partidos perdidos de ${proyections.generalData[1]}`);
                const probLossesInMachesB = await readInput(`Número de partidos disputados donde perdió ${proyections.generalData[1]}`);

                // Calcula la probabilidad de perder (q)
                const teamALossesPrediction = proyections.calculateProbabilityOfQ(losseTheGametotalMatches, probLosseInNmatches);
                const teamBLossesPrediction = proyections.calculateProbabilityOfQ(lossesByTeamB, probLossesInMachesB);

                const probabilityOfLossA = proyections.binomialProbability(proyections.generalData[9], desiredSuccesses1, teamALossesPrediction);
                const probabilityOfLossB = proyections.binomialProbability(proyections.generalData[9], desiredSuccesses1, teamBLossesPrediction);

                
                proyections.addTeamName( 
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
                )
                await pause()
                break;
            case '6':



                const ponderateProbRecentTeamA = proyections.generalData[4];
                const ponderateProbRecentTeamB = proyections.generalData[5];

                const ponderateProbHeadToHeadTeamA = proyections.generalData[7];
                const ponderateProbHeadToHeadTeamB = proyections.generalData[8];

                const probDraw = proyections.generalData[10];


                proyections.weightedProbabilityAllResults(
                    ponderateProbRecentTeamA,
                    ponderateProbRecentTeamB,
                    ponderateProbHeadToHeadTeamA,
                    ponderateProbHeadToHeadTeamB,
                    probDraw,
                    proyections.generalData[2],
                    proyections.generalData[3]
                );

                 //guardar la data pendiente de este objeto en el state de la clase           
                proyections.addPrediction({
                    matchesPlayed: parseFloat(proyections.generalData[11]),
                    victories: parseFloat(proyections.generalData[12]),
                    trials: parseFloat(proyections.generalData[9]),
                    desiredSuccesses: parseFloat(proyections.generalData[13]),
                    probabilityLastPerformance: parseFloat(proyections.generalData[4]),                   
                    historyProbability: parseFloat(proyections.generalData[7]),
                    drawProbability : parseFloat(proyections.generalData[14]),
                    weightedProbability: parseFloat(proyections.generalData[15]),
                    drawProbability: parseFloat(proyections.generalData[10]),
                    losseProbability: parseFloat(proyections.generalData[16]),
                    ProbabilityToWinTakenInConsiderationAllPrevData: parseFloat(proyections.generalData[17]),
                });
                proyections.addPrediction({
                    matchesPlayed: parseFloat(proyections.generalData[11]),
                    victories: parseFloat(proyections.generalData[6]),
                    trials: parseFloat(proyections.generalData[9]),
                    desiredSuccesses: parseFloat(proyections.generalData[13]),
                    probabilityLastPerformance: parseFloat(proyections.generalData[5]),
                    historyProbability: parseFloat(proyections.generalData[8]),
                    drawProbability : parseFloat(proyections.generalData[14]),
                    weightedProbability: parseFloat(proyections.generalData[19]),
                    drawProbability: parseFloat(proyections.generalData[10]),
                    losseProbability: parseFloat(proyections.generalData[20]),
                    ProbabilityToWinTakenInConsiderationAllPrevData: parseFloat(proyections.generalData[18])
                });

                saveFile(proyections.toArray());
                proyections.exportToExcel('predictions.xlsx');
                proyections.cleanGralData();
                console.log("la data del primer pronóstico se ha limpiado".red ,proyections.generalData)
                await pause();
                break;

        }
    } while (opt !== '0');
}

main();
