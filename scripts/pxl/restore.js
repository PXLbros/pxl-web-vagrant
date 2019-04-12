const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const { exec } = require('shelljs');
const { cyan_line, error_line, highlight_line, success_line } = require('../utils/log');
const { prompt } = require('inquirer');

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

    const sites_available_confs = readdirSync('/etc/apache2/sites-available');
    let num_enabled_sites_available_confs = 0;
    
    for (let sites_available_conf of sites_available_confs) {
        const enable_sites_available_conf_response = await exec(`cd /etc/apache2/sites-available && sudo a2ensite ${sites_available_conf}`, { silent: true });

        if (enable_sites_available_conf_response.code === 0 && enable_sites_available_conf_response.stdout.trim() !== `Site ${sites_available_conf.substring(0, sites_available_conf.length - 5)} already enabled`) {
            success_line(`Apache virtual host configuration ${sites_available_conf} enabled.`);

            num_enabled_sites_available_confs++;
        } else {
            error_line(enable_sites_available_conf_response.stdout.trim());
        }
    }

    // Reload Apache if one or more virtual host configuration files were enabled
    if (num_enabled_sites_available_confs > 0) {
        const reload_apache_response = await exec(`sudo service apache2 reload`, { silent: true });

        if (reload_apache_response.code !== 0) {
            error_line(`Reload Apache error:\n${reload_apache_response.stderr}`);
        }
    }

    // Restore .bash_profile
    cyan_line('Restoring .bash_profile...');

    const bash_profile_response = await exec(`cp ${backup_dir}/.bash_profile ~/.bash_profile`);

    if (bash_profile_response.code !== 0) {
        error_line(`Error: ${bash_profile_response.stderr}`);
        return;
    }

    // Restore MySQL
    cyan_line('Restoring MySQL...');

    const mysql_backup_dir = `${backup_dir}/mysql`;
    const mysql_backup_path = `${mysql_backup_dir}/databases.sql`;
    
    const mysql_response = await exec(`mysqldump -uvagrant -pvagrant --all-databases < ${mysql_backup_path}`, { silent: true });

    if (mysql_response.code !== 0) {
        error_line(`Error: ${mysql_response.stderr}`);
        return;
    }

    // Restore /etc/hosts file
    const etc_hosts_backup_dir = `${backup_dir}/etc`;
    const etc_hosts_response = await exec(`sudo cp ${etc_hosts_backup_dir}/hosts /etc/hosts`, { silent: true });

    if (etc_hosts_response.code !== 0) {
        error_line(`/etc/hosts Error: ${etc_hosts_response.stderr}`);
        return;
    }

    highlight_line('Restore complete!');
}

main();
