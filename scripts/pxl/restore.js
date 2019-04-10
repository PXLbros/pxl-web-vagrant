const { existsSync, lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const { exec } = require('shelljs');
const { cyan_line, error_line, highlight_line, line_break } = require('../utils/log');
const { prompt } = require('inquirer');
const { format } = require('date-fns');
const { ask_confirm } = require('../utils/ask');

async function main() {
    // List backups
    const backups_dir = '/vagrant/backups';
    
    const is_directory = source => lstatSync(source).isDirectory();
    const get_directories = source => readdirSync(source).map(name => join(source, name)).filter(is_directory);

    const backup_dir = (await prompt([
        {
            type: 'list',
            name: 'value',
            message: 'Choose backup to restore from:',
            choices: get_directories(backups_dir).map(backup_dir => {
                return {
                    name: backup_dir,
                    value: backup_dir
                };
            })
        }
    ])).value;

    highlight_line(`Restoring from ${backup_dir}...`);

    // Restore sites available directory
    cyan_line('Restoring Apache sites-available directory...');

    const sites_available_dir = `${backup_dir}/apache2/sites-available`;
    const sites_available_response = await exec(`rsync -r ${sites_available_dir}/ /etc/apache2/sites-available`, { silent: true });

    if (sites_available_response.code !== 0) {
        error_line(`Error: ${sites_available_response.stderr}`);
        return;
    }

    for (let sites_available_conf of sites_available_confs) {
    }

    // Restore .bash_profile
    cyan_line('Restoring.bash_profile...');

    const bash_profile_response = await exec(`cp ${backup_dir}/.bash_profile ~/.bash_profile`);

    if (bash_profile_response.code !== 0) {
        error_line(`Error: ${bash_profile_response.stderr}`);
        return;
    }

    // Restore MySQL
    cyan_line('Restoring MySQL...');

    const mysql_backup_dir = `${backup_dir}/mysql/var/lib/mysql`;
    const mysql_response = await exec(`sudo service mysql stop && rsync -r ${mysql_backup_dir}/ /var/lib/mysql && sudo chown -R mysql:mysql /var/lib/mysql/ && sudo service mysql start`, { silent: true });

    if (mysql_response.code !== 0) {
        error_line(`Error: ${mysql_response.stderr}`);
        return;
    }

    highlight_line('Restore complete!');
}

main();
