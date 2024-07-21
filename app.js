require('colors');
const inquirer = require('inquirer');
const { inquirerMenu, pause, readInput } = require('./helpers/inquirer');
const { saveFile, readDb } = require('./helpers/saveFile');
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
                const teamName = await readInput('Nombre del equipo:');
                const desiredSuccesses = await readInput('Número de ensayos . <En cuántos partidos deseas hacer tu calculo de predicción>');
                const nGamesPlayed = await readInput(`Cúantos partidos te gustaría que ganara ${teamName} en ${desiredSuccesses} partido(s) jugado(s)?`);
                const dataVictoriesMatches = await readInput('Número de victorias del equip < número de últimas victorias que conozcas>');
                const dataGamesPlayed = await readInput('Número de partidos jugados <en cuántos partidos tuvo las victorias que escribiste ?>:');
                
                const p = proyections.calculateProbabilityOfP(dataVictoriesMatches, dataGamesPlayed);
                const probability = proyections.binomialProbability(nGamesPlayed, desiredSuccesses, p);
                
                console.log(`La probabilidad de tener exactamente ${desiredSuccesses} éxitos en ${nGamesPlayed} ensayos es: ${probability.toFixed(2)}%`.green);

                proyections.addPrediction({
                    teamName,
                    nGamesPlayed,
                    desiredSuccesses,
                    dataVictoriesMatches,
                    dataGamesPlayed,
                    probability: probability.toFixed(2)
                });

                saveFile(proyections.toArray());
                await pause();
                break;

            case '2':
                const teamName2 = await readInput('Nombre del equipo:');
                const goalsFor = await readInput('Número de goles del equipo <cantidad de goles del equipo o jugador que conozcas>:');
                const gamesPlayed = await readInput('Número de partidos jugados <En cuántos partidos hizo esos goles?:');
                const goalsDesired = await readInput('Número de goles deseados en el partido:');
                
                const lambda = proyections.goalsAverage(goalsFor, gamesPlayed);
                const poissonProb = proyections.poissonProbability(goalsDesired, lambda);
                
                console.log(`La probabilidad de que el equipo anote exactamente ${goalsDesired} goles es: ${poissonProb.toFixed(3)}%`.green);

                proyections.addPrediction({
                    teamName: teamName2,
                    goalsFor,
                    gamesPlayed,
                    goalsDesired,
                    probability: poissonProb.toFixed(3)
                });

                saveFile(proyections.toArray());
                await pause();
                break;

            case '3':
                const probRecent = await readInput('Probabilidad basada en el rendimiento reciente (en %):');
                const probHeadToHead = await readInput('Probabilidad basada en encuentros directos (en %):');
                const weightRecent = await readInput('Peso para el rendimiento reciente:');
                const weightHeadToHead = await readInput('Peso para encuentros directos:');
                
                const weightedProb = proyections.weightedProbability(probRecent / 100, probHeadToHead / 100, weightRecent, weightHeadToHead);
                
                console.log(`Probabilidad ponderada: ${(weightedProb * 100).toFixed(2)}%`.green);

                proyections.addPrediction({
                    probRecent,
                    probHeadToHead,
                    weightRecent,
                    weightHeadToHead,
                    probability: (weightedProb * 100).toFixed(2)
                });

                saveFile(proyections.toArray());
                await pause();
                break;

            case '4':
                const teamA = await readInput('Nombre del equipo A:');
                const teamB = await readInput('Nombre del equipo B:');
                const probA = await readInput('Probabilidad de empate para el equipo A (en %):');
                const probB = await readInput('Probabilidad de empate para el equipo B (en %):');
                const weightA = await readInput('Peso para el equipo A:');
                const weightB = await readInput('Peso para el equipo B:');
                
                const weightedDrawProb = proyections.weightedProbability(probA / 100, probB / 100, weightA, weightB);
                
                console.log(`Probabilidad ponderada de empate entre ${teamA} y ${teamB}: ${(weightedDrawProb * 100).toFixed(2)}%`.green);

                proyections.addPrediction({
                    teamA,
                    teamB,
                    probA,
                    probB,
                    weightA,
                    weightB,
                    probability: (weightedDrawProb * 100).toFixed(2)
                });

                saveFile(proyections.toArray());
                await pause();
                break;

            case '5':
                console.log(proyectionsDb); // Aquí podrías implementar una tabla o formato más legible
                await pause();
                break;

            case '6':
                console.log('Historial de predicciones:');
                console.log(proyections.getHistory()); // Asumo que tienes un método para obtener el historial
                await pause();
                break;
        }
    } while (opt !== '0');
}

main();
