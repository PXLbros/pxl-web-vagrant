const chalk = require('chalk');
const { exec } = require('shelljs');
const log = console.log;

function yellow_line(text) {
    log(chalk.yellow(text));
}

module.exports = {
    title_line(title, value, color = 'cyan') {
        log(`${chalk[color](chalk[color](`${title}:`))} ${value}`);
    },

    highlight_line(text) {
        yellow_line(text);
    },

    success_line(text) {
        log(chalk.green(text));
    },

    error_line(text) {
        log(chalk.red(text));
    },

    blue_line(text) {
        log(chalk.blue(text));
    },

    cyan_line(text) {
        log(chalk.cyan(text));
    },

    yellow_line,

    line_break() {
        log();
    },

    figlet(text) {
        exec(`figlet ${text}`);
    }
};
