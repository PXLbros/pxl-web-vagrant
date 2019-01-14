const { existsSync } = require('fs');
const { cp, exec } = require('shelljs');

class InstallHelper
{
    constructor(pxl_config) {
        this.pxl_config = pxl_config;

        this.php_cli = `php${this.pxl_config.code.php}`;
    }

    install() {
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

    edit_file_line_pre(file, pre, value) {
        exec(`sed -i s~${pre}.*$~${pre}${value}~g ${file}`);
    }

    yarn(command = null) {
        exec(`yarn${command !== null ? ` ${command}` : ``}`);
    }
}

module.exports = InstallHelper;
