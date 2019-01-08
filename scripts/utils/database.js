const { exec } = require('shelljs');

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
                throw new Error(`Database "${name}" already exist.`);
            }

            const create_database_result = exec(`mysql -u${process.env.MYSQL_USER_NAME} -p${process.env.MYSQL_USER_PASSWORD} -e "CREATE DATABASE ${name};"`, { silent: true });
            
            if (create_database_result.code !== 0) {
                throw new Error(create_database_result.stderr);
            }
        }
    },

    exists: database_exists
}
