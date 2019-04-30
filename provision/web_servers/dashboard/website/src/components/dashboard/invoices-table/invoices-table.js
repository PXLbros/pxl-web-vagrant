import Api from '@/services/Api';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { createDateFilter } from 'vue-date-fns';
import { parseFromTimeZone } from 'date-fns-timezone';
import { sv } from 'date-fns/locale';

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
            columns: [
                {
                    text: 'Datum',
                    value: 'date',
                    type: 'date'
                },
                {
                    text: 'Kunder',
                    value: 'num_customers',
                    type: 'customers'
                },
                {
                    text: 'Leveranskostnad',
                    value: 'delivery_fee'
                },
                {
                    text: 'Skapad',
                    value: 'created_at',
                    type: 'date',
                    date_format: 'HH:MM DD MMMM YYYY'
                }
            ],

            invoices: null,
            formatted_invoices: null,
            is_loading: false,
            load_error: null
        };
    },

    async created() {
        await this.loadInvoices();
    },

    methods: {
        async loadInvoices() {
            try {
                this.is_loading = true;
                this.load_error = null;

                const load_response = await Api().get(`clients/${this.client.id}/invoices`, {
                    params: {
                        'sort-by': 'created_at',
                        'sort-order': 'desc'
                    }
                });

                const invoices = load_response.data.data;

                this.invoices = invoices;
                this.formatted_invoices = invoices.map(invoice => {
                    invoice.created_at = parseFromTimeZone(invoice.created_at, { timeZone: process.env.VUE_APP_DB_TIMEZONE });

                    invoice.values = this.columns.map(column => {
                        let value;

                        if (column.value === 'delivery_fee') {
                            value = `${invoice.data.client.delivery_fee} kr`;
                        } else {
                            value = invoice[column.value];
                        }

                        let column_value = {
                            type: column.type || 'string',
                            value: value
                        };

                        if (column.type === 'date') {
                            column_value.date_format = (column.date_format || 'DD MMMM YYYY');
                        }

                        return column_value;
                    });

                    return invoice;
                });
            } catch (load_error) {
                this.load_error = (process.env.VUE_APP_DEBUG ? load_error : 'Kunde inte ladda fakturor.');
            } finally {
                this.is_loading = false;
            }
        },

        openInvoiceDetails(invoice) {
        },

        openInvoice(invoice) {
            window.open(invoice.url);
        },

        async downloadInvoice(invoice) {
            const filename = `${this.client.name} (${format(new Date(), 'yyyy-MM-dd', { locale: sv })}).pdf`;

            saveAs(invoice.url, filename);
        }
    }
};
