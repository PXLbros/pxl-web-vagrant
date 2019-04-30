import Vue from 'vue';
import VueTimeago from 'vue-timeago';
// import toNow from 'date-fns/distance_in_words_to_now';

Vue.use(VueTimeago, {
    locale: 'sv',

    locales: {
        sv: require('date-fns/locale/sv')
    }
    // converter: date => {
    //     return toNow(date, {
    //         undefined,
    //         includeSeconds: false,
    //         addSuffix: true
    //     });
    // }
});
