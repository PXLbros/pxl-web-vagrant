// https://blog.bvzzdesign.com/2018/05/19/installing-wordpress-4-9-6-to-ubuntu-18-04-lts-with-nginx-mysql-and-php-7-2-and-setting-ssl-for-https-connections-with-letsencrypt/

const commandLineArgs = require('command-line-args');
const { cd, exec, mv, rm } = require('shelljs');
const { ask_input } = require('../../../../utils/ask');

module.exports = {
    async install() {
        const options = commandLineArgs([
            { name: 'project-dir', type: String },
            { name: 'hostname', type: String },
            { name: 'database', type: String },
            { name: 'admin-username', type: String },
            { name: 'admin-password', type: String },
            { name: 'admin-email', type: String }
        ]);

        const project_dir = (options['project-dir']);
        const database = (options['database'] || await ask_input('What should be the database name?'));

        exec(`mkdir -p ${project_dir}`);

        exec('wget https://wordpress.org/latest.tar.gz');
        exec('tar xf latest.tar.gz --strip-components=1');
        rm('latest.tar.gz');

        mv('wp-config-sample.php', 'wp-config.php');
        exec(`sed -i s/${database}/$WP_DB_NAME/ wp-config.php`);
        exec(`sed -i s/${process.env.MYSQL_USERNAME}/DATABASE_USER/ wp-config.php`);
        exec(`sed -i s/${process.env.MYSQL_PASSWORD}/DATABASE_PASSWORD/ wp-config.php`);
        exec(`echo "define('FS_METHOD', 'direct');" >> wp-config.php`);

        // exec(`curl "http://${hostname}:7005/wp-admin/install.php?step=2" \
        //     --data-urlencode "weblog_title=$WP_DOMAIN"\
        //     --data-urlencode "user_name${admin_username}" \
        //     --data-urlencode "admin_email=${admin_email}" \
        //     --data-urlencode "admin_password=${admin_password}" \
        //     --data-urlencode "admin_password2=${admin_password}" \
        //     --data-urlencode "pw_weak=1"`);
    }
}
