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
                    @import "@/styles/_colors.scss";
                    @import "@/styles/_settings.scss";
                `
            }
        }
    }
};
