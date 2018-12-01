const process = require('process');
const commandLineArgs = require('command-line-args');
const { cd, exec, pwd, test } = require('shelljs');
const { bold, green, red } = require('chalk');
const { ask_confirm, ask_git_branch, ask_input, ask_php_version } = require('./utils/ask');
const { load_pxl_config_from_dir, print_pxl_config } = require('./utils/pxl');
const log = console.log;

const options = commandLineArgs([
    { name: 'dir', type: String },
    { name: 'git-repo', type: String },
    { name: 'git-branch', type: String }
]);

async function main() {
    const site_dir = (options['dir'] || await ask_input('What is the site directory?', pwd().stdout));

    // Check if site directory already exist
    let site_dir_exist = false;

    if (test('-d', site_dir)) {
        if (!await ask_confirm(`Directory ${site_dir} already exist, do you want to continue?`)) {
            return;
        }

        site_dir_exist = true;
    }

    const is_from_github = (!site_dir_exist && (options['git-repo'] || await ask_confirm('Does a GitHub repository exist?')));
    let git_branch = (options['git-branch'] || null);

    if (is_from_github) {
        const github_ssh_repository = (options['git-repo'] || await ask_input('What is the GitHub SSH repository? (i.e. git@github.com:Organization/project-name.git)'));

        // Clone GitHub repository
        exec(`git clone ${github_ssh_repository} ${site_dir}`);

        if (!test('-d', site_dir)) {
            log(red(`Can't find site directory ${site_dir}.`));

            return;
        }

        // Look for .pxl-vagrant/config.yaml and figure out settings from there
        // ...
    }

    // Go to site directory
    cd(site_dir);

    // Checkout Git branch
    if (is_from_github) {
        let git_checkout_result_code = -1;
        let inited_git_branch_check = false;

        while (git_checkout_result_code !== 0) {
            if (git_branch === null || inited_git_branch_check === true) {
                git_branch = await ask_git_branch();

                inited_git_branch_check = true;
            }

            const git_checkout_result = exec(`git checkout ${git_branch}`, { silent: true });
            // const git_checkout_result = exec(`cd ${site_dir} && git checkout ${git_branch} && pwd`, { silent: true });

            git_checkout_result_code = git_checkout_result.code;

            if (git_checkout_result_code !== 0) {
                log(red(`Could not check out Git branch "${git_branch}".`));
            }
        }
    }

    if (site_dir_exist || is_from_github) {
        // Check if .pxl configuration file exist
        const pxl_config = load_pxl_config_from_dir(site_dir);

        if (pxl_config) {
            log(`\n${green('~ PXL Web Vagrant ~')}`);

            print_pxl_config(pxl_config);

            if (typeof pxl_config.network === 'object' && typeof pxl_config.network.hostname === 'string') {
                exec(`sudo hostile set 127.0.0.1 ${pxl_config.network.hostname}`, { silent: true });
            }

            if (typeof pxl_config['web-server'] === 'string') {
                const public_dir = (typeof pxl_config['public-dir'] === 'string' ? pxl_config['public-dir'] : site_dir);
                const php_version = (typeof pxl_config.code === 'object' && typeof pxl_config.code.php === 'string' ? pxl_config.code.php : null);

                console.log('php_version: ' + php_version);

                exec(`node /vagrant/provision/shell/scripts/create_nginx_site.js --non-interactive --hostname=${pxl_config.network.hostname} --public-dir=${public_dir}${php_version ? `--php=${php_version}` : ''}`);
            }
        }
    }
}

main();
