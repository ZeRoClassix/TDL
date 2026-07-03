import Spinner from '../components/Spinner.js';
import {
    addVideoComment,
    addVideoReply,
    ensureSocialVideoIdentities,
    formatCompactNumber,
    formatFullDate,
    formatRelativeDate,
    getCommentAuthorAvatar,
    getSocialDataset,
    getVideoComments,
    getVideoReaction,
    preloadProfileAvatars,
    setVideoReaction,
    toggleCommentLike,
} from '../socialData.js';

export default {
    name: 'SocialWatch',
    components: { Spinner },
    data: () => ({
        store: window.store || {},
        loading: true,
        video: null,
        profile: null,
        recommendedVideos: [],
        comments: [],
        reaction: null,
        copied: false,
        commentForm: {
            text: '',
        },
        commentFocused: false,
        replyDrafts: {},
        expandedReplies: {},
        commentDislikes: {},
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
        currentUserAvatar() {
            if (!this.currentUserName) return '';
            return getCommentAuthorAvatar(this.currentUserName);
        },
        displayedLikes() {
            return Number(this.video?.likes || 0) + (this.reaction === 'like' ? 1 : 0);
        },
        displayedDislikes() {
            return Number(this.video?.dislikes || 0) + (this.reaction === 'dislike' ? 1 : 0);
        },
        displayedCommentCount() {
            return Math.max(Number(this.video?.commentsCount || 0), this.comments.length);
        },
    },
    methods: {
        formatCompactNumber,
        formatFullDate,
        formatRelativeDate,
        getCommentAuthorAvatar,
        async loadWatchPage() {
            this.loading = true;
            const dataset = await getSocialDataset();
            await this.applyDataset(dataset);
            this.loading = false;
            preloadProfileAvatars();
            await this.hydrateWatchYoutubeMetadata();
        },
        async applyDataset(dataset) {
            const id = this.$route.params.id;

            this.video = dataset.videos.find((entry) => entry.id === id) || null;
            if (!this.video) {
                this.profile = null;
                this.recommendedVideos = [];
                this.comments = [];
                return;
            }

            this.profile = dataset.profiles.find((entry) => entry.slug === this.video.playerSlug) || null;
            this.recommendedVideos = dataset.videos
                .filter((entry) => entry.id !== this.video.id)
                .sort((a, b) => this.recommendationScore(b) - this.recommendationScore(a))
                .slice(0, 12);

            this.reaction = getVideoReaction(this.video.id);
            this.refreshComments();
        },
        async hydrateWatchYoutubeMetadata() {
            if (!this.video) return;

            const hydrated = await ensureSocialVideoIdentities([
                this.video.youtubeId,
                ...this.recommendedVideos.map((entry) => entry.youtubeId),
            ], { limit: 60 });
            await this.applyDataset(hydrated);
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
        refreshComments() {
            this.comments = getVideoComments(this.video.id);
        },
        setReactionState(nextReaction) {
            this.reaction = this.reaction === nextReaction ? null : nextReaction;
            setVideoReaction(this.video.id, this.reaction);
        },
        async copyShareLink() {
            const url = `${window.location.origin}${window.location.pathname}#/social/watch/${this.video.id}`;
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
        promptSignIn() {
            this.store.showAuth = 'login';
        },
        submitComment() {
            if (!this.isLoggedIn || !this.commentForm.text.trim()) return;

            addVideoComment(this.video.id, {
                author: this.currentUserName,
                text: this.commentForm.text,
            });

            this.commentForm.text = '';
            this.commentFocused = false;
            this.refreshComments();
        },
        cancelComment() {
            this.commentForm.text = '';
            this.commentFocused = false;
        },
        toggleReplies(commentId) {
            this.expandedReplies = {
                ...this.expandedReplies,
                [commentId]: !this.expandedReplies[commentId],
            };
        },
        submitReply(commentId) {
            const text = String(this.replyDrafts[commentId] || '').trim();
            if (!text || !this.isLoggedIn) return;

            addVideoReply(this.video.id, commentId, {
                author: this.currentUserName,
                text,
            });

            this.replyDrafts = { ...this.replyDrafts, [commentId]: '' };
            this.refreshComments();
        },
        likeComment(commentId) {
            toggleCommentLike(this.video.id, commentId);
            this.refreshComments();
        },
        dislikeComment(commentId) {
            this.commentDislikes = {
                ...this.commentDislikes,
                [commentId]: !this.commentDislikes[commentId],
            };
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
                    <router-link to="/social" class="btn btn-primary">Back to Social</router-link>
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

                    <router-link v-if="profile" class="social-channel-card" :to="'/social/player/' + profile.slug">
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
                            <p>{{ formatCompactNumber(profile.followers) }} subscribers</p>
                            <span>{{ profile.bio }}</span>
                        </div>
                    </router-link>

                    <div class="social-watch-detail-card">
                        <div class="social-watch-detail-card__row">
                            <span>Level</span>
                            <strong>{{ video.levelName || 'Custom Upload' }}</strong>
                        </div>
                        <div class="social-watch-detail-card__row">
                            <span>Tier</span>
                            <strong>{{ video.difficulty }}</strong>
                        </div>
                        <div class="social-watch-detail-card__row">
                            <span>FPS</span>
                            <strong>{{ video.fpsCategory }} FPS</strong>
                        </div>
                        <div class="social-watch-detail-card__row">
                            <span>Comments</span>
                            <strong>{{ formatCompactNumber(displayedCommentCount) }}</strong>
                        </div>
                    </div>

                    <!-- ======================== -->
                    <!-- YOUTUBE-STYLE COMMENTS   -->
                    <!-- ======================== -->
                    <section class="social-comments">
                        <div class="section-headline section-headline--compact">
                            <div>
                                <div class="section-kicker">Comments</div>
                                <h2>{{ displayedCommentCount }} discussions</h2>
                            </div>
                        </div>

                        <!-- Comment composer – logged in -->
                        <div class="comment-composer-yt" v-if="isLoggedIn">
                            <img class="comment-composer-yt__avatar" :src="currentUserAvatar" :alt="currentUserName" />
                            <div class="comment-composer-yt__fields">
                                <textarea
                                    v-model="commentForm.text"
                                    placeholder="Add a comment..."
                                    rows="1"
                                    @focus="commentFocused = true"
                                ></textarea>
                                <div class="comment-composer-yt__actions" v-if="commentFocused || commentForm.text.trim()">
                                    <button class="btn-ghost" @click="cancelComment">Cancel</button>
                                    <button
                                        class="btn-comment-submit"
                                        @click="submitComment"
                                        :disabled="!commentForm.text.trim()"
                                    >Comment</button>
                                </div>
                            </div>
                        </div>

                        <!-- Comment composer – not logged in -->
                        <div class="comment-composer-yt comment-composer-yt--disabled" v-else @click="promptSignIn">
                            <div class="comment-composer-yt__avatar comment-composer-yt__avatar--placeholder">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <div class="comment-composer-yt__fields">
                                <div class="comment-composer-yt__placeholder">Sign in to comment...</div>
                            </div>
                        </div>

                        <div class="social-note-banner">
                            Seed comments are file-backed. New comments and likes added in the browser are local to this device.
                        </div>

                        <!-- Comment thread -->
                        <div class="comment-thread-yt">
                            <article v-for="comment in comments" :key="comment.id" class="comment-yt">
                                <img class="comment-yt__avatar" :src="getCommentAuthorAvatar(comment.author)" :alt="comment.author" loading="lazy" />
                                <div class="comment-yt__body">
                                    <div class="comment-yt__header">
                                        <strong class="comment-yt__author">{{ comment.author }}</strong>
                                        <span class="comment-yt__time">{{ formatRelativeDate(comment.createdAt) }}</span>
                                    </div>
                                    <p class="comment-yt__text" v-if="comment.text">{{ comment.text }}</p>

                                    <div class="comment-yt__engagement" v-if="comment.text">
                                        <button class="comment-yt__action" @click="likeComment(comment.id)" title="Like">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.96 2.39l-1.34 7A2 2 0 0 1 18.49 21H7a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11l2.08-4.16A1 1 0 0 1 14.57 2h.29A1 1 0 0 1 15.83 3.22L15 5.88Z"/></svg>
                                            <span v-if="comment.likes">{{ formatCompactNumber(comment.likes) }}</span>
                                        </button>
                                        <button class="comment-yt__action" :class="{ active: commentDislikes[comment.id] }" @click="dislikeComment(comment.id)" title="Dislike">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.96-2.39l1.34-7A2 2 0 0 1 5.51 3H17a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11l-2.08 4.16A1 1 0 0 1 9.43 22h-.29a1 1 0 0 1-.97-1.22L9 18.12Z"/></svg>
                                        </button>
                                        <button
                                            class="comment-yt__action comment-yt__action--reply"
                                            @click="toggleReplies(comment.id)"
                                            v-if="isLoggedIn || (comment.replies && comment.replies.length)"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                            <span v-if="comment.replies && comment.replies.length">
                                                {{ comment.replies.length }} {{ comment.replies.length === 1 ? 'reply' : 'replies' }}
                                            </span>
                                            <span v-else>Reply</span>
                                        </button>
                                    </div>

                                    <!-- Collapsible replies -->
                                    <div class="comment-yt__replies" v-if="expandedReplies[comment.id]">
                                        <div v-for="reply in (comment.replies || [])" :key="reply.id" class="comment-yt comment-yt--reply">
                                            <img class="comment-yt__avatar comment-yt__avatar--sm" :src="getCommentAuthorAvatar(reply.author)" :alt="reply.author" loading="lazy" />
                                            <div class="comment-yt__body">
                                                <div class="comment-yt__header">
                                                    <strong class="comment-yt__author">{{ reply.author }}</strong>
                                                    <span class="comment-yt__time">{{ formatRelativeDate(reply.createdAt) }}</span>
                                                </div>
                                                <p class="comment-yt__text">{{ reply.text }}</p>
                                                <div class="comment-yt__engagement">
                                                    <button class="comment-yt__action" @click="likeComment(reply.id)" title="Like">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.96 2.39l-1.34 7A2 2 0 0 1 18.49 21H7a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11l2.08-4.16A1 1 0 0 1 14.57 2h.29A1 1 0 0 1 15.83 3.22L15 5.88Z"/></svg>
                                                        <span v-if="reply.likes">{{ formatCompactNumber(reply.likes) }}</span>
                                                    </button>
                                                    <button class="comment-yt__action" :class="{ active: commentDislikes[reply.id] }" @click="dislikeComment(reply.id)" title="Dislike">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.96-2.39l1.34-7A2 2 0 0 1 5.51 3H17a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11l-2.08 4.16A1 1 0 0 1 9.43 22h-.29a1 1 0 0 1-.97-1.22L9 18.12Z"/></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Reply input -->
                                        <div class="comment-yt__reply-input" v-if="isLoggedIn">
                                            <img class="comment-yt__avatar comment-yt__avatar--sm" :src="currentUserAvatar" :alt="currentUserName" />
                                            <input
                                                v-model="replyDrafts[comment.id]"
                                                type="text"
                                                placeholder="Reply\u2026"
                                                @keydown.enter="submitReply(comment.id)"
                                            />
                                            <button
                                                class="btn-reply-submit"
                                                @click="submitReply(comment.id)"
                                                :disabled="!replyDrafts[comment.id] || !replyDrafts[comment.id].trim()"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>
                </section>

                <aside class="social-watch-sidebar">
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
                        :to="'/social/watch/' + entry.id"
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
