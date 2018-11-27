const { exec } = require('shelljs');
const { ask_confirm } = require('./utils/ask');
const { choose_files_from_dir } = require('./utils/choose');

async function main() {
    const selected_apache_site_configuration_file = await choose_files_from_dir('/etc/apache2/sites-available', 'Which Apache virtual host do you want to delete?');

    if (await ask_confirm(`Are you sure you want to delete Apache site "${selected_apache_site_configuration_file}"?`)) {
        // Disable Apache site
        exec(`sudo a2dissite ${selected_apache_site_configuration_file}`);

        const selected_apache_site_configuration_file_path = `/etc/apache2/sites-available/${selected_apache_site_configuration_file}`;

        // Read hostname from Apache site configuration file
        const get_server_name_result = exec(`awk '/ServerName/ {print $2}' ${selected_apache_site_configuration_file_path}`)
        const hostname = (get_server_name_result.code === 0 && get_server_name_result.stdout ? get_server_name_result.stdout : null);

        // Delete /etc/hosts entry
        if (hostname !== null) {
            exec(`sudo hostile remove ${hostname}`);
        }

        // Delete Apache sites available configuration file
        exec(`sudo rm ${selected_apache_site_configuration_file_path}`);

        console.log(`Apache site "${selected_apache_site_configuration_file}" has been deleted.`);
    }
}

main();
