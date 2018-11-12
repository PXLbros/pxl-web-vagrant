const { readdir } = require('fs');
const { spawn } = require('child_process');
const { choose_apache_site_configuration_file } = require('./utils/choose');

async function main() {
    readdir('/etc/apache2/sites-available', async (error, files) => {
        const selected_apache_site_configuration_file = await choose_apache_site_configuration_file('Which Apache virtual host configuration file do you want to edit?');

        // Open selected Apache site configuration file in default editor
        spawn((process.env.EDITOR || 'vi'), [`/etc/apache2/sites-available/${selected_apache_site_configuration_file}`], {
            stdio: 'inherit'
        });
    });
}

main();
