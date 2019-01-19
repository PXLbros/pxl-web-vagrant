const InstallHelper = require('/vagrant/scripts/sites/classes/install_helper');
const { highlight_line, line_break } = require('/vagrant/scripts/utils/log');

class InstallScript extends InstallHelper {
    install() {
        super.install();

        // Go to public directory
        this.cd(this.pxl_config['public-site-dir']);

        // Download WordPress
        highlight_line('Download WordPress...');
        this.run('wget https://wordpress.org/latest.tar.gz');
        this.run('tar xf latest.tar.gz --strip-components=1');
        this.run('rm latest.tar.gz');

        this.copy_file('wp-config-sample.php', 'wp-config.php');
        this.replace_env_file('wp-config.php', '$WP_DB_NAME', this.pxl_config.database.name);
        this.replace_env_file('wp-config.php', '$WP_DB_USERNAME', process.env.MYSQL_USER_NAME);
        this.replace_env_file('wp-config.php', '$WP_DB_PASSWORD', process.env.MYSQL_USER_PASSWORD);
        this.run(`echo "define('FS_METHOD', 'direct');" >> wp-config.php`);

        // this.run(`sudo chown -R vagrant:vagrant ${this.pxl_config['public-site-dir']}`);

        this.run(`curl "http://${this.pxl_config.hostname}:${process.env.APACHE_PORT}/wp-admin/install.php?step=2" \
    --data-urlencode "weblog_title=${this.pxl_config.hostname}"\
    --data-urlencode "user_name=admin" \
    --data-urlencode "admin_email=admin@admin.com" \
    --data-urlencode "admin_password=admin" \
    --data-urlencode "admin_password2=admin" \
    --data-urlencode "pw_weak=1"`);
    }
};

module.exports = InstallScript;
