const { exec } = require('shelljs');
const { blue_line, cyan_line, line_break } = require('../utils/log');

const package_json = require('../../package.json');

line_break();

exec('figlet PXL Web Vagrant');

blue_line(`v${package_json.version} (Built on [${process.env.BUILD_DATE}])`);
blue_line('https://github.com/PXLbros/pxl-web-vagrant');

line_break();

cyan_line(`Vagrant Name: ${process.env.VAGRANT_NAME}`);
cyan_line(`IP: ${process.env.IP_ADDRESS}`);

exec('echo " "');
