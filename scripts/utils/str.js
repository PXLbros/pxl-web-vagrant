module.exports = {
    remove_trailing_slash(str) {
        return str.replace(/\/$/, '');
    },

    remove_last_directory(path) {
        let new_path = path.split('/');
        new_path.pop();

        return new_path.join('/');
    },

    get_last_directory(path) {
        let new_path = path.split('/');

        return new_path[new_path.length - 1];
    },
    
    get_filename_from_path(path) {
        return path.substring(path.lastIndexOf('/') + 1);
    }
};
