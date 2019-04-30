module.exports = {
    getDateInputValue() {
        let date1 = new Date();
        let date2 = new Date();

        date2.setMinutes(date1.getMinutes() - date1.getTimezoneOffset());

        return date2.toJSON().slice(0, 10);
    }
};
