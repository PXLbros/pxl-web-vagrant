const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const { prompt } = require('inquirer');
const { exec } = require('shelljs');
const inquirer = require('inquirer');
const { choose } = require('./choose.js');
const { get_installed_web_servers } = require('./web_server');

inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'));

async function ask_input(question, default_value = null) {
    const prompt_result = await prompt([
        {
            type: 'input',
            name: 'value',
            message: question,
            default: default_value
        }
    ]);

    return prompt_result.value;
}

async function ask_confirm(question, default_value = true) {
    const prompt_result = await prompt([
        {
            type: 'confirm',
            name: 'value',
            message: question,
            default: default_value
        }
    ]);

    return prompt_result.value;
}

module.exports = {
    ask_input,
    ask_confirm,

    async ask_git_branch() {
        const branches_str = exec('git branch', { silent: true });
        const branches = branches_str.replace(/\n$/, '').split('\n');
        const default_branch = branches.find(branch => branch.substring(0, 2) === '* ');

        const prompt_result = await prompt([
            {
                type: 'list',
                name: 'value',
                message: 'Choose Git branch',
                default: default_branch,
                choices: branches.map(branch => {
                    branch = (branch === default_branch ? branch.substring(2) : branch);

                    return {
                        name: branch,
                        value: branch
                    };
                }).reverse()
            }
        ]);

        return prompt_result.value;
    },

    async ask_php_version() {
        const is_directory = source => lstatSync(source).isDirectory();
        const get_directories = source => readdirSync(source).map(name => join(source, name)).filter(is_directory);

        const prompt_result = await prompt([
            {
                type: 'list',
                name: 'value',
                message: 'What PHP version?',
                choices: get_directories('/etc/php').map(php_directory => {
                    const php_version = php_directory.substring(9);

                    return {
                        name: php_version,
                        value: php_version
                    };
                }).reverse()
            }
        ]);

        return prompt_result.value;
    },

    async ask_dir() {
        return prompt([
            {
                type: 'fuzzypath',
                name: 'path',
                pathFilter: (isDirectory, nodePath) => {
                    if (nodePath.indexOf('node_modules') !== -1 || nodePath.indexOf('vendor') !== -1 || nodePath.indexOf('.git') !== -1) {
                        return false;
                    }

                    return isDirectory;
                },
                rootPath: '/vagrant/projects/pxl/universal/website',
                message: 'Select a target directory for your component:',
                suggestOnly: false
            }
        ]);
    },

    ask_web_server(question) {
        return choose(question, get_installed_web_servers().map(web_server => {
            return {
                name: web_server,
                value: web_server.toLowerCase()
            };
        }));
    },

    async ask_create_database(driver, name) {
        if (!driver) {
            driver = await choose('What database driver?', [{
                name: 'MySQL',
                value: 'mysql'
            }]);
        }

        if (!name) {
            name = await ask_input('Enter database name:');
        }

        return {
            driver,
            name
        };
    }
};
