const commandLineArgs = require('command-line-args');
const { writeFileSync } = require('fs');
const { exec } = require('shelljs');
const { ask_confirm, ask_input, ask_php_version } = require('./utils/ask');

const options = commandLineArgs([
    { name: 'non-interactive', type: Boolean },

    { name: 'hostname', type: String },
    // { name: 'project-dir', type: String },
    { name: 'public-dir', type: String },
    { name: 'php', type: String }
]);

async function main() {
    const non_interactive = options['non-interactive'];

    const hostname = (options['hostname'] || await ask_input('What is the hostname? (e.g. domain.loc)'));
    // const project_dir = (options['project-dir'] || await ask_input('What is the project directory?', (hostname ? `/vagrant/sites/${hostname}` : null)));
    const public_dir = (options['public-dir'] || await ask_input('What is the public directory?')); // , `${project_dir}/public`

    let php_version = null;

    if (!options['php'] && !non_interactive) {
        php_version = (!options['php'] && await ask_confirm('Does the project use PHP?') ? await ask_php_version() : null);
    }

    const configuration_file_name = `${hostname}`;
    const configuration_file_path = `/etc/nginx/sites-available/${configuration_file_name}`;

    let configuration_file_contents = `server {
    listen ${process.env.NGINX_PORT};
    root ${public_dir};
    index index.php;
    server_name ${hostname};

    location / {
        try_files $uri $uri/ =404;
    }`;

    // For Laravel: try_files $uri $uri/ /index.php?$query_string;

if (php_version !== null) {
    configuration_file_contents += `\n\n\tlocation ~ \.php$ {
        include snippets/fastcgi-php.conf;

        fastcgi_pass unix:/var/run/php/php${php_version}-fpm.sock;
    }`;
    }

    configuration_file_contents += '\n}';

    writeFileSync(configuration_file_path, configuration_file_contents);

    exec(`sudo ln -s ${configuration_file_path} /etc/nginx/sites-enabled/`);
    exec(`sudo service nginx reload`);

    exec(`sudo hostile set 127.0.0.1 ${hostname}`);
}

main();
