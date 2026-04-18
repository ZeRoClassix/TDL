import { store } from "../main.js";
import { embed, getYoutubeIdFromUrl } from "../util.js";
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
                
                <div v-if="!searchQuery" class="list-category-header">
                    <h3>Main List (Top 1–75)</h3>
                </div>

                <!-- Search Bar -->
                <div class="list-controls centered-controls">
                    <div class="search-box small-search">
                        <input 
                            type="text" 
                            v-model="searchQuery" 
                            placeholder="Search demons by name or author..."
                            class="search-input"
                        />
                        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        </button>
                    </div>
                </div>

                <!-- Part A: Scrollable Demon List -->
                <div class="list-section">
                    <div v-if="filteredList.length === 0" class="empty-state-v2">
                        <p>No demons found matching your search.</p>
                    </div>
                    <table class="list" v-else>
                        <tbody v-for="(item, idx) in filteredList" :key="item.originalIndex">
                            
                            <tr v-if="!searchQuery && item.originalIndex === 75" class="list-label-row">
                                <td colspan="2" class="list-label-container">
                                    <div class="list-category-header">
                                        <h3>Extended List (Top 76–150)</h3>
                                    </div>
                                </td>
                            </tr>
                            
                            <tr v-if="!searchQuery && item.originalIndex === 150" class="list-label-row">
                                <td colspan="2" class="list-label-container">
                                    <div class="list-category-header">
                                        <h3>Legacy List</h3>
                                    </div>
                                </td>
                            </tr>

                            <tr class="list-item-row" :class="{ 'extended-item': item.rank > 75 && item.rank <= 150 }">
                                <td colspan="2" class="level" :class="{ 'error': !item.level }">
                                     <button @click="goToLevel(item.level)" class="level-bar-btn" @mouseenter="hoveredIndex = item.originalIndex" @mouseleave="hoveredIndex = null">
                                         <div class="level-bg" :style="{ backgroundImage: 'url(' + getThumb(item.level?.verification) + ')' }"></div>
                                         <iframe v-if="isHoverSupported && hoveredIndex === item.originalIndex && getHoverVideoUrl(item.level?.verification)" class="level-bg-video" :src="getHoverVideoUrl(item.level?.verification)" frameborder="0" allow="autoplay; fullscreen; encrypted-media; picture-in-picture"></iframe>
                                         <div class="level-overlay"></div>
                                        
                                        <div class="level-content compact-card">
                                            <div class="level-left">
                                                <div class="level-thumb-container">
                                                    <img :src="getThumb(item.level?.verification)" class="level-thumb" alt="Thumbnail">
                                                </div>
                                                <div class="rank">
                                                    <p v-if="item.rank <= 150" class="type-label-lg">#{{ item.rank }}</p>
                                                    <p v-else class="type-label-lg">Legacy</p>
                                                </div>
                                                 <div class="level-names">
                                                     <span class="name-label">{{ item.level?.name || ('Error ' + item.err + '.json') }}</span>
                                                     <span class="author-label">Published by: {{ item.level?.author }}</span>
                                                     <span class="points-label">{{ score(item.rank, 100, item.level?.percentToQualify) }} Points</span>
                                                 </div>
                                            </div>
                                        </div>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
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
                        <h3 class="sidebar-card__title">
                            <span class="sidebar-card__icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </span>
                            List Editors
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="sidebar-note">Contact these people for any list-related questions or issues:</p>
                        <ul class="editor-list">
                            <li v-for="editor in editors.filter(e => ['kaoas', 'binarY', 'casamio'].includes(e.name))" :key="editor.name">
                                <span class="editor-avatar"><img :src="'assets/' + roleIconMap[editor.role] + (store.dark ? '-dark' : '') + '.svg'" :alt="editor.role"></span>
                                <div class="editor-info">
                                    <a v-if="editor.link" class="type-label-lg" :href="editor.link" target="_blank">{{ editor.name }}</a>
                                    <span v-else class="type-label-lg">{{ editor.name }}</span>
                                    <small>{{ getEditorDisplayRole(editor.name) }}</small>
                                </div>
                            </li>
                        </ul>
                        
                        <hr class="sidebar-divider">
                        
                        <p class="sidebar-note">Contact these people if you have questions about why a record was rejected. Do not bug them about checking submissions!</p>
                        <ul class="editor-list">
                            <li v-for="editor in editors.filter(e => ['znassPCD', 'pyantCARRY', 'xasit', 'verOPP'].includes(e.name))" :key="editor.name">
                                <span class="editor-avatar"><img :src="'assets/' + roleIconMap[editor.role] + (store.dark ? '-dark' : '') + '.svg'" :alt="editor.role"></span>
                                <div class="editor-info">
                                    <a v-if="editor.link" class="type-label-lg" :href="editor.link" target="_blank">{{ editor.name }}</a>
                                    <span v-else class="type-label-lg">{{ editor.name }}</span>
                                    <small>{{ getEditorDisplayRole(editor.name) }}</small>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- 2. Guidelines -->
                <div class="card sidebar-card">
                    <div class="card-header">
                        <h3 class="sidebar-card__title">
                            <span class="sidebar-card__icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            </span>
                            Guidelines
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="sidebar-note">All demonlist operations are carried out in accordance to our guidelines. Be sure to check them before submitting a record to ensure a flawless experience!</p>
                        <router-link to="/guidelines" class="btn btn-secondary full-width sidebar-action sidebar-action--secondary">Read the Guidelines &rarr;</router-link>
                    </div>
                </div>

                <!-- 3. Submit a Record -->
                <div class="card sidebar-card">
                    <div class="card-header">
                        <h3 class="sidebar-card__title">
                            <span class="sidebar-card__icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                            </span>
                            Submit a Record
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="sidebar-note">Note: Please do not submit nonsense, it only makes it harder for us all and will get you banned. Also note that the form rejects duplicate submissions.</p>
                        <router-link to="/submit" class="btn btn-primary full-width sidebar-action sidebar-action--primary">Submit a Record!</router-link>
                    </div>
                </div>

                <!-- 4. Stats Viewer -->
                <div class="card sidebar-card">
                    <div class="card-header">
                        <h3 class="sidebar-card__title">
                            <span class="sidebar-card__icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-4"></path></svg>
                            </span>
                            Stats Viewer
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="sidebar-note">Get a detailed overview of who completed the most, created the most demons or beat the hardest demons! There is even a leaderboard to compare yourself to the very best!</p>
                        <router-link to="/leaderboard" class="btn btn-secondary full-width sidebar-action sidebar-action--secondary">Open the Stats Viewer!</router-link>
                    </div>
                </div>

                <!-- 5. Discord -->
                <div class="card sidebar-card">
                    <div class="card-header">
                        <h3 class="sidebar-card__title"><span class="sidebar-card__icon sidebar-card__icon--discord"><img :src="'assets/discord' + (store.dark ? '-dark' : '') + '.svg'" width="18" height="18" alt=""/></span>Join Our Community</h3>
                    </div>
                    <div class="card-body">
                        <p class="sidebar-note">Join the official PCDemonlist Discord server, where you can get in touch with the list team, get notified of updates, and connect with the GD community!</p>
                        <a href="https://discord.gg/geometrydash" target="_blank" class="btn full-width sidebar-action sidebar-action--discord">
                            <img src="assets/discord.svg" width="16" height="16" class="sidebar-action__icon" alt=""/> Join Discord
                        </a>
                    </div>
                </div>

            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store,
        hoveredIndex: null,
        isHoverSupported: window.matchMedia('(hover: hover)').matches,
        searchQuery: ''
    }),
    computed: {
        filteredList() {
            if (!this.searchQuery) {
                return this.list.map(([level, err], index) => ({ level, err, rank: index + 1, originalIndex: index }));
            }
            const q = this.searchQuery.toLowerCase();
            return this.list
                .map(([level, err], index) => ({ level, err, rank: index + 1, originalIndex: index }))
                .filter(item => {
                    const l = item.level;
                    if (!l) return false;
                    return (l.name && l.name.toLowerCase().includes(q)) || 
                           (l.author && l.author.toLowerCase().includes(q));
                });
        },
        level() {
            return this.list[this.selected] ? this.list[this.selected][0] : null;
        },
        video() {
            if (!this.level?.showcase) {
                return embed(this.level?.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        this.list = await fetchList();
        this.editors = await fetchEditors();

        if (!this.list) {
            this.errors = ["Failed to load list. Retry in a few minutes or notify list staff."];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => `Failed to load level. (${err}.json)`)
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
        getThumb(video) {
            if (typeof video === 'object' && video?.video) {
                video = video.video;
            }
            if (!video || typeof video !== 'string') return 'extreme.png';
            const id = getYoutubeIdFromUrl(video);
            if (!id) return 'extreme.png';
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
        goToLevel(level) {
            if (!level) return;
            this.$router.push(`/demonlist/${level.id}`);
        },
        getEditorDisplayRole(name) {
            const roles = {
                'kaoas': 'List Owner',
                'binarY': 'List Admin',
                'casamio': 'List Admin',
                'znassPCD': 'List Helper',
                'pyantCARRY': 'List Trial Helper',
                'xasit': 'Developer',
                'verOPP': 'Developer'
            };
            return roles[name] || 'List Helper';
        }
    },
};
