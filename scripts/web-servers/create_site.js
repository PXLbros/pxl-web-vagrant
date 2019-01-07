const commandLineArgs = require('command-line-args');
const { existsSync } = require('fs');
const { exec } = require('shelljs');
const { bold, yellow, red, cyan } = require('chalk');
const { ask_confirm, ask_input, ask_options, ask_php_version, ask_web_server } = require('../utils/ask');
const { enable_web_server_site, generate_virtual_host_config, get_config_filename, get_config_file_path, get_web_server_title, reload_web_server, save_virtual_host_config } = require('../utils/web_server.js');
const log = console.log;

const options = commandLineArgs([
    { name: 'web-server', type: String },
    { name: 'hostname', type: String },
    { name: 'public-dir', type: String },
    { name: 'git-repo', type: String },
    { name: 'php', type: String },
    { name: 'overwrite', type: Boolean, defaultOption: false }
]);

async function main() {
    const web_server = (options['web-server'] || await ask_web_server('What web server should be used?'));
    const web_server_title = get_web_server_title(web_server);

    const hostname = (options['hostname'] || await ask_input('What is the hostname? (e.g. domain.loc)'));
    const public_dir = (options['public-dir'] || await ask_input('What is the public directory?', `/vagrant/projects/${hostname}`));
    const php_version = (!options['php'] && await ask_confirm('Does the project use PHP?') ? await ask_php_version() : (options['php'] ? options['php'] : null));
    
    let git_repo = options['git-repo'];
    
    if (!git_repo) {
        if (await ask_confirm('Create project from existing Git repository?')) {
            git_repo = await ask_input('What is the Git SSH repository? (e.g. git@github.com:Organization/project-name.git)');
        }
    }

    let overwrite = options['overwrite'];

    const configuration_file_name = get_config_filename(web_server, hostname);
    const configuration_file_path = get_config_file_path(web_server, hostname);

    if (existsSync(configuration_file_path) && !overwrite) {
        if (!await ask_confirm(`${web_server_title} virtual host configuration file "${configuration_file_name}" already exist, do you want to overwrite it?`, false)) {
            return;
        }

        overwrite = true;
    }

    // Save virtual host configuration file
    save_virtual_host_config(configuration_file_path, web_server, hostname, public_dir, php_version);

    // Enable web server site
    enable_web_server_site(web_server, configuration_file_name);

    // Reload web server service
    reload_web_server(web_server);

    // Add /etc/hosts entry
    exec(`sudo hostile set 127.0.0.1 ${hostname}`, { silent: true });

    // Show success message
    log(yellow(`${web_server_title} site added!\n`));
    log(`${cyan(bold('Hostname:'))} ${hostname}`);
    log(`${cyan(bold('Public Directory:'))} ${public_dir}`);

    if (php_version) {
        log(`${cyan(bold('PHP Version:'))} ${php_version}`);
    }
}

main();
