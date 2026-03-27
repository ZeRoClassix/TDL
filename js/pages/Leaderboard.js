import { fetchLeaderboard } from '../content.js';
import { getPlayerFlag, getAllFlags } from '../flags.js';

/**
 * Format numbers with commas and exactly 2 decimals
 * @param {Number} num
 * @returns {String} Formatted number
 */
export function localize(num) {
    return Number(num).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
        searchQuery: '',
        showEdit: false,
        editName: '',
        editTag: '',
        editFlag: '',
        store: window.store, // Access global store
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>
                <div class="board-container">
                    <!-- Search Bar -->
                    <div class="search-bar">
                        <input type="text" v-model="searchQuery" placeholder="Search player..." />
                        <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''" aria-label="Clear search">✕</button>
                    </div>

                    <!-- Leaderboard Table -->
                    <table class="board" v-if="filteredLeaderboard.length > 0">
                        <tr v-for="(ientry, i) in filteredLeaderboard" :key="ientry.user">
                            <td class="rank">
                                <p class="type-label-lg">#{{ ientry.rank }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">{{ localize(ientry.total) }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selected == i }">
                                <button @click="selected = i">
                                    <span class="type-label-lg">
                                        <img v-if="getFlag(ientry.user)" :src="'/flags/' + getFlag(ientry.user) + '.svg'" class="flag" :alt="getFlag(ientry.user)">
                                        {{ getDisplayName(ientry.user) }}
                                    </span>
                                </button>
                            </td>
                        </tr>
                    </table>
                    
                    <!-- No Results Fallback -->
                    <div class="no-results" v-else>
                        <p>No players found matching "{{ searchQuery }}".</p>
                    </div>
                </div>
                <div class="player-container">
                    <div class="player" v-if="entry">
                        <div class="player-header">
                            <h1>
                                #{{ entry.rank }} 
                                <img v-if="getFlag(entry.user)" :src="'/flags/' + getFlag(entry.user) + '.svg'" class="flag-lg" :alt="getFlag(entry.user)">
                                <span v-if="getTag(entry.user)" class="clan-tag">[{{ getTag(entry.user) }}]</span>
                                {{ getDisplayName(entry.user) }}
                            </h1>
                            <button v-if="isOwner(entry.user)" class="btn-edit-profile" @click="openEdit">Edit Profile</button>
                        </div>
                        <h3>{{ localize(entry.total) }}</h3>
                        <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length}})</h2>
                        <table class="table">
                            <tr v-for="score in entry.verified">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
                        <table class="table">
                            <tr v-for="score in entry.completed">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.progressed.length > 0">Progressed ({{ entry.progressed.length }})</h2>
                        <table class="table">
                            <tr v-for="score in entry.progressed">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div class="player" v-else style="display: flex; height: 100%; align-items: center; justify-content: center;">
                        <p class="type-label-lg" style="color: var(--color-on-background-muted);">(´・ω・｀)</p>
                    </div>
                </div>
            </div>

            <!-- Profile Editor Modal -->
            <div v-if="showEdit" class="modal-overlay" @click.self="showEdit = false">
                <div class="modal profile-editor">
                    <div class="modal-header">
                        <h2>Edit Profile</h2>
                        <button class="close-btn" @click="showEdit = false">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="field">
                            <label>Name</label>
                            <input type="text" v-model="editName" placeholder="Your name">
                        </div>
                        <div class="field">
                            <label>Clan Tag</label>
                            <input type="text" v-model="editTag" placeholder="Tag (e.g. SARK)" maxlength="10">
                        </div>
                        <div class="field">
                            <label>Flag</label>
                            <div class="flag-select-container">
                                <img v-if="editFlag" :src="'/flags/' + editFlag + '.svg'" class="flag-preview">
                                <select v-model="editFlag" class="flag-dropdown">
                                    <option value="">No Flag</option>
                                    <option v-for="f in availableFlags" :key="f.id" :value="f.id">
                                        {{ f.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-save" @click="saveProfile">Save Changes</button>
                    </div>
                </div>
            </div>
        </main>
    `,
    computed: {
        filteredLeaderboard() {
            if (!this.searchQuery) return this.leaderboard;
            const q = this.searchQuery.toLowerCase();
            return this.leaderboard.filter(entry => entry.user.toLowerCase().includes(q));
        },
        entry() {
            return this.filteredLeaderboard[this.selected];
        },
        availableFlags() {
            return getAllFlags();
        }
    },
    watch: {
        searchQuery() {
            // Reset right-panel selection securely to bounds whenever search changes
            this.selected = 0;
        }
    },
    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        // pre-calculate global rank so it doesn't break when filtered
        this.leaderboard = leaderboard ? leaderboard.map((entry, index) => ({ ...entry, rank: index + 1 })) : [];
        this.err = err || [];
        this.loading = false;
        
        // Ensure store is reactive correctly
        if (!this.store) this.store = window.store;
    },
    methods: {
        localize,
        getDisplayName(username) {
            return this.store.getProfile(username).name || username;
        },
        getFlag(username) {
            // Priority: Store override -> 2kplayerflags.txt
            const profile = this.store.getProfile(username);
            return profile.flag || getPlayerFlag(username);
        },
        getTag(username) {
            return this.store.getProfile(username).tag || null;
        },
        isOwner(username) {
            return this.store.user && this.store.user.username.toLowerCase() === username.toLowerCase();
        },
        openEdit() {
            const profile = this.store.getProfile(this.entry.user);
            this.editName = profile.name || this.entry.user;
            this.editTag = profile.tag || '';
            this.editFlag = profile.flag || getPlayerFlag(this.entry.user) || '';
            this.showEdit = true;
        },
        saveProfile() {
            this.store.updateProfile(this.entry.user, {
                name: this.editName,
                tag: this.editTag,
                flag: this.editFlag
            });
            this.showEdit = false;
        }
    },
};


