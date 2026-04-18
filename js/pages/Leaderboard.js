import { fetchLeaderboard, fetchFutureProgress, fetchFutureDemons } from '../content.js';
import { getPlayerFlag, getAllFlags } from '../flags.js';
import { getPercentNumber } from '../util.js';

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

function getYouTubeId(url) {
    if (!url || typeof url !== 'string') return null;
    try {
        const u = new URL(url);

        // youtu.be/<id>
        if (u.hostname === 'youtu.be') {
            const id = u.pathname.replace('/', '').trim();
            return id || null;
        }

        // youtube.com/watch?v=<id>
        if (u.hostname.includes('youtube.com')) {
            const v = u.searchParams.get('v');
            if (v) return v;

            // youtube.com/embed/<id>
            const parts = u.pathname.split('/').filter(Boolean);
            const embedIndex = parts.indexOf('embed');
            if (embedIndex !== -1 && parts[embedIndex + 1]) return parts[embedIndex + 1];
        }
    } catch (e) {
        return null;
    }
    return null;
}

function getVideoThumbnailUrl(link) {
    const id = getYouTubeId(link);
    if (!id) return null;
    // Use maxres when available; YouTube will fall back internally if not.
    return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

const PlayerHeader = {
    props: ['displayName', 'tag', 'flagId', 'rank'],
    template: `
        <div class="sv-header">
            <img v-if="flagId" class="sv-flag" :src="'flags/' + flagId + '.svg'" :alt="flagId" />
            <div class="sv-title">
                <div class="sv-name-row">
                    <h1 class="sv-name">{{ displayName }}</h1>
                    <span v-if="tag" class="sv-tag">[{{ tag }}]</span>
                </div>
                <div class="sv-sub">Place #{{ rank }}</div>
            </div>
        </div>
    `
};

const StatCard = {
    props: ['label', 'value'],
    template: `
        <div class="sv-stat">
            <div class="sv-stat-label">{{ label }}</div>
            <div class="sv-stat-value">{{ value }}</div>
        </div>
    `
};

const HardestDemonCard = {
    props: ['hardest'],
    template: `
        <div class="sv-hardest" v-if="hardest">
            <div class="sv-hardest-head">
                <div class="sv-section-title">Hardest Demon</div>
                <div class="sv-hardest-badge">#{{ hardest.rank }}</div>
            </div>
            <div class="sv-hardest-body">
                <div
                    v-if="thumbUrl"
                    class="sv-hardest-thumb"
                    :style="{ backgroundImage: 'url(' + thumbUrl + ')' }"
                ></div>
                <a class="sv-hardest-name" target="_blank" :href="hardest.link">{{ hardest.level }}</a>
                <div class="sv-hardest-meta">{{ hardest.typeLabel }}</div>
            </div>
        </div>
        <div class="sv-hardest sv-hardest-empty" v-else>
            <div class="sv-section-title">Hardest Demon</div>
            <div class="sv-empty">None</div>
        </div>
    `,
    computed: {
        thumbUrl() {
            if (!this.hardest?.link) return null;
            return getVideoThumbnailUrl(this.hardest.link);
        }
    }
};

const DemonList = {
    props: ['title', 'items', 'showPercent', 'compact'],
    template: `
        <section class="sv-list" :class="{ 'compact-demon-list': compact }">
            <div class="sv-section-title">{{ title }}</div>
            <div class="sv-list-items" v-if="items && items.length">
                <a
                    v-for="it in items"
                    :key="(it.level || '') + ':' + (it.rank || '') + ':' + (it.percent || '')"
                    class="sv-list-item future-inline-item"
                    target="_blank"
                    :href="it.link"
                >
                    <div class="sv-list-left">
                        <span class="sv-list-rank">#{{ it.rank }}</span>
                        <span class="future-inline-name sv-list-name">{{ it.level }}</span>
                    </div>
                    <span v-if="showPercent && typeof it.percent !== 'undefined'" class="percent-badge inline-percent">{{ it.percent }}%</span>
                </a>
            </div>
            <div class="sv-empty" v-else>None</div>
        </section>
    `
};

const FutureDemonsList = {
    props: ['title', 'items', 'showPercent', 'showWR'],
    template: `
        <section class="sv-list future-demons-list">
            <div class="sv-section-title">
                {{ title }}
                <span class="future-badge" v-if="items && items.length">{{ items.length }}</span>
            </div>
            <div class="sv-list-items" v-if="items && items.length">
                <a
                    v-for="it in items"
                    :key="it.demonName + ':' + it.percent"
                    class="sv-list-item future-inline-item"
                    target="_blank"
                    :href="it.video || '#'"
                >
                    <div class="future-inline-copy">
                        <div v-if="it.demonStatus || (it.isWR && showWR)" class="future-inline-flags">
                            <span
                                v-if="it.demonStatus"
                                :class="['status-container', 'status-container-mini', 'status-' + it.demonStatus.toLowerCase()]"
                            >
                                {{ it.demonStatus }}
                            </span>
                            <span v-if="it.isWR && showWR" class="wr-indicator" title="World Record">WR</span>
                        </div>
                        <div class="future-inline-main">
                            <span class="future-inline-name">{{ it.demonName }}</span>
                            <span
                                v-if="showPercent"
                                class="percent-badge inline-percent"
                                :class="{ 'wr-percent': it.isWR, ['percent-' + it.demonStatus?.toLowerCase()]: it.demonStatus }"
                            >
                                {{ it.percent }}%
                            </span>
                        </div>
                    </div>
                </a>
            </div>
            <div class="sv-empty" v-else>No future demon progress yet</div>
        </section>
    `
};

export default {
    components: {
        Spinner,
        PlayerHeader,
        StatCard,
        HardestDemonCard,
        DemonList,
        FutureDemonsList,
    },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        currentPage: 1,
        pageSize: 100,
        err: [],
        searchQuery: '',
        selectedFlagFilter: null,
        showFlagDropdown: false,
        showEdit: false,
        editName: '',
        editTag: '',
        editFlag: '',
        store: window.store,
        futureProgressData: [],
        futureDemonsCache: null,
        futureProgressCache: {},
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
                    <!-- Search & Filter Bar -->
                    <div class="search-bar with-filter">
                        <input type="text" v-model="searchQuery" placeholder="Search player..." />
                        <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''" aria-label="Clear search">✕</button>
                        <div class="country-filter-wrapper">
                            <button class="country-filter-btn" @click="showFlagDropdown = !showFlagDropdown">
                                <img v-if="selectedFlagFilter" :src="'flags/' + selectedFlagFilter + '.svg'" class="filter-flag-icon">
                                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                                <span>{{ selectedFlagLabel }}</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:auto; opacity:0.7;"><path d="m6 9 6 6 6-6"/></svg>
                            </button>
                            <div class="country-dropdown" v-show="showFlagDropdown">
                                <button class="country-option" :class="{ active: selectedFlagFilter === null }" @click="selectedFlagFilter = null; showFlagDropdown = false">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                                    <span>Global</span>
                                </button>
                                <button 
                                    class="country-option" 
                                    v-for="flag in activeFlags" 
                                    :key="flag.id" 
                                    :class="{ active: selectedFlagFilter === flag.id }" 
                                    @click="selectedFlagFilter = flag.id; showFlagDropdown = false"
                                >
                                    <img :src="'flags/' + flag.id + '.svg'" class="country-flag-icon">
                                    <span>{{ flag.name }}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-if="filteredLeaderboard.length > 0" class="leaderboard-pagination">
                        <div class="pagination-info">
                            Showing {{ visibleRangeStart }}-{{ visibleRangeEnd }} of {{ filteredLeaderboard.length }} players
                        </div>
                        <div class="pagination-controls">
                            <button
                                class="page-nav-btn"
                                :disabled="currentPage === 1"
                                @click="goToPage(currentPage - 1)"
                                aria-label="Previous 100 players"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            </button>
                            <span class="page-indicator">Page {{ currentPage }} / {{ totalPages }}</span>
                            <button
                                class="page-nav-btn"
                                :disabled="currentPage === totalPages"
                                @click="goToPage(currentPage + 1)"
                                aria-label="Next 100 players"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </button>
                        </div>
                    </div>

                    <!-- Leaderboard Table -->
                    <table class="board" v-if="paginatedLeaderboard.length > 0">
                        <tr v-for="(ientry, i) in paginatedLeaderboard" :key="ientry.user">
                            <td class="rank">
                                <p class="type-label-lg">#{{ ientry.rank }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">{{ localize(ientry.total) }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selected == pageStartIndex + i }">
                                <button @click="selected = pageStartIndex + i">
                                    <span class="type-label-lg">
                                        <img v-if="getFlag(ientry.user)" :src="'flags/' + getFlag(ientry.user) + '.svg'" class="flag" :alt="getFlag(ientry.user)">
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
                        <div class="stats-viewer">
                            <div class="sv-topbar">
                                <PlayerHeader
                                    :displayName="getDisplayName(entry.user)"
                                    :tag="getTag(entry.user)"
                                    :flagId="getFlag(entry.user)"
                                    :rank="entry.rank"
                                />
                                <button v-if="isOwner(entry.user)" class="btn-edit-profile" @click="openEdit">Edit Profile</button>
                            </div>

                            <div class="sv-quick">
                                <StatCard label="Place" :value="'#' + entry.rank" />
                                <StatCard label="Points" :value="localize(entry.total)" />
                            </div>

                            <div class="sv-grid">
                                <section class="sv-block">
                            <div class="sv-section-title">Demonlist Stats</div>
                                    <div class="sv-two">
                                        <StatCard label="Main List Completions" :value="mainListCompletions" />
                                        <StatCard label="Extended List Completions" :value="extendedListCompletions" />
                                    </div>
                                </section>

                                <HardestDemonCard :hardest="hardestDemon" />
                            </div>

                            <div class="sv-lists">
                                <DemonList title="Verified Demons" :items="verifiedSorted" :compact="true" />
                                <DemonList title="Completed Demons" :items="completedSorted" :compact="true" />
                                <DemonList title="Progress" :items="progressedSorted" :showPercent="true" />
                                <FutureDemonsList title="Future Demons Progress" :items="futureProgress" :showPercent="true" :showWR="true" />
                            </div>
                        </div>
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
                                <img v-if="editFlag" :src="'flags/' + editFlag + '.svg'" class="flag-preview">
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
            let result = this.leaderboard;
            if (this.selectedFlagFilter) {
                result = result.filter(entry => this.getFlag(entry.user) === this.selectedFlagFilter);
            }
            if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                result = result.filter(entry => entry.user.toLowerCase().includes(q));
            }
            return result;
        },
        totalPages() {
            return Math.max(1, Math.ceil(this.filteredLeaderboard.length / this.pageSize));
        },
        pageStartIndex() {
            return (this.currentPage - 1) * this.pageSize;
        },
        paginatedLeaderboard() {
            return this.filteredLeaderboard.slice(this.pageStartIndex, this.pageStartIndex + this.pageSize);
        },
        visibleRangeStart() {
            return this.filteredLeaderboard.length ? this.pageStartIndex + 1 : 0;
        },
        visibleRangeEnd() {
            return Math.min(this.pageStartIndex + this.pageSize, this.filteredLeaderboard.length);
        },
        entry() {
            return this.filteredLeaderboard[this.selected];
        },
        futureProgress() {
            if (!this.entry?.user) return [];
            return this.futureProgressData;
        },
        verifiedSorted() {
            if (!this.entry?.verified) return [];
            return [...this.entry.verified].sort((a, b) => a.rank - b.rank);
        },
        completedSorted() {
            if (!this.entry?.completed) return [];
            return [...this.entry.completed].sort((a, b) => a.rank - b.rank);
        },
        progressedSorted() {
            if (!this.entry?.progressed) return [];
            return [...this.entry.progressed].sort((a, b) => a.rank - b.rank);
        },
        mainListCompletions() {
            if (!this.entry?.completed) return 0;
            return this.entry.completed.filter((x) => x.rank <= 75).length;
        },
        extendedListCompletions() {
            if (!this.entry?.completed) return 0;
            return this.entry.completed.filter((x) => x.rank >= 76 && x.rank <= 150).length;
        },
        hardestDemon() {
            if (!this.entry) return null;
            const all = [
                ...(this.entry.verified || []).map((x) => ({ ...x, typeLabel: 'Verified' })),
                ...(this.entry.completed || []).map((x) => ({ ...x, typeLabel: 'Completed' })),
                ...(this.entry.progressed || []).map((x) => ({ ...x, typeLabel: `Progress ${x.percent}%` })),
            ];
            if (!all.length) return null;
            return all.sort((a, b) => a.rank - b.rank)[0];
        },
        availableFlags() {
            return getAllFlags();
        },
        activeFlags() {
            const flagSet = new Set();
            this.leaderboard.forEach(entry => {
                const f = this.getFlag(entry.user);
                if (f) flagSet.add(f);
            });
            return this.availableFlags.filter(flag => flagSet.has(flag.id));
        },
        selectedFlagLabel() {
            if (!this.selectedFlagFilter) return 'Global';
            const flag = this.availableFlags.find(f => f.id === this.selectedFlagFilter);
            return flag ? flag.name : 'Global';
        }
    },
    watch: {
        searchQuery() {
            this.selected = 0;
            this.currentPage = 1;
        },
        selectedFlagFilter() {
            this.selected = 0;
            this.currentPage = 1;
        },
        filteredLeaderboard(newValue) {
            if (!newValue.length) {
                this.selected = 0;
                this.currentPage = 1;
                this.futureProgressData = [];
                return;
            }

            const maxPage = Math.max(1, Math.ceil(newValue.length / this.pageSize));
            if (this.currentPage > maxPage) {
                this.currentPage = maxPage;
            }

            if (this.selected > newValue.length - 1) {
                this.selected = 0;
            }

            const pageStart = (this.currentPage - 1) * this.pageSize;
            const pageEnd = pageStart + this.pageSize - 1;
            if (this.selected < pageStart || this.selected > pageEnd) {
                this.selected = pageStart;
            }
        },
        async selected() {
            await this.loadFutureProgress();
        }
    },
    async mounted() {
        const [[leaderboard, err], futureDemons] = await Promise.all([
            fetchLeaderboard(),
            fetchFutureDemons(),
        ]);
        // pre-calculate global rank so it doesn't break when filtered
        this.leaderboard = leaderboard ? leaderboard.map((entry, index) => ({ ...entry, rank: index + 1 })) : [];
        this.err = err || [];
        this.futureDemonsCache = futureDemons || null;
        this.loading = false;
        
        // Ensure store is reactive correctly
        if (!this.store) this.store = window.store;
        
        // Load future progress for initial selection
        await this.loadFutureProgress();
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
        },
        goToPage(page) {
            const nextPage = Math.min(Math.max(page, 1), this.totalPages);
            if (nextPage === this.currentPage) return;

            this.currentPage = nextPage;
            const firstVisibleIndex = (nextPage - 1) * this.pageSize;
            this.selected = Math.min(firstVisibleIndex, this.filteredLeaderboard.length - 1);
        },
        async loadFutureProgress() {
            if (!this.entry?.user) {
                this.futureProgressData = [];
                return;
            }
            const cacheKey = this.entry.user.toLowerCase();
            if (this.futureProgressCache[cacheKey]) {
                this.futureProgressData = this.futureProgressCache[cacheKey];
                return;
            }

            const progress = await fetchFutureProgress(this.entry.user);
             
            // Determine WR status and map status to demonStatus for display
            const demons = this.futureDemonsCache || await fetchFutureDemons();
            if (!this.futureDemonsCache) {
                this.futureDemonsCache = demons;
            }
            if (demons) {
                progress.forEach(p => {
                    const demon = demons.find(d => d.id === p.demonId);
                    if (demon && demon.records) {
                        const maxPercent = Math.max(...demon.records.map(r => getPercentNumber(r.percent)));
                        p.isWR = getPercentNumber(p.percent) === maxPercent;
                    }
                    // Map status to demonStatus for template use
                    p.demonStatus = p.status || null;
                });
            }
             
            this.futureProgressCache[cacheKey] = progress;
            this.futureProgressData = progress;
        }
    },
};


