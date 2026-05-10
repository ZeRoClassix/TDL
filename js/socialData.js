import { loadSocialDataset } from './social/engine.js';
import {
    formatCompactNumber,
    formatFullDate,
    formatRelativeDate,
    generateAvatar,
    normalizeDate,
    slugify,
} from './social/helpers.js';
import { fetchYoutubeChannelUploads, fetchYoutubeVideoIdentities, fetchYoutubeVideoIdentity } from './social/youtube.js';

const STORAGE_KEYS = {
    comments: 'pcd_social_file_comments',
    reactions: 'pcd_social_reactions',
    pollVotes: 'pcd_social_poll_votes',
    commentActivity: 'pcd_social_comment_activity',
    communityPosts: 'pcd_social_community_posts',
};

let socialCache = null;

export async function getSocialDataset({ refresh = false } = {}) {
    if (!refresh && socialCache) return socialCache;
    socialCache = await loadSocialDataset();
    return socialCache;
}

export async function getSocialVideoById(id) {
    const dataset = await getSocialDataset();
    return dataset.videos.find((video) => video.id === id) || null;
}

export async function getSocialProfileBySlug(slug) {
    const dataset = await getSocialDataset();
    return dataset.profiles.find((profile) => profile.slug === slug) || null;
}

export async function ensureSocialProfileChannelVideos(slug, { forceRefresh = false } = {}) {
    const dataset = await getSocialDataset();
    const profile = dataset.profiles.find((entry) => entry.slug === slug);
    if (!profile) return null;

    const apiKey = String(dataset.settings?.youtubeApiKey || '').trim();
    if (!apiKey || !profile.youtubeChannelId || !profile.youtubeUploadsPlaylistId) {
        const recentYoutubeIds = (profile.uploads || [])
            .map((video) => video.youtubeId)
            .filter(Boolean)
            .slice(0, 3);

        for (const youtubeId of recentYoutubeIds) {
            const identity = await fetchYoutubeVideoIdentity({
                youtubeId,
                cacheHours: Number(dataset.settings?.youtubeCacheHours || 12) * 7,
            });
            if (identity?.channelId || identity?.handle) {
                socialCache = await loadSocialDataset();
                return socialCache.profiles.find((entry) => entry.slug === slug) || profile;
            }
        }

        return profile;
    }

    await fetchYoutubeChannelUploads({
        channelId: profile.youtubeChannelId,
        uploadsPlaylistId: profile.youtubeUploadsPlaylistId,
        apiKey,
        limit: Number(dataset.settings?.channelUploadLimit || 24),
        cacheHours: Number(dataset.settings?.channelUploadCacheHours || 6),
        forceRefresh,
    });

    socialCache = await loadSocialDataset();
    return socialCache.profiles.find((entry) => entry.slug === slug) || profile;
}

export async function ensureSocialVideoIdentities(videoIds, {
    forceRefresh = false,
    limit = 0,
} = {}) {
    const ids = [...new Set((Array.isArray(videoIds) ? videoIds : []).filter(Boolean))];
    const targetIds = limit > 0 ? ids.slice(0, limit) : ids;
    if (!targetIds.length) return getSocialDataset();

    await fetchYoutubeVideoIdentities({
        videoIds: targetIds,
        forceRefresh,
        cacheHours: 24 * 14,
        concurrency: 2,
    });

    socialCache = await loadSocialDataset();
    return socialCache;
}

export function getCommunityPostsForPlayer(playerSlug) {
    const profile = socialCache?.profiles.find((entry) => entry.slug === playerSlug);
    if (!profile) return [];

    const votes = readStorage(STORAGE_KEYS.pollVotes, {});
    return (profile.communityPosts || []).map((post) => {
        const postVotes = votes[post.id] || {};
        return {
            ...post,
            pollOptions: (post.pollOptions || []).map((option) => ({
                ...option,
                votes: Number(option.votes || 0) + Number(postVotes[option.id] || 0),
            })),
        };
    });
}

export function voteOnCommunityPoll(playerSlug, postId, optionId) {
    if (!socialCache?.profiles.find((entry) => entry.slug === playerSlug)) return;

    const votes = readStorage(STORAGE_KEYS.pollVotes, {});
    votes[postId] ??= {};
    votes[postId][optionId] = Number(votes[postId][optionId] || 0) + 1;
    writeStorage(STORAGE_KEYS.pollVotes, votes);
}

