const { existsSync } = require('fs');
const { exec } = require('shelljs');
const { cyan_line, error_line, highlight_line, line_break } = require('../utils/log');
const { format } = require('date-fns');
const { ask_confirm } = require('../utils/ask');

async function main() {
    const backup_dir = `/vagrant/backups/${format(new Date(), 'YYYY-MM-DD')}`;

    if (existsSync(backup_dir)) {
        if (!await ask_confirm(`You have already backed up today, do you want to overwrite previous backup at ${backup_dir}?`)) {
            return;
        }
    }

    highlight_line(`Backing up to ${backup_dir}...`);

    // Backup sites available directory
    cyan_line('Backing up Apache sites-available directory...');

    const sites_available_dir = `${backup_dir}/apache2/sites-available`;
    // const sites_available_response = await exec(`rsync -r ${sites_available_dir} /etc/apache2/sites-available/`, { silent: true });

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
    cyan_line('Backing up MySQL databases...');

    const mysql_backup_dir = `${backup_dir}/mysql/var/lib/mysql`;
    const mysql_response = await exec(`mkdir -p ${mysql_backup_dir}/ && rsync -r /var/lib/mysql/ ${mysql_backup_dir}`, { silent: true });

    if (mysql_response.code !== 0) {
        error_line(`MySQL Error: ${mysql_response.stderr}`);
        return;
    }

    highlight_line('Restore complete!');
}

main();
