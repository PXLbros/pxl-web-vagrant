import Api from '@/services/Api';

export default {
    props: {
        client: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            form_data: {
                name: this.client.name,
                delivery_fee: this.client.delivery_fee
            },

            is_saving: false
        };
    },

    methods: {
        async save() {
            try {
                this.is_saving = true;

                const save_response = await Api().put(`clients/${this.client.id}`, this.form_data);

                const saved_client = save_response.data.data;

                this.$toasted.global.success(`Uppdraget har sparats.`);

                this.$emit('saved', saved_client);
            } catch (save_error) {
                let error_message = 'Kunde inte spara uppdraget.';

                if (save_error.response.status === 422) {
                    error_message = save_error.response.data.validation_errors;
                } else if (process.env.VUE_APP_DEBUG) {
                    console.log('save_error', save_error);
                }

                this.$toasted.global.error(error_message);
            } finally {
                this.is_saving = false;
            }
        }
    }
};
