import Api from '@/services/Api';
import { createDateFilter } from 'vue-date-fns';
import sv from 'date-fns/locale/sv';
// const { parseFromTimeZone } = require('date-fns-timezone');

export default {
    props: {
        resourceType: {
            type: String,
            required: true
        },

        columns: {
            type: Array,
            required: true
        },

        defaultSortColumn: {
            type: String,
            default: null
        },

        defaultSortOrder: {
            type: String,
            default: 'asc'
        }
    },

    filters: {
        date: createDateFilter('DD MMMM YYYY', { sv })
    },

    data() {
        return {
            filter_text: '',
            current_filter: '',

            resources: null,
            formatted_resources: null,
            is_loading: false,
            load_error: null,

            current_page: 1,
            num_pages: 0,
            num_per_page: 10,
            current_sort_by: this.defaultSortColumn,
            current_sort_order: this.defaultSortOrder,

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
            this.loadResources();
        }
    },

    async created() {
        await this.loadResources();
    },

    methods: {
        async loadResources() {
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

                const load_response = await Api().get(this.resourceType, {
                    params: query_params
                });

                const resources = load_response.data.data;

                this.num_pages = load_response.data.meta.last_page;

                this.resources = resources;
                this.formatted_resources = resources.map(resource => {
                    resource.price_formatted = `${Math.round(resource.price)} kr`;
                    // resource.invoice_date = (resource.invoice_date ? parseFromTimeZone(resource.invoice_date, { timeZone: process.env.VUE_APP_DB_TIMEZONE }) : null);

                    // console.log('resource.invoice_date', resource.invoice_date);

                    resource.values = this.columns.map(column => {
                        return {
                            type: column.type || 'string',
                            value: resource[column.value]
                        };
                    });

                    return resource;
                });

                this.$emit('resources-loaded');
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

            await this.loadResources();
        },

        async clearFilter() {
            this.filter_text = '';
            this.current_filter = '';

            await this.loadResource();
        },

        openResourceModal(resource) {
            this.$emit('open-resource-modal', resource);
        },

        openInvoiceModal(resource = null) {
            this.$emit('open-invoice-modal', resource);
        },

        sort(by) {
            if (this.current_sort_by === by) {
                this.current_sort_order = (this.current_sort_order === 'asc' ? 'desc' : 'asc');
            }

            this.current_sort_by = by;

            this.loadResources();
        },

        goToPreviousPage() {
            if (this.current_page === 1) {
                return;
            }

            this.current_page--;

            this.loadResource();
        },

        goToNextPage() {
            if (this.current_page === this.num_pages) {
                return;
            }

            this.current_page++;

            this.loadResource();
        }
    }
};
