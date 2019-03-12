const InstallHelper = require('/vagrant/scripts/sites/classes/install_helper');
const { highlight_line, line_break } = require('/vagrant/scripts/utils/log');

class InstallScript extends InstallHelper {
    install() {
        super.install();

        // Download Slim Framework dependencies
        highlight_line('Download Slim Framework dependencies...');
        this.composer('global require slim/slim-skeleton');

        line_break();

        // Install Slim Framework library
        highlight_line('Install Slim Framework...');

        const tmp_lib_dir = '_slim-framework-lib';

        this.composer(`create-project slim/slim-skeleton ${tmp_lib_dir}`);

        if (!this.file_exists(tmp_lib_dir)) {
            console.log('Could not create Slim Framework project.');
            return;
        }

        this.delete('public/', true);
        this.move_files(`${this.site_dir}/${tmp_lib_dir}/`, `${this.site_dir}/`);
        this.delete(`${this.site_dir}/${tmp_lib_dir}/`, true);

        line_break();
    }
};

module.exports = InstallScript;
