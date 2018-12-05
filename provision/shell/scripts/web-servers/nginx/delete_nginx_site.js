const { exec } = require('shelljs');
const { ask_confirm } = require('./utils/ask');
const { choose_files_from_dir } = require('./utils/choose');

async function main() {
    const selected_nginx_site_configuration_file = await choose_files_from_dir('/etc/nginx/sites-available', 'Which nginx site do you want to delete?');

    if (await ask_confirm(`Are you sure you want to delete nginx site "${selected_nginx_site_configuration_file}"?`)) {
        const selected_nginx_site_configuration_file_path = `/etc/nginx/sites-available/${selected_nginx_site_configuration_file}`;

        // Read hostname from nginx site configuration file
        const get_server_name_result = exec(`awk '/server_name/ {print $2}' ${selected_nginx_site_configuration_file_path}`)
        const hostname = (get_server_name_result.code === 0 && get_server_name_result.stdout ? get_server_name_result.stdout : null);

        // Delete /etc/hosts entry
        if (hostname !== null) {
            exec(`sudo hostile remove ${hostname}`);
        }

        // Delete nginx sites available configuration file
        exec(`sudo rm /etc/nginx/sites-enabled/${selected_nginx_site_configuration_file}`);
        exec(`sudo rm ${selected_nginx_site_configuration_file_path}`);
        exec('sudo service nginx restart');

        console.log(`nginx site "${selected_nginx_site_configuration_file}" has been deleted.`);
    }
}

main();
