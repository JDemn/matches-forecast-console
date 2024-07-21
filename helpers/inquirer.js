const inquirer = require('inquirer');

require('colors');

const menuOpts = [{
    type: 'list',
    name: 'option',
    message: '¿Qué desea hacer?',
    choices: [
        { value: '1', name: '1. Calcular predicción de éxito de un equipo en n partidos' },
        { value: '2', name: '2. ¿Qué probabilidad hay de que un equipo meta n goles en el partido?' },
        { value: '3', name: '3. Hacer ponderación sobre resultados tomados de desempeño reciente del equipo y resultados sobre datos históricos de encuentros entre ambos equipos' },
        { value: '4', name: '4. Ponderación para predecir empate entre equipo A y equipo B' },
        { value: '5', name: '5. Tabla de última predicción entre equipo A y B' },
        { value: '6', name: '6. Historial de predicciones' },
        { value: '0', name: '0. Salir' }
    ]
}];

const inquirerMenu = async () => {
    console.clear();
    console.log('============================'.green);
    console.log('  Seleccione una opción'.white);
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
