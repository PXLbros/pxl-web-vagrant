const commandLineArgs = require('command-line-args');
const { get_current_dir } = require('../utils/file');
const { ask_input, ask_confirm } = require('../utils/ask');
const { yellow } = require('chalk');
const { load_pxl_config_from_dir, print_pxl_config } = require('../utils/pxl');
const { error_line, line_break } = require('../utils/log');
const { create: create_database } = require('../utils/database');
const log = console.log;

const options = commandLineArgs([
    { name: 'site-dir', type: String }
]);

async function main() {
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

        const ask_pxl_config = (await ask_confirm(`Do you want to install?`));

        if (ask_pxl_config) {
            if (pxl_config.database) {
                try {
                    create_database(pxl_config.database.driver, pxl_config.database.name);
            
                    log(yellow(`Database "${database.name}" has been created!`));
                } catch (create_database_error) {
                    error_line(create_database_error.message);
                }
            }
        }
    } catch (load_pxl_config_error) {
        error_line(load_pxl_config_error.message);
    }
}

main();
