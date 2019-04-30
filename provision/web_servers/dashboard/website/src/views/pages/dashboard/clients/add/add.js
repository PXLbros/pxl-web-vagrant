import { mapActions, mapState } from 'vuex';
import Api from '@/services/Api';

export default {
    data() {
        return {
            did_set_settings_initially: false,

            form_data: {
                name: '',
                package_id: null,
                customer_uid_from: '',
                customer_uid_to: '',
                modules: [],
                delivery_fee: null
            },

            selected_package_id: null,

            is_saving: false
        };
    },

    computed: {
        ...mapState({
            settings: 'settings',

            isLoadingPackages: 'is_loading_packages',
            loadPackagesError: 'load_packages_error',
            packages: 'packages'
        }),

        packagesOptions() {
            if (!this.packages) {
                return;
            }

            const packages_options = this.packages.map(_package => {
                return {
                    value: _package.id,
                    text: `${_package.name} (${_package.price} kr)`
                };
            });

            return packages_options;
        },

        selectedPackage() {
            if (!this.selected_package_id) {
                return null;
            }

            return this.packages.find(_package => _package.id === this.selected_package_id);
        }
    },

    watch: {
        selectedPackage() {
            if (!this.selectedPackage) {
                return;
            }

            // Add modules from selected package
            for (let module of this.selectedPackage.modules) {
                this.form_data.modules.push({
                    name: module.name,
                    price: module.price
                });
            }
        },

        settings() {
            if (this.settings && !this.did_set_settings_initially) {
                this.form_data.delivery_fee = this.settings.delivery_fee;

                this.did_set_settings_initially = true;
            }
        }
    },

    async created() {
        await this.loadPackages();
    },

    methods: {
        ...mapActions([
            'loadClients',
            'loadPackages'
        ]),

        async save() {
            try {
                this.is_saving = true;

                const save_response = await Api().post('clients', this.form_data);

                if (save_response.data.error) {
                    if (save_response.data.error === 'existing_customers') {
                        if (save_response.data.num_existing_customers === 1) {
                            throw new Error('Kundnummer upptaget.');
                        } else {
                            throw new Error(`Kundnummer upptagna av ${save_response.data.num_existing_customers} andra kunder.`);
                        }
                    } else {
                        throw new Error();
                    }
                }

                const added_client = save_response.data.data;

                this.$toasted.global.success(`Uppdraget "${added_client.name}" har sparats.`);

                // Reload clients
                this.loadClients();

                // Go to created client
                this.$router.push({ name: 'edit-client', params: { id: added_client.id } });
            } catch (save_error) {
                let error_message = save_error.message || 'Kunde inte spara uppdraget.';

                if (save_error.response && save_error.response.status === 422) {
                    error_message = save_error.response.data.validation_errors;
                } else if (process.env.VUE_APP_DEBUG) {
                    console.log('save_error', save_error);
                }

                this.$toasted.global.error(error_message);
            } finally {
                this.is_saving = false;
            }
        },

        addModule() {
            const num_modules = this.form_data.modules.length;

            // Focus last form field if empty instead of adding new one
            if (num_modules > 0 && !this.form_data.modules[num_modules - 1].name) {
                this.$refs.module_name_inputs[num_modules - 1].focus();

                return;
            }

            this.form_data.modules.push({
                name: '',
                price: ''
            });

            // Focus name field
            this.$nextTick(() => {
                this.$refs.module_name_inputs[this.form_data.modules.length - 1].focus();
            });
        },

        async removeModule(module_to_remove, module_index_to_remove) {
            if (module_to_remove.name) {
                const confirm_remove = await this.$swal({
                    title: `Ta bort`,
                    text: `Är du säker på att du vill ta bort modulen?`,
                    showCancelButton: true
                });

                if (!confirm_remove.value) {
                    return;
                }
            }

            this.form_data.modules.splice(module_index_to_remove, 1);
        }
    }
};
