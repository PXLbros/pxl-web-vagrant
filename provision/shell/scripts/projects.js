const { blue, yellow } = require('chalk');
const { find_pxl_projects, get_pxl_config_title_inline } = require('./utils/pxl');
const { choose } = require('./utils/choose');
const log = console.log;

async function main() {
    const dir = `/vagrant/projects`;

    log(blue(`Searching for PXL Web Vagrant projects in "${dir}"...`));

    const projects = find_pxl_projects(dir);
    const num_projects = projects.length;

    log(yellow(`\nFound ${num_projects} project${num_projects !== 1 ? 's' : ''}.\n`));

    const selected_project = (await choose('Select project', projects.map(project => {
        return {
            name: get_pxl_config_title_inline(project, true),
            value: project.name
        };
    })));
}

main();
