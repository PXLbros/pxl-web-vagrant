module.exports = {
    lintOnSave: process.env.NODE_ENV !== 'production',

    devServer: {
        overlay: {
            warnings: true,
            errors: true
        }
    },

    css: {
        loaderOptions: {
            sass: {
                data: `
                    // @import "@/styles/_first-to-import.scss";
                    // @import "@/styles/_second-to-import.scss";
                `
            }
        }
    }
};
