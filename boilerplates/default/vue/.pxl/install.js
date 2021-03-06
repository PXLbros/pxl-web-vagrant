const InstallHelper = require('/vagrant/scripts/projects/classes/install_helper');
const { remove_last_directory } = require('/vagrant/scripts/utils/str');
const { highlight_line, line_break } = require('/vagrant/scripts/utils/log');

class InstallScript extends InstallHelper {
    install() {
        super.install();

        // Download Vue CLI
        highlight_line('Install Vue CLI...');
        this.run(`npm install -g @vue/cli`);

        // Create Vue project
        highlight_line('Create Vue project...');

        const pre_project_dir = remove_last_directory(this.project_dir);

        this.run(`mkdir -p ${pre_project_dir}`);
        this.go_to_dir(pre_project_dir);
        this.run(`vue create ${this.project_dir_name} -f -b --default`); // -i '{"useConfigFiles": true}'

        // Build
        // this.yarn('build');

        line_break();

        if (this.pxl_config.hostname) {
            this.run('vue build');
        }
    }
};

module.exports = InstallScript;
