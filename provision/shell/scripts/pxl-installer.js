const { blue, red } = require('chalk');
const { existsSync } = require('fs');
const { exec } = require('shelljs');
const pxl = require('./utils/pxl');
const log = console.log;

module.exports = {
    init(pxl_config_file_path = null) {
        try {
            if (!pxl_config_file_path) {
                pxl_config_file_path = `${process.pwd}/.pxl/config.yaml`;
            }

            if (!existsSync(pxl_config_file_path)) {
                throw new Error(`Could not find PXL Web Vagrant confiuration file "${pxl_config_file_path}".`);
            }

            const pxl_config = pxl.load_pxl_config(pxl_config_file_path);

            log(blue(`Starting installing "${pxl_config.name}"...`));

            if (typeof pxl_config.hostname === 'string') {
                exec(`sudo hostile set 127.0.0.1 ${pxl_config.hostname}`);

                // Install web server site
                if (typeof pxl_config['web-server'] === 'string') {
                    const public_dir = (pxl_config.dir + '/' + (typeof pxl_config['public-dir'] === 'string' ? pxl_config['public-dir'] : ''));
                    const php_version = (typeof pxl_config.code === 'object' && pxl_config.code.php ? pxl_config.code.php : null);

                    exec(`node /vagrant/provision/shell/scripts/create_${pxl_config['web-server']}_site.js --hostname=${pxl_config.hostname} --public-dir=${public_dir}${php_version ? ` --php=${php_version}` : ''}`);
                }

                // Create database
                if (typeof pxl_config.database === 'object') {
                    exec(`node /vagrant/provision/shell/scripts/create_database.js --driver=${pxl_config.database.driver} --name=${pxl_config.database.name}`);
                }
            }
        } catch (error) {
            log(red(error));
        }
    },

    install() {
    }
};
