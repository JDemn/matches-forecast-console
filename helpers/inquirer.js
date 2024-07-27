const inquirer = require('inquirer');

require('colors');

const menuOpts = [{
    type: 'list',
    name: 'option',
    message: '¿Qué desea hacer?',
    choices: [
        { value: '1', name: '1. Calcular el éxito de un equipo de ganar su siguiente encuentro'.yellow },
        { value: '2', name: '2. Calcular probabilidad de ganar el encuntro , en base a datos históricos de encuentros directos'.yellow },
        { value: '3', name: '3. Ponderar resultados anteriores para aumentar la probabilidad de éxito de este cálculo' },
        { value: '4', name: '4. Calcular probabilidad de empate entre encuentros directos y tomando en cuenta empates que tuvieron en la actual jornada'.yellow },
        { value: '5', name: '5.Calcular probabilidad que tiene un equipo de perder el encuentro'.yellow },
        { value: '6', name: '6. Ponderar todas las probabilidades de los anteriores resultados para incrementar la probabilidad de éxito'.yellow },
        { value: '7', name: '7. Calcular el promedio de goles que tendrán los equipos en n encuentros'.yellow },
        { value: '10', name: '8. Mostrar tabla de posibilidad de marcador entre ambos equipos'.yellow },
        { value: '11', name: '10. Game pronostic'.red }
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
