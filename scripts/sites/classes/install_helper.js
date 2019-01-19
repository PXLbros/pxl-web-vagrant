const { existsSync } = require('fs');
const { cd, cp, exec, mv } = require('shelljs');
const { remove_trailing_slash } = require('../../utils/str');
const { blue_line, error_line, figlet, highlight_line, line_break, success_line } = require('../../utils/log');

class InstallHelper
{
    constructor(pxl_config) {
        this.pxl_config = pxl_config;

        this.site_dir = this.pxl_config['site-dir'];
        this.site_url = `http://${this.pxl_config.hostname}:${process.env.APACHE_PORT_OUT}`;
        this.php_cli = `php${this.pxl_config.code.php}`;
    }

    install() {
        highlight_line(`Run install script ${this.pxl_config['install-script']}...`);
        line_break();

        if (this.pxl_config.name) {
            figlet(this.pxl_config.name);
            line_break();
        }

        // Go to site directory
        this.go_to_dir(this.site_dir);
    }

    finish_install() {
        highlight_line(`Finish installation...`);
        line_break();

        if (this.file_exists(this.pxl_config['custom-files-dir'])) {
            this.sync_paths(this.pxl_config['custom-files-dir'], this.pxl_config['site-dir'])
        }

        // Summary
        success_line(`${this.pxl_config.name} has been successfully installed!`);
        line_break();

        blue_line(`Site Directory: ${this.site_dir}`);
        blue_line(`Site Public Directory: ${this.pxl_config['public-site-dir']}`);
        blue_line(`URL: ${this.site_url}.`);
    }

    sync_paths(from_dir, to_dir) {
        const rsync_result = exec(`rsync -a ${from_dir}/ ${to_dir}`);

        return (rsync_result.code === 0);
    }

    php(command) {
        exec(`${this.php_cli} ${command}`);
    }

    composer(command) {
        this.php(`/usr/local/bin/composer ${command}`);
    }

    file_exists(path) {
        return existsSync(path);
    }

    go_to_dir(dir) {
        cd(dir);
    }

    copy_file(from, to) {
        cp(from, to);
    }

    move_files(from_dir, to_dir) {
        from_dir = remove_trailing_slash(from_dir);
        to_dir = remove_trailing_slash(to_dir);

        mv(`${from_dir}/{*,.*}`, `${to_dir}/`);
    }

    edit_env_file(file, key, value) {
        const sed_result = exec(`sed -i s~${key}=.*$~${key}=${value}~g ${file}`);

        return (sed_result.code === 0);
    }

    replace_env_file(file, from, to) {
        const sed_result = exec(`sed -i s~${from}~${to}~g ${file}`);

        return (sed_result.code === 0);
    }

    yarn(command = null) {
        const exec_result = exec(`yarn${command !== null ? ` ${command}` : ``}`);

        return (exec_result.code === 0);
    }

    run(command) {
        const exec_result = exec(command);

        return (exec_result.code === 0);
    }
}

module.exports = InstallHelper;
