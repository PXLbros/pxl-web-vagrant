const commandLineArgs = require('command-line-args');
const { yellow } = require('chalk');
const { ask_create_database } = require('../utils/ask');
const { create: create_database } = require('../utils/database');
const { error_line } = require('../utils/log');
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
        error_line(create_database_error.message);
    }
}

main();
