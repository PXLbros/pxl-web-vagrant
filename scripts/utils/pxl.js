const { exec, mkdir, test } = require('shelljs');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { bold, gray, green, red } = require('chalk');
const slugify = require('slugify');
const yaml = require('js-yaml');
const { ask_confirm, ask_input } = require('./ask');
const { remove_last_directory, remove_trailing_slash } = require('./str');
const { error_line, line_break, title_line } = require('./log');
const { get_public_directories } = require('../utils/web_server.js');
const log = console.log;

function get_pxl_config_file_path_from_dir(dir) {
    return `${dir}/config.yaml`;
}

// function validate_pxl_config(pxl_config) {
//     console.log('validate_pxl_config', pxl_config);

//     return true;
// }

function pxl_config_exist(dir) {
    const config_file_path = get_pxl_config_file_path_from_dir(remove_trailing_slash(dir));

    return existsSync(config_file_path);
}

function load_pxl_config_from_dir(dir) {
    if (!pxl_config_exist(dir)) {
        return null;
    }

    const pxl_config_file_path = get_pxl_config_file_path_from_dir(remove_trailing_slash(dir));

    if (!existsSync(pxl_config_file_path)) {
        return null;
    }

    const pxl_config = load_pxl_config(pxl_config_file_path);

    return pxl_config;
}

function load_pxl_config(pxl_config_file_path, site_dir = null) {
    const pxl_config_dir = remove_last_directory(pxl_config_file_path);

    try {
        let pxl_config_contents = readFileSync(pxl_config_file_path, 'utf8');
        pxl_config_contents = pxl_config_contents.trim();

        let pxl_config = {};
        
        if (pxl_config_contents) {
            pxl_config = yaml.safeLoad(pxl_config_contents);

            if (!pxl_config) {
                throw new Error(`Could not load PXL Web Vagrant configuration file "${pxl_config_file_path}".`);
            }

            // validate_pxl_config(pxl_config);
            pxl_config['site-dir'] = (site_dir || remove_last_directory(pxl_config_dir));

            let public_site_dir;

            if (pxl_config['public-dir']) {
                if (get_public_directories().includes(pxl_config['public-dir'])) {
                    public_site_dir = `${pxl_config['site-dir']}/${pxl_config['public-dir']}`;
                } else {
                    public_site_dir = pxl_config['public-dir'];
                }
            } else {
                public_site_dir = pxl_config['site-dir'];
            }

            pxl_config['public-site-dir'] = public_site_dir;
        }

        // Check for install/uninstall script
        const install_script_path = `${pxl_config_dir}/install.js`;
        const uninstall_script_path = `${pxl_config_dir}/install.js`;

        if (existsSync(install_script_path)) {
            pxl_config['install-script'] = install_script_path;
        }

        if (existsSync(uninstall_script_path)) {
            pxl_config['uninstall-script'] = uninstall_script_path;
        }

        return pxl_config;
    } catch (e) {
        throw e;
    }
}

function find_pxl_configs(dir, filter_type = null) {
    const cache_file_path = `/home/vagrant/.pxl/cache/projects`;

    let search_result;

    if (existsSync(cache_file_path)) {
        search_result = readFileSync(cache_file_path, 'utf8');
    } else {
        search_result = exec(`find ${dir} -type d -name '.pxl'`, { silent: true }).stdout;

        exec('mkdir -p /home/vagrant/.pxl/cache');
        writeFileSync(cache_file_path, search_result);
    }

    const pxl_dirs = search_result.split('\n').filter(pxl_dir => (pxl_dir !== ''));

    let pxl_configs = [];

    for (let pxl_dir of pxl_dirs) {
        try {
            const pxl_config = load_pxl_config_from_dir(pxl_dir);

            if (!pxl_config) {
                // log(blue(`No config found in "${pxl_dir}"...`));

                continue;
            }

            pxl_config.dir = remove_last_directory(pxl_dir);

            // print_pxl_config(pxl_config);

            if (filter_type !== null && pxl_config.type !== filter_type) {
                continue;
            }

            pxl_configs.push(pxl_config);
        } catch (load_pxl_config_error) {
            log(red(load_pxl_config_error));
        }
    }

    return pxl_configs;
}

