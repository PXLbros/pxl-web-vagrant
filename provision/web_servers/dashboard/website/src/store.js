import Vue from 'vue';
import Vuex from 'vuex';
import Api from '@/services/Api';

const axios = require('axios');

Vue.use(Vuex);

const user = (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

if (user && user.jwt) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${user.jwt}`;
}

export default new Vuex.Store({
    state: {
        is_signing_in: false,
        user: user,

        is_loading_settings: false,
        load_settings_error: false,
        settings: undefined,

        is_loading_clients: false,
        load_clients_error: false,
        clients: undefined,

        is_loading_packages: false,
        load_packages_error: false,
        packages: undefined
    },

    mutations: {
        // Auth
        setIsSigningIn(state, value) {
            state.is_signing_in = value;
        },

        setUser(state, user) {
            localStorage.setItem('user', JSON.stringify(user));

            axios.defaults.headers.common['Authorization'] = `Bearer ${user.jwt}`;

            state.user = user;
        },

        // Settings
        setIsLoadingSettings(state, value) {
            state.is_loading_settings = value;
        },

        setLoadSettingsError(state, value) {
            state.load_settings_error = value;
        },

        setSettings(state, settings) {
            state.settings = settings;
        },

        // Clients
        setIsLoadingClients(state, value) {
            state.is_loading_clients = value;
        },

        setLoadClientsError(state, value) {
            state.load_clients_error = value;
        },

        setClients(state, clients) {
            state.clients = clients;
        },

        // Packages
        setIsLoadingPackages(state, value) {
            state.is_loading_packages = value;
        },

        setLoadPackagesError(state, value) {
            state.load_packages_error = value;
        },

        setPackages(state, packages) {
            state.packages = packages;
        }
    },

    getters: {
        user: state => state.user,

        settings: state => state.settings,
        isLoadingSettings: state => state.is_loading_settings,
        loadSettingsError: state => state.load_settings_error
    },

    actions: {
        async loadSettings(context) {
            try {
                context.commit('setIsLoadingSettings', true);
                context.commit('setLoadSettingsError', false);

                const load_response = await Api().get(`settings`);

                if (typeof load_response.data.data !== 'object') {
                    throw new Error();
                }

                const settings = load_response.data.data;

                let formatted_settings = {};

                for (let setting of settings) {
                    formatted_settings[setting.key] = setting.value;
                }

                context.commit('setSettings', formatted_settings);
            } catch (load_error) {
                context.commit('setLoadSettingsError', true);
            } finally {
                context.commit('setIsLoadingSettings', false);
            }
        },

        async loadClients(context) {
            try {
                context.commit('setIsLoadingClients', true);
                context.commit('setLoadClientsError', false);

                const load_response = await Api().get(`clients`);

                if (typeof load_response.data.data !== 'object') {
                    throw new Error();
                }

                const clients = load_response.data.data;

                context.commit('setClients', clients);
            } catch (load_error) {
                console.log('load_error', load_error);
                context.commit('setLoadClientsError', true);
            } finally {
                context.commit('setIsLoadingClients', false);
            }
        },

        async loadPackages(context) {
            try {
                context.commit('setIsLoadingPackages', true);
                context.commit('setLoadPackagesError', false);

                const load_response = await Api().get(`packages`);

                if (typeof load_response.data.data !== 'object') {
                    throw new Error();
                }

                const packages = load_response.data.data;

                context.commit('setPackages', packages);
            } catch (load_error) {
                context.commit('setLoadPackagesError', true);
            } finally {
                context.commit('setIsLoadingPackages', false);
            }
        }
    }
});
