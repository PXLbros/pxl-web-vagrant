const commandLineArgs = require('command-line-args');
const { spawn } = require('child_process');
const { ask_site_configuration_file, ask_web_server, get_sites_config_dir } = require('../utils/web_server');

const options = commandLineArgs([
    { name: 'web-server', type: String }
]);

async function main() {
    const web_server = (options['web-server'] || await ask_web_server('Which web server?'));
    const web_server_sites_config_dir = get_sites_config_dir(web_server);
    const selected_site_configuration_file = await ask_site_configuration_file(web_server);

    // Open selected Apache site configuration file in default editor
    spawn((process.env.EDITOR || 'vi'), [`${web_server_sites_config_dir}/${selected_site_configuration_file}`], {
        stdio: 'inherit'
    });
}

main();
