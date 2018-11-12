const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const { prompt } = require('inquirer');

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
    }
};
