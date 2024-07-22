const inquirer = require('inquirer');

require('colors');

const menuOpts = [{
    type: 'list',
    name: 'option',
    message: '¿Qué desea hacer?',
    choices: [
        { value: '0', name: '0. Ingresa el nombre del equipo A y B sobre los que deseas hacer el cálculo' },
        { value: '1', name: '1. Calcular el éxito de un equipo de ganar su siguiente encuentro' },
        { value: '2', name: '2. Calcular probabilidad de ganar el encuntro , en base a datos históricos de encuentros directos' },
        { value: '3', name: '3. Ponderar resultados anteriores para aumentar la probabilidad de éxito de este cálculo' },
        { value: '4', name: '4. Calcular probabilidad de empate entre encuentros directos y tomando en cuenta empates que tuvieron en la actual jornada' },
        { value: '5', name: '5.Calcular probabilidad que tiene un equipo de perder el encuentro' },
        { value: '6', name: '5. Ponderar todas las probabilidades de los anteriores resultados para incrementar la probabilidad de éxito' },
        { value: '7', name: '6. Calcular el promedio de goles que tendrán los equipos en n encuentros' },
        { value: '10', name: '0. Mostrar tabla de posibilidad de marcador entre ambos equipos' }
    ]
}];

const inquirerMenu = async () => {
    console.clear();
    console.log('============================'.green);
    console.log('  Seleccione una opción'.white);
    console.log('  No te saltes ningún paso para obtener un 98% de éxito en la predicción'.yellow);
    console.log('  Busca proover la aplicación de datos reales . Cada jornada tiene su tabla de resultado del rendimiento de los equipos'.white);
    console.log('  Para los datos históricos entre equipos busca de una base de datos o recomiendo buscar en edge'.white);
    console.log('============================\n'.green);

    const {option} = await inquirer.prompt(menuOpts)
    return option;
}

const pause = async () => {
    const question = [{
        type: 'input',
        name: 'enter',
        message: `Presione ${'ENTER'.green} para continuar`
    }];
    console.log('\n');
    await inquirer.prompt(question);
}

const readInput = async (message) => {
    const question = [{
        type: 'input',
        name: 'desc',
        message,
        validate(value) {
            if (value.length === 0) {
                return 'Por favor ingrese un valor';
            }
            return true;
        }
    }];
    const { desc } = await inquirer.prompt(question);
    return desc;
}

module.exports = {
    inquirerMenu,
    pause,
    readInput
}
