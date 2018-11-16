const commandLineArgs = require('command-line-args');
const { ask_confirm, ask_input } = require('./utils/ask');

const options = commandLineArgs([
    { name: 'name', type: String },
    { name: 'git-repo', type: String },
    { name: 'dir', type: String }
]);

async function main() {
    const project_name = (options['name'] || await ask_input('What is the name of the project?'));
    const project_name_slug = slugify(project_name, {
        lower: true
    });

    const is_from_github = (options['git-repo'] || await ask_confirm('Does a GitHub repository exist?');

    if (is_from_github) {
        const github_ssh_repository = (options['git-repo'] || await ask_input('What is the GitHub SSH repository? (i.e. git@github.com:Organization/project-name.git)'));

        // Clone GitHub repository
        // shell.exec(`git clone ${github_ssh_repository} ${project_dir}`);

        console.log('github_ssh_repository: ' + github_ssh_repository);

        // Look for .pxl-vagrant/config.yaml and figure out settings from there
        // ...
    }

    console.log(`project name: ${project_name}`);
}

main();
