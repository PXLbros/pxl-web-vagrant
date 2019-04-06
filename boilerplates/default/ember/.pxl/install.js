const InstallHelper = require('/vagrant/scripts/projects/classes/install_helper');
const { remove_last_directory } = require('/vagrant/scripts/utils/str');
const { highlight_line, line_break } = require('/vagrant/scripts/utils/log');

class InstallScript extends InstallHelper {
    install() {
        super.install();

        // Download Ember CLI
        highlight_line('Install Ember CLI...');
        this.run(`npm i -g ember-cli`);

        // Create Ember project
        highlight_line('\nCreate Ember.js project...');

        const pre_project_dir = remove_last_directory(this.project_dir);
        
        this.run(`cd ${pre_project_dir} && pwd && ember new --dir=${this.project_dir} --no-welcome --yarn`);

        this.go_to_dir(this.project_dir);

        // Build
        this.run('ember build');
    }
};

module.exports = InstallScript;
