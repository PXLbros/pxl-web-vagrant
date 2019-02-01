const commandLineArgs = require('command-line-args');
const { existsSync } = require('fs');
const { exec } = require('shelljs');
const { yellow, red } = require('chalk');
const { ask_confirm } = require('../../utils/ask');
const { choose_files_from_dir } = require('../../utils/choose');
const log = console.log;

const options = commandLineArgs([
    { name: 'hostname', type: String },
    { name: 'non-interactive', type: Boolean, defaultOption: false }
]);

async function main() {
    let selected_nginx_site_configuration_file;

    if (options['hostname']) {
        selected_apache_site_configuration_file = `${options['hostname']}.conf`;
    } else {
        selected_apache_site_configuration_file = await choose_files_from_dir('/etc/apache2/sites-available', 'Which Apache site do you want to delete?');
    }

    const selected_apache_site_configuration_file_path = `/etc/apache2/sites-available/${selected_apache_site_configuration_file}`;

    if (!existsSync(selected_apache_site_configuration_file_path)) {
        log(red(`Could not find Apache site configuration "${selected_apache_site_configuration_file}".`));

        return;
    }

    if (!options['non-interactive'] && !await ask_confirm(`Are you sure you want to delete Apache site "${selected_apache_site_configuration_file}"?`)) {
        return;
    }

    // Disable Apache site
    exec(`sudo a2dissite ${selected_apache_site_configuration_file}`, { silent: true });

    // Read hostname from Apache site configuration file
    const get_server_name_result = exec(`awk '/ServerName/ {print $2}' ${selected_apache_site_configuration_file_path}`, { silent: true })
    const hostname = (get_server_name_result.code === 0 && get_server_name_result.stdout ? get_server_name_result.stdout.trim() : null);

    // Delete /etc/hosts entry
    if (hostname !== null) {
        exec(`sudo hostile remove ${hostname}`, { silent: true });
    }

    // Delete Apache sites available configuration file
    exec(`sudo rm ${selected_apache_site_configuration_file_path}`);

    // Reload Apache
    reload_web_server('apache', true);

    log(yellow(`Apache site "${hostname}" deleted!`));
}

main();
