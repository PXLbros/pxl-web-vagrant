import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/pages/home/home.vue';

Vue.use(Router);

const router = new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
            meta: {
                guest: true
            }
        }
        // {
        //     path: '/installningar',
        //     name: 'settings',
        //     meta: {
        //         layout: 'dashboard',
        //         require_auth: true
        //     },
        //     component: () => import(/* webpackChunkName: "dashboard" */ './views/pages/dashboard/settings/settings.vue')
        // }
    ]
});

export default router;
