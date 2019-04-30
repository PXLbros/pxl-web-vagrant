const { blue_line, cyan_line, figlet, line_break } = require('../utils/log');

const package_json = require('../../package.json');

line_break();

figlet('PXL Web Vagrant');

line_break();

blue_line(`v${package_json.version} (Built on ${process.env.VAGRANT_BUILD_DATE})`);
blue_line(`GitHub: https://github.com/PXLbros/pxl-web-vagrant`);
blue_line(`Documentation: https://pxlbros.github.io/pxl-web-vagrant`);

line_break();

cyan_line(`~ ${process.env.VAGRANT_NAME} ~`);
cyan_line(`IP: ${process.env.VAGRANT_IP_ADDRESS}`);
cyan_line(`http://${process.env.VAGRANT_IP_ADDRESS}`);

line_break();
cyan_line(`phpMyAdmin:\nhttp://${process.env.VAGRANT_IP_ADDRESS}/phpmyadmin`);

line_break();
