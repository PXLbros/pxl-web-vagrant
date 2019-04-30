const commandLineArgs = require('command-line-args');
const { existsSync } = require('fs');
const { ask_confirm } = require('../utils/ask');
const { choose_files_from_dir } = require('../utils/choose');
const { ask_web_server, enable_web_server_site, get_installed_web_servers, get_sites_config_dir, get_web_server_title, reload_web_server } = require('../utils/web_server.js');
const { error_line, highlight_line, figlet, line_break } = require('../utils/log');

const options = commandLineArgs([
    { name: 'web-server', type: String },
    { name: 'hostname', type: String },
    { name: 'site-dir', type: String },
    { name: 'reload', type: Boolean }
]);

async function main() {
    figlet('edit site conf');
    line_break();

    let reload = (options['reload'] || false);

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
        selected_site_configuration_file = await choose_files_from_dir(web_server_sites_conf_dir, `Which ${web_server_title} site do you want to enable?`);
    }

    const selected_site_configuration_file_path = `${web_server_sites_conf_dir}/${selected_site_configuration_file}`;

    if (!existsSync(selected_site_configuration_file_path)) {
        error_line(`Could not find ${web_server_title} site configuration "${selected_site_configuration_file}".`);

        return;
    }

    try {
        enable_web_server_site(web_server, selected_site_configuration_file);

        highlight_line(`${web_server_title} site ${selected_site_configuration_file} has been enabled.`);

        if (!reload) {
            if (await ask_confirm(`Do you want to reload ${web_server_title} for changes to take affect?`)) {
                reload = true;
            }
        }
        
        if (reload) {
            reload_web_server(web_server);
        }
    } catch (error) {
        error_line(error.message);
    }
}

main();
