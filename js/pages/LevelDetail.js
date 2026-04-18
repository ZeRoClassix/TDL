import { embed, getYoutubeIdFromUrl, getPercentNumber } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading" class="spinner-container">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list layout-two-column">
            
            <!-- LEFT COLUMN: 75% Main Content -->
            <div class="main-column">
                <router-link to="/demonlist" class="btn btn-secondary" style="align-self:flex-start;">
                    &larr; Back to Demonlist
                </router-link>

                <div v-if="level" class="level-detail-section">
                    <!-- 1. Header Card -->
                    <div class="level-header-card" style="position: relative;">
                        <!-- Navigation Arrows -->
                        <router-link v-if="prevLevelId" :to="'/demonlist/' + prevLevelId" class="nav-arrow nav-prev" title="Previous Level (Harder)">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                        </router-link>

                        <router-link v-if="nextLevelId" :to="'/demonlist/' + nextLevelId" class="nav-arrow nav-next" title="Next Level (Easier)">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                        </router-link>

                        <h1>{{ level.name }}</h1>
                        <iframe class="video" :src="video" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        <div class="author-block-horizontal">
                            <div class="author-item creators-gradient">
                                <div class="type-title-sm">Creators</div>
                                <p class="type-body">{{ level.creators.length > 0 ? level.creators.join(', ') : level.author }}</p>
                            </div>
                            <div class="author-item verifier-gradient">
                                <div class="type-title-sm">Verifier</div>
                                <p class="type-body">{{ level.verifier }}</p>
                            </div>
                            <div class="author-item publisher-gradient">
                                <div class="type-title-sm">Publisher</div>
                                <p class="type-body">{{ level.author }}</p>
                            </div>
                        </div>
                        <div v-if="level.note" class="level-note">
                            <p><i>{{ level.note }}</i></p>
                        </div>
                    </div>

                    <!-- 2. Level Details Block -->
                    <div class="card level-stats-card">
                        <ul class="stats-row">
                            <li>
                                <div class="stat-info">
                                    <div class="stat-val">{{ points }} points</div>
                                    <div class="stat-label">100% required</div>
                                </div>
                            </li>
                            <li>
                                <div class="stat-info">
                                    <div class="stat-val">{{ level.id }}</div>
                                    <div class="stat-label">Level ID</div>
                                </div>
                            </li>
                            <li>
                                <div class="stat-info">
                                    <div class="stat-val">{{ level.password || 'Free to Copy' }}</div>
                                    <div class="stat-label">Password</div>
                                </div>
                            </li>
                            <li>
                                <div class="stat-info">
                                    <div class="stat-val">Extreme Demon</div>
                                    <div class="stat-label">Difficulty</div>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <!-- 3. Position History Card -->
                    <div class="card position-history-card" style="display: none;">
                        <div class="card-header">
                            <h3>Position History</h3>
                        </div>
                        <div class="card-body">
                            <table class="history-table">
                                <thead>
                                    <tr>
                                        <th>Old position &rarr; New position</th>
                                        <th>Date of change</th>
                                        <th>Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>#{{ rank }} &rarr; #{{ rank }}</td>
                                        <td>-</td>
                                        <td>-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 4. Records Card -->
                    <div class="card records-modern-card">
                        <div class="card-header">
                            <div class="ch-left">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                                <span>Records</span>
                            </div>
                            <span class="ch-badge" v-if="level.records && level.records.length > 0">{{ level.records.length }} Records</span>
                        </div>
                        
                        <div class="card-body">
                            <p class="qualify-note" v-if="rank <= 150"><strong>{{ level.percentToQualify || 100 }}%</strong> or better to qualify</p>
                            <p class="qualify-note" v-else>This level does not accept new records.</p>

                            <!-- First Victor -->
                            <div v-if="sortedRecords.length > 0" class="featured-record-section">
                                <h4 class="section-subtitle">First Victor</h4>
                                <a :href="sortedRecords[0].link" target="_blank" class="featured-record-card">
                                    <div class="featured-thumb-wrapper">
                                        <img :src="getThumb(sortedRecords[0].link)" class="featured-thumb" alt="Progress Thumbnail">
                                        <div class="play-overlay">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="m7 4 12 8-12 8V4z"/></svg>
                                        </div>
                                    </div>
                                    <div class="featured-info">
                                        <div class="player-block">
                                            <span class="player-name">
                                                {{ sortedRecords[0].user }}
                                                <span v-if="sortedRecords[0].user === level.verifier" class="verifier-tag">VERIFIER</span>
                                            </span>
                                            <span class="run-date">{{ formatDate(sortedRecords[0].date) }}</span>
                                        </div>
                                        <div class="percent-block">
                                            <span class="percent-value">{{ sortedRecords[0].percent }}%</span>
                                            <div class="progress-line">
                                                <div class="line-fill" :style="{ width: getPercentNumber(sortedRecords[0].percent) + '%' }"></div>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>

                            <!-- Other Victors -->
                            <div v-if="sortedRecords.length > 1" class="records-grid-section">
                                <h4 class="section-subtitle">Other Victors</h4>
                                <div class="records-grid">
                                    <a v-for="(record, index) in sortedRecords.slice(1)" 
                                       :key="index" 
                                       :href="record.link" 
                                       target="_blank" 
                                       class="record-mini-card">
                                        <div class="mini-thumb-wrapper">
                                            <img :src="getThumb(record.link)" class="mini-thumb">
                                            <div class="mini-fade-overlay"></div>
                                            <span class="mini-percent">{{ record.percent }}%</span>
                                        </div>
                                        <div class="mini-info">
                                            <span class="mini-player">
                                                {{ record.user }}
                                                <span v-if="record.user === level.verifier" class="verifier-tag-sm">VERIFIER</span>
                                            </span>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            <div v-if="!level.records || level.records.length === 0" class="empty-state-v2">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.3; margin-bottom:1rem;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                <p>No records yet.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="level-detail-section" style="display:flex; justify-content:center; align-items:center; min-height:300px;">
                    <p class="type-label-lg" style="color:var(--color-error);">(ノಠ益ಠ)ノ彡┻━┻ Error Loading Level</p>
                </div>
            </div>
            
            <!-- RIGHT COLUMN: 25% Sidebar -->
            <div class="sidebar-column">
                <div class="errors" v-show="errors.length > 0">
                    <p class="error" v-for="error of errors" :key="error">{{ error }}</p>
                </div>

                <!-- 1. List Editors -->
                <div class="card sidebar-card" v-if="editors && editors.length > 0">
                    <div class="card-header">
                        <h3>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            List Editors
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="sidebar-note">Contact these people for any list-related questions or issues:</p>
                        <ul class="editor-list">
                            <li v-for="editor in editors.filter(e => e.role === 'admin' || e.role === 'owner')" :key="editor.name">
                                <span class="editor-avatar"><img :src="'assets/' + roleIconMap[editor.role] + (store.dark ? '-dark' : '') + '.svg'" :alt="editor.role"></span>
                                <div class="editor-info">
                                    <a v-if="editor.link" class="type-label-lg" :href="editor.link" target="_blank">{{ editor.name }}</a>
                                    <span v-else class="type-label-lg">{{ editor.name }}</span>
                                    <small>{{ editor.role === 'owner' ? 'List Owner' : 'List Admin' }}</small>
                                </div>
                            </li>
                        </ul>

                        <hr class="sidebar-divider">

                        <p class="sidebar-note">Contact these people if you have questions about why a record was rejected. Do not bug them about checking submissions!</p>
                        <ul class="editor-list">
                            <li v-for="editor in editors.filter(e => e.role !== 'admin' && e.role !== 'owner')" :key="editor.name">
                                <span class="editor-avatar"><img :src="'assets/' + roleIconMap[editor.role] + (store.dark ? '-dark' : '') + '.svg'" :alt="editor.role"></span>
                                <div class="editor-info">
                                    <a v-if="editor.link" class="type-label-lg" :href="editor.link" target="_blank">{{ editor.name }}</a>
                                    <span v-else class="type-label-lg">{{ editor.name }}</span>
                                    <small>List Helper</small>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- 2. Guidelines -->
                <div class="card sidebar-card">
                    <div class="card-header">
                        <h3>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            Guidelines
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="sidebar-note">All demonlist operations are carried out in accordance to our guidelines. Be sure to check them before submitting a record to ensure a flawless experience!</p>
                        <router-link to="/guidelines" class="btn btn-secondary full-width">Read the Guidelines &rarr;</router-link>
                    </div>
                </div>

                <!-- 3. Submit a Record -->
                <div class="card sidebar-card">
                    <div class="card-header">
                        <h3>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                            Submit a Record
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="sidebar-note">Note: Please do not submit nonsense, it only makes it harder for us all and will get you banned. Also note that the form rejects duplicate submissions.</p>
                        <router-link to="/submit" class="btn btn-primary full-width">Submit a Record!</router-link>
                    </div>
                </div>

                <!-- 4. Stats Viewer -->
                <div class="card sidebar-card">
                    <div class="card-header">
                        <h3>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-4"></path></svg>
                            Stats Viewer
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="sidebar-note">Get a detailed overview of who completed the most, created the most demons or beat the hardest demons! There is even a leaderboard to compare yourself to the very best!</p>
                        <router-link to="/leaderboard" class="btn btn-secondary full-width">Open the Stats Viewer!</router-link>
                    </div>
                </div>

                <!-- 5. Discord -->
                <div class="card sidebar-card">
                    <div class="card-header">
                        <h3><img src="assets/discord.svg" width="18" height="18" style="margin-right:6px;" alt=""/>Join Our Community</h3>
                    </div>
                    <div class="card-body">
                        <p class="sidebar-note">Join the official PCDemonlist Discord server, where you can get in touch with the list team, get notified of updates, and connect with the GD community!</p>
                        <a href="https://discord.gg/geometrydash" target="_blank" class="btn full-width" style="background:#5865F2; color:white; border:none; display:flex; align-items:center; justify-content:center;">
                            <img src="assets/discord.svg" width="16" height="16" style="margin-right:8px; filter:brightness(0) invert(1);" alt=""/> Join Discord
                        </a>
                    </div>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        store: window.store,
        list: [],
        editors: [],
        loading: true,
        errors: [],
        level: null,
        rank: null,
        points: 0,
        roleIconMap,
        prevLevelId: null,
        nextLevelId: null,
    }),
    computed: {
        video() {
            if (!this.level) return null;
            return embed(this.level.showcase || this.level.verification);
        },
        sortedRecords() {
            if (!this.level || !this.level.records) return [];
            return [...this.level.records].sort((a, b) => this.getPercentNumber(b.percent) - this.getPercentNumber(a.percent));
        },
        maxPercent() {
            if (!this.level || !this.level.records || this.level.records.length === 0) return 0;
            return Math.max(...this.level.records.map(r => this.getPercentNumber(r.percent)));
        }
    },
    async mounted() {
        const id = this.$route.params.id;

        const list = await fetchList();
        this.editors = await fetchEditors();

        if (!list) {
            this.errors = ["Failed to load list. Retry in a few minutes or notify list staff."];
            this.loading = false;
            return;
        }

        const idx = list.findIndex(([lvl]) => String(lvl?.id) === String(id));
        if (idx === -1) {
            this.level = null;
            this.rank = null;
            this.points = 0;
            this.loading = false;
            return;
        }

        this.level = list[idx][0];
        this.rank = idx + 1;
        this.points = score(this.rank, 100, this.level?.percentToQualify);
        
        this.prevLevelId = idx > 0 ? list[idx - 1][0].id : null;
        this.nextLevelId = idx < 149 && idx < list.length - 1 ? list[idx + 1][0].id : null;
        
        this.loading = false;
    },
    watch: {
        "$route.params.id": {
            immediate: false,
            async handler() {
                this.loading = true;
                this.errors = [];
                this.level = null;
                this.rank = null;
                this.points = 0;

                const id = this.$route.params.id;
                const list = await fetchList();
                this.editors = await fetchEditors();

                if (!list) {
                    this.errors = ["Failed to load list. Retry in a few minutes or notify list staff."];
                    this.loading = false;
                    return;
                }

                const idx = list.findIndex(([lvl]) => String(lvl?.id) === String(id));
                if (idx === -1) {
                    this.loading = false;
                    return;
                }

                this.level = list[idx][0];
                this.rank = idx + 1;
                this.points = score(this.rank, 100, this.level?.percentToQualify);
                
                this.prevLevelId = idx > 0 ? list[idx - 1][0].id : null;
                this.nextLevelId = idx < 149 && idx < list.length - 1 ? list[idx + 1][0].id : null;
                
                this.loading = false;
            },
        },
    },
    methods: {
        embed,
        score,
        getPercentNumber,
        getThumb(video) {
            if (!video || typeof video !== 'string') return 'extreme.png';
            const id = getYoutubeIdFromUrl(video);
            if (!id) return 'extreme.png';
            return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        },
        formatDate(dateStr) {
            if (!dateStr) return '-';
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        },
        isVerifier(username) {
            if (!this.level) return false;
            if (!this.level.verifier) return false;
            return this.level.verifier.toLowerCase() === username.toLowerCase();
        },
    },
};
