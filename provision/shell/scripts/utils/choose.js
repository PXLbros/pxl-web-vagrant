const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const { prompt } = require('inquirer');
const { blue } = require('chalk');
const { find_pxl_projects, get_pxl_config_title_inline } = require('./pxl');

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
    },

    async choose_pxl_project(dir = '/vagrant/projects') {
        log(blue(`Searching for PXL Web Vagrant projects in "${dir}"...`));

        const projects = find_pxl_projects(dir);
        const num_projects = projects.length;

        log(yellow(`\nFound ${num_projects} project${num_projects !== 1 ? 's' : ''}.\n`));

        const prompt_result = (await choose('Projects', projects.map(project => {
            return {
                name: get_pxl_config_title_inline(project, true),
                value: project.name
            };
        })));

        return prompt_result.value;
    }
};
