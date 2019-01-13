const { pwd } = require('shelljs');

module.exports = {
    get_current_dir() {
        return pwd().stdout;
    }
};
