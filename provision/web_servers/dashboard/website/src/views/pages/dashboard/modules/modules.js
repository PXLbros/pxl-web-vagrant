import ResourceTable from '@/components/dashboard/resource-table/resource-table.vue';
import ResourceModal from '@/components/dashboard/resource-modal/resource-modal.vue';

export default {
    components: {
        ResourceTable,
        ResourceModal
    },

    data() {
        return {
            is_module_modal_open: false
        };
    },

    computed: {
        isResourceModalOpen() {
        }
    },

    methods: {
        openModuleModal() {
            this.is_module_modal_open = true;
        }
    }
};
