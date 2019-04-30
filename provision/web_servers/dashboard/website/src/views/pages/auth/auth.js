import { mapState } from 'vuex';

import SignInForm from '@/components/auth/sign-in-form/sign-in-form.vue';

export default {
    components: {
        SignInForm
    },

    data() {
        return {
            is_sign_up_mode: false
        };
    },

    computed: {
        ...mapState({
            isSigningIn: 'is_signing_in'
        })
    }
};
