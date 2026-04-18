import { store } from "../main.js";
import { embed, getYoutubeIdFromUrl, getPercentNumber } from "../util.js";
import { fetchFutureDemons, fetchEditors, fetchFutureRecords } from "../content.js";

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

export default {
    components: { Spinner },
    template: `
        <main v-if="loading" class="spinner-container">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-future-detail layout-two-column">
            
            <!-- LEFT COLUMN: Main Content -->
            <div class="main-column">
                <router-link to="/future-demons" class="btn btn-secondary" style="align-self:flex-start;">
                    &larr; Back to Future Demons
                </router-link>

                <div v-if="demon" class="future-detail-section">
                    <!-- Header Card -->
                    <div class="level-header-card future-header" style="position: relative;">
                        <!-- Navigation Arrows -->
                        <router-link v-if="prevDemonId" :to="'/future-demons/' + prevDemonId" class="nav-arrow nav-prev" title="Previous Demon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                        </router-link>

                        <router-link v-if="nextDemonId" :to="'/future-demons/' + nextDemonId" class="nav-arrow nav-next" title="Next Demon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                        </router-link>

                        <div class="future-title-row">
                            <div class="title-name-group">
                                <h1>{{ demon.name }}</h1>
                                <span v-if="demon.status" :class="['status-container', 'status-' + demon.status.toLowerCase()]">{{ demon.status }}</span>
                            </div>
                            <span class="verification-badge large" :class="demon.verificationStatus" style="margin-left: auto;">
                                <span class="badge-icon" v-html="getVerificationIcon(demon.verificationStatus)"></span>
                                {{ getVerificationLabel(demon.verificationStatus) }}
                            </span>
                        </div>
                        
                        <!-- Video -->
                        <div class="video-container">
                            <iframe 
                                v-if="showcaseVideo" 
                                class="video" 
                                :src="showcaseVideo" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen
                            ></iframe>
                            <div v-else class="video-placeholder">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom:1rem; opacity:0.5;"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M2.5 17a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-2Z"/><path d="M12 16V8a4 4 0 0 0-8 0v8"/><path d="M.5 18H2"/><path d="M11 2h2"/><path d="M11 6h2"/><path d="M7 2h2"/><path d="M7 6h2"/><path d="M15 2h2"/><path d="M15 6h2"/></svg>
                                <span>No showcase video available</span>
                            </div>
                        </div>
                        
                        <!-- Creator Info -->
                        <div class="author-block-horizontal">
                            <div class="author-item creators-gradient" v-if="demon.creators && demon.creators.length > 0">
                                <div class="type-title-sm">Creators</div>
                                <p class="type-body">{{ demon.creators.join(', ') }}</p>
                            </div>
                            <div class="author-item creators-gradient" v-else-if="demon.author">
                                <div class="type-title-sm">Creator</div>
                                <p class="type-body">{{ demon.author }}</p>
                            </div>
                            <div class="author-item verifier-gradient-orange" v-if="demon.verification && demon.verification.username">
                                <div class="type-title-sm">Target Verifier</div>
                                <p class="type-body">{{ demon.verification.username }}</p>
                            </div>
                            <div class="author-item verifier-gradient-orange" v-else-if="demon.verifier">
                                <div class="type-title-sm">Target Verifier</div>
                                <p class="type-body">{{ demon.verifier }}</p>
                            </div>
                            <div class="author-item publisher-gradient" v-if="demon.publisher">
                                <div class="type-title-sm">Publisher</div>
                                <p class="type-body">{{ demon.publisher }}</p>
                            </div>
                        </div>
                        
                        <!-- Description -->
                        <div v-if="demon.description" class="future-description-container">
                            <div class="description-label">About This Level</div>
                            <p class="description-text">{{ demon.description }}</p>
                        </div>
                    </div>

                    <!-- Highlight Row: Placement & Dev Progress -->
                    <div class="detail-highlight-row">
                        <!-- Estimated Place Card -->
                        <div class="card estimated-place-card highlight-card">
                            <div class="card-header">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                Estimated Placement
                            </div>
                            <div class="card-body">
                                <div class="rank-display">
                                    <span class="rank-value">#{{ demon.estimatedPlace || '?' }}</span>
                                    <div class="rank-meta">
                                        <span class="rank-label">Rank</span>
                                        <span class="rank-subtitle">Approximate</span>
                                    </div>
                                </div>
                                <div class="placement-context" v-if="demon.placementContext">
                                    <div class="context-grid">
                                        <div class="context-item">
                                            <span class="context-label">Above</span>
                                            <span class="context-value">{{ demon.placementContext.above || 'Unknown' }}</span>
                                        </div>
                                        <div class="context-item">
                                            <span class="context-label">Below</span>
                                            <span class="context-value">{{ demon.placementContext.below || 'Unknown' }}</span>
                                        </div>
                                    </div>
                                    <div class="context-reason" v-if="demon.placementContext.reason">
                                        <p class="reason-text">{{ demon.placementContext.reason }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Completion Status Card -->
                        <div class="card completion-card highlight-card" v-if="demon && (demon.completionPercent !== null && demon.completionPercent !== undefined || demon.devStatus || demon.estimatedRelease)">
                            <div class="card-header">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                Development Progress
                            </div>
                            <div class="card-body">
                                <div class="progress-display">
                                    <span class="progress-value" v-if="completionPercentNum !== null">{{ completionPercentNum }}%</span>
                                    <span class="progress-value" v-else>-</span>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar-fill" :style="{ width: (completionPercentNum !== null ? completionPercentNum : 0) + '%' }"></div>
                                    </div>
                                </div>
                                <div class="dev-stats-mini">
                                    <div class="mini-stat" v-if="demon.devStatus">
                                        <span class="ms-label">Current Stage</span>
                                        <span class="ms-value">{{ demon.devStatus }}</span>
                                    </div>
                                    <div class="mini-stat" v-if="demon.estimatedRelease">
                                        <span class="ms-label">Release Window</span>
                                        <span class="ms-value">{{ demon.estimatedRelease }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Level ID & Song Stats -->
                    <div class="card stats-detail-card">
                         <div class="stats-grid">
                            <div class="stat-box">
                                <span class="sb-label">Level ID</span>
                                <span class="sb-value">{{ demon.id || '-' }}</span>
                            </div>
                            <div class="stat-box">
                                <span class="sb-label">Difficulty</span>
                                <span class="sb-value text-primary">Extreme Demon</span>
                            </div>
                            <div class="stat-box" v-if="demon.gameVersion">
                                <span class="sb-label">Version</span>
                                <span class="sb-value">{{ demon.gameVersion }}</span>
                            </div>
                            <div class="stat-box" v-if="demon.song">
                                <span class="sb-label">Soundtrack</span>
                                <span class="sb-value">{{ demon.song }}</span>
                            </div>
                         </div>
                    </div>

                    <!-- World Records Section (Redesigned) -->
                    <div class="card records-modern-card">
                        <div class="card-header">
                            <div class="ch-left">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                                <span>{{ demon.verificationStatus === 'wip' ? 'Development Records' : 'Verification Progress' }}</span>
                            </div>
                            <span class="ch-badge" v-if="records && records.length > 0">{{ records.length }} Runs</span>
                        </div>
                        
                        <div class="card-body">
                            <!-- Current World Record(s) Section -->
                            <div v-if="wrRecords.length > 0" class="featured-record-section">
                                <h4 class="section-subtitle">{{ wrRecords.length === 1 ? 'CURRENT WORLD RECORD' : 'CURRENT WORLD RECORDS' }}</h4>
                                <div class="wr-records-list">
                                    <a v-for="(record, index) in wrRecords" 
                                       :key="index"
                                       :href="record.video || record.link" 
                                       target="_blank" 
                                       class="featured-record-card"
                                       :class="{ 'wr-item': true }">
                                        <div class="featured-thumb-wrapper">
                                            <img :src="getThumb(record.video || record.link)" class="featured-thumb" alt="World Record Thumbnail">
                                            <div class="play-overlay">
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="m7 4 12 8-12 8V4z"/></svg>
                                            </div>
                                        </div>
                                        <div class="featured-info">
                                            <div class="player-block">
                                                <span class="player-name">
                                                    {{ record.user }}
                                                    <span v-if="isVerifier(record.user)" class="verifier-tag">VERIFIER</span>
                                                    <span v-if="record.status" :class="['status-container', 'status-container-mini', 'status-' + record.status.toLowerCase()]">{{ record.status }}</span>
                                                    <span class="wr-tag">WR</span>
                                                </span>
                                                <span class="run-date">{{ formatDate(record.date) }}</span>
                                            </div>
                                            <div class="percent-block">
                                                <span class="percent-value">{{ record.percent }}%</span>
                                                <div class="progress-line">
                                                    <div class="line-fill" :style="{ width: getPercentNumber(record.percent) + '%' }"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            <!-- Other Notable Records (non-WR records) -->
                            <div v-if="nonWrRecords.length > 0" class="records-grid-section">
                                <h4 class="section-subtitle">Other Notable Records</h4>
                                <div class="records-grid">
                                    <a v-for="(record, index) in nonWrRecords" 
                                       :key="index" 
                                       :href="record.video || record.link" 
                                       target="_blank" 
                                       class="record-mini-card">
                                        <div class="mini-thumb-wrapper">
                                            <img :src="getThumb(record.video || record.link)" class="mini-thumb">
                                            <div class="mini-fade-overlay"></div>
                                            <span class="mini-percent">{{ record.percent }}%</span>
                                        </div>
                                        <div class="mini-info">
                                            <span class="mini-player">
                                                {{ record.user }}
                                                <span v-if="isVerifier(record.user)" class="verifier-tag-sm">VERIFIER</span>
                                                <span v-if="record.status" :class="['status-container', 'status-container-mini', 'status-' + record.status.toLowerCase()]">{{ record.status }}</span>
                                            </span>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            <div v-if="(!records || records.length === 0) || (wrRecords.length === 0 && nonWrRecords.length === 0)" class="empty-state-v2">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.3; margin-bottom:1rem;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                <p>No notable progress records logged yet.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="level-detail-section" style="display:flex; justify-content:center; align-items:center; min-height:300px;">
                    <p class="type-label-lg" style="color:var(--color-error);">Demon not found</p>
                </div>
            </div>
            
            <!-- RIGHT COLUMN: Sidebar -->
            <div class="sidebar-column">
                <div class="errors" v-show="errors.length > 0">
                    <p class="error" v-for="error of errors" :key="error">{{ error }}</p>
                </div>

                <!-- Demon Navigation -->
                <div class="card sidebar-card">
                    <div class="card-header">
                        <h3>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:10px; color:var(--color-primary-light);"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            Future Demons
                        </h3>
                    </div>
                    <div class="card-body">
                        <div class="demon-nav-list">
                            <router-link 
                                v-for="d in allDemons" 
                                :key="d.id"
                                :to="'/future-demons/' + d.id"
                                :class="['demon-nav-item', { active: d.id === demon?.id }]"
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

                <!-- Quick Info -->
                <div class="card sidebar-card" v-if="demon">
                    <div class="card-header">
                        <h3>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:10px; color:var(--color-primary-light);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            Quick Info
                        </h3>
                    </div>
                    <div class="card-body">
                        <div class="quick-info-item">
                            <span class="quick-label">Status</span>
                            <span class="quick-value" :class="demon.verificationStatus">
                                <span class="badge-icon" v-html="getVerificationIcon(demon.verificationStatus)"></span>
                                {{ getVerificationLabel(demon.verificationStatus) }}
                            </span>
                        </div>
                        <div class="quick-info-item" v-if="demon.estimatedPlace">
                            <span class="quick-label">Est. Place</span>
                            <span class="quick-value">#{{ demon.estimatedPlace }}</span>
                        </div>
                        <div class="quick-info-item" v-if="demon.difficultyCategory">
                            <span class="quick-label">Category</span>
                            <span class="quick-value">{{ capitalize(demon.difficultyCategory) }}</span>
                        </div>
                        <div class="quick-info-item" v-if="demon.song">
                            <span class="quick-label">Song</span>
                            <span class="quick-value">{{ demon.song }}</span>
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
                        <p class="sidebar-note">Contact for questions about future demons:</p>
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
        store: window.store,
        allDemons: [],
        editors: [],
        loading: true,
        errors: [],
        demon: null,
        records: [],
        roleIconMap,
        prevDemonId: null,
        nextDemonId: null,
    }),
    computed: {
        hasExplicitWR() {
            if (!this.records) return false;
            return this.records.some(r => r.isWR === true);
        },
        wrRecords() {
            if (!this.records) return [];
            return this.records.filter(r => r.isWR === true).sort((a, b) => this.getPercentNumber(b.percent) - this.getPercentNumber(a.percent));
        },
        nonWrRecords() {
            if (!this.records) return [];
            return this.records.filter(r => r.isWR !== true).sort((a, b) => this.getPercentNumber(b.percent) - this.getPercentNumber(a.percent));
        },
        completionPercentNum() {
            if (!this.demon) return null;
            const raw = this.demon.completionPercent;
            if (raw === null || raw === undefined || raw === '') return null;
            const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
            if (!Number.isFinite(n)) return null;
            return Math.max(0, Math.min(100, Math.round(n)));
        },
        showcaseVideo() {
            if (!this.demon) return null;

            // 1. Try to find a direct string URL in showcase or verification
            if (typeof this.demon.showcase === 'string' && this.demon.showcase) {
                const vid = embed(this.demon.showcase);
                if (vid) return vid;
            }
            if (typeof this.demon.verification === 'string' && this.demon.verification) {
                const vid = embed(this.demon.verification);
                if (vid) return vid;
            }

            // Handle case where showcase is an object with username/percent
            if (this.demon.showcase && typeof this.demon.showcase === 'object') {
                // If showcase object has a video property, use that
                if (this.demon.showcase.video) {
                    const embeddedUrl = embed(this.demon.showcase.video);
                    if (embeddedUrl) {
                        return embeddedUrl;
                    }
                }
                // Otherwise, no video URL available
                return null;
            }
            // 2. Try to find a .video property if either is an object
            if (this.demon.showcase && typeof this.demon.showcase === 'object' && this.demon.showcase.video) {
                const vid = embed(this.demon.showcase.video);
                if (vid) return vid;
            }
            if (this.demon.verification && typeof this.demon.verification === 'object' && this.demon.verification.video) {
                const vid = embed(this.demon.verification.video);
                if (vid) return vid;
            }

            return null;
        },
        sortedRecords() {
            if (!this.records) return [];
            return [...this.records].sort((a, b) => this.getPercentNumber(b.percent) - this.getPercentNumber(a.percent));
        },
        maxPercent() {
            if (!this.records || this.records.length === 0) return 0;
            return Math.max(...this.records.map(r => this.getPercentNumber(r.percent)));
        }
    },
    async mounted() {
        await this.loadDemon();
    },
    watch: {
        "$route.params.id": {
            immediate: false,
            async handler() {
                await this.loadDemon();
            },
        },
    },
    methods: {
        async loadDemon() {
            this.loading = true;
            this.errors = [];
            this.demon = null;
            this.records = [];

            const id = this.$route.params.id;

            this.allDemons = await fetchFutureDemons();
            this.editors = await fetchEditors();

            if (!this.allDemons) {
                this.errors = ["Failed to load future demons list."];
                this.loading = false;
                return;
            }

            // Find demon by ID or name slug
            const demon = this.allDemons.find(d =>
                String(d.id) === String(id) ||
                d.name.toLowerCase().replace(/\s+/g, '-') === id
            );

            if (!demon) {
                this.errors = ["Demon not found."];
                this.loading = false;
                return;
            }

            this.demon = demon;

            // Load records for this demon
            const allRecords = await fetchFutureRecords();
            this.records = allRecords.filter(r => r.demonId === demon.id || r.demonName === demon.name);

            // Calculate previous and next demon IDs
            const idx = this.allDemons.findIndex(d => String(d.id) === String(demon.id));
            if (idx > 0) {
                this.prevDemonId = this.allDemons[idx - 1].id || this.allDemons[idx - 1].name.toLowerCase().replace(/\s+/g, '-');
            } else {
                this.prevDemonId = null;
            }
            if (idx >= 0 && idx < this.allDemons.length - 1) {
                this.nextDemonId = this.allDemons[idx + 1].id || this.allDemons[idx + 1].name.toLowerCase().replace(/\s+/g, '-');
            } else {
                this.nextDemonId = null;
            }

            this.loading = false;
        },
        getVerificationLabel(status) {
            return verificationLabels[status] || status;
        },
        getVerificationShortLabel(status) {
            const shorts = {
                open: 'Open',
                closed: 'Closed',
                wip: 'WIP'
            };
            return shorts[status] || status;
        },
        getVerificationIcon(status) {
            const icons = {
                open: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`,
                closed: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
                wip: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.4-3.4"/><path d="M14.5 12.5 15.5 11.5"/></svg>`
            };
            return icons[status] || `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        },
        goToDemon(demon) {
            if (!demon) return;
            this.$router.push(`/future-demons/${demon.id || demon.name.toLowerCase().replace(/\s+/g, '-')}`);
        },
        capitalize(str) {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
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
        formatDate(dateStr) {
            if (!dateStr) return '-';
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        },
        getPercentNumber,
        isVerifier(username) {
            if (!this.demon) return false;
            const targetVerifier = (this.demon.verification && this.demon.verification.username) || this.demon.verifier;
            if (!targetVerifier) return false;
            return targetVerifier.toLowerCase() === username.toLowerCase();
        }
    },
};
