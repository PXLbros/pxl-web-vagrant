const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const { spawn } = require('child_process');
const { ask_site_configuration_file, ask_web_server, get_installed_web_servers, get_sites_config_dir } = require('../utils/web_server');

const options = commandLineArgs([
    { name: 'web-server', type: String, description: 'Web server.' }
]);

async function main() {
    if (options.help) {
        const usage = commandLineUsage([
            {
                header: 'Options',
                content: 'Edit site configuration.',
                optionList: options_values.map(option => {
                    return  {
                        name: option.name,
                        description: (option.description || null)
                    };
                })
            }
        ]);

        log(usage);
        return;
    }

    const installed_web_servers = get_installed_web_servers();
    
    let web_server = options['web-server'];
    
    if (!web_server) {
        if (installed_web_servers.length === 1) {
            web_server = installed_web_servers[0].value;
        } else {
            web_server = await ask_web_server('What web server should be used?');
        }
    }

    const web_server_sites_config_dir = get_sites_config_dir(web_server);
    const selected_site_configuration_file = await ask_site_configuration_file(web_server);

    // Open selected Apache site configuration file in default editor
    spawn((process.env.EDITOR || 'vi'), [`${web_server_sites_config_dir}/${selected_site_configuration_file}`], {
        stdio: 'inherit'
    });

    // TODO: Ask to restart server (tried but editor got glithcy)
}

main();
