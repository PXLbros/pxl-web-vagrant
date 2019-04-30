import Vue from 'vue';
import App from './App.vue';

// Router
import router from './router';

// Vuex
import store from './store';

// Semantic UI
import SuiVue from 'semantic-ui-vue';
// import 'semantic-ui-css/semantic.min.css';
import '../semantic/dist/semantic.min.css';

// vue-timeago
import './libs/vue-timeago';

// Layouts
import AuthLayout from './views/layouts/auth/auth.vue';
import DashboardLayout from './views/layouts/dashboard/dashboard.vue';

Vue.config.productionTip = false;

Vue.use(SuiVue);

Vue.component('auth-layout', AuthLayout);
Vue.component('dashboard-layout', DashboardLayout);

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
