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
    const sites_available_response = await exec(`mkdir -p ${backup_dir}/apache2/sites-available && rsync -r /etc/apache2/sites-available/ ${backup_dir}/apache2/sites-available`, { silent: true });

    if (sites_available_response.code !== 0) {
        error_line(`Error: ${sites_available_response.stdout}`);
        return;
    }

    // Backup .bash_profile
    const bash_profile_response = await exec(`cp ~/.bash_profile ${backup_dir}/.bash_profile`);

    if (bash_profile_response.code !== 0) {
        error_line(`Error: ${bash_profile_response.stdout}`);
        return;
    }

    highlight_line('Backup complete!');
}

main();
