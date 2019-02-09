const commandLineArgs = require('command-line-args');
const { get_current_dir } = require('../utils/file');
const { ask_input, ask_confirm } = require('../utils/ask');
const { yellow } = require('chalk');
const { run_install_script_from_pxl_config, load_pxl_config_from_dir, print_pxl_config } = require('../utils/pxl');
const { error_line, line_break, title_line } = require('../utils/log');
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

        let hostname;

        if (options['hostname']) {
            hostname = options['hostname'];
        } else if (pxl_config.hostname) {
            hostname = pxl_config.hostname;
        } else {
            hostname = await ask_input('What is the hostname? (e.g. domain.loc)');
        }

        pxl_config.hostname = hostname;

        const web_server = 'apache';
        pxl_config['web-server'] = (web_server || 'nginx');

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

        line_break();

        log(yellow('Site installed!'));
        title_line('Hostname', hostname);
        line_break();
    } catch (load_pxl_config_error) {
        error_line(load_pxl_config_error.message);
    }
}

main();
