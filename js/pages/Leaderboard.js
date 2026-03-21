import { fetchLeaderboard } from '../content.js';

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
                                    <!-- Highlight matching text feature via simple regex or just display user -->
                                    <span class="type-label-lg">{{ ientry.user }}</span>
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
                        <h1>#{{ entry.rank }} {{ entry.user }}</h1>
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
    },
    methods: {
        localize,
    },
};
