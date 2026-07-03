import Spinner from '../components/Spinner.js';
import {
    formatCompactNumber,
    formatFullDate,
    formatRelativeDate,
    getVideoReaction,
    setVideoReaction,
} from '../socialData.js';
import { fetchYoutubeVideoIdentity, fetchYoutubeVideoDetails } from '../social/youtube.js';
import { generateAvatar } from '../social/helpers.js';
import { fetchFutureDemons } from '../content.js';
import { store } from "../store.js";

export default {
    name: 'SocialWatch',
    components: { Spinner },
    data: () => ({
        store: window.store || store,
        loading: true,
        video: null,
        profile: null,
        recommendedVideos: [],
        reaction: null,
        copied: false,
    }),
    watch: {
        '$route.params.id': {
            immediate: false,
            async handler() {
                await this.loadWatchPage();
            },
        },
    },
    async mounted() {
        await this.loadWatchPage();
    },
    computed: {
        isLoggedIn() {
            return Boolean(this.store?.user);
        },
        currentUserName() {
            return this.store?.user?.username || '';
        },
        displayedLikes() {
            return Number(this.video?.likes || 0) + (this.reaction === 'like' ? 1 : 0);
        },
        displayedDislikes() {
            return Number(this.video?.dislikes || 0) + (this.reaction === 'dislike' ? 1 : 0);
        },
    },
    methods: {
        formatCompactNumber,
        formatFullDate,
        formatRelativeDate,
        async loadWatchPage() {
            this.loading = true;
            const id = this.$route.params.id;
            
            // Default basic info
            this.video = {
                id,
                youtubeId: id,
                embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0&showinfo=0`,
                badge: 'Record',
                isFramePerfect: false,
                title: 'Loading video...',
                views: 0,
                uploadDate: new Date().toISOString(),
                likes: 0,
                dislikes: 0,
                commentsCount: 0,
                levelName: 'Future Demon',
                difficulty: 'Extreme Demon',
                fpsCategory: 'Any'
            };
            this.profile = {
                slug: 'player',
                name: 'Unknown Player',
                avatar: 'assets/user-shield.svg',
                verified: false,
                followers: 0,
                bio: ''
            };
            this.recommendedVideos = [];

            try {
                // Fetch details from YouTube
                const apiKey = this.store?.settings?.youtubeApiKey || '';
                const detailsMap = await fetchYoutubeVideoDetails({ videoIds: [id], apiKey });
                const detail = detailsMap.get(id);
                
                const identity = await fetchYoutubeVideoIdentity({ youtubeId: id });

                if (detail) {
                    this.video.title = detail.title || this.video.title;
                    this.video.uploadDate = detail.uploadDate || this.video.uploadDate;
                }
                
                if (identity) {
                    this.video.title = identity.title || this.video.title;
                    this.profile.name = identity.authorName || this.profile.name;
                    this.profile.slug = identity.handle || identity.channelId || this.profile.slug;
                } else if (detail) {
                    this.profile.name = detail.channelTitle || this.profile.name;
                    this.profile.slug = detail.channelId || this.profile.slug;
                }

                // Match with Future Demons for custom stats and player info
                const futureDemons = await fetchFutureDemons();
                let matchedDemon = null;
                let matchedRecord = null;
                
                for (const demon of futureDemons) {
                    if (demon.showcase && demon.showcase.includes(id)) {
                        matchedDemon = demon;
                        break;
                    }
                    if (demon.verification && demon.verification.link && demon.verification.link.includes(id)) {
                        matchedDemon = demon;
                        break;
                    }
                    if (demon.records) {
                        for (const record of demon.records) {
                            if ((record.video && record.video.includes(id)) || (record.link && record.link.includes(id))) {
                                matchedDemon = demon;
                                matchedRecord = record;
                                break;
                            }
                        }
                    }
                    if (matchedDemon) break;
                }

                if (matchedDemon) {
                    this.video.levelName = matchedDemon.name;
                    this.video.estimatedPlace = matchedDemon.estimatedPlace ? `#${matchedDemon.estimatedPlace}` : 'Unknown';
                    
                    const demonNameLower = matchedDemon.name.toLowerCase();
                    if (demonNameLower === 'grief') {
                        this.video.views = Math.floor(Math.random() * (2000000 - 1500000) + 1500000);
                    } else if (demonNameLower === 'heliopolis') {
                        this.video.views = Math.floor(Math.random() * (1500000 - 1200000) + 1200000);
                    } else if (demonNameLower === 'silent kocmoc') {
                        const recName = matchedRecord ? (matchedRecord.user || matchedRecord.username || matchedRecord.player || '').toLowerCase() : '';
                        if (matchedRecord && Number(matchedRecord.percent) === 75 && recName.includes('aidn76')) {
                            this.video.views = 384129;
                        } else {
                            this.video.views = Math.floor(Math.random() * (1200000 - 1000000) + 1000000);
                        }
                    } else if (['kocmoc unleashed', 'vehemence', 'aeternus', 'angleicide', 'injury', 'etertnal silence', 'sweeping demon 2'].includes(demonNameLower)) {
                        this.video.views = Math.floor(Math.random() * (800000 - 300000) + 300000);
                    } else {
                        this.video.views = Math.floor(Math.random() * (300000 - 20000) + 20000);
                    }
                    
                    this.video.likes = Math.floor(this.video.views * (Math.random() * (0.10 - 0.05) + 0.05));
                    this.video.dislikes = Math.floor(this.video.likes * (Math.random() * (0.05 - 0.01) + 0.01));
                    
                    let overrideName = matchedRecord ? (matchedRecord.user || matchedRecord.username || matchedRecord.player) : matchedDemon.author;
                    if (overrideName) {
                        if (overrideName.toLowerCase() === 'aidn76') {
                            this.profile.name = 'aidn76';
                        } else {
                            this.profile.name = overrideName;
                        }
                    }

                    if (matchedRecord && matchedRecord.date) {
                        this.video.uploadDate = matchedRecord.date;
                    }
                } else {
                    this.video.estimatedPlace = 'Unknown';
                }

                // Initial avatar generator using helpers (ignores clan tags and adds gradient)
                this.profile.avatar = generateAvatar(this.profile.name);

            } catch (e) {
                console.error("Failed to load video details:", e);
            }

            this.reaction = getVideoReaction(this.video.id);
            this.loading = false;
        },
        recommendationScore(video) {
            let score = 0;
            if (video.levelName && video.levelName === this.video.levelName) score += 12;
            if (video.playerSlug === this.video.playerSlug) score += 8;
            if (video.type === this.video.type) score += 5;
            if (video.categoryFlags?.trending) score += 4;
            score += Math.max(0, 220 - Number(video.levelRank || 999));
            score += Math.log10(Math.max(1, Number(video.views || 0)));
            return score;
        },
        setReactionState(nextReaction) {
            this.reaction = this.reaction === nextReaction ? null : nextReaction;
            setVideoReaction(this.video.id, this.reaction);
        },
        async copyShareLink() {
            const url = `${window.location.origin}${window.location.pathname}#/future-demons/watch/${this.video.id}`;
            try {
                await navigator.clipboard.writeText(url);
                this.copied = true;
                setTimeout(() => {
                    this.copied = false;
                }, 1800);
            } catch {
                this.copied = false;
            }
        },
    },
    template: `
        <main v-if="loading" class="spinner-container">
            <Spinner></Spinner>
        </main>
        <main v-else-if="!video" class="page-social-watch">
            <div class="social-shell">
                <div class="social-empty social-empty--watch">
                    <h2>Video not found.</h2>
                    <p>The upload you opened is missing or no longer available in the social feed.</p>
                    <router-link to="/future-demons" class="btn btn-primary">Back to Future Demons</router-link>
                </div>
            </div>
        </main>
        <main v-else class="page-social-watch">
            <div class="social-watch-shell">
                <section class="social-watch-main">
                    <div class="social-watch-player">
                        <iframe
                            v-if="video.embedUrl"
                            :src="video.embedUrl"
                            frameborder="0"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                        ></iframe>
                        <div v-else class="social-watch-player__fallback">
                            <h3>Embed unavailable</h3>
                            <p>Add a valid YouTube ID in the video override manifest to enable the player.</p>
                        </div>
                    </div>

                    <div class="social-watch-title">
                        <span class="video-badge">{{ video.badge }}</span>
                        <span v-if="video.isFramePerfect" class="video-frame-badge">Frame Perfect</span>
                        <h1>{{ video.title }}</h1>
                    </div>

                    <div class="social-watch-meta">
                        <div>
                            <strong>{{ formatCompactNumber(video.views) }} views</strong>
                            <span>{{ formatFullDate(video.uploadDate) }}</span>
                        </div>
                        <div class="social-watch-actions">
                            <button class="social-action-btn" :class="{ active: reaction === 'like' }" @click="setReactionState('like')">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.96 2.39l-1.34 7A2 2 0 0 1 18.49 21H7a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11l2.08-4.16A1 1 0 0 1 14.57 2h.29A1 1 0 0 1 15.83 3.22L15 5.88Z"></path></svg>
                                <span>{{ formatCompactNumber(displayedLikes) }}</span>
                            </button>
                            <button class="social-action-btn" :class="{ active: reaction === 'dislike' }" @click="setReactionState('dislike')">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 14V2"></path><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.96-2.39l1.34-7A2 2 0 0 1 5.51 3H17a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11l-2.08 4.16A1 1 0 0 1 9.43 22h-.29a1 1 0 0 1-.97-1.22L9 18.12Z"></path></svg>
                                <span>{{ formatCompactNumber(displayedDislikes) }}</span>
                            </button>
                            <button class="social-action-btn" @click="copyShareLink">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.59 13.51 6.83 3.98"></path><path d="m15.41 6.51-6.82 3.98"></path></svg>
                                <span>{{ copied ? 'Copied' : 'Share' }}</span>
                            </button>
                        </div>
                    </div>

                    <div v-if="profile" class="social-channel-card">
                        <img :src="profile.avatar" :alt="profile.name" loading="eager" />
                        <div class="social-channel-card__copy">
                            <div class="social-channel-card__name">
                                <strong>{{ profile.name }}</strong>
                                <span v-if="profile.verified" class="creator-pill__badge" aria-label="Verified">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M12 2.5 14.92 5l3.82.35 1.37 3.58L22.5 12l-2.39 3.07-1.37 3.58-3.82.35L12 21.5 9.08 19l-3.82-.35-1.37-3.58L1.5 12l2.39-3.07 1.37-3.58L9.08 5 12 2.5Zm-1.05 12.9 5.2-5.2-1.1-1.1-4.1 4.1-1.9-1.9-1.1 1.1 3 3Z"/>
                                    </svg>
                                </span>
                            </div>
                            <p v-if="profile.followers">{{ formatCompactNumber(profile.followers) }} subscribers</p>
                            <span v-if="profile.bio">{{ profile.bio }}</span>
                        </div>
                    </div>

                    <div class="social-watch-detail-card">
                        <div class="social-watch-detail-card__row">
                            <span>Level</span>
                            <strong>{{ video.levelName || 'Custom Upload' }}</strong>
                        </div>
                        <div class="social-watch-detail-card__row">
                            <span>Estimated Place</span>
                            <strong>{{ video.estimatedPlace }}</strong>
                        </div>
                        <div class="social-watch-detail-card__row">
                            <span>FPS</span>
                            <strong>{{ video.fpsCategory }} FPS</strong>
                        </div>
                    </div>

                    <!-- ======================== -->
                    <!-- YOUTUBE-STYLE COMMENTS   -->
                    <!-- ======================== -->
                    <section class="social-comments">
                        <div class="section-headline section-headline--compact">
                            <div>
                                <div class="section-kicker">Comments</div>
                                <h2>Comments Unavailable</h2>
                            </div>
                        </div>

                        <div class="social-empty" style="padding: 3rem 1rem; text-align: center; background: rgba(0,0,0,0.2); border-radius: 8px;">
                            <div class="social-empty-icon" style="margin-bottom: 1rem;">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                    <circle cx="12" cy="11" r="3"/>
                                    <path d="M12 16v-2"/>
                                    <path d="M12 8h.01"/>
                                </svg>
                            </div>
                            <h3 style="margin-bottom: 0.5rem;">Comments are under maintenance</h3>
                            <p style="color: var(--text-muted);">The comments section for Future Demons is currently offline and will be added back later.</p>
                        </div>
                    </section>
                </section>

                <aside class="social-watch-sidebar" v-if="recommendedVideos.length > 0">
                    <div class="section-headline section-headline--compact">
                        <div>
                            <div class="section-kicker">Up Next</div>
                            <h2>Recommended</h2>
                        </div>
                    </div>
                    <router-link
                        v-for="entry in recommendedVideos"
                        :key="entry.id"
                        class="watch-side-card"
                        :to="'/future-demons/watch/' + entry.id"
                    >
                        <div class="watch-side-card__thumb">
                            <img :src="entry.thumbnail" :alt="entry.title" loading="lazy" />
                            <span class="video-badge">{{ entry.badge }}</span>
                        </div>
                        <div class="watch-side-card__body">
                            <h3>{{ entry.title }}</h3>
                            <span>{{ entry.playerName }}</span>
                            <p>{{ formatCompactNumber(entry.views) }} views · {{ formatRelativeDate(entry.uploadDate) }}</p>
                        </div>
                    </router-link>
                </aside>
            </div>
        </main>
    `,
};
