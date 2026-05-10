import routes from './routes.js';
import { initFlags } from './flags.js';
import { store } from './store.js';

const VueGlobal = window.Vue;
const VueRouterGlobal = window.VueRouter;

const router = VueRouterGlobal.createRouter({
    history: VueRouterGlobal.createWebHashHistory(),
    routes,
});

const app = VueGlobal.createApp({
    data: () => ({ store }),
    methods: {
        toggleDark() {
            this.store.toggleDark();
        },
        openAuth(type) {
            this.store.showAuth = type;
        },
        closeAuth() {
            this.store.showAuth = null;
        },
        handleLogin() {
            // BACKEND: Connect to real login API here
            const username = this.loginUsername.trim();
            const password = this.loginPassword.trim();
            
            // Mock authentication
            if (this.store.passwords && this.store.passwords[username] === password) {
                this.store.setUser({ username, role: username === 'ModTest' ? 'moderator' : 'player' });
                this.closeAuth();
            } else {
                alert('Invalid username or password.');
            }
        },
        handleLogout() {
            this.store.setUser(null);
        }
    },
    computed: {
        loginUsername: {
            get() { return this.store.loginUsername || ''; },
            set(v) { this.store.loginUsername = v; }
        },
        loginPassword: {
            get() { return this.store.loginPassword || ''; },
            set(v) { this.store.loginPassword = v; }
        },
        authModalMode() {
            const mode = this.store.showAuth;
            return mode === 'login' || mode === 'signup' ? mode : 'login';
        },
        authModalTitle() {
            return this.authModalMode === 'signup' ? 'Create your account' : 'Welcome back';
        },
        authModalEyebrow() {
            return this.authModalMode === 'signup' ? 'Join PCDemonlist' : 'Account Access';
        },
        authModalDescription() {
            return this.authModalMode === 'signup'
                ? 'Sign up to comment, submit records, and access community features.'
                : 'Log in to continue to the official submission and ranking platform.';
        },
    }
});

// Click Outside Directive
app.directive('click-outside', {
    mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event);
            }
        };
        document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
    },
});

app.use(router);
initFlags().then(() => {
    app.mount('#app');
});
