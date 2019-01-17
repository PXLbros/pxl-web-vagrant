const commandLineArgs = require('command-line-args');
const { existsSync } = require('fs');
const { exec } = require('shelljs');
const { bold, blue, cyan, red, yellow } = require('chalk');
const { format } = require('date-fns');
const { install_from_pxl_config, load_pxl_config_from_dir, print_pxl_config } = require('../utils/pxl');
const { ask_confirm, ask_input, ask_php_version, ask_create_database } = require('../utils/ask');
const { is_public_directory } = require('../utils/web_server');
const { remove_trailing_slash } = require('../utils/str');
const { create: create_database, exists: database_exists } = require('../utils/database');
const { ask_web_server, enable_web_server_site, get_config_filename, get_config_file_path, get_installed_web_servers, get_web_server_title, reload_web_server, save_virtual_host_config } = require('../utils/web_server.js');
const { error_line, highlight_line, line_break } = require('../utils/log');
const log = console.log;

const options = commandLineArgs([
    { name: 'web-server', type: String },
    { name: 'hostname', type: String },
    { name: 'site-dir', type: String },
    { name: 'public-dir', type: String },
    { name: 'git-repo', type: String },
    { name: 'git-branch', type: String },
    { name: 'php', type: String },
    { name: 'database-driver', type: String },
    { name: 'database-name', type: String },
    { name: 'overwrite', type: Boolean },
    { name: 'no-backup', type: Boolean },
    { name: 'force', type: Boolean },
    { name: 'show-command', type: Boolean }
]);

