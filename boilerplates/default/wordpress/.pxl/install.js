const InstallHelper = require('/vagrant/scripts/sites/classes/install_helper');
const { highlight_line, line_break } = require('/vagrant/scripts/utils/log');

class InstallScript extends InstallHelper {
    install() {
        super.install();

        // Download WordPress
        highlight_line('Download WordPress...');
        this.run('wget https://wordpress.org/latest.tar.gz');
        this.run('tar xf latest.tar.gz --strip-components=1');
        this.run('rm latest.tar.gz');
    }
};

module.exports = InstallScript;
