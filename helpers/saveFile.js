const fs = require('fs');
const file = './db/data.json';

const saveFile = (data) => {
    fs.writeFileSync(file, JSON.stringify(data));
}

const readDb = () => {
    if (!fs.existsSync(file)) {
        return null;
    }
    const info = fs.readFileSync(file, { encoding: 'utf-8' });
    if (info.trim().length === 0) {
        return null;
    }
    return JSON.parse(info);
}

module.exports = {
    saveFile,
    readDb
}
