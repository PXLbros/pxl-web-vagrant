const InstallHelper = require('/vagrant/scripts/sites/classes/install_helper');
const { get_last_directory, remove_last_directory } = require('/vagrant/scripts/utils/str');
const { highlight_line, line_break } = require('/vagrant/scripts/utils/log');

class InstallScript extends InstallHelper {
    install() {
        super.install();

        // Download Ember CLI
        highlight_line('Install Ember CLI...');
        this.run(`npm i -g ember-cli`);

        // Create Ember project
        highlight_line('\nCreate Ember Octane project...');

        const project_name = get_last_directory(this.site_dir);
        
        this.run(`ember new ${project_name} --dir=${this.site_dir} --no-welcome --yarn -b @ember/octane-app-blueprint`);

        this.go_to_dir(this.site_dir);

        // Build
        this.run('ember build');
    }
};

module.exports = InstallScript;
