const { existsSync } = require('fs');
const { cd, cp, exec } = require('shelljs');

class InstallHelper
{
    constructor(pxl_config) {
        this.pxl_config = pxl_config;

        this.php_cli = `php${this.pxl_config.code.php}`;
    }

    install() {
        // Go to site directory before installing
        cd(this.pxl_config['site-dir']);
    }

    php(command) {
        exec(`${this.php_cli} ${command}`);
    }

    composer(command) {
        this.php(`/usr/local/bin/composer ${command}`);
    }

    file_exists(path) {
        return existsSync(path);
    }

    copy_file(from, to) {
        cp(from, to);
    }

    edit_env_file(file, key, value) {
        exec(`sed -i s~${key}.*$~${key}${value}~g ${file}`);
    }

    yarn(command = null) {
        exec(`yarn${command !== null ? ` ${command}` : ``}`);
    }
}

module.exports = InstallHelper;
