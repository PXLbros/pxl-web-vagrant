const { exec } = require('shelljs');

exec('figlet PXL Web Vagrant');

exec(`cat ${process.env.HOME}/.bash_profile`);

exec('echo " "');
