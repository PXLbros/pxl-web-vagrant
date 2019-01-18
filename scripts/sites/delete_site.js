const commandLineArgs = require('command-line-args');
const { existsSync } = require('fs');
const { exec } = require('shelljs');
const { yellow } = require('chalk');
const { ask_confirm } = require('../utils/ask');
const { choose_files_from_dir } = require('../utils/choose');
const { error_line, line_break } = require('../utils/log');
const { load_pxl_config_from_dir } = require('../utils/pxl');
const { get_web_server_title, get_installed_web_servers, get_sites_config_dir } = require('../utils/web_server');
const log = console.log;

const options = commandLineArgs([
    { name: 'web-server', type: String },
    { name: 'hostname', type: String },
    { name: 'site-dir', type: String },
    { name: 'non-interactive', type: Boolean, defaultOption: false }
]);

async function main() {
    exec('figlet delete site');
    line_break();

    const installed_web_servers = get_installed_web_servers();
    
    let web_server = options['web-server'];
    
    if (!web_server) {
        if (installed_web_servers.length === 1) {
            web_server = installed_web_servers[0].value;
        } else {
            web_server = await ask_web_server('What web server should be used?');
        }
    }

    const web_server_title = get_web_server_title(web_server);
    const web_server_sites_conf_dir = get_sites_config_dir(web_server);

    let selected_site_configuration_file;

    if (options['hostname']) {
        selected_site_configuration_file = `${options['hostname']}.conf`;
    } else {
        selected_site_configuration_file = await choose_files_from_dir(web_server_sites_conf_dir, `Which ${web_server_title} site do you want to delete?`);
    }

    const selected_site_configuration_file_path = `${web_server_sites_conf_dir}/${selected_site_configuration_file}`;

    if (!existsSync(selected_site_configuration_file_path)) {
        error_line(`Could not find ${web_server_title} site configuration "${selected_site_configuration_file}".`);

        return;
    }

    if (!options['non-interactive'] && !await ask_confirm(`Are you sure you want to delete ${web_server_title} site "${selected_site_configuration_file}"?`)) {
        return;
    }

    // Read hostname from site configuration file
    let hostname;

    if (web_server === 'apache') {
        // Disable Apache site
        exec(`sudo a2dissite ${selected_site_configuration_file}`, { silent: true });

        const get_server_name_result = exec(`awk '/ServerName/ {print $2}' ${selected_site_configuration_file_path}`, { silent: true })
        hostname = (get_server_name_result.code === 0 && get_server_name_result.stdout ? get_server_name_result.stdout.trim() : null);
    } else if (web_server === 'nginx') {
        const get_server_name_result = exec(`awk '/server_name/ {print $2}' ${selected_nginx_site_configuration_file_path}`, { silent: true })
        hostname = (get_server_name_result.code === 0 && get_server_name_result.stdout ? get_server_name_result.stdout.trim().slice(0, -1) : null);

        // exec(`sudo rm ${selected_nginx_site_configuration_enabled_file_path}`);
    }

    const site_dir = (options['site-dir'] || await ask_input('Enter site directory:', `/vagrant/projects/${hostname}`));

    // Check if PXL Web Vagrant configuration in site dir
    try {
        pxl_config = load_pxl_config_from_dir(`${site_dir}/.pxl`);

        if (pxl_config) {
            if (pxl_config.code && pxl_config.code.php) {
                php_version = pxl_config.code.php;
            }

            if (pxl_config.database) {
                database_driver = pxl_config.database.driver;
                database_name = pxl_config.database.name;
            }

            public_dir = pxl_config['public-site-dir'];

            line_break();

            log(yellow('Found PXL Web Vagrant configuration:'));

            print_pxl_config(pxl_config);

            line_break();

            if (force || (!force && await ask_confirm(`Do you want to install?`))) {
                install_from_pxl_config(pxl_config); // TODO: Instead of doing this, just get variables instead and run commands below?
            }
        }
    } catch (load_pxl_config_error) {
        error_line(load_pxl_config_error);
    }

    // Delete sites available configuration file
    exec(`sudo rm ${selected_site_configuration_file_path}`);

    // Delete /etc/hosts entry
    if (hostname !== null) {
        exec(`sudo hostile remove ${hostname}`, { silent: true });
    }

    // Restart
    exec('sudo service apache2 reload', { silent: true });
    exec('sudo service nginx restart', { silent: true });

    log(yellow(`${web_server_title} site "${hostname}" deleted!`));
}

main();
