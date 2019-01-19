const InstallHelper = require('/vagrant/scripts/sites/classes/install_helper');

class InstallScript extends InstallHelper {
    install() {
        super.install();

        this.composer('global require laravel/installer');
        
        this.composer('create-project laravel/laravel .laravel');

        if (!this.file_exists('.laravel')) {
            console.log('Could not create Laravel project.');
            return;
        }

        this.run('mv ./laravel/* ./*');

        this.composer('install');

        if (!this.file_exists('.env')) {
            this.copy_file('.env.example', '.env');

            console.log('COPIED FILE!');
        }

        this.edit_env_file('.env', 'DB_USERNAME=', process.env.MYSQL_USER_NAME);
        this.edit_env_file('.env', 'DB_PASSWORD=', process.env.MYSQL_USER_PASSWORD);

        this.yarn();
        this.yarn('dev');

        this.php('artisan migrate:fresh --seed');
    }
};

module.exports = InstallScript;
