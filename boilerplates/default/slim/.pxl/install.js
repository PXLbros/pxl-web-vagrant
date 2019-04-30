const InstallHelper = require('/vagrant/scripts/projects/classes/install_helper');
const { highlight_line, line_break } = require('/vagrant/scripts/utils/log');
const resolve = require('path').resolve;

class InstallScript extends InstallHelper {
    install() {
        super.install();

        // Download Slim Framework dependencies
        highlight_line('Download Slim Framework dependencies...');
        // this.composer('global require slim/slim-skeleton');
        this.composer('composer require slim/slim:4.0.0-alpha');
        this.composer('composer require slim/psr7:dev-master');

        line_break();

        // Install Slim Framework library
        highlight_line('Install Slim Framework...');

        const tmp_lib_dir = '_slim-framework-lib';

        if (this.exists(tmp_lib_dir)) {
            this.delete(tmp_lib_dir, true);
        }

        this.composer(`create-project slim/slim-skeleton ${tmp_lib_dir}`);

        const tmp_lib_dir_full = resolve(tmp_lib_dir);

        if (!this.file_exists(tmp_lib_dir_full)) {
            console.log('Could not create Slim Framework project.');
            return;
        }

        this.delete('public/', true);
        this.move_files(tmp_lib_dir_full, this.project_dir, true);
        this.delete(`${tmp_lib_dir_full}/`, true);

        line_break();
    }
};

module.exports = InstallScript;
