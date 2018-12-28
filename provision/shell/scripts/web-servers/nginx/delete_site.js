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
        selected_nginx_site_configuration_file = options['hostname'];
    } else {
        selected_nginx_site_configuration_file = await choose_files_from_dir('/etc/nginx/sites-available', 'Which NGINX site do you want to delete?');
    }

    const selected_nginx_site_configuration_file_path = `/etc/nginx/sites-available/${selected_nginx_site_configuration_file}`;
    const selected_nginx_site_configuration_enabled_file_path = `/etc/nginx/sites-enabled/${selected_nginx_site_configuration_file}`;

    if (!existsSync(selected_nginx_site_configuration_file_path)) {
        log(red(`Could not find NGINX site configuration "${selected_nginx_site_configuration_file}".`));

        return;
    }

    if (!options['non-interactive'] && !await ask_confirm(`Are you sure you want to delete nginx site "${selected_nginx_site_configuration_file}"?`)) {
        return;
    }

    // Read hostname from nginx site configuration file
    const get_server_name_result = exec(`awk '/server_name/ {print $2}' ${selected_nginx_site_configuration_file_path}`, { silent: true })
    const hostname = (get_server_name_result.code === 0 && get_server_name_result.stdout ? get_server_name_result.stdout.trim().slice(0, -1) : null);

    // Delete /etc/hosts entry
    if (hostname !== null) {
        exec(`sudo hostile remove ${hostname}`, { silent: true });
    }

    // Delete nginx sites available configuration file
    exec(`sudo rm ${selected_nginx_site_configuration_enabled_file_path}`);
    exec(`sudo rm ${selected_nginx_site_configuration_file_path}`);
    exec('sudo service nginx restart', { silent: true });

    log(yellow(`NGINX site "${hostname}" deleted!`));
}

main();
