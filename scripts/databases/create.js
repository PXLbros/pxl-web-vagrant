const commandLineArgs = require('command-line-args');
const { yellow, red } = require('chalk');
const { ask_create_database } = require('../utils/ask');
const { create: create_database } = require('../utils/database');
const log = console.log;

const options = commandLineArgs([
    { name: 'driver', type: String },
    { name: 'name', type: String }
]);

async function main() {
    const database = await ask_create_database(options['driver'], options['name']);

    if (!database) {
        return;
    }

    try {
        create_database(database.driver, database.name);

        log(yellow(`Database "${database.name}" has been created!`));
    } catch (create_database_error) {
        log(red(create_database_error));
    }
}

main();
