const { exec } = require('shelljs');
const { blue, red } = require('chalk');
const { choose } = require('./utils/choose');
const { new_project_questionare } = require('./utils/ask');
const { create_project, find_pxl_projects, get_pxl_config_title_inline, open_project } = require('./utils/pxl');
const log = console.log;

const from_bashrc = (process.env.FROM_BASHRC === 'true');

async function open_main_menu() {
    open_menu([
        {
            name: 'Projects',
            value: 'projects',
            action: () => {
                open_projects_menu();
            }
        },
        {
            name: 'Sites',
            value: 'sites',
            action: () => {
                open_sites_menu();
            }
        },
        'Web Servers',
        {
            name: 'Databases',
            value: 'databases',
            action: () => {
                open_databases_menu();
            }
        },
        {
            type: 'separator'
        },
        // 'Misc (Weather etc.)',
        // {
        //     type: 'separator'
        // },
        {
            name: 'Help',
            value: 'help',
            action: () => {
                log(blue('PXL Web Vagrant 1.0.0 (Built on Dec 1st)'));
            }
        },
        {
            type: 'separator',
            value: 'help',
            action: () => {
                log('PXL Web Vagrant');
            }
        },
        {
            name: 'Close',
            value: 'close',
            action: () => {
            }
        }
    ]);
}

async function open_projects_menu() {
    open_menu([
        {
            name: 'Project 1',
            value: 'project_1'
        }
    ]);
}

async function open_sites_menu() {
    open_menu([
        {
            name: 'Create new site',
            value: 'create_site',
            action: () => {
                exec(`node /vagrant/provision/shell/scripts/create_site.js`);
            }
        }
    ]);
}

async function open_projects_menu() {
    const projects = find_pxl_projects('/vagrant/projects');

    let projects_menu = [
        {
            name: 'New Project',
            value: 'create_project',
            action: () => {
                create_project();
            }
        },
        {
            type: 'separator'
        }
    ];

    for (let project of projects) {
        projects_menu.push({
            name: get_pxl_config_title_inline(project, true),
            value: project.name,
            action: () => {
                open_project(project);
            }
        });
    }

    projects_menu.push({
        type: 'separator'
    });

    projects_menu.push({
        name: 'Back',
        value: 'back',
        action: () => {
            open_main_menu();
        }
    });

    open_menu(projects_menu);
}

async function open_databases_menu() {
    open_menu([
        {
            name: 'Create database',
            value: 'create_database',
            action: () => {
                exec(`node /vagrant/provision/shell/scripts/create_database.js`);
            }
        },
        {
            name: 'Delete database',
            value: 'delete_database',
            action: () => {
                exec(`node /vagrant/provision/shell/scripts/delete_database.js`);
            }
        }
    ]);
}

async function open_menu(menu_items) {
    menu_items = menu_items.map(menu_item => {
        if (typeof menu_item === 'string') {
            menu_item = {
                name: menu_item,
                value: menu_item
            };
        }

        return menu_item;
    });

    menu_items.unshift({
        type: 'separator'
    });

    const selected_menu_item_value = (await choose('Menu', menu_items));

    const selected_menu_item = menu_items.find(menu_item => menu_item.value === selected_menu_item_value || menu_item === selected_menu_item_value);

    if (typeof selected_menu_item.action === 'function') {
        selected_menu_item.action();
    } else {
        log(red(`No action for menu item "${selected_menu_item.value}".`) + '\n');

        open_main_menu();
    }
}

async function main() {
    exec('echo " "');

    open_main_menu();
}

main();
