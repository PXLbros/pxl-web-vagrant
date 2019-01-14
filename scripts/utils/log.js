const chalk = require('chalk');
const log = console.log;

module.exports = {
    title_line(title, value, color = 'cyan') {
        log(`${chalk[color](chalk[color](`${title}:`))} ${value}`);
    },

    highlight_line(text) {
        log(chalk.yellow(text));
    },

    error_line(message) {
        log(chalk.red(message));
    },

    line_break() {
        log();
    }
};
