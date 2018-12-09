const commandLineArgs = require('command-line-args');
const { writeFileSync } = require('fs');
const { exec } = require('shelljs');
const { ask_confirm, ask_input, ask_php_version } = require('../../utils/ask');

const options = commandLineArgs([
    { name: 'hostname', type: String },
    { name: 'public-dir', type: String },
    { name: 'php', type: String }
]);

async function main() {
    const hostname = (options['hostname'] || await ask_input('What is the hostname? (e.g. domain.loc)'));
    // const project_dir = (options['project-dir'] || await ask_input('What is the project directory?', (hostname ? `/vagrant/projects/${hostname}` : null)));
    const public_dir = (options['public-dir'] || await ask_input('What is the public directory?'));
    const php_version = (!options['php'] && await ask_confirm('Does the project use PHP?') ? await ask_php_version() : (options['php'] ? options['php'] : null));

    const configuration_file_name = `${hostname}.conf`;

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

    writeFileSync(`/etc/apache2/sites-available/${configuration_file_name}`, configuration_file_contents);

    exec(`sudo a2ensite ${configuration_file_name}`);
    exec(`sudo service apache2 reload`);

    exec(`sudo hostile set 127.0.0.1 ${hostname}`);
}

main();
