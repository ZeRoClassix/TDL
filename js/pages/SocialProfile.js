import Spinner from '../components/Spinner.js';
import {
    ensureSocialProfileChannelVideos,
    ensureSocialVideoIdentities,
    formatCompactNumber,
    formatRelativeDate,
    getCommunityPostsForPlayer,
    getSocialProfileBySlug,
    preloadProfileAvatars,
    voteOnCommunityPoll,
} from '../socialData.js';

export default {
    name: 'SocialProfile',
    components: { Spinner },
    data: () => ({
        loading: true,
        profile: null,
        posts: [],
        syncingChannelVideos: false,
    }),
    watch: {
        '$route.params.slug': {
            immediate: false,
            async handler() {
                await this.loadProfile();
            },
        },
        '$route.query.tab': {
            immediate: false,
            async handler() {
                await this.loadProfile();
            },
        },
    },
    async mounted() {
        await this.loadProfile();
    },
    computed: {
        activeTab() {
            return this.$route.query.tab || 'home';
        },
        profileVideos() {
            return this.profile?.uploads || [];
        },
        featuredVideos() {
            return this.profile?.featuredVideos?.length ? this.profile.featuredVideos : this.profileVideos.slice(0, 4);
        },
        videoGrid() {
            return this.profileVideos.slice().sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        },
        liveVideos() {
            return this.profile?.liveVideos || [];
        },
        vodVideos() {
            return this.profile?.vods || [];
        },
        totalViews() {
            return Number(this.profile?.stats?.totalViews || 0);
        },
    },
    methods: {
        formatCompactNumber,
        formatRelativeDate,
        async loadProfile() {
            this.loading = true;
            this.profile = await getSocialProfileBySlug(this.$route.params.slug);
            this.posts = this.profile ? getCommunityPostsForPlayer(this.profile.slug) : [];
            this.loading = false;
            preloadProfileAvatars();

            if (!this.profile || !(this.profile.youtubeSyncAvailable || this.profile.uploads?.some((video) => video.youtubeId))) return;

            this.syncingChannelVideos = true;
            try {
                const refreshed = await ensureSocialProfileChannelVideos(this.profile.slug);
                if (refreshed) {
                    this.profile = refreshed;
                    this.posts = getCommunityPostsForPlayer(refreshed.slug);
                }
                const hydrated = await ensureSocialVideoIdentities(
                    (this.profile?.uploads || []).map((video) => video.youtubeId).filter(Boolean),
                    { limit: 180 },
                );
                const hydratedProfile = hydrated.profiles.find((entry) => entry.slug === this.$route.params.slug);
                if (hydratedProfile) {
                    this.profile = hydratedProfile;
                    this.posts = getCommunityPostsForPlayer(hydratedProfile.slug);
                }
            } finally {
                this.syncingChannelVideos = false;
            }
        },
        setTab(tab) {
            this.$router.replace({
                path: `/social/player/${this.$route.params.slug}`,
                query: tab === 'home' ? {} : { tab },
            });
        },
        vote(postId, optionId) {
            voteOnCommunityPoll(this.profile.slug, postId, optionId);
            this.posts = getCommunityPostsForPlayer(this.profile.slug);
        },
        socialEntries() {
            if (!this.profile) return [];
            return [
                { key: 'youtube', label: 'YouTube', url: this.profile.socials.youtube },
                { key: 'twitch', label: 'Twitch', url: this.profile.socials.twitch },
                { key: 'discord', label: 'Discord', url: this.profile.socials.discord },
                { key: 'twitter', label: 'Twitter / X', url: this.profile.socials.twitter },
            ];
        },
    },
    template: `
        <main v-if="loading" class="spinner-container">
            <Spinner></Spinner>
        </main>
        <main v-else-if="!profile" class="page-social-profile">
            <div class="social-shell">
                <div class="social-empty social-empty--watch">
                    <h2>Player profile not found.</h2>
                    <p>The player you opened does not have a social profile yet.</p>
                    <router-link to="/social" class="btn btn-primary">Back to Social</router-link>
                </div>
            </div>
        </main>
        <main v-else class="page-social-profile">
            <div class="social-shell social-shell--profile">
                <section class="social-channel-hero">
                    <div class="social-channel-hero__banner">
                        <div class="social-channel-hero__overlay"></div>
                        <div class="social-channel-hero__content">
                            <img :src="profile.avatar" :alt="profile.name" />
                            <div class="social-channel-hero__copy">
                                <div class="social-kicker">Player Channel</div>
                                <div class="social-channel-hero__title">
                                    <h1>{{ profile.name }}</h1>
                                    <span v-if="profile.verified" class="creator-pill__badge" aria-label="Verified">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                            <path d="M12 2.5 14.92 5l3.82.35 1.37 3.58L22.5 12l-2.39 3.07-1.37 3.58-3.82.35L12 21.5 9.08 19l-3.82-.35-1.37-3.58L1.5 12l2.39-3.07 1.37-3.58L9.08 5 12 2.5Zm-1.05 12.9 5.2-5.2-1.1-1.1-4.1 4.1-1.9-1.9-1.1 1.1 3 3Z"/>
                                        </svg>
                                    </span>
                                </div>
                                <p>{{ profile.bio }}</p>
                                <div class="social-channel-hero__meta">
                                    <span>{{ formatCompactNumber(profile.followers) }} subscribers</span>
                                    <span>{{ profileVideos.length }} uploads</span>
                                    <span>{{ formatCompactNumber(totalViews) }} total views</span>
                                    <span>{{ profile.bannerLabel }}</span>
                                </div>
                                <div v-if="syncingChannelVideos" class="social-note-banner">
                                    Syncing channel identity and recent uploads from YouTube...
                                </div>
                                <div class="social-channel-hero__links">
                                    <a
                                        v-for="entry in socialEntries()"
                                        :key="entry.key"
                                        :href="entry.url || undefined"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="social-link-chip"
                                        :class="{ disabled: !entry.url }"
                                    >
                                        {{ entry.label }}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="social-channel-tabs">
                    <button class="social-tab-btn" :class="{ active: activeTab === 'home' }" @click="setTab('home')">Home</button>
                    <button class="social-tab-btn" :class="{ active: activeTab === 'videos' }" @click="setTab('videos')">Videos</button>
                    <button class="social-tab-btn" :class="{ active: activeTab === 'live' }" @click="setTab('live')">Live</button>
                    <button class="social-tab-btn" :class="{ active: activeTab === 'vods' }" @click="setTab('vods')">VODs</button>
                    <button class="social-tab-btn" :class="{ active: activeTab === 'community' }" @click="setTab('community')">Community</button>
                </section>

                <section v-if="activeTab === 'home'" class="social-channel-section">
                    <div class="section-headline">
                        <div>
                            <div class="section-kicker">Featured</div>
                            <h2>Most Popular Uploads</h2>
                        </div>
                    </div>
                    <div class="social-grid social-grid--wide">
                        <router-link
                            v-for="video in featuredVideos"
                            :key="video.id"
                            class="social-grid-card"
                            :to="'/social/watch/' + video.id"
                        >
                            <div class="social-grid-card__thumb">
                                <img :src="video.thumbnail" :alt="video.title" />
                                <span class="video-badge">{{ video.badge }}</span>
                            </div>
                            <div class="social-grid-card__body">
                                <h3>{{ video.title }}</h3>
                                <div class="social-grid-card__meta">
                                    <span>{{ formatCompactNumber(video.views) }} views</span>
                                    <span>{{ formatRelativeDate(video.uploadDate) }}</span>
                                    <span>{{ video.levelName }}</span>
                                </div>
                            </div>
                        </router-link>
                    </div>
                </section>

                <section v-else-if="activeTab === 'videos'" class="social-channel-section">
                    <div class="section-headline">
                        <div>
                            <div class="section-kicker">Library</div>
                            <h2>All Uploads</h2>
                        </div>
                    </div>
                    <div class="social-grid">
                        <router-link
                            v-for="video in videoGrid"
                            :key="video.id"
                            class="social-grid-card"
                            :to="'/social/watch/' + video.id"
                        >
                            <div class="social-grid-card__thumb">
                                <img :src="video.thumbnail" :alt="video.title" />
                                <span class="video-badge">{{ video.badge }}</span>
                            </div>
                            <div class="social-grid-card__body">
                                <h3>{{ video.title }}</h3>
                                <div class="social-grid-card__meta">
                                    <span>{{ formatCompactNumber(video.views) }} views</span>
                                    <span>{{ formatRelativeDate(video.uploadDate) }}</span>
                                    <span>{{ video.difficulty }}</span>
                                </div>
                            </div>
                        </router-link>
                    </div>
                </section>

                <section v-else-if="activeTab === 'live'" class="social-channel-section">
                    <div class="section-headline">
                        <div>
                            <div class="section-kicker">Live Style</div>
                            <h2>Run Sessions & Active Grinds</h2>
                        </div>
                    </div>
                    <div v-if="liveVideos.length" class="social-grid">
                        <router-link
                            v-for="video in liveVideos"
                            :key="video.id"
                            class="social-grid-card social-grid-card--live"
                            :to="'/social/watch/' + video.id"
                        >
                            <div class="social-grid-card__thumb">
                                <img :src="video.thumbnail" :alt="video.title" />
                                <span class="video-live-badge">Active Now</span>
                            </div>
                            <div class="social-grid-card__body">
                                <h3>{{ video.title }}</h3>
                                <div class="social-grid-card__meta">
                                    <span>{{ video.levelName }}</span>
                                    <span>{{ video.fpsCategory }} FPS</span>
                                    <span>{{ formatCompactNumber(video.views) }} views</span>
                                </div>
                            </div>
                        </router-link>
                    </div>
                    <div v-else class="social-empty">
                        <h3>No active runs right now.</h3>
                        <p>This tab fills from videos tagged or inferred as active progress sessions.</p>
                    </div>
                </section>

                <section v-else-if="activeTab === 'vods'" class="social-channel-section">
                    <div class="section-headline">
                        <div>
                            <div class="section-kicker">Archive</div>
                            <h2>Archived Major Uploads</h2>
                        </div>
                    </div>
                    <div class="social-grid">
                        <router-link
                            v-for="video in vodVideos"
                            :key="video.id"
                            class="social-grid-card"
                            :to="'/social/watch/' + video.id"
                        >
                            <div class="social-grid-card__thumb">
                                <img :src="video.thumbnail" :alt="video.title" />
                                <span class="video-badge">{{ video.badge }}</span>
                            </div>
                            <div class="social-grid-card__body">
                                <h3>{{ video.title }}</h3>
                                <div class="social-grid-card__meta">
                                    <span>{{ formatCompactNumber(video.views) }} views</span>
                                    <span>{{ video.levelName }}</span>
                                </div>
                            </div>
                        </router-link>
                    </div>
                </section>

                <section v-else class="social-channel-section">
                    <div class="section-headline">
                        <div>
                            <div class="section-kicker">Community</div>
                            <h2>Posts, Polls & Updates</h2>
                        </div>
                    </div>

                    <div v-if="posts.length" class="community-feed">
                        <article v-for="post in posts" :key="post.id" class="community-card">
                            <div class="community-card__head">
                                <div>
                                    <span class="video-badge">{{ post.type === 'update' ? 'Update' : post.type === 'poll' ? 'Poll' : 'Post' }}</span>
                                    <strong>{{ profile.name }}</strong>
                                </div>
                                <span>{{ formatRelativeDate(post.createdAt) }}</span>
                            </div>
                            <p>{{ post.content }}</p>

                            <div v-if="post.pollOptions && post.pollOptions.length" class="community-poll">
                                <button
                                    v-for="option in post.pollOptions"
                                    :key="option.id"
                                    class="community-poll__option"
                                    @click="vote(post.id, option.id)"
                                >
                                    <span>{{ option.label }}</span>
                                    <strong>{{ formatCompactNumber(option.votes) }}</strong>
                                </button>
                            </div>
                        </article>
                    </div>
                    <div v-else class="social-empty">
                        <h3>No community posts yet.</h3>
                        <p>Add community entries directly inside this player's profile JSON file.</p>
                    </div>
                </section>
            </div>
        </main>
    `,
};
