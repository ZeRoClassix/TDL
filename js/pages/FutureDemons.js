import { store } from "../main.js";
import { embed, getYoutubeIdFromUrl } from "../util.js";
import { fetchFutureDemons, fetchEditors } from "../content.js";

import Spinner from "../components/Spinner.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

const verificationLabels = {
    open: "Open Verification",
    closed: "Closed Verification",
    wip: "Still Being Made"
};

const verificationIcons = {
    open: "unlock",
    closed: "lock",
    wip: "hammer"
};

export default {
    components: { Spinner },
    template: `
        <main v-if="loading" class="spinner-container">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-future-demons layout-two-column">
            
            <!-- LEFT COLUMN: Main Content -->
            <div class="main-column">
                
                <!-- Info Banner -->
                <div class="future-info-banner critical-banner">
                    <div class="info-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <div class="info-content">
                        <p class="info-title">These represent the most highly anticipated future demons currently in development or testing.</p>
                        <p class="info-subtitle">Since it is impossible to accurately predict their true difficulty before official publication, levels are sorted alphabetically rather than by their estimated placement. Please note that this collection will be updated gradually over time as more projects enter their verification phases.</p>
                    </div>
                </div>

                <!-- Search & Filter Bar -->
                <div class="future-controls">
                    <div class="filter-dropdown">
                        <button class="filter-btn" @click="showFilterDropdown = !showFilterDropdown">
                            <span class="filter-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.47 3.59a10 10 0 1 0 3 3a10 10 0 0 0-3-3Zm-1.5 15.41a6.3 6.3 0 0 1-5.3-3c-.1-.2-.1-.5 0-.7a6.3 6.3 0 0 1 5.3-3c.1 0 .2 0 .3.1s.1.2.1.3a6.4 6.4 0 0 1-.4 1.5c-.1.3-.1.7 0 1a6.4 6.4 0 0 1 .4 1.5c0 .1 0 .2-.1.3s-.2.1-.3.1Z"/><path d="M10.47 7.59a3.5 3.5 0 1 1-3 3a3.5 3.5 0 0 1 3-3Z"/></svg>
                            </span>
                            {{ filterLabel }}
                            <span class="dropdown-arrow">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </span>
                        </button>
                        <div class="filter-menu" v-show="showFilterDropdown" v-click-outside="() => showFilterDropdown = false">
                            <button 
                                v-for="option in filterOptions" 
                                :key="option.value"
                                :class="['filter-option', { active: filter === option.value }]"
                                @click="setFilter(option.value)"
                            >
                                {{ option.label }}
                            </button>
                        </div>
                    </div>
                    <div class="search-box">
                        <input 
                            type="text" 
                            v-model="searchQuery" 
                            placeholder="Search..."
                            class="search-input"
                        />
                        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        </button>
                    </div>
                </div>
                
                <!-- Future Demons List -->
                <div class="future-list-section">
                    <div v-if="filteredDemons.length === 0" class="empty-state">
                        <p>No future demons found matching your search.</p>
                    </div>
                    <table class="future-list" v-else>
                        <tbody>
                            <tr v-for="(demon, i) in filteredDemons" :key="demon.id || i" class="future-item-row">
                                <td class="future-demon-cell">
                                    <button @click="goToDemon(demon)" class="future-demon-btn" @mouseenter="hoveredIndex = i" @mouseleave="hoveredIndex = null">
                                        <div class="future-demon-bg" :style="{ backgroundImage: 'url(' + getThumb(demon.showcase || demon.verification) + ')' }"></div>
                                        <iframe v-if="isHoverSupported && hoveredIndex === i && getHoverVideoUrl(demon.showcase || demon.verification)" class="future-demon-bg-video" :src="getHoverVideoUrl(demon.showcase || demon.verification)" frameborder="0" allow="autoplay; fullscreen; encrypted-media; picture-in-picture"></iframe>
                                        <div class="future-demon-overlay"></div>
                                        
                                        <div class="future-demon-content">
                                             <div class="future-demon-left">
                                                 <div class="future-demon-thumb-container">
                                                     <img :src="getThumb(demon.showcase || demon.verification)" class="future-demon-thumb" alt="Level Thumbnail">
                                                 </div>
                                                 <div class="future-demon-info">
                                                     <div class="future-demon-name-row">
                                                         <span class="future-demon-name">{{ demon.name }}</span>
                                                         <span v-if="demon.status" :class="['status-container', 'status-' + demon.status.toLowerCase()]">{{ demon.status }}</span>
                                                     </div>
                                                     <div class="future-demon-creators" v-if="demon.creators || demon.author">
                                                         by {{ demon.creators && demon.creators.length > 1 ? demon.creators[0] + ' and more...' : (demon.creators ? demon.creators[0] : demon.author) }}
                                                     </div>
                                                 </div>
                                             </div>
                                            <div class="future-demon-right">
                                                <div class="status-badge-container">
                                                    <span class="verification-badge" :class="demon.verificationStatus">
                                                        <span class="badge-icon" v-html="getVerificationIcon(demon.verificationStatus)"></span>
                                                        {{ getVerificationLabel(demon.verificationStatus) }}
                                                    </span>
                                                </div>
                                                <span class="estimated-place" v-if="demon.estimatedPlace">
                                                    ~#{{ demon.estimatedPlace }}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
            </div>
            
            <!-- RIGHT COLUMN: Sidebar -->
            <div class="sidebar-column">
                
                <div class="errors" v-show="errors.length > 0">
                    <p class="error" v-for="error of errors" :key="error">{{ error }}</p>
                </div>

                <!-- Future Demons Browser (Added for modern sidebar feel) -->
                <div class="card sidebar-card" v-if="demons && demons.length > 0">
                    <div class="card-header">
                        <h3>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:10px; color:var(--color-primary-light);"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            Future Demons
                        </h3>
                    </div>
                    <div class="card-body">
                        <div class="demon-nav-list">
                            <router-link 
                                v-for="d in demons" 
                                :key="d.id"
                                :to="'/future-demons/' + d.id"
                                :class="['demon-nav-item', { active: false }]"
                            >
                                <div class="nav-item-bg" :style="{ backgroundImage: 'url(' + getThumb(d.showcase || d.verification) + ')' }"></div>
                                <div class="nav-item-overlay"></div>
                                <div class="nav-item-content">
                                    <div class="nav-demon-name-row">
                                        <span class="nav-demon-name">{{ d.name }}</span>
                                        <span v-if="d.status" :class="['status-container', 'status-container-mini', 'status-' + d.status.toLowerCase()]">{{ d.status }}</span>
                                    </div>
                                    <span class="nav-verification-badge" :class="d.verificationStatus">
                                        <span class="badge-icon" v-html="getVerificationIcon(d.verificationStatus)"></span>
                                        {{ getVerificationShortLabel(d.verificationStatus) }}
                                    </span>
                                </div>
                            </router-link>
                        </div>
                        <router-link to="/future-demons" class="btn-prominent-blue">
                            View Full List
                        </router-link>
                    </div>
                </div>

                <!-- Future Demons Info Card -->
                <div class="card sidebar-card">
                    <div class="card-header">
                        <h3>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:10px; color:var(--color-primary-light);"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            About Future Demons
                        </h3>
                    </div>
                    <div class="card-body padding-none">
                        <div style="padding: 1.5rem;">
                            <p class="sidebar-note">Future demons are upcoming extreme demons that are currently in development, unverified, or in private testing. These levels have not been officially released on the Demonlist yet.</p>
                            <div class="verification-legend">
                                <div class="legend-item">
                                    <div class="legend-icon open">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                                    </div>
                                    <span>Open Verification - Anyone can verify</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-icon closed">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    </div>
                                    <span>Closed Verification - Restricted testers</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-icon wip">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.4-3.4"/><path d="M14.5 12.5 15.5 11.5"/></svg>
                                    </div>
                                    <span>Still Being Made - Work in progress</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stats Card -->
                <div class="card sidebar-card">
                    <div class="card-header">
                        <h3>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:10px; color:var(--color-primary-light);"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                            Future Stats
                        </h3>
                    </div>
                    <div class="card-body">
                        <div class="future-stats">
                            <div class="stat-row">
                                <span class="stat-name">Total Future Demons</span>
                                <span class="stat-value">{{ demons.length }}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-name">Open Verification</span>
                                <span class="stat-value">{{ countByStatus.open }}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-name">Closed Verification</span>
                                <span class="stat-value">{{ countByStatus.closed }}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-name">In Development</span>
                                <span class="stat-value">{{ countByStatus.wip }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- List Editors -->
                <div class="card sidebar-card" v-if="editors && editors.length > 0">
                    <div class="card-header">
                        <h3>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:10px; color:var(--color-primary-light);"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            List Editors
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="sidebar-note">Contact these people for any list-related questions:</p>
                        <ul class="editor-list">
                            <li v-for="editor in editors.slice(0, 3)" :key="editor.name">
                                <span class="editor-avatar"><img :src="'assets/' + roleIconMap[editor.role] + (store.dark ? '-dark' : '') + '.svg'" :alt="editor.role"></span>
                                <div class="editor-info">
                                    <a v-if="editor.link" class="type-label-lg" :href="editor.link" target="_blank">{{ editor.name }}</a>
                                    <span v-else class="type-label-lg">{{ editor.name }}</span>
                                    <small>{{ editor.role === 'owner' ? 'List Owner' : editor.role === 'admin' ? 'List Admin' : 'List Helper' }}</small>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </main>
    `,
    data: () => ({
        demons: [],
        editors: [],
        loading: true,
        errors: [],
        roleIconMap,
        store,
        hoveredIndex: null,
        isHoverSupported: window.matchMedia('(hover: hover)').matches,
        searchQuery: '',
        filter: 'all',
        showFilterDropdown: false,
        filterOptions: [
            { value: 'all', label: 'All Future Demons' },
            { value: 'hardest', label: 'Hardest' },
            { value: 'hard', label: 'Hard' },
            { value: 'medium', label: 'Medium' },
            { value: 'easy', label: 'Easy' }
        ]
    }),
    computed: {
        filterLabel() {
            const option = this.filterOptions.find(o => o.value === this.filter);
            return option ? option.label : 'Filter';
        },
        filteredDemons() {
            let result = this.demons;
            
            // Apply category filter
            if (this.filter !== 'all') {
                result = result.filter(d => d.difficultyCategory === this.filter);
            }
            
            // Apply search filter
            if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                result = result.filter(d => 
                    d.name.toLowerCase().includes(q) || 
                    (d.creators && d.creators.some(c => c.toLowerCase().includes(q))) ||
                    (d.author && d.author.toLowerCase().includes(q))
                );
            }
            
            // Sort alphabetically by name
            return result.sort((a, b) => a.name.localeCompare(b.name));
        },
        countByStatus() {
            return {
                open: this.demons.filter(d => d.verificationStatus === 'open').length,
                closed: this.demons.filter(d => d.verificationStatus === 'closed').length,
                wip: this.demons.filter(d => d.verificationStatus === 'wip').length
            };
        }
    },
    async mounted() {
        this.demons = await fetchFutureDemons();
        this.editors = await fetchEditors();

        if (!this.demons) {
            this.errors = ["Failed to load future demons list."];
        } else {
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        getThumb(video) {
            if (typeof video === 'object' && video?.video) {
                video = video.video;
            } else if (typeof video === 'object' && video?.link) {
                video = video.link;
            }
            if (!video || typeof video !== 'string') return 'assets/video-placeholder.png';
            const id = getYoutubeIdFromUrl(video);
            if (!id) return 'assets/video-placeholder.png';
            return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        },
        getHoverVideoUrl(video) {
            if (typeof video === 'object' && video?.video) {
                video = video.video;
            }
            if (!video || typeof video !== 'string') return "";
            const id = getYoutubeIdFromUrl(video);
            if (!id) return "";
            return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&disablekb=1`;
        },
        goToDemon(demon) {
            if (!demon) return;
            this.$router.push(`/future-demons/${demon.id}`);
        },
        getVerificationLabel(status) {
            return verificationLabels[status] || status;
        },
        getVerificationIcon(status) {
            const icons = {
                open: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`,
                closed: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
                wip: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.4-3.4"/><path d="M14.5 12.5 15.5 11.5"/></svg>`
            };
            return icons[status] || `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        },
        getVerificationShortLabel(status) {
            const shorts = {
                open: 'Open',
                closed: 'Closed',
                wip: 'WIP'
            };
            return shorts[status] || status;
        },
        setFilter(value) {
            this.filter = value;
            this.showFilterDropdown = false;
        }
    },
};
