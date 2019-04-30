import Vue from 'vue';
import Toasted from 'vue-toasted';

Vue.use(Toasted, {
    position: 'bottom-right',
    duration: 3500
});

Vue.toasted.register('error', message => {
    if (typeof message === 'object') {
        const num_errors = Object.keys(message).length;

        let formatted_message = '';

        for (let error_key in message) {
            if (message.hasOwnProperty(error_key)) {
                let error_message = message[error_key];

                formatted_message += (num_errors > 1 ? `- ${error_message}<br>` : error_message);
            }
        }

        return formatted_message;
    } else {
        return (message || 'Something went wrong!');
    }
}, {
    type: 'default'
});

Vue.toasted.register('success', message => {
    return (message || 'Yay!');
});
