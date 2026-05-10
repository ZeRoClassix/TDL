import Spinner from '../components/Spinner.js';
import {
    ensureSocialVideoIdentities,
    formatCompactNumber,
    formatRelativeDate,
    getSocialDataset,
    preloadProfileAvatars,
} from '../socialData.js';

export default {
    name: 'Social',
    components: { Spinner },
    data: () => ({
        store: window.store || {},
        loading: true,
        dataset: {
            videos: [],
            profiles: [],
            filters: { difficulties: [], fpsCategories: [], types: [], sortOptions: [] },
            settings: {},
            adminResources: [],
        },
        search: '',
        typeFilter: 'all',
        difficultyFilter: 'all',
        fpsFilter: 'all',
        sortBy: 'relevance',
        studioOpen: false,
    }),
    computed: {
        videos() {
            return this.dataset.videos || [];
        },
        profiles() {
            return this.dataset.profiles || [];
        },
        normalizedSearch() {
            return this.search.trim().toLowerCase();
        },
        hasFilters() {
            return Boolean(
                this.normalizedSearch
                || this.typeFilter !== 'all'
                || this.difficultyFilter !== 'all'
                || this.fpsFilter !== 'all'
            );
        },
        filteredVideos() {
            return this.videos.filter((video) => {
                if (this.typeFilter !== 'all' && video.type !== this.typeFilter) return false;
                if (this.difficultyFilter !== 'all' && video.difficulty !== this.difficultyFilter) return false;
                if (this.fpsFilter !== 'all' && video.fpsCategory !== this.fpsFilter) return false;
                if (!this.normalizedSearch) return true;

                return [
                    video.playerName,
                    video.levelName,
                    video.title,
                    video.type,
                    video.levelAuthor,
                ].some((field) => String(field || '').toLowerCase().includes(this.normalizedSearch));
            });
        },
        matchingProfiles() {
            if (!this.normalizedSearch) return [];

            return this.profiles.filter((profile) => [
                profile.name,
                profile.bio,
                profile.bannerLabel,
            ].some((field) => String(field || '').toLowerCase().includes(this.normalizedSearch)));
        },
        sectionRows() {
            return [
                { key: 'mostPopular', title: 'Most Popular', videos: this.sectionVideos('mostPopular') },
                { key: 'latest', title: 'Latest', videos: this.sectionVideos('latest') },
                { key: 'trending', title: 'Trending', videos: this.sectionVideos('trending') },
                { key: 'topVerifications', title: 'Top Verifications', videos: this.sectionVideos('topVerifications') },
                { key: 'topProgress', title: 'Top Progress Runs', videos: this.sectionVideos('topProgress') },
                { key: 'upcomingProgress', title: 'Upcoming Progress', videos: this.sectionVideos('upcomingProgress') },
                { key: 'activeNow', title: 'Active Now', videos: this.sectionVideos('activeNow') },
            ];
        },
        browseVideos() {
            const videos = [...this.filteredVideos];
            switch (this.sortBy) {
                case 'most-viewed':
                    return this.sortedByViews(videos);
                case 'newest':
                    return this.sortedByNewest(videos);
                case 'hardest-levels':
                    return videos.sort((a, b) => a.levelRank - b.levelRank || b.views - a.views);
                default:
                    return this.sortedByRelevance(videos);
            }
        },
        featuredCreators() {
            const limit = Number(this.dataset.settings?.featuredPlayerLimit || 8);
            const source = this.matchingProfiles.length ? this.matchingProfiles : this.profiles;
            return source.slice(0, limit);
        },
        isModerator() {
            return this.store?.user?.role === 'moderator';
        },
        youtubeSyncEnabled() {
            return Boolean(String(this.dataset.settings?.youtubeApiKey || '').trim());
        },
    },
    async mounted() {
        await this.loadHub();
    },
    methods: {
        formatCompactNumber,
        formatRelativeDate,
        async loadHub(refresh = false) {
            this.loading = true;
            this.dataset = await getSocialDataset({ refresh });
            this.loading = false;
            preloadProfileAvatars();
            await this.hydrateVisibleYoutubeMetadata();
        },
        async hydrateVisibleYoutubeMetadata() {
            if (!this.dataset?.videos) return;
            const candidateIds = [
                ...this.dataset.videos.map((video) => video.youtubeId).filter(Boolean),
            ];
            if (!candidateIds.length) return;
            this.dataset = await ensureSocialVideoIdentities(candidateIds, { limit: 1000 });
        },
        sortedByViews(videos) {
            return [...videos].sort((a, b) => b.views - a.views);
        },
        sortedByNewest(videos) {
            return [...videos].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        },
        sortedByTrending(videos) {
            return [...videos].sort((a, b) => Number(b.trendingScore || 0) - Number(a.trendingScore || 0));
        },
        sortedByProgress(videos) {
            return [...videos].sort((a, b) => {
                const scoreB = (Number(b.progressPercent || 0) * 1000) + (200 - Number(b.levelRank || 999)) + Math.log10(Math.max(1, Number(b.views || 0)));
                const scoreA = (Number(a.progressPercent || 0) * 1000) + (200 - Number(a.levelRank || 999)) + Math.log10(Math.max(1, Number(a.views || 0)));
                return scoreB - scoreA;
            });
        },
        sortedByRelevance(videos) {
            if (!this.normalizedSearch) return this.sortedByNewest(videos);
            return [...videos].sort((a, b) => this.relevanceScore(b) - this.relevanceScore(a));
        },
        relevanceScore(video) {
            let score = 0;
            const fields = {
                title: 6,
                playerName: 5,
                levelName: 4,
                type: 3,
                levelAuthor: 2,
            };

            Object.entries(fields).forEach(([key, weight]) => {
                if (String(video[key] || '').toLowerCase().includes(this.normalizedSearch)) score += weight;
            });

            return score + Math.log10(Math.max(1, Number(video.views || 0)));
        },
        sectionVideos(key) {
            const pool = this.filteredVideos.filter((video) => this.sectionEligibility(video, key));
            const flagged = this.sortForSection(key, pool.filter((video) => video.categoryFlags?.[key]));
            const seen = new Set(flagged.map((video) => video.id));
            const filler = this.sortForSection(
                key,
                pool.filter((video) => !seen.has(video.id))
            );
            return [...flagged, ...filler].slice(0, 14);
        },
        sectionEligibility(video, key) {
            if (key === 'topVerifications') return video.type === 'verification';
            if (key === 'upcomingProgress') return video.type === 'progress' && video.isUpcomingRecord;
            if (key === 'topProgress' || key === 'activeNow') return video.type === 'progress';
            return true;
        },
        sortForSection(key, videos) {
            switch (key) {
                case 'mostPopular':
                case 'topVerifications':
                    return this.sortedByViews(videos);
                case 'latest':
                    return this.sortedByNewest(videos);
                case 'trending':
                case 'activeNow':
                    return this.sortedByTrending(videos);
                case 'topProgress':
                case 'upcomingProgress':
                    return this.sortedByProgress(videos);
                default:
                    return videos;
            }
        },
        scrollRail(key, direction) {
            const rail = this.$el.querySelector(`[data-rail="${key}"]`);
            if (!rail) return;
            rail.scrollBy({ left: direction * 420, behavior: 'smooth' });
        },
        goToVideo(id) {
            this.$router.push(`/social/watch/${id}`);
        },
        goToProfile(slug) {
            this.$router.push(`/social/player/${slug}`);
        },
        resetFilters() {
            this.search = '';
            this.typeFilter = 'all';
            this.difficultyFilter = 'all';
            this.fpsFilter = 'all';
            this.sortBy = 'relevance';
        },
    },
    template: `
        <main v-if="loading" class="spinner-container">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-social">
            <div class="social-shell">
                <section class="social-hero">
                    <div class="social-hero__copy">
                        <div class="social-kicker">Social / Progress</div>
                        <h1>Watch the demonlist scene like it has its own platform.</h1>
                        <p>Player profiles are discovered automatically from demonlist records, enriched from YouTube when available, and still fully controllable through local override manifests.</p>
                    </div>
                    <div class="social-hero__stats">
                        <div class="social-stat">
                            <span class="social-stat__label">Tracked Uploads</span>
                            <strong>{{ formatCompactNumber(videos.length) }}</strong>
                        </div>
                        <div class="social-stat">
                            <span class="social-stat__label">Profiles Loaded</span>
                            <strong>{{ formatCompactNumber(profiles.length) }}</strong>
                        </div>
                        <div class="social-stat">
                            <span class="social-stat__label">Hybrid Data</span>
                            <strong>{{ youtubeSyncEnabled ? 'YouTube + Local Files' : 'Local Files + Simulation' }}</strong>
                        </div>
                    </div>
                </section>

                <section class="social-toolbar">
                    <div class="social-search">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </svg>
                        <input
                            v-model="search"
                            type="text"
                            placeholder="Search players, levels, videos, or run types..."
                        />
                    </div>
                    <div class="social-toolbar__controls">
                        <select v-model="sortBy">
                            <option value="relevance">Relevance</option>
                            <option value="most-viewed">Most Viewed</option>
                            <option value="newest">Newest</option>
                            <option value="hardest-levels">Hardest Levels</option>
                        </select>
                        <select v-model="difficultyFilter">
                            <option value="all">All Tiers</option>
                            <option v-for="difficulty in dataset.filters.difficulties.filter((value) => value !== 'all')" :key="difficulty" :value="difficulty">{{ difficulty }}</option>
                        </select>
                        <select v-model="fpsFilter">
                            <option value="all">All FPS</option>
                            <option v-for="fps in dataset.filters.fpsCategories.filter((value) => value !== 'all')" :key="fps" :value="fps">{{ fps }} FPS</option>
                        </select>
                    </div>
                    <div class="social-chip-row">
                        <button
                            v-for="type in dataset.filters.types"
                            :key="type"
                            class="social-chip"
                            :class="{ active: typeFilter === type }"
                            @click="typeFilter = type"
                        >
                            {{ type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1) }}
                        </button>
                        <button v-if="hasFilters" class="social-chip social-chip--ghost" @click="resetFilters">Reset</button>
                    </div>
                </section>

                <section v-if="isModerator" class="social-studio">
                    <button class="social-studio__toggle" @click="studioOpen = !studioOpen">
                        <span>Admin File Control</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path :d="studioOpen ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'"></path>
                        </svg>
                    </button>
                    <div v-if="studioOpen" class="social-studio__grid">
                        <div class="studio-card">
                            <div class="studio-card__header">
                                <h3>Data Sources</h3>
                                <p>Everything in the feed now comes from local manifests and JSON files, with optional YouTube enrichment layered on top.</p>
                            </div>
                            <div class="studio-list">
                                <div v-for="resource in dataset.adminResources" :key="resource.path" class="studio-list__item studio-list__item--stacked">
                                    <div>
                                        <strong>{{ resource.label }}</strong>
                                        <span>{{ resource.path }}</span>
                                    </div>
                                    <p>{{ resource.description }}</p>
                                </div>
                            </div>
                        </div>

                        <div class="studio-card">
                            <div class="studio-card__header">
                                <h3>Hybrid Rules</h3>
                                <p>Manual files always win. If a value is omitted, the site falls back to fetched or simulated data.</p>
                            </div>
                            <div class="studio-note-grid">
                                <div class="studio-note">
                                    <strong>Profiles</strong>
                                    <span>Override names, avatars, subscribers, verified state, bios, socials, and manual-only profiles in <code>/social/profile-overrides.json</code>.</span>
                                </div>
                                <div class="studio-note">
                                    <strong>Videos</strong>
                                    <span>Override stats, comments, categories, and custom videos in <code>/social/video-overrides.json</code>.</span>
                                </div>
                                <div class="studio-note">
                                    <strong>Simulation</strong>
                                    <span>Top demons and bigger creators trend upward faster; lower demons and stagnant videos grow more slowly.</span>
                                </div>
                                <div class="studio-note">
                                    <strong>YouTube Sync</strong>
                                    <span>{{ youtubeSyncEnabled ? 'Enabled in /social/config.json' : 'Disabled until a YouTube API key is added in /social/config.json' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="social-creators">
                    <div class="section-headline">
                        <div>
                            <div class="section-kicker">{{ matchingProfiles.length ? 'Matches' : 'Featured Players' }}</div>
                            <h2>{{ matchingProfiles.length ? 'Profiles matching your search' : 'Profiles worth checking next' }}</h2>
                        </div>
                    </div>
                    <div class="social-creator-row">
                        <router-link
                            v-for="profile in featuredCreators"
                            :key="profile.slug"
                            class="creator-pill"
                            :to="'/social/player/' + profile.slug"
                        >
                            <img :src="profile.avatar" :alt="profile.name" loading="eager" />
                            <div>
                                <strong>{{ profile.name }}</strong>
                                <span>{{ formatCompactNumber(profile.followers) }} subscribers</span>
                            </div>
                            <span v-if="profile.verified" class="creator-pill__badge" aria-label="Verified">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M12 2.5 14.92 5l3.82.35 1.37 3.58L22.5 12l-2.39 3.07-1.37 3.58-3.82.35L12 21.5 9.08 19l-3.82-.35-1.37-3.58L1.5 12l2.39-3.07 1.37-3.58L9.08 5 12 2.5Zm-1.05 12.9 5.2-5.2-1.1-1.1-4.1 4.1-1.9-1.9-1.1 1.1 3 3Z"/>
                                </svg>
                            </span>
                        </router-link>
                    </div>
                </section>

                <section v-for="section in sectionRows" :key="section.key" class="social-rail-section" v-show="section.videos.length > 0">
                    <div class="section-headline">
                        <div>
                            <div class="section-kicker">Social Feed</div>
                            <h2>{{ section.title }}</h2>
                        </div>
                        <div class="rail-actions">
                            <button class="rail-btn" @click="scrollRail(section.key, -1)" aria-label="Scroll left">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
                            </button>
                            <button class="rail-btn" @click="scrollRail(section.key, 1)" aria-label="Scroll right">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="social-rail" :data-rail="section.key">
                        <article
                            v-for="video in section.videos"
                            :key="video.id"
                            class="social-video-card"
                            tabindex="0"
                            @click="goToVideo(video.id)"
                            @keydown.enter="goToVideo(video.id)"
                        >
                            <div class="social-video-card__thumb">
                                <img :src="video.thumbnail" :alt="video.title" loading="lazy" />
                                <span class="video-badge">{{ video.badge }}</span>
                                <span v-if="video.isFramePerfect" class="video-frame-badge">Frame Perfect</span>
                            </div>
                            <div class="social-video-card__body">
                                <h3>{{ video.title }}</h3>
                                <button class="video-player-link" @click.stop="goToProfile(video.playerSlug)">{{ video.playerName }}</button>
                                <p>{{ formatCompactNumber(video.views) }} views · {{ formatRelativeDate(video.uploadDate) }}</p>
                                <div class="video-meta-row">
                                    <span>{{ video.levelName || 'Custom Upload' }}</span>
                                    <span>{{ video.fpsCategory }} FPS</span>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>

                <section class="social-browse">
                    <div class="section-headline">
                        <div>
                            <div class="section-kicker">Browse</div>
                            <h2>{{ hasFilters ? 'Filtered Results' : 'Everything Happening Right Now' }}</h2>
                        </div>
                    </div>
                    <div class="social-grid">
                        <article
                            v-for="video in browseVideos.slice(0, 24)"
                            :key="video.id"
                            class="social-grid-card"
                            tabindex="0"
                            @click="goToVideo(video.id)"
                            @keydown.enter="goToVideo(video.id)"
                        >
                            <div class="social-grid-card__thumb">
                                <img :src="video.thumbnail" :alt="video.title" loading="lazy" />
                                <span class="video-badge">{{ video.badge }}</span>
                            </div>
                            <div class="social-grid-card__body">
                                <h3>{{ video.title }}</h3>
                                <div class="social-grid-card__meta">
                                    <button class="video-player-link" @click.stop="goToProfile(video.playerSlug)">{{ video.playerName }}</button>
                                    <span>{{ formatCompactNumber(video.views) }} views</span>
                                    <span>{{ video.difficulty }}</span>
                                </div>
                            </div>
                        </article>
                    </div>
                    <div v-if="browseVideos.length === 0" class="social-empty">
                        <h3>No uploads matched those filters.</h3>
                        <p>Try another player, level name, video title, or run type.</p>
                    </div>
                </section>
            </div>
        </main>
    `,
};
