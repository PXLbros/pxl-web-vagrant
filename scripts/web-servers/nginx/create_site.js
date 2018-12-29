const commandLineArgs = require('command-line-args');
const { existsSync, writeFileSync } = require('fs');
const { exec, test } = require('shelljs');
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

    const configuration_file_name = `${hostname}`;
    const configuration_file_path = `/etc/nginx/sites-available/${configuration_file_name}`;
    const configuration_file_enabled_path = `/etc/nginx/sites-enabled/${configuration_file_name}`;

    if (existsSync(configuration_file_path) && !overwrite) {
        if (!await ask_confirm(`NGINX virtual host configuration file "${configuration_file_name}" already exist, do you want to overwrite it?`, false)) {
            return;
        }

        overwrite = true;
    }

    let configuration_file_contents = `server {
    listen ${process.env.NGINX_PORT};
    root ${public_dir};
    index index.php;
    server_name ${hostname};

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }`;

if (php_version !== null) {
    configuration_file_contents += `\n\n\tlocation ~ \.php$ {
        include snippets/fastcgi-php.conf;

        fastcgi_pass unix:/var/run/php/php${php_version}-fpm.sock;
    }`;
    }

    configuration_file_contents += '\n}';

    if (overwrite && existsSync(configuration_file_enabled_path)) {
        exec(`sudo rm ${configuration_file_enabled_path}`);
    }

    writeFileSync(configuration_file_path, configuration_file_contents);

    exec(`sudo ln -s ${configuration_file_path} /etc/nginx/sites-enabled/`, { silent: true });
    exec(`sudo service nginx reload`, { silent: true });

    exec(`sudo hostile set 127.0.0.1 ${hostname}`, { silent: true });

    log(yellow(`NGINX site added!\n`));
    log(`${cyan(bold('Hostname:'))} ${hostname}`);
    log(`${cyan(bold('Public Directory:'))} ${public_dir}`);

    if (php_version) {
        log(`${cyan(bold('PHP Version:'))} ${php_version}`);
    }
}

main();
