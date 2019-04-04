const { existsSync, writeFileSync } = require('fs');
const { exec } = require('shelljs');
const { choose } = require('./choose');
const { get_filename_from_path, remove_trailing_slash } = require('./str');
const { choose_files_from_dir } = require('./choose');
const { blue_line, cyan_line, success_line } = require('./log');

function get_public_directories() {
    return ['public', 'public_html', 'html', 'dist'];
}

function get_sites_config_dir(web_server) {
    if (web_server === 'apache') {
        return '/etc/apache2/sites-available';
    } else if (web_server === 'nginx') {
        return '/etc/nginx/sites-available';
    }

    throw new Error(`Invalid web server "${web_server}".`);
}

function get_config_file_path(web_server, config_filename) {
    return `${get_sites_config_dir(web_server)}/${config_filename}`;
}

function get_web_server_title(web_server) {
    if (web_server === 'apache') {
        return 'Apache';
    } else if (web_server === 'nginx') {
        return 'NGINX';
    }

    throw new Error(`Invalid web server "${web_server}".`);
}

function get_installed_web_servers() {
    const is_apache_installed = (exec('apachectl -v', { silent: true }).code === 0);
    const is_nginx_installed = (exec('which nginx', { silent: true }).code === 0);

    let web_servers = [];

    if (is_apache_installed) {
        web_servers.push({
            value: 'apache',
            name: 'Apache'
        });
    }

    if (is_nginx_installed) {
        web_servers.push({
            value: 'nginx',
            name: 'NGINX'
        });
    }

    return web_servers;
}

