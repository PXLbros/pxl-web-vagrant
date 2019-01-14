const { exec } = require('shelljs');

class InstallHelper
{
    constructor(pxl_config) {
        this.pxl_config = pxl_config;
    }

    install() {
    }

    composer(command) {
        exec(`php${this.pxl_config.code.php} /usr/local/bin/composer ${command}`);
    }
}

module.exports = InstallHelper;
