const InstallHelper = require('/vagrant/scripts/sites/classes/install_helper');
const { highlight_line, line_break } = require('/vagrant/scripts/utils/log');

class InstallScript extends InstallHelper {
    install() {
        super.install('Laravel');

        // Download Laravel dependencies
        highlight_line('Download Laravel dependencies...');
        this.composer('global require laravel/installer');

        // Install Laravel library
        line_break();
        highlight_line('Install Laravel library...');

        const tmp_lib_dir = '_laravel-lib';

        this.composer(`create-project laravel/laravel${this.pxl_config.laravel && this.pxl_config.laravel.version ? `=${this.pxl_config.laravel.version}` : ''} ${tmp_lib_dir} --prefer-dist`);

        if (!this.file_exists(tmp_lib_dir)) {
            console.log('Could not create Laravel project.');
            return;
        }

        this.move_files(`${this.site_dir}/${tmp_lib_dir}/`, `${this.site_dir}/`);
        this.run(`rm -rf ${this.site_dir}/${tmp_lib_dir}/`);

        // Run composer
        // line_break();
        // highlight_line('Install Composer...');
        // this.composer('install');

        // if (!this.file_exists('.env')) {
        //     this.copy_file('.env.example', '.env');
        // }

        // Update .env file
        line_break();
        highlight_line('Update .env file...');

        this.edit_env_file('.env', 'DB_USERNAME=', process.env.MYSQL_USER_NAME);
        this.edit_env_file('.env', 'DB_PASSWORD=', process.env.MYSQL_USER_PASSWORD);

        // Install Yarn dependencies
        line_break();
        highlight_line('Install Yarn dependencies...');
        this.yarn();

        // Run Yarn dev
        line_break();
        highlight_line('Run Yarn...');
        this.yarn('dev');

        // Run database migration
        if (this.pxl_config.database) {
            line_break();
            highlight_line('Run database migration...');

            this.php('artisan migrate:fresh --seed');
        }
    }
};

module.exports = InstallScript;
