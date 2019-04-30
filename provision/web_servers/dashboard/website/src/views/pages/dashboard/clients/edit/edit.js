import Api from '@/services/Api';

import { mapActions } from 'vuex';

import CustomersTable from '@/components/dashboard/customers-table/customers-table.vue';
import InvoicesTable from '@/components/dashboard/invoices-table/invoices-table.vue';
import ClientSettings from '@/components/dashboard/client-settings/client-settings.vue';

import CustomerModal from '@/components/dashboard/customer-modal/customer-modal.vue';
import InvoiceModal from '@/components/dashboard/invoice-modal/invoice-modal.vue';

export default {
    components: {
        CustomersTable,
        InvoicesTable,
        ClientSettings,

        CustomerModal,
        InvoiceModal
    },

    data() {
        return {
            is_loading: false,
            load_error: null,
            is_deleting: false,
            client: null,

            edit_customer: null,

            is_invoice_modal_open: false
        };
    },

    watch: {
        $route(to, from) {
            if (from.name === 'edit-client') {
                this.loadClient();
            }
        }
    },

    async created() {
        await this.loadClient();
    },

    methods: {
        ...mapActions([
            'loadClients'
        ]),

        async loadClient() {
            try {
                this.is_loading = true;
                this.load_error = null;

                const load_response = await Api().get(`clients/${this.$attrs.id}`);

                const client = load_response.data.data;

                this.client = client;
            } catch (load_error) {
                this.load_error = 'Kunde inte ladda uppdraget.';
            } finally {
                this.is_loading = false;
            }
        },

        async deleteClient() {
            const confirm_delete = await this.$swal({
                title: `Ta bort`,
                text: `Är du säker på att du vill ta bort uppdraget?`,
                showCancelButton: true
            });

            if (!confirm_delete.value) {
                return;
            }

            try {
                this.is_deleting = true;

                const delete_response = await Api().delete(`clients/${this.client.id}`);

                if (delete_response.status !== 204) {
                    throw new Error();
                }

                this.$toasted.global.success('Uppdraget har tagits bort.');

                this.loadClients();

                this.$router.push({ name: 'clients' });
            } catch (delete_error) {
                this.$toasted.global.error('Kunde inte ta bort uppdraget.');
            } finally {
                this.is_deleting = false;
            }
        },

        openInvoiceModal(customer = null) {
            this.is_invoice_modal_open = true;
        },

        openCustomerModal(customer) {
            this.edit_customer = customer;
        },

        onCustomersLoaded() {
            this.$refs.invoice_modal.$on('close', () => {
                this.is_invoice_modal_open = false;
            });
        },

        onClientSaved(saved_client) {
            this.client = saved_client;

            this.loadClients();
        }
    }
};
