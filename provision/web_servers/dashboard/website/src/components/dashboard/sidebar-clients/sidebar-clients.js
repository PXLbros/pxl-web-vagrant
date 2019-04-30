import { mapState, mapActions } from 'vuex';

export default {
    computed: {
        ...mapState({
            isLoadingClients: 'is_loading_clients',
            loadClientsError: 'load_clients_error',
            clients: 'clients'
        })
    },

    methods: {
        ...mapActions([
            'loadClients'
        ])
    }
};