export function getVideoComments(videoId) {
    const baseVideo = socialCache?.videos.find((video) => video.id === videoId);
    const local = readStorage(STORAGE_KEYS.comments, {});
    const activity = readStorage(STORAGE_KEYS.commentActivity, {});
    const fileComments = mergeCommentActivity(
        cloneComments(baseVideo?.comments || []),
        activity[videoId] || {}
    );
    const localComments = cloneComments(local[videoId] || []);
    return [...fileComments, ...localComments]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addVideoComment(videoId, comment) {
    const local = readStorage(STORAGE_KEYS.comments, {});
    local[videoId] ??= [];
    local[videoId].push({
        id: `comment-${Date.now()}`,
        author: String(comment.author || 'Anonymous').trim() || 'Anonymous',
        text: String(comment.text || '').trim(),
        likes: 0,
        createdAt: new Date().toISOString(),
        replies: [],
    });
    writeStorage(STORAGE_KEYS.comments, local);
}

export function addVideoReply(videoId, commentId, reply) {
    const local = readStorage(STORAGE_KEYS.comments, {});
    local[videoId] ??= [];

    const comment = local[videoId].find((c) => c.id === commentId);
    if (comment) {
        comment.replies ??= [];
        comment.replies.push({
            id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            ...reply,
            likes: 0,
            createdAt: new Date().toISOString(),
        });
        writeStorage(STORAGE_KEYS.comments, local);
        return;
    }

    const activity = readStorage(STORAGE_KEYS.commentActivity, {});
    activity[videoId] ??= {};
    activity[videoId][commentId] ??= { likes: 0, replies: [] };
    activity[videoId][commentId].replies.push({
        id: `reply-local-${Date.now()}`,
        ...reply,
        likes: 0,
        createdAt: new Date().toISOString(),
    });
    writeStorage(STORAGE_KEYS.commentActivity, activity);
}

export function addCommunityPost(playerSlug, post) {
    const activity = readStorage(STORAGE_KEYS.communityPosts, {});
    activity[playerSlug] ??= [];
    activity[playerSlug].push({
        id: `post-${Date.now()}`,
        type: 'text',
        content: post.content || post,
        createdAt: new Date().toISOString(),
        ...post,
    });
    writeStorage(STORAGE_KEYS.communityPosts, activity);
}

export function toggleCommentLike(videoId, commentId) {
    const local = readStorage(STORAGE_KEYS.comments, {});
    const baseComments = cloneComments(local[videoId] || []);
    let updated = false;

    local[videoId] = baseComments.map((comment) => {
        if (comment.id === commentId) {
            updated = true;
            return { ...comment, likes: Number(comment.likes || 0) + 1 };
        }

        return {
            ...comment,
            replies: (comment.replies || []).map((reply) => {
                if (reply.id !== commentId) return reply;
                updated = true;
                return { ...reply, likes: Number(reply.likes || 0) + 1 };
            }),
        };
    });

    if (updated) {
        writeStorage(STORAGE_KEYS.comments, local);
        return;
    }

    const activity = readStorage(STORAGE_KEYS.commentActivity, {});
    activity[videoId] ??= {};
    activity[videoId][commentId] ??= { likes: 0, replies: [] };
    activity[videoId][commentId].likes = Number(activity[videoId][commentId].likes || 0) + 1;
    writeStorage(STORAGE_KEYS.commentActivity, activity);
}

export function getVideoReaction(videoId) {
    const stored = readStorage(STORAGE_KEYS.reactions, {});
    return stored[videoId] || null;
}

export function setVideoReaction(videoId, reaction) {
    const stored = readStorage(STORAGE_KEYS.reactions, {});
    stored[videoId] = reaction || null;
    writeStorage(STORAGE_KEYS.reactions, stored);
}

export {
    formatCompactNumber,
    formatFullDate,
    formatRelativeDate,
    normalizeDate,
    slugify,
};

const preloadedAvatarUrls = new Set();

export function preloadProfileAvatars() {
    if (!socialCache?.profiles) return;
    const urls = socialCache.profiles
        .map((p) => p.avatar)
        .filter((url) => url && !url.startsWith('data:') && !preloadedAvatarUrls.has(url))
        .slice(0, 30); // Prevent 403 rate limits from bulk loading hundreds of external images

    urls.forEach((url) => {
        preloadedAvatarUrls.add(url);
        const img = new Image();
        img.src = url;
    });
}

export function getCommentAuthorAvatar(authorName) {
    if (!authorName) return generateAvatar('Anonymous');
    const lookup = String(authorName).toLowerCase().trim();
    const match = socialCache?.profiles?.find(
        (p) => p.name.toLowerCase() === lookup || p.slug === lookup
    );
    return match?.avatar || generateAvatar(authorName);
}

function cloneComments(comments) {
    return (Array.isArray(comments) ? comments : []).map((comment) => ({
        ...comment,
        replies: Array.isArray(comment.replies)
            ? comment.replies.map((reply) => ({ ...reply }))
            : [],
    })).filter((comment) => comment.text || (comment.replies && comment.replies.length));
}

function mergeCommentActivity(comments, activityMap) {
    return comments.map((comment) => {
        const activity = activityMap[comment.id] || {};
        return {
            ...comment,
            likes: Number(comment.likes || 0) + Number(activity.likes || 0),
            replies: [
                ...(comment.replies || []).map((reply) => {
                    const replyActivity = activityMap[reply.id] || {};
                    return {
                        ...reply,
                        likes: Number(reply.likes || 0) + Number(replyActivity.likes || 0),
                    };
                }),
                ...cloneComments(activity.replies || []),
            ],
        };
    });
}

function readStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ignore storage limitations in static mode.
    }
}
