const commandLineArgs = require('command-line-args');
const { exec } = require('shelljs');
const { ask_input } = require('./utils/ask');
const { choose } = require('./utils/choose');

const options = commandLineArgs([
    { name: 'driver', type: String },
    { name: 'name', type: String }
]);

async function main() {
    const driver = (options.driver || await choose('What is the database driver?', [
        {
            name: 'MySQL',
            value: 'mysql'
        }
    ]));

    const name = (options.name || await ask_input('What is the name of the database? (e.g. my_database)'));

    let created_database = false;

    if (driver === 'mysql') {
        const create_database_result = exec(`mysql -u${process.env.DATABASE_USER} -p${process.env.DATABASE_PASSWORD} -e "CREATE DATABASE ${name};" 2> /dev/null`);

        if (create_database_result.code === 0) {
            created_database = true;
        }
    }

    if (created_database) {
        console.log(`Database "${name}" has been created!`);
    } else {
        console.log(`Could not create database "${name}".`);
    }
}

main();
