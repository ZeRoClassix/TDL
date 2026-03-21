import routes from './routes.js';

export const store = Vue.reactive({
    dark: JSON.parse(localStorage.getItem('theme-dark')) ?? true,
    // Auth modal state: null | 'login' | 'signup'
    // UI-only – no backend yet
    showAuth: null,
    
    // Auth user state
    user: null,
    loginUsername: '',
    loginPassword: '',
    
    login() {
        if (this.loginUsername === 'ModTest' && this.loginPassword === 'Test1234') {
            this.user = { username: 'ModTest', role: 'moderator' };
            this.showAuth = null;
            this.loginPassword = ''; // clear password
        } else {
            alert('Invalid credentials! Use ModTest / Test1234 for testing.');
        }
    },
    logout() {
        this.user = null;
        this.loginUsername = '';
        this.loginPassword = '';
    },
    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem('theme-dark', JSON.stringify(this.dark));
    },
});

const app = Vue.createApp({
    data: () => ({ store }),
});

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
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