module.exports = {
    get_installed_web_servers,

    get_config_filename(web_server, hostname) {
        if (web_server === 'apache') {
            return `${hostname}.conf`;
        } else if (web_server === 'nginx') {
            return hostname;
        }

        throw new Error(`Invalid web server "${web_server}".`);
    },

    get_sites_config_dir,

    get_config_file_path,

    get_web_server_title,

    save_virtual_host_config(file_path, web_server, hostname, public_dir, php_version = null, overwrite = false) {
        const config_filename = get_filename_from_path(file_path);

        // blue_line(`Create ${get_web_server_title(web_server)} site configuration file ${config_filename}.`);

        let contents;

        let config_to_delete_path;


        if (web_server === 'apache') {
            contents = `<VirtualHost *:${process.env.APACHE_PORT_HTTP}>
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

            // contents += (php_version !== null ? `\n\n    Include /etc/apache2/conf-available/php${php_version}-fpm.conf\n` : `\n`);

            if (php_version !== null) {
                contents += `\n\n    <FilesMatch .php$>
        SetHandler "proxy:unix:/var/run/php/php${php_version}-fpm.sock|fcgi://localhost/"
    </FilesMatch>`;
            }

            contents += `\n</VirtualHost>`;

            // HTTPS
            contents += `\n\n<VirtualHost *:${process.env.APACHE_PORT_HTTPS}>
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

            if (php_version !== null) {
                contents += `\n\n    <FilesMatch .php$>
        SetHandler "proxy:unix:/var/run/php/php${php_version}-fpm.sock|fcgi://localhost/"
    </FilesMatch>`;
            }

    contents += `\n
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/apache-selfsigned.crt
    SSLCertificateKeyFile /etc/ssl/private/apache-selfsigned.key

    <FilesMatch ".(cgi|shtml|phtml|php)$">
        SSLOptions +StdEnvVars
    </FilesMatch>
    
    <Directory /usr/lib/cgi-bin>
        SSLOptions +StdEnvVars
    </Directory>
</VirtualHost>`;

            contents += '\n\n# vim: syntax=apache';

            if (overwrite) {
                config_to_delete_path = file_path;

                if (existsSync(config_to_delete_path)) {
                    exec(`sudo a2dissite ${config_filename}`, { silent: true });
                }
            }
        } else if (web_server === 'nginx') {
            contents = `server {
    listen ${process.env.NGINX_PORT_HTTP};
    root ${public_dir};
    index index.php;
    server_name ${hostname};

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }`;

            if (php_version !== null) {
                contents += `\n\n\tlocation ~ .php$ {
        include snippets/fastcgi-php.conf;

        fastcgi_pass unix:/var/run/php/php${php_version}-fpm.sock;
    }`;
            }

            contents += '\n}';

            if (overwrite) {
                config_to_delete_path = `/etc/nginx/sites-enabled/${config_filename}`;
            }
        }

        if (overwrite && existsSync(config_to_delete_path)) {
            exec(`sudo rm ${config_to_delete_path}`, { silent: true });
        }

        // Save file
        writeFileSync(file_path, contents);

        success_line(`Created ${get_web_server_title(web_server)} site configuration file ${config_filename}.`);
    },

    enable_web_server_site(web_server, config_filename, silent = false) {
        let enable_result;

        if (web_server === 'apache') {
            enable_result = exec(`sudo a2dissite ${config_filename}`, { silent: true });
            enable_result = exec(`sudo a2ensite ${config_filename}`, { silent: true });
        } else if (web_server === 'nginx') {
            enable_result = exec(`sudo ln -s ${get_config_file_path('nginx', config_filename)} /etc/nginx/sites-enabled/`, { silent: true });
        } else {
            throw new Error(`Invalid web server "${web_server}".`);
        }

        if (enable_result.stdout === `Site ${config_filename.substr(0, config_filename.length - 5)} already enabled\n`) {
            throw new Error(`${get_web_server_title(web_server)} site ${config_filename} already enabled.`);
        } else if (enable_result.code !== 0) {
            console.log(enable_result.stderr);

            throw new Error(`Could not enable ${get_web_server_title(web_server)} site ${config_filename}.`);
        }

        if (!silent) {
            success_line(`Enabled ${get_web_server_title(web_server)} ${config_filename} site.`);
        }

        return true;
    },

    disable_web_server_site(web_server, config_filename, silent = false) {
        let disable_result;

        if (web_server === 'apache') {
            disable_result = exec(`sudo a2dissite ${config_filename}`, { silent: true });
        } else if (web_server === 'nginx') {
            // TODO: ...
        } else {
            throw new Error(`Invalid web server "${web_server}".`);
        }

        if (disable_result.stdout === `Site ${config_filename.substr(0, config_filename.length - 5)} already disabled\n`) {
            throw new Error(`${get_web_server_title(web_server)} site ${config_filename} already disabled.`);
        } else if (disable_result.code !== 0) {
            throw new Error(`Could not enable ${get_web_server_title(web_server)} site ${config_filename}.`);
        }

        if (!silent) {
            blue_line(`Disabled ${get_web_server_title(web_server)} ${config_filename} site.`);
        }

        return true;
    },

    reload_web_server(web_server, silent = false) {
        let reload_result;

        if (web_server === 'apache') {
            reload_result = exec(`sudo service apache2 reload`, { silent: true });
        } else if (web_server === 'nginx') {
            reload_result = exec(`sudo service nginx reload`, { silent: true });
        } else {
            throw new Error(`Invalid web server "${web_server}".`);
        }

        if (reload_result.code !== 0) {
            throw new Error(reload_result.stderr);
        }

        if (!silent) {
            cyan_line(`Reloaded ${get_web_server_title(web_server)}.`);
        }

        return true;
    },

    restart_web_server(web_server, silent = false) {
        let restart_result;

        if (web_server === 'apache') {
            restart_result = exec(`sudo service apache2 restart`, { silent: true });
        } else if (web_server === 'nginx') {
            restart_result = exec(`sudo service nginx restart`, { silent: true });
        } else {
            throw new Error(`Invalid web server "${web_server}".`);
        }

        if (restart_result.code !== 0) {
            throw new Error(restart_result.stderr);
        }

        if (!silent) {
            cyan_line(`Restarted ${get_web_server_title(web_server)}.`);
        }

        return true;
    },

    get_public_directories,

    is_public_directory(path) {
        let last_directory = path.split('/').reverse()[0];

        return get_public_directories().includes(last_directory);
    },

    remove_public_from_dir(path) {
        path = remove_trailing_slash(path);

        for (let public_dir_str of get_public_directories()) {
            const public_dir_str_length = public_dir_str.length;

            if (path.substr(path.length - public_dir_str_length) === public_dir_str) {
                return remove_trailing_slash(path.substr(0, path.length - public_dir_str_length));
            }
        }
    },

    async ask_site_configuration_file(web_server) {
        return await choose_files_from_dir(get_sites_config_dir(web_server), `Which ${get_web_server_title(web_server)} virtual host configuration file do you want to edit?`);
    },

    ask_web_server(question, none_option = false, none_option_text = 'None') {
        const web_server_options = get_installed_web_servers();
        
        if (none_option) {
            web_server_options.unshift({
                value: null,
                name: none_option_text
            });
        }

        return choose(question, web_server_options);
    }
};
