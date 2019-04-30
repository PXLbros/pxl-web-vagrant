import { mapActions } from 'vuex';
import SidebarClients from '@/components/dashboard/sidebar-clients/sidebar-clients.vue';

require('@/libs/toasted');
require('@/libs/sweetalert');

export default {
    components: {
        SidebarClients
    },

    created() {
        this.loadSettings();
        this.loadClients();
    },

    methods: {
        ...mapActions([
            'loadSettings',
            'loadClients'
        ]),

        signOut() {
            localStorage.removeItem('user');

            this.$router.push({ name: 'auth' });
        }
    }
};
