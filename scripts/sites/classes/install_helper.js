const { existsSync } = require('fs');
const { cd, cp, exec, mv } = require('shelljs');
const { get_last_directory, remove_trailing_slash } = require('../../utils/str');
const { blue_line, figlet, highlight_line, line_break } = require('../../utils/log');
const resolve = require('path').resolve;
const warn = console.warn;

class InstallHelper
{
    constructor(pxl_config) {
        this.pxl_config = pxl_config;

        this.site_dir = this.pxl_config['site-dir'];

        if (this.site_dir) {
            this.site_dir_name = get_last_directory(this.site_dir);
        }

        if (this.pxl_config.hostname) {
            this.site_url = `http://${this.pxl_config.hostname}:${process.env.APACHE_PORT_HTTP_OUT}`;
        }

        if (this.pxl_config.code && this.pxl_config.code.php) {
            this.php_cli = `php${this.pxl_config.code.php}`;
        }
    }

    install() {
        highlight_line(`Run install script ${this.pxl_config['install-script']}...`);
        line_break();

        if (this.pxl_config.name) {
            figlet(this.pxl_config.name);
            line_break();
        }

        // Go to site directory
        if (this.file_exists(this.site_dir)) {
            this.go_to_dir(this.site_dir);
        }
    }

    finish_install() {
        if (this.file_exists(this.pxl_config['custom-files-dir'])) {
            blue_line(`Found custom-files-dir directory, sync ${this.pxl_config['site-dir']} with ${this.pxl_config['custom-files-dir']}...`);

            this.sync_paths(this.pxl_config['custom-files-dir'], this.pxl_config['site-dir']);
        }
    }

    sync_paths(from_dir, to_dir) {
        from_dir = remove_trailing_slash(from_dir);
        to_dir = remove_trailing_slash(to_dir);
        
        const rsync_result = exec(`rsync -a ${from_dir}/ ${to_dir}/`);

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

    edit_env(file, keys, type = 'dotenv') {
        let num_total = 0;
        let num_successful = 0;

        for (let key in keys) {
            const value = keys[key];
            
            let sed_command;

            if (type === 'dotenv') {
                sed_command = `sed -i s~${key}=.*$~${key}=${value}~g ${file}`;
            } else if (type === 'wordpress') {
                sed_command = `sed -i s~${key}~${value}~g ${file}`;
            } else if (type === 'editorconfig') {
                // sed_command = `sed -i s~${key}\s=\s.*$~${key}\s=\s${value}~g ${file}`;
            } else {
                warn(`end_env type "${type}" not implemented.`);

                return false;
            }
            
            const sed_result = exec(sed_command);
            
            if (sed_result.code === 0) {
                num_successful++;
            }

            num_total++;
        }

        const all_successful = (num_successful === num_total);

        if (!all_successful) {
            return false;
        }

        return true;
    }

    yarn(command = null) {
        const exec_result = exec(`yarn${command !== null ? ` ${command}` : ``}`);

        return (exec_result.code === 0);
    }

    run(command) {
        const exec_result = exec(command);

        return (exec_result.code === 0);
    }

    delete(path, recursive = false) {
        const exec_result = exec(`rm ${recursive ? '-rf' : ''} ${path}`);
        
        return (exec_result.code === 0);
    }
}

module.exports = InstallHelper;
