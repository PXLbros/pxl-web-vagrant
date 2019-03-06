const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const { existsSync } = require('fs');
const { exec } = require('shelljs');
const { bold, blue, cyan, red, yellow } = require('chalk');
const { format } = require('date-fns');
const { create_pxl_config_in_dir, run_install_script_from_pxl_config, load_pxl_config_from_dir, print_pxl_config } = require('../utils/pxl');
const { ask_create_database, ask_confirm, ask_input, ask_path, ask_php_version } = require('../utils/ask');
const { is_public_directory } = require('../utils/web_server');
const { remove_trailing_slash } = require('../utils/str');
const boilerplateUtil = require('../utils/boilerplate');
const { ask_create_database_driver, create: create_database, exists: database_exists, get_driver_title: get_database_driver_title } = require('../utils/database');
const { ask_web_server, enable_web_server_site, get_config_filename, get_config_file_path, get_installed_web_servers, get_web_server_title, reload_web_server, save_virtual_host_config } = require('../utils/web_server.js');
const { blue_line, cyan_line, error_line, highlight_line, line_break, success_line } = require('../utils/log');
const log = console.log;

const options_values = [
    { name: 'web-server', type: String, description: 'Web server.' },
    { name: 'hostname', type: String, description: 'Site hostname.' },
    { name: 'site-dir', type: String, description: 'Site root directory.' },
    { name: 'public-dir', type: String, description: 'Site public directory.' },
    { name: 'git-repo', type: String, description: 'Git repository.' },
    { name: 'git-branch', type: String, description: 'Initial Git branch.' },
    { name: 'boilerplate', type: String, description: 'Boilerplate.' },
    { name: 'php', type: String, description: 'PHP version.' },
    { name: 'db-driver', type: String, description: 'Database driver.' },
    { name: 'db-name', type: String, description: 'Database name.' },
    { name: 'overwrite', type: Boolean, description: 'Overwrite existing site if any.' },
    { name: 'no-backup', type: Boolean, description: `Omit backup of existing site upon overwrite.` },
    { name: 'force', type: Boolean, description: `Don't prompt for questions.` },
    { name: 'show-command', type: Boolean, description: 'Show executed command after run.' },
    { name: 'help', type: Boolean, description: 'Print this help guide.' }
];

const options = commandLineArgs(options_values.map(option => {
    return {
        name: option.name,
        type: option.type
    };
}));

