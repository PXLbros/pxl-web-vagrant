module.exports = {
    remove_trailing_slash(str) {
        return str.replace(/\/$/, '');
    },

    remove_last_directory(path) {
        let new_path = path.split('/');
        new_path.pop();

        return new_path.join('/');
    },
    
    getFilenameFromPath(path) {
        return path.substring(path.lastIndexOf('/') + 1);
    }
};