function print_pxl_config(pxl_config) {
    try {
        if (typeof pxl_config !== 'object') {
            throw new Error();
        }

        if (typeof pxl_config.hostname === 'string' && pxl_config.hostname) {
            title_line('Hostname', pxl_config.hostname);
        }

        if (typeof pxl_config['web-server'] === 'string' && pxl_config['web-server']) {
            title_line('Web Server', pxl_config['web-server']);
        }

        if (typeof pxl_config['code'] === 'object' && typeof pxl_config['code'].php) {
            title_line('PHP', pxl_config['code'].php);
        }

        if (typeof pxl_config['database'] === 'object') {
            title_line('Database Driver', pxl_config['database'].driver);
            title_line('Database Name', pxl_config['database'].name);
        }

        if (pxl_config['install-script']) {
            title_line('Install Script', pxl_config['install-script']);
        }
    } catch (e) {
        console.log(e);
        error_line(`Could not parse PXL Web Vagrant configuration file.`);
    }
}

function get_pxl_config_title_inline(pxl_config) {
    let str = `${bold(pxl_config.name)}`;

    str += gray(` ${pxl_config.dir}`);

    // TODO: Check subs for sites and see what's going on...
    // if (typeof pxl_config['web-server'] === 'string') {
    //     str += ` / ${italic('Web Server:')} ${pxl_config['web-server']}`;
    // }

    return str;
}

function create_pxl_config_in_dir(dir, public_dir, php_version = null, database_driver = null, database_name = null) {
    dir = remove_trailing_slash(dir);

    const config_dir = `${dir}/.pxl`;
    const config_file_path = `${config_dir}/config.yaml`;

    // Create configuration directory if not exist
    if (!test('-d', config_dir)) {
        mkdir('-p', config_dir);
    }

    // Check if configuration file already exist
    if (test('-d', config_file_path)) {
        throw new Error(`PXL Web Vagrant configuration file ${config_file_path} already exist.`);
    }

    // let config_contents = `site-dir: ${dir}`;

    // if (boilerplate) {
    //     config_contents += `\nboilerplate: ${boilerplate}`;
    // }
    
    let config_contents = '';

    if (public_dir) {
        config_contents += `public-dir: ${public_dir}`;
    }

    if (php_version) {
        config_contents += `\ncode:\n    php: ${php_version}`;
    }

    if (database_driver && database_name) {
        config_contents += `\ndatabase:\n    driver: ${database_driver}\n    name: ${database_name}`;
    }

    // Create configuration file
    const create_config_result = exec(`echo "${config_contents}" > ${config_file_path}`);

    if (create_config_result.code !== 0) {
        throw new Error(`Could not create PXL Web Vagrant configuration file ${config_file_path}.`);
    }

    // Copy install helper template
    const install_script_file_path = `${config_dir}/install.js`;

    if (!test('-d', install_script_file_path)) {
        let install_script_template = `const InstallHelper = require('/vagrant/scripts/sites/classes/install_helper');

class InstallScript extends InstallHelper {
    install() {
        super.install();
    }
};

module.exports = InstallScript;`;

        exec(`echo "${install_script_template}" > ${install_script_file_path}`);
    }

    return config_dir;
}

function create_pxl_config(name, dir) {
    dir = remove_trailing_slash(dir);

    const config_dir = `${dir}/.pxl`;
    const config_file_path = `${config_dir}/config.yaml`;

    // Create configuration directory if not exist
    if (!test('-d', config_dir)) {
        mkdir('-p', config_dir);
    }

    // Check if configuration file already exist
    if (test('-d', config_file_path)) {
        throw new Error(`PXL Web Vagrant configuration file ${config_file_path} already exist.`);
    }

    // Create configuration file
    const create_config_result = exec(`echo "name: '${name}'\\ntype: 'project'" > ${config_file_path}`);

    if (create_config_result.code === 0) {
        // Update cache file
        exec(`echo "${config_dir}" >> /home/vagrant/.pxl/cache/projects\n`);
    }

    return load_pxl_config(config_file_path);
}

