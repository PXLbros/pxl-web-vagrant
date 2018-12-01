const { exec, mkdir, test } = require('shelljs');
const { readFileSync } = require('fs');
const { bold, green, red } = require('chalk');
const yaml = require('js-yaml');
const log = console.log;
const { remove_trailing_slash } = require('./str');

function get_pxl_config_file_path_from_dir(dir) {
    return `${dir}/.pxl/config.yaml`;
}

function validate_pxl_config(pxl_config) {
    if (typeof pxl_config.name !== 'string') {
        throw new Error('Missing or invalid "name".');
    }

    return true;
}

function pxl_config_exist(dir) {
    dir = remove_trailing_slash(dir);

    const config_dir = `${dir}/.pxl`;
    const config_file_path = get_pxl_config_file_path_from_dir(dir);

    if (!test('-d', config_dir)) {
        return false;
    }

    return test('-f', config_file_path);
}

function load_pxl_config(pxl_config_file_path) {
    try {
        const pxl_config = yaml.safeLoad(readFileSync(pxl_config_file_path, 'utf8'));

        validate_pxl_config(pxl_config);

        return pxl_config;
    } catch (e) {
        throw e;
    }
}

module.exports = {
    async create_pxl_config(name, dir, options = {
        default: 1
    }) {
        dir = remove_trailing_slash(dir);

        const config_dir = `${dir}/.pxl`;
        const config_file_path = `${config_dir}/config.yaml`;

        // Create configuration directory if not exist
        if (!test('-d', config_dir)) {
            mkdir('-p', config_dir);
        }

        // Check if configuration file already exist
        if (test('-d', config_file_path)) {
            throw new Error(`PXL Web Vagrant configuration file ${config_file_path} already exist.`);
        }

        // Create configuration file
        exec(`echo name: ${name} > ${config_file_path}`);
    },

    load_pxl_config_from_dir(dir) {
        if (!pxl_config_exist(dir)) {
            return null;
        }

        const pxl_config_file_path = get_pxl_config_file_path_from_dir(remove_trailing_slash(dir));
        const pxl_config = load_pxl_config(pxl_config_file_path);

        return pxl_config;
    },

    print_pxl_config(pxl_config) {
        validate_pxl_config(pxl_config);

        log(`${bold('Site Name:')} ${pxl_config.name}`);

        if (typeof pxl_config.network === 'object' && typeof pxl_config.network.hostname === 'string') {
            log(`${bold('Hostname:')} ${pxl_config.network.hostname}`);
        }

        if (typeof pxl_config['web-server'] === 'string') {
            log(`${bold('Web Server:')} ${pxl_config['web-server']}`);
        }

        if (typeof pxl_config['database'] === 'object') {
            log(`${bold('Database Driver:')} ${pxl_config['database'].driver}`);
            log(`${bold('Database Name:')} ${pxl_config['database'].name}`);
        }

        if (typeof pxl_config['code'] === 'object') {
            if (typeof pxl_config['code'].php === 'string') {
                log(`${bold('PHP:')} ${pxl_config['code'].php}`);
            }
        }
    }
};
