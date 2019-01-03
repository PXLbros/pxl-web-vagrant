const commandLineArgs = require('command-line-args');
const { existsSync, writeFileSync } = require('fs');
const { exec } = require('shelljs');
const { bold, yellow, red, cyan } = require('chalk');
const { ask_confirm, ask_input, ask_php_version } = require('../../utils/ask');
const log = console.log;

const options = commandLineArgs([
    { name: 'hostname', type: String },
    { name: 'public-dir', type: String },
    { name: 'php', type: String },
    { name: 'overwrite', type: Boolean, defaultOption: false }
]);

async function main() {
    const hostname = (options['hostname'] || await ask_input('What is the hostname? (e.g. domain.loc)'));
    const public_dir = (options['public-dir'] || await ask_input('What is the public directory?', `/vagrant/projects/${hostname}`));
    const php_version = (!options['php'] && await ask_confirm('Does the project use PHP?') ? await ask_php_version() : (options['php'] ? options['php'] : null));

    let overwrite = options['overwrite'];

    const configuration_file_name = `${hostname}.conf`;
    const configuration_file_path = `/etc/apache2/sites-available/${configuration_file_name}`;

    if (existsSync(configuration_file_path) && !overwrite) {
        if (!await ask_confirm(`Apache virtual host configuration file "${configuration_file_name}" already exist, do you want to overwrite it?`, false)) {
            return;
        }

        overwrite = true;
    }

    let configuration_file_contents = `<VirtualHost *:${process.env.APACHE_PORT}>
    ServerName ${hostname}
    DocumentRoot ${public_dir}

    <Directory />
        AllowOverride All
    </Directory>

    <Directory ${public_dir}>
        Options Indexes FollowSymLinks MultiViews
        AllowOverride all
        Require all granted
    </Directory>

    LogLevel error
    ErrorLog /var/log/apache2/${hostname}-error.log
    CustomLog /var/log/apache2/${hostname}-access.log combined`;

    configuration_file_contents += (php_version !== null ? `\n\n    Include /etc/apache2/conf-available/php${php_version}-fpm.conf\n` : `\n`);
    configuration_file_contents += `</VirtualHost>`;

    configuration_file_contents += '\n# vim: syntax=apache';

    writeFileSync(configuration_file_path, configuration_file_contents);

    exec(`sudo a2ensite ${configuration_file_name}`, { silent: true });

    exec(`sudo service apache2 reload`, { silent: true });

    // Add /etc/hosts entry
    exec(`sudo hostile set 127.0.0.1 ${hostname}`, { silent: true });

    log(yellow(`Apache site added!\n`));
    log(`${cyan(bold('Hostname:'))} ${hostname}`);
    log(`${cyan(bold('Public Directory:'))} ${public_dir}`);

    if (php_version) {
        log(`${cyan(bold('PHP Version:'))} ${php_version}`);
    }
}

main();