async function main() {
    exec('figlet create_site');
    line_break();

    const no_backup = (options['no-backup'] || false);
    const force = (options['force'] || false);

    const installed_web_servers = get_installed_web_servers();
    
    let web_server = options['web-server'];
    
    if (!web_server) {
        if (installed_web_servers.length === 1) {
            web_server = installed_web_servers[0].value;
        } else {
            web_server = await ask_web_server('What web server should be used?');
        }
    }

    const web_server_title = get_web_server_title(web_server);

    const hostname = (options['hostname'] || await ask_input('Enter hostname (e.g. domain.loc):'));
    let site_dir = (options['site-dir'] || await ask_input('Enter site directory:', `/vagrant/projects/${hostname}`));

    // Make sure site_dir doesn't have a trailing slash
    site_dir = remove_trailing_slash(site_dir);

    let public_dir;

    if (options['public-dir']) {
        public_dir = `${site_dir}/${options['public-dir']}`;
    } else if (is_public_directory(site_dir)) {
        public_dir = site_dir;
    } else {
        let public_dir_input = await ask_input(`Enter public site directory (leave empty for ${site_dir}):`);

        if (public_dir_input) {
            public_dir_input = remove_trailing_slash(public_dir_input);

            public_dir = `${site_dir}/${public_dir_input}`;

            // log(yellow(public_dir));
        }
    }

    // const default_site_dir = (is_public_directory(public_dir) ? remove_last_directory(public_dir) : public_dir);

    let git_repo = options['git-repo'];
    let git_branch = (options['git-branch'] || null);
    
    if (!git_repo) {
        if (await ask_confirm('Create from existing Git repository?')) {
            git_repo = (await ask_input('Enter Git SSH repository (e.g. git@github.com:Organization/project-name.git):'));
        }
    }

    let overwrite = (options['overwrite'] || false);

    let configuration_file_name;
    let configuration_file_path;

    let git_clone_error;

    let pxl_config;
    
    let php_version = (options['php'] || null);

    let database_driver;
    let database_name;
    let create_database_error = null;

    // If site directory already exist, take backup/delete existing
    if (existsSync(site_dir)) {            
        // Take backup
        if (!no_backup || no_backup !== true) {
            const backup_dir = `${site_dir}_${format(new Date(), 'YYYY-MM-DD_H-mm-ss')}`;

            exec(`sudo mv ${site_dir} ${backup_dir}`, { silent: true });

            log(yellow(`Backed up existing directory ${site_dir} at ${backup_dir}.`));
        } else {
            // No backup, delete existing site directory
            exec(`sudo rm -rf ${site_dir}`);
        }
    }

    if (git_repo) {    
        line_break();

        log(blue(`Cloning Git repository ${git_repo} to ${site_dir}...`));

        // Clone Git repository
        const git_clone_result = exec(`git clone ${git_repo}${git_branch ? ` --branch=${git_branch}` : ''} ${site_dir}`, { silent: true });
        git_clone_error = (git_clone_result.code !== 0 ? git_clone_result.stderr : null);

        if (git_clone_error) {
            error_line(git_clone_error);

            return;
        }

        highlight_line('Git repository cloned!');

        // Check for .pxl/config.yaml file
        try {
            pxl_config = load_pxl_config_from_dir(`${site_dir}/.pxl`);

            if (pxl_config) {
                if (pxl_config.code && pxl_config.code.php) {
                    php_version = pxl_config.code.php;
                }

                if (pxl_config.database) {
                    database_driver = pxl_config.database.driver;
                    database_name = pxl_config.database.name;
                }

                public_dir = pxl_config['public-site-dir'];

                line_break();

                log(yellow('Found PXL Web Vagrant configuration:'));

                print_pxl_config(pxl_config);

                line_break();

                if (force || (!force && await ask_confirm(`Do you want to install?`))) {
                    install_from_pxl_config(pxl_config); // TODO: Instead of doing this, just get variables instead and run commands below?
                }
            }
        } catch (load_pxl_config_error) {
            error_line(load_pxl_config_error);
        }
    } else {
        // If not from Git repo, create site & public directory
        if (!existsSync(public_dir)) {
            exec(`mkdir -p ${public_dir}`);
        }
    }

    configuration_file_name = get_config_filename(web_server, hostname);
    configuration_file_path = get_config_file_path(web_server, configuration_file_name);

    if (existsSync(configuration_file_path) && !overwrite) {
        if (!await ask_confirm(`${web_server_title} virtual host configuration file "${configuration_file_name}" already exist, do you want to overwrite it?`, false)) {
            return;
        }
    }

    if (!php_version) {
        php_version = (options['php'] || await ask_php_version());
    }

    if (!database_driver) {
        database_driver = (options['database-driver'] || null);
    }

    if (!database_name) {
        database_name = (options['database-name'] || null);
    }

    if (!pxl_config && (options['database-driver'] !== '' && options['database-name'] !== '') && (!database_driver || !database_name) && await ask_confirm('Do you want to create a database?')) {
        const database = (await ask_create_database(database_driver, database_name));

        database_driver = database.driver;
        database_name = database.name;
    }

    if (database_driver && database_name) {
        if (database_exists(database_driver, database_name)) {
            error_line(`${get_database_driver_title(pxl_config.database.driver)} Database "${pxl_config.database.name}" already exist.`);
        } else {
            try {
                create_database(database_driver, database_name);
            } catch (create_database_error) {
                create_database_error = create_database_error;
            }
        }
    }   

    // Save virtual host configuration file
    save_virtual_host_config(configuration_file_path, web_server, hostname, public_dir, php_version, overwrite);

    // Enable web server site
    enable_web_server_site(web_server, configuration_file_name);

    // Reload web server service
    reload_web_server(web_server);

    // Add /etc/hosts entry
    exec(`sudo hostile set 127.0.0.1 ${hostname}`, { silent: true });

    // Show summary
    log(yellow(`\n${web_server_title} site added!\n`));
    log(`${cyan(bold('Hostname:'))} ${hostname}`);
    log(`${cyan(bold('Public Directory:'))} ${public_dir}`);

    if (php_version) {
        log(`${cyan(bold('PHP:'))} ${php_version}`);
    }

    if (git_repo && git_clone_error) {
        log(`${cyan(bold('Git:'))} ${red(`Error (${git_clone_error})`)}`);
    }

    if (create_database_error) {
        log(`${cyan(bold('Database:'))} ${red(`${create_database_error}`)}`);
    }

    if (options['show-command']) {
        let command_str = `create_site \\
        --web-server=${web_server} \\
        --hostname=${hostname} \\
        --site-dir=${site_dir} \\
        --public-dir=${public_dir} \\
        --git-repo=${git_repo} \\
        --php=${php_version} \\
        --database-driver=${database_driver} \\
        --database-name=${database_name} \\
        ${overwrite ? '--overwrite \\' : ''}
        ${no_backup ? '--no-backup \\' : ''}
        ${force ? '--force \\' : ''}`;

        log(`\n${cyan(bold('Command:'))}`);
        log(command_str);
    }
}

main();
