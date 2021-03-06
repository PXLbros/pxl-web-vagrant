const InstallHelper = require('/vagrant/scripts/projects/classes/install_helper');
const { get_last_directory } = require('/vagrant/scripts/utils/str');
const { highlight_line } = require('/vagrant/scripts/utils/log');

class InstallScript extends InstallHelper {
    install() {
        super.install();

        // Download Ember CLI
        highlight_line('Install Ember CLI...');
        this.run(`npm i -g ember-cli`);

        // Create Ember project
        highlight_line('\nCreate Ember.js Octane project...');

        const project_name = get_last_directory(this.root_dir);
        
        this.run(`ember new ${project_name} --dir=${this.root_dir} --no-welcome --yarn -b @ember/octane-app-blueprint`);

        this.go_to_dir(this.root_dir);

        // Update .editorconfig file
        this.edit_env('.editorconfig', {
            'indent_size': 4
        }, 'dotenv');

        // Build
        this.run('ember build');
    }
};

module.exports = InstallScript;
