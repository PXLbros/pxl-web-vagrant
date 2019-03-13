const { exec } = require('shelljs');
const { prompt } = require('inquirer');

function database_exists(driver, name) {
    if (driver === 'mysql') {
        const exists_result = exec(`mysql -u${process.env.MYSQL_USER_NAME} -p${process.env.MYSQL_USER_PASSWORD} -e "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${name}';"`, { silent: true });

        return (exists_result.stdout !== '');
    }

    return false;
}

module.exports = {
    create(driver, name) {
        if (driver === 'mysql') {
            if (database_exists(driver, name)) {
                throw new Error(`MySQL database "${name}" already exist.`);
            }

            const create_database_result = exec(`mysql -u${process.env.MYSQL_USER_NAME} -p${process.env.MYSQL_USER_PASSWORD} -e "CREATE DATABASE ${name};"`, { silent: true });
            
            if (create_database_result.code !== 0) {
                throw new Error(create_database_result.stderr);
            }
        }
    },

    delete(driver, name) {
        if (driver === 'mysql') {
            if (!database_exists(driver, name)) {
                throw new Error(`MySQL database "${name}" doesn't exist.`);
            }

            const delete_database_result = exec(`mysql -u${process.env.MYSQL_USER_NAME} -p${process.env.MYSQL_USER_PASSWORD} -e "DROP DATABASE ${name};"`, { silent: true });
            
            if (delete_database_result.code !== 0) {
                throw new Error(delete_database_result.stderr);
            }
        }
    },

    exists: database_exists,

    get_driver_title(driver) {
        switch (driver) {
            case 'mysql':
                return 'MySQL';
        }
    },

    async ask_create_database_driver(question, no_text = 'No') {
        let choices = [];

        choices.push({
            name: no_text,
            value: null
        });

        choices.push({
            name: 'MySQL',
            value: 'mysql'
        });

        const prompt_result = await prompt([
            {
                type: 'list',
                name: 'value',
                message: question || 'Create database?',
                choices: choices
            }
        ]);

        return prompt_result.value;
    }
};