async function main() {
    exec('figlet create site');

    if (options.help) {
        const usage = commandLineUsage([
            {
                header: 'Options',
                content: 'Create new site from existing Git repository, boilerplate or new.',
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
    } else {
        line_break();
    }

    // const my_dir = (await ask_path('/vagrant', 'dir', 'Select a root directory:'));
    // const my_file = (await ask_path(my_dir.path, 'file', 'Select a file:'));

    // console.log(my_dir);
    // console.log(my_file);
    // return;

    let boilerplate_input = (options['boilerplate'] || null);

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

    let boilerplate;
    let boilerplate_pxl_config;
    let pxl_config;

    let public_dir = (options['public-dir'] || null);
    let php_version = (options['php'] || null);
    let database_driver;
    let database_name;

    let git_repo = (options['git-repo'] || null);
    let git_branch = (options['git-branch'] || null);
    
    if (options['git-repo'] === undefined && !boilerplate) {
        if (await ask_confirm('Create from existing Git repository?')) {
            git_repo = (await ask_input('Enter Git SSH repository (e.g. git@github.com:Organization/project-name.git):'));
        }
    }

    // If not Git repository, check for boilerplate
    if (!git_repo) {
        if (boilerplate_input) {
            let boilerplate_type_input = 'default';
            let boilerplate_name_input = boilerplate_input;

            boilerplate = await boilerplateUtil.loadBoilerplate(boilerplateUtil.getBoilerplateFromName(boilerplate_name_input, boilerplate_type_input), site_dir);
        } else {
            boilerplate = await boilerplateUtil.askBoilerplate('Do you want to load from boilerplate?');
        }

        if (boilerplate && boilerplate.pxl_config) {
            boilerplate.pxl_config['site-dir'] = site_dir;

            boilerplate_pxl_config = boilerplate.pxl_config;
            boilerplate_pxl_config.hostname = hostname;
        }

        if (boilerplate_pxl_config && boilerplate_pxl_config['public-dir']) {
            public_dir = boilerplate_pxl_config['public-site-dir'];
        } else if (options['public-dir']) {
            public_dir = `${site_dir}/${options['public-dir']}`;
        } else if (is_public_directory(site_dir)) {
            public_dir = site_dir;
        } else {
            let public_dir_input = await ask_input('What is the public site directory? (leave empty for same as site directory)'); // TODO: Can we wait with this question till after cloning git? Because it'll say in .pxl config file from clone if
    
            if (public_dir_input) {
                public_dir_input = remove_trailing_slash(public_dir_input);
    
                public_dir = `${site_dir}/${public_dir_input}`;
            }
        }
    }

    let overwrite = (options['overwrite'] || false);

    let configuration_file_name;
    let configuration_file_path;

    let git_clone_error;

    // If site directory already exist, take backup/delete existing
    if (existsSync(site_dir)) {            
        // Take backup
        if (!no_backup || no_backup !== true) {
            const backup_dir = `${site_dir}_${format(new Date(), 'YYYY-MM-DD_H-mm-ss')}`;

            if (await ask_confirm(`Site directory ${site_dir} already exists, do you want to take a backup?`)) {
                exec(`sudo mv ${site_dir} ${backup_dir}`, { silent: true });

                log(yellow(`Backed up existing directory ${site_dir} to ${backup_dir}.`));
            } else {
                // No backup, delete existing site directory
                exec(`sudo rm -rf ${site_dir}`);

                cyan_line(`Removed existing directory ${site_dir}.`);
                line_break();
            }
        } else {
            // No backup, delete existing site directory
            exec(`sudo rm -rf ${site_dir}`);

            cyan_line(`Removed existing directory ${site_dir}.`);
            line_break();
        }
    }

    // Create from Git repository
    if (git_repo) {
        line_break();

        log(blue(`Cloning Git repository ${git_repo} into ${site_dir}...`));

        // Clone Git repository
        const git_clone_result = exec(`git clone ${git_repo}${git_branch ? ` --branch=${git_branch}` : ''} ${site_dir}`, { silent: true });
        git_clone_error = (git_clone_result.code !== 0 ? git_clone_result.stderr : null);

        if (git_clone_error) {
            error_line(git_clone_error);

            return;
        }

        highlight_line(`Git repository cloned to ${site_dir}.`);
        line_break();

        // Check for .pxl/config.yaml file
        try {
            pxl_config = load_pxl_config_from_dir(`${site_dir}/.pxl`);

            if (pxl_config) {
                if (hostname && !pxl_config.hostname) {
                    pxl_config.hostname = hostname;
                }

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
            } else {
                if (!public_dir) {
                    // Check or ask public dir
                    if (is_public_directory(site_dir)) {
                        public_dir = site_dir;
                    } else {
                        let public_dir_input = await ask_input('What is the public site directory? (leave empty for same as site directory)'); // TODO: Can we wait with this question till after cloning git? Because it'll say in .pxl config file from clone if
                
                        if (public_dir_input) {
                            public_dir_input = remove_trailing_slash(public_dir_input);
                
                            public_dir = `${site_dir}/${public_dir_input}`;
                        }
                    }
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

    let public_dir_full = (public_dir ? `${site_dir}/${public_dir}` : site_dir);

    configuration_file_name = get_config_filename(web_server, hostname);
    configuration_file_path = get_config_file_path(web_server, configuration_file_name);

    let overwrite_web_server_conf_file = false;

    if (existsSync(configuration_file_path) && !overwrite) {
        if (await ask_confirm(`${web_server_title} virtual host configuration file "${configuration_file_name}" already exist, do you want to overwrite it?`, false)) {
            overwrite_web_server_conf_file = true;
        }
    }

    if (boilerplate_pxl_config && boilerplate_pxl_config.code && boilerplate_pxl_config.code.php) {
        php_version = boilerplate_pxl_config.code.php;
    } else if (!php_version && !boilerplate_pxl_config) {
        php_version = (options['php'] || await ask_php_version());

        if (boilerplate_pxl_config && boilerplate_pxl_config.code) {
            boilerplate_pxl_config.code.php = php_version;
        }

        if (pxl_config && pxl_config.code) {
            pxl_config.code.php = php_version;
        }
    }

    if (boilerplate_pxl_config && boilerplate_pxl_config.database && boilerplate_pxl_config.database.driver) {
        database_driver = boilerplate_pxl_config.database.driver;
    } else if (!database_driver) {
        database_driver = (options['db-driver'] || null);

        if (boilerplate_pxl_config && boilerplate_pxl_config.database) {
            boilerplate_pxl_config.database.driver = database_driver;
        }

        if (pxl_config && pxl_config.database) {
            pxl_config.database.driver = database_driver;
        }
    }

    if (boilerplate_pxl_config && boilerplate_pxl_config.database && boilerplate_pxl_config.database.name) {
        database_name = boilerplate_pxl_config.database.name;
    } else if (!database_name) {
        database_name = (options['db-name'] || null);

        if (boilerplate_pxl_config && boilerplate_pxl_config.database) {
            boilerplate_pxl_config.database.name = database_name;
        }

        if (pxl_config && pxl_config.database) {
            pxl_config.database.name = database_name;
        }
    }

    if (!pxl_config && (options['db-driver'] !== '' && options['db-name'] !== '') && (!database_driver || !database_name)) {
        if (!database_driver) {
            database_driver = await ask_create_database_driver();
        }

        if (database_driver) {
            const database = await ask_create_database(database_driver);

            database_driver = database.driver;
            database_name = database.name;
        }
    }

    if (database_driver && database_name) {
        if (database_exists(database_driver, database_name)) {
            error_line(`${get_database_driver_title(database_driver)} database "${database_name}" already exists.`);
            line_break();
        } else {
            try {
                create_database(database_driver, database_name);
            } catch (create_database_error) {
                error_line(create_database_error.message);
            }
        }
    }   

    // Save virtual host configuration file
    save_virtual_host_config(configuration_file_path, web_server, hostname, public_dir_full, php_version, overwrite_web_server_conf_file);

    // Enable web server site
    try {
        enable_web_server_site(web_server, configuration_file_name);
    } catch (enable_web_server_site_error) {
        error_line(enable_web_server_site_error.message);
    }

    // Reload web server service
    reload_web_server(web_server);

    // Add /etc/hosts entry
    const add_etc_hosts_entry_result = exec(`sudo hostile set 127.0.0.1 ${hostname}`, { silent: true });

    if (add_etc_hosts_entry_result.code === 0) {
        blue_line(`Added ${hostname} /etc/hosts entry.`);
    } else {
        console.log(add_etc_hosts_entry_result);

        error_line(`Could not add ${hostname} /etc/hosts entry. (${add_etc_hosts_entry_result.stderr})`);
    }

    if (boilerplate_pxl_config || pxl_config) {
        if (force || (!force && await ask_confirm(`Do you want to install?`))) {
            if (boilerplate_pxl_config) {
                run_install_script_from_pxl_config(boilerplate_pxl_config);
            } else if (pxl_config) {
                run_install_script_from_pxl_config(pxl_config);
            }
        }
    }

    if (!pxl_config) {
        line_break();

        if (force || await ask_confirm(`Do you want to save PXL Web Vagrant configuration?`)) {
            try {
                const pxl_config_dir = create_pxl_config_in_dir(site_dir, public_dir, php_version, database_driver, database_name, boilerplate ? boilerplate.pxl_config.name : null);

                cyan_line(`PXL Web Vagrant configuration ${pxl_config_dir} created.`);
            } catch (create_pxl_config_error) {
                error_line(create_pxl_config_error.message);
            }
        }
    }

    // Show summary
    line_break();

    success_line(`Success!`);

    line_break();

    log(`${cyan(bold('Web Server:'))} ${web_server}`);
    log(`${cyan(bold('Hostname:'))} ${hostname}`);
    log(`${cyan(bold('Site Directory:'))} ${site_dir}`);
    log(`${cyan(bold('Public Directory:'))} ${public_dir}`);

    if (php_version) {
        log(`${cyan(bold('PHP:'))} ${php_version}`);
    }

    if (git_repo && git_clone_error) {
        log(`${cyan(bold('Git:'))} ${red(`Error (${git_clone_error})`)}`);
    }

    if (database_driver) {
        log(`${cyan(bold('Database Driver:'))} ${database_driver}`);
    }

    if (database_name) {
        log(`${cyan(bold('Database Name:'))} ${database_name}`);
    }

    if (options['show-command']) {
        let command_str = `create_site`;

        if (web_server) {
            command_str += ` \\\n\t--web-server=${web_server}`;
        }

        if (hostname) {
            command_str += ` \\\n\t--hostname=${hostname}`;
        }

        if (site_dir) {
            command_str += ` \\\n\t--site-dir=${site_dir}`;
        }

        if (public_dir_full) {
            command_str += ` \\\n\t--public-dir=${public_dir_full}`;
        }

        if (git_repo) {
            command_str += ` \\\n\t--git-repo=${git_repo}`;
        }

        if (git_branch) {
            command_str += ` \\\n\t--git-branch=${git_branch}`;
        }

        if (php_version) {
            command_str += ` \\\n\t--php=${php_version}`;
        }

        if (database_driver) {
            command_str += ` \\\n\t--database-driver=${database_driver}`;
        }

        if (database_name) {
            command_str += ` \\\n\t--db-name=${database_name}`;
        }
        
        if (overwrite) {
            command_str += ` \\\n\t--overwrite`;
        }

        if (no_backup) {
            command_str += ` \\\n\t--no-backup`;
        }

        if (force) {
            command_str += ` \\\n\t--force`;
        }

        log(`\n${cyan(bold('Command:'))}`);
        log(command_str);
    }
}

main();
