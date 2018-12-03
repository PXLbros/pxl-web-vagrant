const commandLineArgs = require('command-line-args');
const { ask_confirm, ask_input } = require('./utils/ask');
const { remove_trailing_slash } = require('./utils/str');
const { create_project, create_pxl_project_config } = require('./utils/pxl');

const options = commandLineArgs([
    { name: 'name', type: String },
    { name: 'dir', type: String }
]);

async function main() {
    create_project(options);
}

main();
