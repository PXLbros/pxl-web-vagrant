import Api from '@/services/Api';
import { createDateFilter } from 'vue-date-fns';
import sv from 'date-fns/locale/sv';
// const { parseFromTimeZone } = require('date-fns-timezone');

export default {
    props: {
        client: {
            type: Object,
            required: true
        }
    },

    filters: {
        date: createDateFilter('DD MMMM YYYY', { sv })
    },

    data() {
        return {
            filter_text: '',
            current_filter: '',

            columns: [
                {
                    text: '#',
                    value: 'uid',
                    sort: 'uid'
                },
                {
                    text: 'OCR',
                    value: 'ocr',
                    sort: 'ocr'
                },
                {
                    text: 'Pris',
                    value: 'price_formatted',
                    sort: 'price'
                },
                {
                    text: 'Fakturadatum',
                    value: 'invoice_date',
                    type: 'date',
                    sort: 'invoice_date'
                },
                // {
                //     text: 'Förfallodatum',
                //     value: 'due_date'
                // },
                {
                    text: 'Påminnelsedatum',
                    value: 'reminder_invoice_date',
                    type: 'date',
                    sort: 'reminder_invoice_date'
                },
                {
                    text: 'Kravfakturadatum',
                    value: 'requirement_invoice_date',
                    type: 'date',
                    sort: 'requirement_invoice_date'
                },
                // {
                //     text: 'Betalat',
                //     value: 'amount_paid'
                // },
                // {
                //     text: 'Returer',
                //     value: ''
                // },
                {
                    text: 'Kommentar',
                    value: 'comment',
                    sort: 'comment'
                }
            ],

            customers: null,
            formatted_customers: null,
            is_loading: false,
            load_error: null,

            current_page: 1,
            num_pages: 0,
            num_per_page: 10,
            current_sort_by: 'uid',
            current_sort_order: 'asc',

            num_per_page_options: [
                { text: '5', value: 5 },
                { text: '10', value: 10 },
                { text: '25', value: 25 },
                { text: '50', value: 50 },
                { text: '100', value: 100 },
                { text: '200', value: 200 }
            ]
        };
    },

    computed: {
        hasFilter() {
            return this.current_filter;
        }
    },

    watch: {
        num_per_page() {
            this.loadCustomers();
        }
    },

    async created() {
        await this.loadCustomers();
    },

    methods: {
        async loadCustomers() {
            try {
                this.is_loading = true;
                this.load_error = null;

                let query_params = {
                    'page': this.current_page,
                    'limit': this.num_per_page,
                    'sort-by': this.current_sort_by,
                    'sort-order': this.current_sort_order
                };

                if (this.filter_text) {
                    query_params['filter-text'] = this.filter_text;
                }

                const load_response = await Api().get(`clients/${this.client.id}/customers`, {
                    params: query_params
                });

                const customers = load_response.data.data;

                this.num_pages = load_response.data.meta.last_page;

                this.customers = customers;
                this.formatted_customers = customers.map(customer => {
                    customer.price_formatted = `${Math.round(customer.price)} kr`;
                    // customer.invoice_date = (customer.invoice_date ? parseFromTimeZone(customer.invoice_date, { timeZone: process.env.VUE_APP_DB_TIMEZONE }) : null);

                    // console.log('customer.invoice_date', customer.invoice_date);

                    customer.values = this.columns.map(column => {
                        return {
                            type: column.type || 'string',
                            value: customer[column.value]
                        };
                    });

                    return customer;
                });

                this.$emit('customers-loaded');
            } catch (load_error) {
                this.load_error = (process.env.VUE_APP_DEBUG ? load_error : 'Kunde inte ladda kunder.');
            } finally {
                this.is_loading = false;
            }
        },

        async filter(e) {
            if (e.target.value === this.current_filter) {
                return;
            }

            this.filter_text = e.target.value;
            this.current_filter = e.target.value;

            await this.loadCustomers();
        },

        async clearFilter() {
            this.filter_text = '';
            this.current_filter = '';

            await this.loadCustomers();
        },

        openCustomerModal(customer) {
            this.$emit('open-customer-modal', customer);
        },

        openInvoiceModal(customer = null) {
            this.$emit('open-invoice-modal', customer);
        },

        sort(by) {
            if (this.current_sort_by === by) {
                this.current_sort_order = (this.current_sort_order === 'asc' ? 'desc' : 'asc');
            }

            this.current_sort_by = by;

            this.loadCustomers();
        },

        goToPreviousPage() {
            if (this.current_page === 1) {
                return;
            }

            this.current_page--;

            this.loadCustomers();
        },

        goToNextPage() {
            if (this.current_page === this.num_pages) {
                return;
            }

            this.current_page++;

            this.loadCustomers();
        }
    }
};
