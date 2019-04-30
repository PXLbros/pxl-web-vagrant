import Api from '@/services/Api';
import _ from 'lodash';

export default {
    props: {
        resourceType: {
            type: String,
            required: true
        },

        resourceId: {
            type: Number,
            default: null
        },

        isOpen: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            resource_options: undefined
        };
    },

    computed: {
        headerText() {
            if (!this.resource_options) {
                return;
            }

            console.log(this.resource_options);

            if (this.resourceId) {
            } else {
                return `Add ${_.upperFirst(this.resource_options.text.singular)}`;
            }
        }
    },

    async created() {
        this.loadResourceOptions();
    },

    methods: {
        async loadResourceOptions() {
            try {
                const response = await Api().options(this.resourceType);

                this.resource_options = response.data;
            } catch (error) {

            }
        }
    }
};
