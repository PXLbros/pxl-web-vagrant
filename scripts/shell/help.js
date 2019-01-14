const { blue } = require('chalk');
const { exec } = require('shelljs');
const log = console.log;

exec('figlet PXL Web Vagrant');

log(blue(`v1.0.0 (Built on [DATE])`));
log(blue('https://github.com/PXLbros/pxl-web-vagrant'));

exec('echo " "');
