const commandLineArgs = require('command-line-args');
const { exec } = require('shelljs');
const { get_current_dir } = require('../utils/file');
const { ask_input, ask_confirm } = require('../utils/ask');
const { yellow } = require('chalk');
const { run_install_script_from_pxl_config, load_pxl_config_from_dir, print_pxl_config } = require('../utils/pxl');
const { get_config_filename, enable_web_server_site, get_config_file_path, reload_web_server, save_virtual_host_config } = require('../utils/web_server');
const { error_line, line_break, success_line, title_line } = require('../utils/log');
const log = console.log;

const options = commandLineArgs([
    { name: 'site-dir', type: String },
    { name: 'force', type: Boolean }
]);

async function main() {
    const force = (options['force'] || false);

    try {
        let pxl_config;
        
        // Try load from arguments
        if (options['site-dir']) {
            pxl_config = load_pxl_config_from_dir(`${options['site-dir']}/.pxl`);

            if (!pxl_config) {
                throw new Error('Could not find PXL Web Vagrant configuration file.');
            }
        }

        // Try load from current directory
        const current_dir = get_current_dir();

        if (!pxl_config) {
            pxl_config = load_pxl_config_from_dir(`${current_dir}/.pxl`);
        }

        if (!pxl_config) {
            pxl_config = load_pxl_config_from_dir(current_dir);
        }

        if (!pxl_config) {
            let site_dir = await ask_input('What is the site directory?', get_current_dir());

            pxl_config = load_pxl_config_from_dir(`${site_dir}/.pxl`);
        }

        if (!pxl_config) {
            throw new Error('Could not find PXL Web Vagrant configuration file.');
        }

        line_break();

        log(yellow('Found PXL Web Vagrant configuration:'));

        print_pxl_config(pxl_config);

        line_break();

        let do_install;

        if (force) {
            do_install = true;
        } else {
            do_install = await ask_confirm(`Do you want to install?`);

            if (!do_install) {
                return;
            }
        }

        if (do_install) {
            run_install_script_from_pxl_config(pxl_config);
        }

        // Install apache if hostname is specified in pxl config
        if (pxl_config['hostname']) {
            const configuration_file_name = get_config_filename('apache', pxl_config['hostname']);
            const configuration_file_path = get_config_file_path('apache', configuration_file_name);

            save_virtual_host_config(configuration_file_path, 'apache', pxl_config['hostname'], pxl_config['public-dir'], pxl_config['php'] || null, true);

            try {
                // Enable web server site
                enable_web_server_site('apache', configuration_file_name);

                // Reload web server service
                reload_web_server('apache');
            } catch (web_server_site_error) {
                error_line(web_server_site_error.message);
            }

            // Add /etc/hosts entry
            const add_etc_hosts_entry_result = exec(`sudo hostile set 127.0.0.1 ${pxl_config['hostname']}`, {
                silent: true
            });

            if (add_etc_hosts_entry_result.code === 0) {
                success_line(`Added ${pxl_config['hostname']} /etc/hosts entry.`);
            } else {
                console.log(add_etc_hosts_entry_result);

                error_line(`Could not add ${pxl_config['hostname']} /etc/hosts entry. (${add_etc_hosts_entry_result.stderr})`);
            }
        }

        line_break();

        log(yellow('Site installed!'));

        if (pxl_config['hostname']) {
            title_line('Hostname', pxl_config['hostname']);
        }

        line_break();
    } catch (load_pxl_config_error) {
        error_line(load_pxl_config_error.message);
    }
}

main();
