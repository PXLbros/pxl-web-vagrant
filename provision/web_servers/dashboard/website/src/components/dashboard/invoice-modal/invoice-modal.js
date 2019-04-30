import Util from '@/services/Util';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

const axios = require('axios');

export default {
    props: {
        client: {
            type: Object,
            required: true
        },

        isOpen: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        customerOptions() {
            return this.client.customers.map(customer => {
                return {
                    value: customer.id,
                    text: customer.uid.toString()
                };
            });
        }
    },

    data() {
        return {
            form_data: {
                date: Util.getDateInputValue(),
                customer_type: 'all',
                customer_uid_from: 1,
                customer_uid_to: 2,
                selective_customers: []
            },

            is_creating: false
        };
    },

    methods: {
        async create() {
            try {
                const confirm_update = await this.$swal({
                    title: `Kund(er) redan fakturerade`,
                    text: `Flera kunder är redan fakturerade, fakturadatum kommer att skrivas över. Är du säker på att du vill fortsätta?`,
                    showCancelButton: true
                });

                const update_customers = confirm_update.value;

                this.is_creating = true;

                let form_data = {
                    date: this.form_data.date,
                    update_customers: update_customers,
                    customer_type: this.form_data.customer_type
                };

                if (this.form_data.customer_type === 'interval') {
                    form_data.customer_uid_from = this.form_data.customer_uid_from;
                    form_data.customer_uid_to = this.form_data.customer_uid_to;
                } else if (this.form_data.customer_type === 'selective') {
                    form_data.customers = this.form_data.selective_customers;
                }

                const create_response = await axios({
                    url: `${process.env.VUE_APP_API_URL}/clients/${this.client.id}/invoice`,
                    method: 'GET',
                    params: form_data,
                    responseType: 'blob'
                });

                const url = window.URL.createObjectURL(new Blob([
                    create_response.data
                ]));

                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${this.client.name} (${format(new Date(), 'yyyy-MM-dd', { locale: sv })}).pdf`);

                document.body.appendChild(link);

                link.click();

                this.$toasted.global.error('Faktura skapad.');

                // Close modal
                this.close();
            } catch (create_error) {
                if (process.env.VUE_APP_DEBUG) {
                    console.log('create_error', create_error);
                }

                this.$toasted.global.error('Kunde inte skapa fakturan.');
            } finally {
                this.is_creating = false;
            }
        },

         close() {
             this.$emit('close');

             this.form_data = {
                date: Util.getDateInputValue(),
                customer_type: 'all',
                customer_uid_from: 0,
                customer_uid_to: 0,
                selective_customers: []
            };
         }
    }
};
