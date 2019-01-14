const commandLineArgs = require('command-line-args');
const { existsSync } = require('fs');
const { exec } = require('shelljs');
const { bold, blue, cyan, red, yellow } = require('chalk');
const { format } = require('date-fns');
const { install_from_pxl_config, load_pxl_config_from_dir, print_pxl_config } = require('../utils/pxl');
const { ask_confirm, ask_input, ask_php_version, ask_web_server, ask_create_database } = require('../utils/ask');
const { is_public_directory } = require('../utils/web_server');
const { remove_trailing_slash } = require('../utils/str');
const { create: create_database } = require('../utils/database');
const { enable_web_server_site, get_config_filename, get_config_file_path, get_web_server_title, reload_web_server, save_virtual_host_config } = require('../utils/web_server.js');
const { error_line, line_break } = require('../utils/log');
const log = console.log;

const options = commandLineArgs([
    { name: 'web-server', type: String },
    { name: 'hostname', type: String },
    { name: 'site-dir', type: String },
    { name: 'public-dir', type: String },
    { name: 'git-repo', type: String },
    { name: 'php', type: String },
    { name: 'database-driver', type: String },
    { name: 'database-name', type: String },
    { name: 'overwrite', type: Boolean },
    { name: 'no-backup', type: Boolean },
    { name: 'force', type: Boolean }
]);

async function main() {
    const no_backup = (options['no-backup'] || false);
    const force = (options['force'] || false);

    const web_server = (options['web-server'] || await ask_web_server('What web server should be used?'));
    const web_server_title = get_web_server_title(web_server);

    const hostname = (options['hostname'] || await ask_input('What is the hostname? (e.g. domain.loc)'));
    let site_dir = (options['site-dir'] || await ask_input('What is the site directory?', `/vagrant/projects/${hostname}`));

    // Make sure site_dir doesn't have a trailing slash
    site_dir = remove_trailing_slash(site_dir);

    let public_dir;

    if (options['public-dir']) {
        public_dir = `${site_dir}/${options['public-dir']}`;
    } else if (is_public_directory(site_dir)) {
        public_dir = site_dir;
    } else {
        let public_dir_input = await ask_input('What is the public site directory? (leave empty for same as site directory)');

        if (public_dir_input) {
            public_dir_input = remove_trailing_slash(public_dir_input);

            public_dir = `${site_dir}/${public_dir_input}`;

            log(yellow(public_dir));
        }
    }

    // const default_site_dir = (is_public_directory(public_dir) ? remove_last_directory(public_dir) : public_dir);

    let git_repo = options['git-repo'];
    
    if (!git_repo) {
        if (await ask_confirm('Create project from existing Git repository?')) {
            git_repo = (await ask_input('What is the Git SSH repository? (e.g. git@github.com:Organization/project-name.git)'));
        }
    }

    let overwrite = (options['overwrite'] || false);

    const configuration_file_name = get_config_filename(web_server, hostname);
    const configuration_file_path = get_config_file_path(web_server, configuration_file_name);

    if (existsSync(configuration_file_path) && !overwrite) {
        if (!await ask_confirm(`${web_server_title} virtual host configuration file "${configuration_file_name}" already exist, do you want to overwrite it?`, false)) {
            return;
        }

        overwrite = true;
    }

    // If site directory already exist
    if (existsSync(site_dir)) {
        // If cloning Git repository and site directory already exist
        if (overwrite && git_repo) {
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
    }

    // Clone
    let git_clone_error;

    if (git_repo) {
        line_break();

        log(blue(`Cloning Git repository ${git_repo} to ${site_dir}...`));

        const git_clone_result = exec(`git clone ${git_repo} ${site_dir}`);
        git_clone_error = (git_clone_result.code !== 0 ? git_clone_result.stderrr : null);

        if (!git_clone_error) {
            // Check for .pxl/config.yaml file
            try {
                const pxl_config = load_pxl_config_from_dir(`${site_dir}/.pxl`);

                if (pxl_config) {
                    pxl_config.hostname = hostname;
                    pxl_config['web-server'] = 'nginx';

                    line_break();

                    log(yellow('Found PXL Web Vagrant configuration:'));

                    print_pxl_config(pxl_config);

                    log();

                    if (!force && await ask_confirm(`Do you want to install?`)) {
                        install_from_pxl_config(pxl_config);
                    }
                }
            } catch (load_pxl_config_error) {
                error_line(load_pxl_config_error);
            }
        }
    } else {
        // If not from Git repo, create site & public directory
        if (!existsSync(public_dir)) {
            exec(`mkdir -p ${public_dir}`);
        }
    }

    const php_version = (options['php'] || await ask_php_version());

    let create_database_error = null;
    let database_driver = (options['database-driver'] || null);
    let database_name = (options['database-name'] || null);

    if ((options['database-driver'] !== '' && options['database-name'] !== '') && (!database_driver || !database_name) && await ask_confirm('Do you want to create a database?')) {
        const database = (await ask_create_database(database_driver, database_name));

        database_driver = database.driver;
        database_name = database.name;
    }

    if (database_driver && database_name) {
        try {
            create_database(database_driver, database_name);
        } catch (create_database_error) {
            create_database_error = create_database_error;
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

    // Show success message
    log(yellow(`\n${web_server_title} site added!\n`));
    log(`${cyan(bold('Hostname:'))} ${hostname}`);
    log(`${cyan(bold('Public Directory:'))} ${public_dir}`);

    if (php_version) {
        log(`${cyan(bold('PHP Version:'))} ${php_version}`);
    }

    if (git_repo && git_clone_error) {
        log(`${cyan(bold('Git:'))} ${red(`Error (${git_clone_error})`)}`);
    }

    if (create_database_error) {
        log(`${cyan(bold('Database:'))} ${red(`${create_database_error}`)}`);
    }

    // create_site \
    //     --web-server=nginx \
    //     --hostname=test.loc \
    //     --site-dir=/vagrant/projects/test.loc \
    //     --public-dir=/vagrant/projects/test.loc/public \
    //     --git-repo=git@github.com:DennisNygren/vagrant-test.git \
    //     --php=7.3 \
    //     --database-driver=null \
    //     --database-name=null \
    //     --overwrite \
    //     --no-backup \
    //     --force

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

main();
