const InstallHelper = require('/vagrant/scripts/sites/classes/install_helper');
const { highlight_line, line_break } = require('/vagrant/scripts/utils/log');

class InstallScript extends InstallHelper {
    install() {
        super.install();

        // Download Laravel dependencies
        highlight_line('Download Laravel dependencies...');
        this.composer('global require laravel/installer');

        // Install Laravel library
        line_break();
        highlight_line('Install Laravel...');

        const tmp_lib_dir = '_laravel-lib';

        this.composer(`create-project laravel/laravel${this.pxl_config.laravel && this.pxl_config.laravel.version ? `=${this.pxl_config.laravel.version}` : ''} ${tmp_lib_dir} --prefer-dist`);

        if (!this.file_exists(tmp_lib_dir)) {
            console.log('Could not create Laravel project.');
            return;
        }

        this.delete('public/', true);
        this.move_files(tmp_lib_dir, this.site_dir, true);
        this.delete(`${tmp_lib_dir}/`, true);

        line_break();
        highlight_line('Update .env file...');

        this.go_to_dir(this.site_dir);

        this.edit_env('.env', {
            'APP_URL': `http://${this.pxl_config.hostname}:${process.env.APACHE_PORT_HTTP_OUT}`,
            'DB_USERNAME': process.env.MYSQL_USER_NAME,
            'DB_PASSWORD': process.env.MYSQL_USER_PASSWORD,
            'LOG_CHANNEL': 'single'
        });

        // Database
        if (this.pxl_config.database && this.pxl_config.database.name) {
            // Update .env file with database name
            this.edit_env_file('.env', 'DB_DATABASE', this.pxl_config.database.name);

            // Run database migration
            line_break();
            highlight_line('Run database migration...');

            this.php('artisan migrate:fresh --seed');
        }
    }
};

module.exports = InstallScript;
