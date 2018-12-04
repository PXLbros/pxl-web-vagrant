const commandLineArgs = require('command-line-args');
const log = console.log;
const pxlInstaller = require('../pxl-installer');

const options = commandLineArgs([
    { name: 'dir', type: String }
]);

const dir = (options['dir'] || process.cwd());

async function main() {
    const pxl_config_file_path = `${dir}/.pxl/config.yaml`;

    try {
        pxlInstaller.init(pxl_config_file_path);
        pxlInstaller.install();
    } catch (pxl_installer_error) {
        console.log(pxl_installer_error);
    }
}

main();
