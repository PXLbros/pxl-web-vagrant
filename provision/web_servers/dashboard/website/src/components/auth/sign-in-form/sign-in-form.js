import { mapMutations } from 'vuex';
import Api from '@/services/Api';

export default {
    data () {
        return {
            email: '',
            password: '',

            is_signing_in: false,
            is_signed_in: false,
            sign_in_error: null
        };
    },

    mounted () {
        this.$refs.email_input.focus();
    },

    methods: {
        ...mapMutations([
            'setIsSigningIn',
            'setUser'
        ]),

        async signIn() {
            try {
                this.setIsSigningIn(true);

                this.sign_in_error = null;

                const sign_in_response = await Api().post('auth', {
                    email: this.email,
                    password: this.password
                });

                const user = sign_in_response.data.data.user;
                const jwt = sign_in_response.data.data.jwt;

                user.jwt = jwt;

                this.setUser(user);

                this.is_signed_in = true;

                this.$router.push({ name: 'clients' });
            } catch (error) {
                if (process.env.VUE_APP_DEBUG) {
                    console.error(error);
                }

                this.$toasted.global.error((error.response && error.response.status === 401 ? 'Invalid email or password.' : 'Could not sign in right now.'));
            } finally {
                this.setIsSigningIn(false);
            }
        }
    }
};
