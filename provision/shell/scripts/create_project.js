const commandLineArgs = require('command-line-args');
const slugify = require('slugify');
const { cd, mkdir, pwd, test } = require('shelljs');
const { ask_confirm, ask_input } = require('./utils/ask');
const { remove_trailing_slash } = require('./utils/str');
const { create_pxl_config } = require('./utils/pxl');

const options = commandLineArgs([
    { name: 'name', type: String },
    { name: 'dir', type: String }
]);

async function main() {
    const project_name = (options['name'] || await ask_input('What is the name of the project?'));
    const project_name_slug = slugify(project_name, {
        lower: true
    });

    const project_dir = remove_trailing_slash(options['dir'] || await ask_input('What is the project directory?'));

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
        await create_pxl_config(project_name, project_dir);
    } catch (create_pxl_config_error) {
        console.log(create_pxl_config_error);
        console.log(create_pxl_config_error.message);
    }

    console.log(`Project "${project_name}" has been created!`);

    if (pwd().stdout !== project_dir) {
        const go_to_dir = (await ask_confirm(`Do you want to go to project directory ${project_dir}?`));

        if (go_to_dir) {
            cd(project_dir);
        }
    }
}

main();
