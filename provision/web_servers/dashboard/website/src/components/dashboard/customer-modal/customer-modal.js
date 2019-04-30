import Api from '@/services/Api';

// import Util from '@/services/Util';
// import { format } from 'date-fns';
// import { sv } from 'date-fns/locale';

// const axios = require('axios');

export default {
    props: {
        customer: {
            type: Object,
            defualt: null
        },

        isOpen: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        difference() {
            return (this.customer.price - (this.form_data.discount || 0));
        }
    },

    data() {
        let form_data = {};

        if (this.customer) {
            form_data.discount = this.customer.discount;
            form_data.comment = this.customer.comment;
        }

        return {
            form_data: form_data,

            is_saving: false
        };
    },

    methods: {
        async save() {
            try {
                this.is_saving = true;

                const save_response = await Api().put(`clients/${this.customer.client_id}/${this.customer.id}`);

                console.log('save_response', save_response);
            } catch (save_error) {
                console.log(save_error);

                alert('noo :(');
            } finally {
                this.is_saving = false;
            }
        },

        close() {
            this.$emit('close');

            this.form_data = {
                comment: ''
            };
        }
    }
};
