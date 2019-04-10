const { exec } = require('shelljs');
const { cyan_line, error_line, highlight_line, line_break } = require('../utils/log');

async function main() {
    const response = await exec('cd /vagrant && git pull', { silent: true });

    if (response.code !== 0) {
        error_line(response.stdout);
        return;
    }

    const response_output = response.stdout;

    if (response_output === 'Already up to date.\n') {
        cyan_line('PXL Web Vagrant is already up to date.\n');
        return;
    }

    highlight_line('Installing new update v1.0.1...');
}

main();
