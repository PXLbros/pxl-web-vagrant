import Api from '@/services/Api';
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            did_set_settings_initially: false,

            form_data: {
                delivery_fee: null
            },

            is_saving: false
        };
    },

    computed: {
        ...mapState({
            settings: 'settings',
            is_loading: 'isLoadingSettings',
            load_error: 'loadSettingsError'
        })
    },

    watch: {
        settings() {
            if (this.settings && !this.did_set_settings_initially) {
                this.form_data.delivery_fee = this.settings.delivery_fee;

                this.did_set_settings_initially = true;
            }
        }
    },

    methods: {
        ...mapActions([
            'loadSettings'
        ]),

        async save() {
            try {
                this.is_saving = true;

                // Save settings
                await Api().put('settings', this.settings);

                // Load settings
                await this.loadSettings();

                this.$toasted.global.success('Inställningar sparade.');
            } catch (save_error) {
                let error_message = 'Kunde inte spara inställningar.';

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
