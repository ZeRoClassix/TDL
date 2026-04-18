import routes from './routes.js';
import { initFlags } from './flags.js';

const VueGlobal = window.Vue;
const VueRouterGlobal = window.VueRouter;

export const store = VueGlobal.reactive({
    dark: JSON.parse(localStorage.getItem('theme-dark')) ?? true,
    // Auth modal state: null | 'login' | 'signup'
    // UI-only – no backend yet
    showAuth: null,
    
    // Auth user state
    user: JSON.parse(localStorage.getItem('user')) || null,
    loginUsername: '',
    loginPassword: '',
    // Auth user passwords (mock database)
    passwords: {
        'ModTest': 'Test1234',
        '[GNG] aidn76': 'classixclears'
    },
    
    // Player profiles (Clan Tag, Flag override)
    profiles: JSON.parse(localStorage.getItem('profiles')) || {},

    login() {
        if (this.passwords[this.loginUsername] === this.loginPassword) {
            const role = this.loginUsername === 'ModTest' ? 'moderator' : 'player';
            this.user = { username: this.loginUsername, role };
            this.saveAuth();
            this.showAuth = null;
            this.loginPassword = '';
            this.loginUsername = '';
        } else {
            alert('Invalid username or password.');
        }
    },
    logout() {
        this.user = null;
        this.saveAuth();
    },
    saveAuth() {
        localStorage.setItem('user', JSON.stringify(this.user));
    },
    updateProfile(username, data) {
        this.profiles[username.toLowerCase()] = {
            ...this.profiles[username.toLowerCase()],
            ...data
        };
        localStorage.setItem('profiles', JSON.stringify(this.profiles));
    },
    getProfile(username) {
        return this.profiles[username?.toLowerCase()] || {};
    },
    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem('theme-dark', JSON.stringify(this.dark));
    },
});

// Expose store globally for components to access without circular deps
window.store = store;

// Initialize flag data from 2kplayerflags.txt
initFlags();



const app = VueGlobal.createApp({
    data: () => ({ store }),
    watch: {
        'store.dark'(val) {
            document.documentElement.classList.toggle('dark', val);
            document.body.classList.toggle('dark', val);
        }
    },
    mounted() {
        document.documentElement.classList.toggle('dark', this.store.dark);
        document.body.classList.toggle('dark', this.store.dark);
    }
});

const router = VueRouterGlobal.createRouter({
    history: VueRouterGlobal.createWebHashHistory(),
    routes,
});

/**
 * v-click-outside directive
 * Calls the binding value (a function) when a click occurs outside the element.
 * Used by the demon dropdown in Submit.js to auto-close on outside click.
 *
 * Usage: <div v-click-outside="() => isOpen = false">…</div>
 */
app.directive('click-outside', {
    beforeMount(el, binding) {
        el._clickOutsideHandler = (event) => {
            if (!el.contains(event.target)) {
                binding.value(event);
            }
        };
        document.addEventListener('click', el._clickOutsideHandler, true);
    },
    unmounted(el) {
        document.removeEventListener('click', el._clickOutsideHandler, true);
    },
});

app.use(router);

app.mount('#app');

