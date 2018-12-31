const { writeFileSync } = require('fs');
const { exec } = require('shelljs');

function get_config_dir(web_server) {
    if (web_server === 'apache') {
        return '/etc/apache2/sites-available';
    } else if (web_server === 'nginx') {
        return '/etc/nginx/sites-available';
    }

    throw new Error(`Invalid web server "${web_server}".`);
}

module.exports = {
    get_installed_web_servers() {
        const is_apache_installed = (exec('apachectl -v', { silent: true }).code === 0);
        const is_nginx_installed = (exec('which nginx -v', { silent: true }).code === 0);

        let web_servers = [];

        if (is_apache_installed) {
            web_servers.push('Apache');
        }

        if (is_nginx_installed) {
            web_servers.push('NGINX');
        }

        return web_servers;
    },

    get_config_filename(web_server, hostname) {
        if (web_server === 'apache') {
            return hostname;
        } else if (web_server === 'nginx') {
            return `${hostname}.conf`;
        }

        throw new Error(`Invalid web server "${web_server}".`);
    },

    get_config_dir,

    get_config_filepath(web_server, config_filename) {
        return `${get_config_dir(web_server)}/${config_filename}`;
    },

    get_web_server_title(web_server) {
        if (web_server === 'apache') {
            return 'Apache';
        } else if (web_server === 'nginx') {
            return 'NGINX';
        }

        throw new Error(`Invalid web server "${web_server}".`);
    },

    save_virtual_host_config(file_path, web_server, hostname, public_dir, php_version = null) {
        let contents;

        if (web_server === 'apache') {
            contents = `<VirtualHost *:${process.env.APACHE_PORT}>
    ServerName ${hostname}
    DocumentRoot ${public_dir}

    <Directory />
        Options Indexes FollowSymLinks MultiViews
        AllowOverride All
        Require all granted
    </Directory>

    LogLevel error
    ErrorLog /var/log/apache2/${hostname}-error.log
    CustomLog /var/log/apache2/${hostname}-access.log combined`;

            contents += (php_version !== null ? `\n\n    Include /etc/apache2/conf-available/php${php_version}-fpm.conf\n` : `\n`);
            contents += `</VirtualHost>`;

            contents += '\n\n# vim: syntax=apache';
        } else if (web_server === 'nginx') {
            contents = `server {
    listen ${process.env.NGINX_PORT};
    root ${public_dir};
    index index.php;
    server_name ${hostname};

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }`;

            if (php_version !== null) {
                contents += `\n\n\tlocation ~ \.php$ {
        include snippets/fastcgi-php.conf;

        fastcgi_pass unix:/var/run/php/php${php_version}-fpm.sock;
    }`;
            }

            contents += '\n}';
        }

        // Save file
        writeFileSync(file_path, contents);
    },

    enable_web_server_site(web_server, config_filename) {
        if (web_server === 'apache') {
            exec(`sudo a2ensite ${config_filename}`, { silent: true });
        } else if (web_server === 'nginx') {
            exec(`sudo ln -s ${get_config_dir('nginx', config_filename)} /etc/nginx/sites-enabled/`, { silent: true });
        } else {
            throw new Error(`Invalid web server "${web_server}".`);
        }
    },

    reload_web_server(web_server) {
        if (web_server === 'apache') {
            exec(`sudo service apache2 reload`, { silent: true });
        } else if (web_server === 'nginx') {
            exec(`sudo service nginx reload`, { silent: true });
        } else {
            throw new Error(`Invalid web server "${web_server}".`);
        }
    }
};
