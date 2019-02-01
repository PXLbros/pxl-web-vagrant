const InstallHelper = require('/vagrant/scripts/sites/classes/install_helper');
const { remove_last_directory } = require('/vagrant/scripts/utils/str');
const { highlight_line, line_break } = require('/vagrant/scripts/utils/log');

class InstallScript extends InstallHelper {
    install() {
        super.install();

        // Download Ember CLI
        highlight_line('Install Ember CLI...');
        this.run(`npm i -g ember-cli`);

        // Create Ember project
        highlight_line('\nCreate Ember project...');
        // this.run(`ember new --no-welcome --yarn`);

        const pre_site_dir = remove_last_directory(this.site_dir);
        // this.run(`mkdir -p ${pre_site_dir}`);
        // this.go_to_dir(pre_site_dir);

        console.log(`cd ${pre_site_dir} && pwd && ember new --dir=${this.site_dir} --no-welcome --yarn`);
        
        this.run(`cd ${pre_site_dir} && pwd && ember new --dir=${this.site_dir} --no-welcome --yarn`);

        // Build
        // this.yarn('build');

        line_break();
    }
};

module.exports = InstallScript;
