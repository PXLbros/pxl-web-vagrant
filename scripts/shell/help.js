const { exec } = require('shelljs');
const { blue_line, cyan_line, line_break } = require('../utils/log');

exec('figlet PXL Web Vagrant');

blue_line(`v1.0.0 (Built on [DATE])`);
blue_line('https://github.com/PXLbros/pxl-web-vagrant');

line_break();

cyan_line(`Name: VAGRANT_NAME`);
cyan_line(`IP: IP_ADDRESS`);

exec('echo " "');
