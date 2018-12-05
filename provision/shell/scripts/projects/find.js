const commandLineArgs = require('command-line-args');
const { exec } = require('shelljs');
const { blue, gray, yellow } = require('chalk');
const { find_pxl_projects, get_pxl_config_title_inline } = require('../utils/pxl');
const { choose } = require('../utils/choose');
const log = console.log;

const options = commandLineArgs([
    { name: 'debug', type: Boolean }
]);

async function main() {
    const dir = `/vagrant/projects`;

    // log(blue(`Searching for PXL Web Vagrant projects in "${dir}"...\n`));

    const projects = find_pxl_projects(dir);
    const num_projects = projects.length;

    // log(yellow(`Found ${num_projects} project${num_projects !== 1 ? 's' : ''}.`) + `\n`);

    if (options['debug']) {
        log(gray(`Found from cache.\n`));
    }

    const selected_project = (await choose('Projects', projects.map(project => {
        return {
            name: get_pxl_config_title_inline(project, true),
            value: project.name
        };
    })));
}

main();
