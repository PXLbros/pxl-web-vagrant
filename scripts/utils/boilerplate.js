const yaml = require('js-yaml');
const { existsSync, readdirSync, readFileSync } = require('fs');
const { ask_confirm } = require('./ask');
const { choose } = require('./choose');
const { getLastDirectory } = require('./str');

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

        return {
            dir: dir,
            pxl_config_file_path: `${dir}/.pxl/config.yaml`,
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

    loadBoilerplate(boilerplate) {
        if (existsSync(boilerplate.pxl_config_file_path)) {
            try {
                const pxl_config = yaml.safeLoad(readFileSync(boilerplate.pxl_config_file_path, 'utf8'));

                boilerplate.pxl_config = pxl_config;

                // if (pxl_config['name']) {
                //     boilerplate.name = pxl_config['name'];
                // }

                // if (pxl_config['public-dir']) {
                //     boilerplate.public_dir = pxl_config['public-dir'];
                // }

                // if (pxl_config['code']) {
                //     boilerplate.code = pxl_config['code'];
                // }

                // if (pxl_config['database']) {
                //     boilerplate.database = pxl_config['database'];
                // }
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
