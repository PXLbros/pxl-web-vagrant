const InstallHelper = require('/vagrant/scripts/sites/classes/install_helper');
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

        const pre_site_dir = remove_last_directory(this.site_dir);

        this.run(`mkdir -p ${pre_site_dir}`);
        this.go_to_dir(pre_site_dir);
        this.run(`vue create ${this.site_dir_name} -f -b --default`); // -i '{"useConfigFiles": true}'

        // Build
        // this.yarn('build');

        line_break();
    }
};

module.exports = InstallScript;
