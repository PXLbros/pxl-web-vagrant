const commandLineArgs = require('command-line-args');
const { existsSync } = require('fs');
const { exec } = require('shelljs');
const { cyan_line, error_line, highlight_line } = require('../utils/log');
const { format } = require('date-fns');
const { ask_confirm } = require('../utils/ask');

const options_values = [
    { name: 'non-interactive', type: Boolean, description: 'Non-interactive mode.' },
];

async function main() {
    let options;

    try {
        options = commandLineArgs(options_values.map(option => {
            return {
                name: option.name,
                type: option.type
            };
        }));
    } catch (e) {
        console.log(e.message);
        
        return;
    }

    let non_interactive = options['non-interactive'] || false;

    const backup_dir = `/vagrant/backups/${format(new Date(), 'YYYY-MM-DD')}`;

    if (existsSync(backup_dir) && !non_interactive) {
        if (!await ask_confirm(`You have already backed up today, do you want to overwrite previous backup at ${backup_dir}?`)) {
            return;
        }
    }

    highlight_line(`Backing up to ${backup_dir}...`);

    // Backup sites available directory
    cyan_line('Backing up Apache sites-available directory...');

    const sites_available_backup_dir = `${backup_dir}/apache2/sites-available`;
    const sites_available_response = await exec(`mkdir -p ${sites_available_backup_dir} && rsync -r /etc/apache2/sites-available ${sites_available_backup_dir}/`, { silent: true });

    if (sites_available_response.code !== 0) {
        error_line(`Apache sites-available Error: ${sites_available_response.stderr}`);
        return;
    }

    // Backup .bash_profile
    cyan_line('Backing up .bash_profile...');

    const bash_profile_response = await exec(`cp ~/.bash_profile ${backup_dir}/.bash_profile`);

    if (bash_profile_response.code !== 0) {
        error_line(`.bash_profile Error: ${bash_profile_response.stderr}`);
        return;
    }

    // Backup MySQL databases
    // cyan_line('Backing up MySQL databases...');

    // const mysql_backup_dir = `${backup_dir}/mysql`;
    // const mysql_backup_path = `${mysql_backup_dir}/databases.sql`;

    // const mysql_response = await exec(`mysqldump -uvagrant -pvagrant --all-databases --skip-lock-tables > ${mysql_backup_path}`, { silent: true });

    // if (mysql_response.code !== 0) {
    //     error_line(`MySQL Error: ${mysql_response.stderr}`);
    //     return;
    // }

    // Backup /etc/hosts file
    // const etc_hosts_backup_path = `${backup_dir}/etc/hosts`;
    // const etc_hosts_response = await exec(`mkdir -p ${etc_hosts_backup_path} && sudo cp /etc/hosts ${etc_hosts_backup_dir}`, { silent: true });

    // if (etc_hosts_response.code !== 0) {
    //     error_line(`/etc/hosts Error: ${etc_hosts_response.stderr}`);
    //     return;
    // }

    highlight_line('Restore complete!');
}

main();
