const { existsSync, readdirSync } = require('fs');
const { ask_confirm } = require('./ask');
const { choose } = require('./choose');
const { getLastDirectory } = require('./str');
const { load_pxl_config } = require('./pxl');

const boilerplateUtil = {
    getBoilerplates() {
        const default_boilerplates = this.getBoilerplatesDirs('default');
        const user_boilerplates = this.getBoilerplatesDirs('user');

        return default_boilerplates.concat(user_boilerplates).map(boilerplate => boilerplateUtil.loadBoilerplate(boilerplate));
    },

    getBoilerplatesDirs(type) {
        return readdirSync(`/vagrant/boilerplates/${type}`).map(boilerplate_dir => {
            const dir = `/vagrant/boilerplates/${type}/${boilerplate_dir}`;

            return {
                dir: dir,
                pxl_config_file_path: `${dir}/.pxl/config.yaml`,
                type: type
            };
        });
    },

    getBoilerplateFromName(name, type) {
        const dir = `/vagrant/boilerplates/${type}/${name}`;
        const install_script_path = `${dir}/.pxl/install.js`;

        return {
            dir: dir,
            pxl_config_file_path: `${dir}/.pxl/config.yaml`,
            install_script: (existsSync(install_script_path) ? install_script_path : null),
            type: type
        };
    },

    getNumBoilerplates() {
        return this.getBoilerplates().length;
    },

    async askBoilerplate(question) {
        const boilerplates = boilerplateUtil.getBoilerplates();
        const num_boilerplates = boilerplates.length;

        if (num_boilerplates === 0) {
            return false;
        }

        if (!await ask_confirm(question)) {
            return false;
        }

        const selected_boilerplate = await choose('Choose:', boilerplates.map(boilerplate => {
            return {
                name: `${boilerplate.name} (${boilerplate.type})`,
                value: boilerplate
            };
        }));

        return this.loadBoilerplate(selected_boilerplate);
    },

    loadBoilerplate(boilerplate, site_dir) {
        if (existsSync(boilerplate.pxl_config_file_path)) {
            try {
                const pxl_config = load_pxl_config(boilerplate.pxl_config_file_path, site_dir);

                boilerplate.pxl_config = pxl_config;
            } catch (load_pxl_config_error) {
                console.log(load_pxl_config_error);
                console.log(load_pxl_config_error.message);
            }
        } else {
            boilerplate.name = getLastDirectory(boilerplate.dir);
        }

        return boilerplate;
    }
};

module.exports = boilerplateUtil;