function create_project_tmuxinator(path, pxl_config) {
    let tmuxinator_str = `name: "${pxl_config.name}"
root: ~/

windows:
  - Home:`;

    const create_project_tmuxinator_result = exec(`echo "${tmuxinator_str}" > ${path}`);

    console.log(tmuxinator_str);
    console.log(create_project_tmuxinator_result);
}

module.exports = {
    async create_pxl_project_config(name, dir) {
        dir = remove_trailing_slash(dir);

        const config_dir = `${dir}/.pxl`;
        const config_file_path = `${config_dir}/config.yaml`;

        // Create configuration directory if not exist
        if (!test('-d', config_dir)) {
            mkdir('-p', config_dir);
        }

        // Check if configuration file already exist
        if (test('-d', config_file_path)) {
            throw new Error(`PXL Web Vagrant configuration file ${config_file_path} already exist.`);
        }

        // Create configuration file
        exec(`echo name: ${name} > ${config_file_path}`);
    },

    create_pxl_config(name, dir, options = {
        default: 1
    }) {
        return create_pxl_config(name, dir, options);
    },

    load_pxl_config_from_dir(dir) {
        return load_pxl_config_from_dir(dir);
    },

    load_pxl_config(path, site_dir = null) {
        return load_pxl_config(path, site_dir);
    },

    print_pxl_config(pxl_config) {
        print_pxl_config(pxl_config);
    },

    get_pxl_config_title_inline(pxl_config) {
        return get_pxl_config_title_inline(pxl_config);
    },

    find_pxl_projects(dir) {
        return find_pxl_configs(dir, 'project');
    },

    async create_project(options = {}) {
        const project_name = (options['name'] || await ask_input('What is the name of the project?'));
        const project_name_slug = slugify(project_name, {
            lower: true
        });

        const project_dir = remove_trailing_slash(options['dir'] || await ask_input('What is the project directory?', `/vagrant/projects/${project_name_slug}`));

        if (test('-d', project_dir)) {
            if (!await ask_confirm(`Directory ${project_dir} already exist, do you want to continue?`)) {
                return;
            }

            // Check if existing directory is empty (if yes, can continue safely. but ask first)

            // Check if .pxl configuraton directory exist
            // ...
        } else {
            // Create project directory
            mkdir('-p', project_dir);
        }

        // Create .pxl configuration directory
        try {
            const pxl_config = create_pxl_config(project_name, project_dir);

            create_project_tmuxinator(`${project_dir}/.pxl/tmuxinator.yml`, pxl_config);
        } catch (create_pxl_config_error) {
            log(create_pxl_config_error);
            log(red(create_pxl_config_error.message));
        }

        log(green(`Project "${project_name}" has been created!`));

        // if (pwd().stdout !== project_dir) {
        //     const go_to_dir = (await ask_confirm(`Do you want to go to project directory ${project_dir}?`));
        //
        //     if (go_to_dir) {
        //         cd(project_dir);
        //     }
        // }
    },

    async open_project(project) {
        const tmuxinator_file_path = `${project.dir}/.pxl/tmuxinator.yml`;

        if (existsSync(tmuxinator_file_path)) {
            exec(`PROJECT_DIR=${project.dir} tmuxinator start --project-config=${tmuxinator_file_path}`);
        } else {
            console.log(`no tmuxinator found, just show info: ${project.dir}`);
        }
    },

    run_install_script_from_pxl_config(pxl_config) {
        if (!pxl_config['install-script']) {
            return null;
        } else if (!existsSync(pxl_config['install-script'])) {
            error_line(`Could not find install script at ${pxl_config['install-script']}.`);

            return null;
        }

        line_break();

        const install_script_class = require(pxl_config['install-script']);
        const install_script = new install_script_class(pxl_config);

        install_script.install();
        install_script.finish_install();
    },

    uninstall_from_pxl_config(pxl_config) {
        console.log('uninstall from', pxl_config);
    },

    create_pxl_config_in_dir
};
