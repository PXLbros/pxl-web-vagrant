const { spawn } = require('child_process');
const { choose_files_from_dir } = require('../../utils/choose');

async function main() {
    const sites_dir = '/etc/apache2/sites-available';
    const selected_apache_site_configuration_file = await choose_files_from_dir(sites_dir, 'Which Apache virtual host configuration file do you want to edit?');

    // Open selected Apache site configuration file in default editor
    spawn((process.env.EDITOR || 'vi'), [`${sites_dir}/${selected_apache_site_configuration_file}`], {
        stdio: 'inherit'
    });
}

main();
