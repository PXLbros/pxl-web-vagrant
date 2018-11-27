const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const { prompt } = require('inquirer');

module.exports = {
    async choose(question, choices) {
        const prompt_result = await prompt([
            {
                type: 'list',
                name: 'value',
                message: question,
                choices: choices,
                pageSize: 20
            }
        ]);

        return prompt_result.value;
    },

    async choose_files_from_dir(dir, question) {
        const apache_available_sites_configuration_files = readdirSync(dir);

        const choices = apache_available_sites_configuration_files.map(file => {
            return {
                name: file,
                value: file
            };
        });

        const prompt_result = await prompt([
            {
                type: 'list',
                name: 'value',
                message: question,
                choices: choices,
                pageSize: 20
            }
        ]);

        return prompt_result.value;
    }
};
