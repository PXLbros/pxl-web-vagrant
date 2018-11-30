const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const { prompt } = require('inquirer');
const { exec } = require('shelljs');
const inquirer = require('inquirer');

inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'));

module.exports = {
    async ask_input(question, default_value = null) {
        const prompt_result = await prompt([
            {
                type: 'input',
                name: 'value',
                message: question,
                default: default_value
            }
        ]);

        return prompt_result.value;
    },

    async ask_confirm(question) {
        const prompt_result = await prompt([
            {
                type: 'confirm',
                name: 'value',
                message: question
            }
        ]);

        return prompt_result.value;
    },

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
                pathFilter: (isDirectory, nodePath) => isDirectory,
                // pathFilter :: (Bool, String) -> Bool
                // pathFilter allows to filter FS nodes by type and path
                rootPath: '/vagrant/sites',
                // rootPath :: String
                // Root search directory
                message: 'Select a target directory for your component:',
                // default: '/',
                suggestOnly: false,
                // suggestOnly :: Bool
                // Restrict prompt answer to available choices or use them as suggestions
            }
        ]);
    }
};
