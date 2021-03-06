const commandLineArgs = require('command-line-args');
const { exec } = require('shelljs');
const { yellow, red } = require('chalk');
const { ask_input } = require('../utils/ask');
const { choose } = require('../utils/choose');
const log = console.log;

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

    let create_database_error = null;

    if (driver === 'mysql') {
        const database_exist_result = exec(`mysql -u${process.env.MYSQL_USER_NAME} -p${process.env.MYSQL_USER_PASSWORD} --skip-column-names -e "SHOW DATABASES LIKE '${name}'"`, { silent: true });
        const database_exist = (database_exist_result.stdout !== '');

        if (!database_exist) {
            log(red(`Could not find database "${name}".`));

            return;
        }

        const create_database_result = exec(`mysql -u${process.env.MYSQL_USER_NAME} -p${process.env.MYSQL_USER_PASSWORD} -e "DROP DATABASE ${name};"`, { silent: true });

        if (create_database_result.code !== 0) {
            create_database_error = create_database_result;
        }
    }

    if (!create_database_error) {
        log(yellow(`Database "${name}" has been deleted!`));
    } else {
        log(red(`Could not delete database "${name}".`));
    }
}

main();
