function readStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ignore storage limitations.
    }
}

const STORAGE_KEY = 'tdl_profile_overrides_v1';
const localProfiles = readStorage(STORAGE_KEY, {});

export const store = Vue.reactive({
    dark: true,
    user: readStorage('user', null),
    showAuth: null, // 'login' | 'signup' | null
    profiles: localProfiles,
    loginUsername: '',
    loginPassword: '',
    loginError: '',
    
    // Mock database
    passwords: {
        'ModTest': 'Test1234',
        '[GNG] aidn76': 'classixclears'
    },
    
    toggleDark() {
        this.dark = !this.dark;
        writeStorage('dark', this.dark);
    },
    
    setUser(user) {
        this.user = user;
        writeStorage('user', user);
    },

    login() {
        const username = String(this.loginUsername || '').trim();
        const password = String(this.loginPassword || '').trim();
        if (!username || !password) return;

        if (this.passwords && this.passwords[username] === password) {
            this.setUser({ username, role: username === 'ModTest' ? 'moderator' : 'player' });
            this.loginUsername = '';
            this.loginPassword = '';
            this.showAuth = null;
        } else {
            this.loginError = 'Invalid username or password.';
        }
    },

    logout() {
        this.setUser(null);
        this.loginUsername = '';
        this.loginPassword = '';
    },
    
    getProfile(username) {
        const key = String(username || '').toLowerCase();
        return this.profiles[key] || {};
    },
    
    updateProfile(username, data) {
        const key = String(username || '').toLowerCase();
        this.profiles[key] = {
            ...(this.profiles[key] || {}),
            ...data,
            updatedAt: new Date().toISOString()
        };
        writeStorage(STORAGE_KEY, this.profiles);
    }
});

window.store = store;
