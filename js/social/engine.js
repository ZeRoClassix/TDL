import { fetchFutureDemons, fetchList } from '../content.js';
import {
    buildEmbedUrl,
    buildYoutubeAvatarFallbackUrl,
    buildYoutubeChannelProfileUrl,
    buildYoutubeThumbnail,
    buildYoutubeUrl,
    capitalize,
    clamp,
    countComments,
    DAY_MS,
    dedupeBy,
    deriveFpsCategory,
    difficultyFromRank,
    fetchIndexedFolder,
    fetchJson,
    formatCompactNumber,
    generateAvatar,
    getCachedProfileAvatar,
    getCachedVideoTitle,
    hasExactPercentValue,
    hasMeaningfulNumber,
    hasOwn,
    inferNumericPercent,
    inferProgressPercent,
    inferTypeFromText,
    isoDaysAgo,
    normalizeDate,
    normalizePlayerLookup,
    resolveYoutubeId,
    restoreNameFromSlug,
    seededRange,
    setCachedProfileAvatar,
    setCachedVideoTitle,
    slugify,
    slugifyPlayerName,
    sortByDateDesc,
    toNumberOrNull,
} from './helpers.js';
import {
    fetchYoutubeChannelDetails,
    fetchYoutubeVideoDetails,
    getCachedChannelUploadsMap,
    getCachedYoutubeVideoIdentityMap,
} from './youtube.js';

const DEFAULT_CONFIG = {
    youtubeApiKey: '',
    youtubeCacheHours: 12,
    channelUploadCacheHours: 6,
    channelUploadLimit: 24,
    includeDiscoveredListVideos: true,
    maxDiscoveredVideos: 0,
    includeCachedChannelUploads: true,
    featuredPlayerLimit: 8,
    preferFetchedTitles: true,
    preferFetchedProfilePictures: true,
    preferFetchedSubscriberCounts: true,
    includeFutureRecordVideos: true,
    simulationReferenceDate: '',
};

const SECTION_KEYS = [
    'mostPopular',
    'latest',
    'trending',
    'topVerifications',
    'topProgress',
    'activeNow',
    'upcomingProgress',
];

export async function loadSocialDataset() {
    const [
        configRaw,
        profileOverrideRaw,
        videoOverrideRaw,
        legacyProfilesRaw,
        legacyVideosRaw,
        list,
        futureDemons,
    ] = await Promise.all([
        fetchJson('social/config.json', DEFAULT_CONFIG),
        fetchJson('social/profile-overrides.json', { profiles: {}, customProfiles: [] }),
        fetchJson('social/video-overrides.json', { videos: {}, customVideos: [] }),
        fetchIndexedFolder('profiles', []),
        fetchIndexedFolder('videos', []),
        fetchList(),
        fetchFutureDemons(),
    ]);

    const config = {
        ...DEFAULT_CONFIG,
        ...(configRaw || {}),
    };

    const levelContext = buildLevelContext(list, futureDemons);
    const discoveredPlayers = levelContext.players;

    const profileOverrideState = normalizeProfileOverrideState(profileOverrideRaw, legacyProfilesRaw);
    const videoOverrideState = normalizeVideoOverrideState(videoOverrideRaw, legacyVideosRaw, levelContext);

    const discoveredVideos = config.includeDiscoveredListVideos
        ? buildDiscoveredListVideos({
            levelContext,
            maxDiscoveredVideos: config.maxDiscoveredVideos,
            includeFutureRecordVideos: config.includeFutureRecordVideos,
        })
        : [];

    let mergedBaseVideos = dedupeVideos([
        ...discoveredVideos,
        ...videoOverrideState.customVideos,
    ]);

    const videoIdentityMap = getCachedYoutubeVideoIdentityMap(
        mergedBaseVideos.map((video) => video.youtubeId).filter(Boolean),
    );

    const videoDetails = await fetchYoutubeVideoDetails({
        videoIds: mergedBaseVideos.map((video) => video.youtubeId).filter(Boolean),
        apiKey: String(config.youtubeApiKey || '').trim(),
        cacheHours: Number(config.youtubeCacheHours || 12),
    });

    const playerChannels = inferPlayerChannels({
        players: discoveredPlayers,
        videos: mergedBaseVideos,
        videoDetails,
        videoIdentityMap,
        manualProfiles: profileOverrideState.profileMap,
    });

    const channelIds = dedupeBy([
        ...[...profileOverrideState.profileMap.values()].map((profile) => profile.youtube.channelId).filter(Boolean),
        ...[...playerChannels.values()].map((entry) => entry.channelId).filter(Boolean),
    ], (value) => value);

    const channelDetails = await fetchYoutubeChannelDetails({
        channelIds,
        apiKey: String(config.youtubeApiKey || '').trim(),
        cacheHours: Math.max(12, Number(config.youtubeCacheHours || 12)),
    });

    const cachedChannelVideos = config.includeCachedChannelUploads
        ? buildCachedChannelVideos({
            playerChannels,
            channelDetails,
            levelContext,
            profileOverrides: profileOverrideState.profileMap,
        })
        : [];

    mergedBaseVideos = dedupeVideos([
        ...mergedBaseVideos,
        ...cachedChannelVideos,
    ]);

    const profileSeeds = buildProfileSeedMap({
        players: discoveredPlayers,
        videos: mergedBaseVideos,
        videoDetails,
        videoIdentityMap,
        manualProfiles: profileOverrideState.profileMap,
        playerChannels,
        channelDetails,
        config,
    });

    const finalizedVideos = applyDerivedCategories(
        mergedBaseVideos.map((video) => finalizeVideo({
            video,
            videoDetails,
            videoIdentityMap,
            videoOverrides: videoOverrideState,
            profileSeeds,
            channelDetails,
            playerChannels,
            levelContext,
            config,
        }))
    ).filter(video => {
        const titleLower = String(video.title || '').toLowerCase();
        // Remove livestreams and VODs based on the fetched YouTube title
        if (titleLower.includes('🔴')) return false;
        if (/\b(stream|vod|live)\b/i.test(titleLower)) return false;
        return true;
    });

    const profiles = buildProfiles({
        players: discoveredPlayers,
        videos: finalizedVideos,
        profileOverrides: profileOverrideState.profileMap,
        channelDetails,
        playerChannels,
        videoIdentityMap,
        config,
    });

    return {
        videos: sortByDateDesc(finalizedVideos),
        profiles: profiles.sort((a, b) => Number(b.followers || 0) - Number(a.followers || 0)),
        filters: {
            difficulties: ['all', 'Top 10', 'Main List', 'Extended List', 'Legacy'],
            fpsCategories: ['all', '60', '120', '240'],
            types: ['all', 'progress', 'completion', 'verification'],
            sortOptions: ['relevance', 'most-viewed', 'newest', 'hardest-levels'],
        },
        settings: config,
        adminResources: [
            { label: 'Social Config', path: '/social/config.json', description: 'Controls API key usage, cache windows, upload limits, and discovery behavior.' },
            { label: 'Profile Overrides', path: '/social/profile-overrides.json', description: 'Override player names, bios, verified state, socials, channel IDs, community posts, and manual-only profiles.' },
            { label: 'Video Overrides', path: '/social/video-overrides.json', description: 'Override video stats, categories, comments, and add custom videos without per-video files.' },
            { label: 'Legacy Profile Files', path: '/profiles/*.json', description: 'Still supported for compatibility, but no longer required for automatic discovery.' },
            { label: 'Legacy Video Files', path: '/videos/*.json', description: 'Still supported for compatibility, but the new manifest-based override files are recommended.' },
        ],
    };
}

function buildLevelContext(list, futureDemons = []) {
    const levels = [];
    const players = new Map();

    (Array.isArray(list) ? list : []).forEach(([level, err], index) => {
        if (!level || err) return;

        const rank = index + 1;
        const levelEntry = {
            id: level.id,
            path: level.path,
            rank,
            name: level.name,
            author: level.author,
            difficulty: difficultyFromRank(rank),
            verification: level.verification,
            verifier: level.verifier,
            records: Array.isArray(level.records) ? level.records : [],
        };
        levels.push(levelEntry);

        registerPlayer(players, level.verifier, { role: 'verifier' });
        levelEntry.records.forEach((record) => {
            registerPlayer(players, record.user, {
                role: inferNumericPercent(record.percent) >= 100 ? 'completion' : 'progress',
                hasVideo: Boolean(resolveYoutubeId(record.link || record.video)),
            });
        });
    });

    (Array.isArray(futureDemons) ? futureDemons : []).forEach((demon, index) => {
        if (!demon) return;

        const estimatedRank = Number(demon.estimatedPlace || 200 + index + 1);
        const records = Array.isArray(demon.records) ? demon.records : [];
        const verificationUrl = typeof demon.verification === 'string'
            ? demon.verification
            : (demon.verification?.video || '');

        const levelEntry = {
            id: demon.id || `future-${index + 1}`,
            path: demon.path || `future-${slugify(demon.name) || index + 1}`,
            rank: estimatedRank,
            name: demon.name,
            author: demon.author || (Array.isArray(demon.creators) ? demon.creators.join(', ') : ''),
            difficulty: difficultyFromRank(estimatedRank),
            verification: verificationUrl,
            verifier: String(demon.verification?.username || demon.verifier || '').trim(),
            records,
            scope: 'future',
            verificationStatus: String(demon.verificationStatus || '').trim(),
            status: String(demon.status || '').trim(),
        };
        levels.push(levelEntry);

        if (levelEntry.verifier && resolveYoutubeId(levelEntry.verification)) {
            registerPlayer(players, levelEntry.verifier, {
                role: 'verifier',
                hasVideo: true,
            });
        }

        levelEntry.records.forEach((record) => {
            registerPlayer(players, record.user, {
                role: inferNumericPercent(record.percent) >= 100 ? 'completion' : 'progress',
                hasVideo: Boolean(resolveYoutubeId(record.link || record.video)),
            });
        });
    });

    return {
        levels,
        levelNameIndex: levels.slice().sort((a, b) => b.name.length - a.name.length),
        players,
    };
}

function registerPlayer(map, name, { role = 'progress', hasVideo = false } = {}) {
    const displayName = String(name || '').trim();
    const slug = slugifyPlayerName(displayName);
    if (!slug) return;

    const entry = map.get(slug) || {
        slug,
        primaryName: displayName,
        aliases: new Set(),
        roleCounts: { verifier: 0, completion: 0, progress: 0 },
        hasAnyVideo: false,
    };

    entry.aliases.add(displayName);
    entry.roleCounts[role] = Number(entry.roleCounts[role] || 0) + 1;
    entry.hasAnyVideo = entry.hasAnyVideo || Boolean(hasVideo);

    if (!entry.primaryName || displayName.length < entry.primaryName.length) {
        entry.primaryName = displayName;
    }

    map.set(slug, entry);
}

function normalizeProfileOverrideState(rawOverrides, legacyProfilesRaw) {
    const profileMap = new Map();

    Object.entries(rawOverrides?.profiles || {}).forEach(([slugKey, profile], index) => {
        const normalized = normalizeProfile({ ...profile, slug: profile.slug || slugKey }, index);
        if (normalized) profileMap.set(normalized.slug, normalized);
    });

    (Array.isArray(rawOverrides?.customProfiles) ? rawOverrides.customProfiles : []).forEach((profile, index) => {
        const normalized = normalizeProfile(profile, index + profileMap.size + 1000);
        if (normalized) profileMap.set(normalized.slug, mergeProfiles(profileMap.get(normalized.slug), normalized));
    });

    (Array.isArray(legacyProfilesRaw) ? legacyProfilesRaw : []).forEach((profile, index) => {
        const normalized = normalizeProfile(profile, index + 5000);
        if (normalized) profileMap.set(normalized.slug, mergeProfiles(normalized, profileMap.get(normalized.slug)));
    });

    return { profileMap };
}

function normalizeVideoOverrideState(rawOverrides, legacyVideosRaw, levelContext) {
    const byYoutubeId = new Map();
    const byId = new Map();
    const customVideos = [];

    Object.entries(rawOverrides?.videos || {}).forEach(([key, override], index) => {
        const normalized = normalizeVideoOverride({ ...override, __key: key }, index);
        if (!normalized) return;
        if (normalized.youtubeId) byYoutubeId.set(normalized.youtubeId, normalized);
        if (normalized.id) byId.set(normalized.id, normalized);
    });

    (Array.isArray(rawOverrides?.customVideos) ? rawOverrides.customVideos : []).forEach((video, index) => {
        const normalized = normalizeVideo(video, index + 1000, 'custom-override', levelContext);
        if (normalized) customVideos.push(normalized);
    });

    (Array.isArray(legacyVideosRaw) ? legacyVideosRaw : []).forEach((video, index) => {
        const normalized = normalizeVideo(video, index + 5000, 'legacy-file', levelContext);
        if (normalized) customVideos.push(normalized);
    });

    return {
        byYoutubeId,
        byId,
        customVideos,
    };
}

function normalizeProfile(profile, index) {
    const slug = profile.slug
        ? slugify(profile.slug)
        : slugifyPlayerName(profile.name || profile.__manifestPath || `profile-${index + 1}`);
    if (!slug) return null;

    const socials = profile.socials || {};
    return {
        slug,
        name: String(profile.name || '').trim(),
        verified: hasOwn(profile, 'verified') ? Boolean(profile.verified) : null,
        bio: String(profile.bio || '').trim(),
        avatar: String(profile.avatar || '').trim(),
        subscribers: toNumberOrNull(profile.subscribers),
        bannerLabel: String(profile.bannerLabel || '').trim(),
        videos: Array.isArray(profile.videos) ? profile.videos.map((entry) => String(entry)) : [],
        featuredVideos: Array.isArray(profile.featuredVideos) ? profile.featuredVideos.map((entry) => String(entry)) : [],
        communityPosts: normalizeCommunityPosts(profile.communityPosts),
        socials: {
            youtube: String(socials.youtube || profile.youtubeUrl || '').trim(),
            twitch: String(socials.twitch || profile.twitch || '').trim(),
            discord: String(socials.discord || profile.discord || '').trim(),
            twitter: String(socials.twitter || profile.twitter || profile.x || '').trim(),
        },
        youtube: {
            channelId: String(profile.youtube?.channelId || '').trim(),
            handle: String(profile.youtube?.handle || '').trim(),
            autoFetch: profile.youtube?.autoFetch !== false,
        },
    };
}

function mergeProfiles(base, override) {
    if (!base) return override;
    if (!override) return base;

    return {
        ...base,
        ...override,
        socials: {
            ...(base.socials || {}),
            ...(override.socials || {}),
        },
        youtube: {
            ...(base.youtube || {}),
            ...(override.youtube || {}),
        },
        videos: override.videos?.length ? override.videos : (base.videos || []),
        featuredVideos: override.featuredVideos?.length ? override.featuredVideos : (base.featuredVideos || []),
        communityPosts: override.communityPosts?.length ? override.communityPosts : (base.communityPosts || []),
        verified: override.verified ?? base.verified,
        subscribers: hasMeaningfulNumber(override.subscribers) ? override.subscribers : base.subscribers,
        bio: override.bio || base.bio,
        avatar: override.avatar || base.avatar,
        bannerLabel: override.bannerLabel || base.bannerLabel,
        name: override.name || base.name,
    };
}

function normalizeCommunityPosts(posts) {
    return (Array.isArray(posts) ? posts : []).map((post, index) => ({
        id: String(post.id || `community-${index + 1}`),
        type: ['poll', 'update'].includes(String(post.type || '').toLowerCase()) ? String(post.type).toLowerCase() : 'text',
        content: String(post.content || '').trim(),
        createdAt: normalizeDate(post.createdAt, isoDaysAgo(index * 4)),
        pollOptions: Array.isArray(post.pollOptions)
            ? post.pollOptions.map((option, optionIndex) => ({
                id: String(option.id || `${post.id || index}-option-${optionIndex + 1}`),
                label: String(option.label || option || '').trim(),
                votes: Number(option.votes || 0),
            })).filter((option) => option.label)
            : [],
    })).filter((post) => post.content);
}

function normalizeVideoOverride(override, index) {
    const youtubeId = resolveYoutubeId(override.youtubeId || override.url || override.__key);
    const id = normalizeStringOverride(override.id);
    if (!youtubeId && !id) return null;

    return pruneUndefined({
        id,
        youtubeId,
        title: hasOwn(override, 'title') ? normalizeStringOverride(override.title) : undefined,
        playerName: hasOwn(override, 'playerName') ? normalizeStringOverride(override.playerName) : undefined,
        playerSlug: hasOwn(override, 'playerSlug') ? normalizeStringOverride(override.playerSlug) : undefined,
        levelName: hasOwn(override, 'levelName') ? normalizeStringOverride(override.levelName) : undefined,
        levelAuthor: hasOwn(override, 'levelAuthor') ? normalizeStringOverride(override.levelAuthor) : undefined,
        levelRank: hasOwn(override, 'levelRank') ? Number(override.levelRank || 999) : undefined,
        type: hasOwn(override, 'type') ? normalizeType(override.type) : undefined,
        url: hasOwn(override, 'url') ? normalizeStringOverride(override.url) : undefined,
        thumbnail: hasOwn(override, 'thumbnail') ? normalizeStringOverride(override.thumbnail) : undefined,
        uploadDate: hasOwn(override, 'uploadDate') ? normalizeDate(override.uploadDate, isoDaysAgo(index + 2)) : undefined,
        hz: hasOwn(override, 'hz') ? Number(override.hz || 0) : undefined,
        fpsCategory: hasOwn(override, 'fpsCategory') ? normalizeStringOverride(override.fpsCategory) : undefined,
        difficulty: hasOwn(override, 'difficulty') ? normalizeStringOverride(override.difficulty) : undefined,
        progressPercent: hasOwn(override, 'progressPercent') ? Number(override.progressPercent || 0) : undefined,
        featured: hasOwn(override, 'featured') ? Boolean(override.featured) : undefined,
        statMode: hasOwn(override, 'statMode') ? normalizeStatMode(override.statMode) : undefined,
        views: hasOwn(override, 'views') ? toNumberOrNull(override.views) : undefined,
        likes: hasOwn(override, 'likes') ? toNumberOrNull(override.likes) : undefined,
        dislikes: hasOwn(override, 'dislikes') ? toNumberOrNull(override.dislikes) : undefined,
        commentsCount: hasOwn(override, 'commentsCount') ? toNumberOrNull(override.commentsCount) : undefined,
        categoryFlags: hasOwn(override, 'categoryFlags') ? normalizeCategoryFlags(override.categoryFlags) : undefined,
        comments: hasOwn(override, 'comments') ? normalizeComments(override.comments, normalizeDate(override.uploadDate, isoDaysAgo(index + 2))) : undefined,
        simulation: hasOwn(override, 'simulation')
            ? {
                seed: String(override.simulation?.seed || youtubeId || id || `override-${index + 1}`),
                baseViews: toNumberOrNull(override.simulation?.baseViews),
                dailyGrowth: toNumberOrNull(override.simulation?.dailyGrowth),
                stagnationChance: toNumberOrNull(override.simulation?.stagnationChance),
                engagementBias: toNumberOrNull(override.simulation?.engagementBias),
            }
            : undefined,
    });
}

function normalizeComments(comments, fallbackDate) {
    return (Array.isArray(comments) ? comments : []).map((comment, index) => ({
        id: String(comment.id || `comment-${index + 1}`),
        author: String(comment.author || comment.username || 'Anonymous').trim() || 'Anonymous',
        text: String(comment.text || '').trim(),
        likes: Number(comment.likes || 0),
        createdAt: normalizeDate(comment.createdAt, fallbackDate),
        replies: (Array.isArray(comment.replies) ? comment.replies : []).map((reply, replyIndex) => ({
            id: String(reply.id || `reply-${index + 1}-${replyIndex + 1}`),
            author: String(reply.author || reply.username || 'Anonymous').trim() || 'Anonymous',
            text: String(reply.text || '').trim(),
            likes: Number(reply.likes || 0),
            createdAt: normalizeDate(reply.createdAt, fallbackDate),
        })).filter((reply) => reply.text),
    })).filter((comment) => comment.text);
}

function buildDiscoveredListVideos({ levelContext, maxDiscoveredVideos, includeFutureRecordVideos = true }) {
    const discovered = [];
    const limit = Number(maxDiscoveredVideos || 0);

    for (const level of levelContext.levels) {
        if (level.scope === 'future' && !includeFutureRecordVideos) continue;
        if (limit > 0 && discovered.length >= limit) break;
        let completionOrdinal = 0;

        const verificationId = resolveYoutubeId(level.verification);
        if (verificationId) {
            discovered.push(createDiscoveredVideo({
                level,
                type: 'verification',
                playerName: level.verifier,
                url: level.verification,
                percent: 100,
                hz: 240,
                order: discovered.length,
                source: level.scope === 'future' ? 'future-demon-verification' : 'demonlist-discovered',
                uploadDate: level.scope === 'future' ? normalizeDate('', isoDaysAgo(Math.max(2, level.rank))) : null,
                categoryFlags: level.scope === 'future' ? { activeNow: true } : {},
                featured: level.scope === 'future' ? level.rank <= 10 : level.rank <= 25,
            }));
        }

        for (const record of level.records) {
            if (limit > 0 && discovered.length >= limit) break;
            const url = record.link || record.video || '';

            // Skip livestreams and VODs
            if (url.includes('twitch.tv') || url.includes('/live/') || url.includes('/live?')) continue;

            const youtubeId = resolveYoutubeId(url);
            if (!youtubeId) continue;

            const percent = inferNumericPercent(record.percent);
            const exactPercent = hasExactPercentValue(record.percent);
            if (percent >= 100) completionOrdinal += 1;
            discovered.push(createDiscoveredVideo({
                level,
                type: percent >= 100 ? 'completion' : 'progress',
                playerName: record.user,
                url,
                percent,
                rawPercent: record.percent,
                hasExactProgressPercent: exactPercent,
                hz: record.hz,
                order: discovered.length,
                source: level.scope === 'future' ? 'future-demon-record' : 'demonlist-discovered',
                uploadDate: record.date || null,
                categoryFlags: level.scope === 'future'
                    ? { activeNow: true, upcomingProgress: percent < 100 }
                    : {},
                featured: level.scope === 'future' ? percent >= 80 : false,
                completionOrdinal: percent >= 100 ? completionOrdinal : null,
            }));
        }
    }

    return discovered;
}

function createDiscoveredVideo({
    level,
    type,
    playerName,
    url,
    percent,
    rawPercent = null,
    hasExactProgressPercent = true,
    hz,
    order,
    source = 'demonlist-discovered',
    uploadDate = null,
    categoryFlags = {},
    featured = false,
    completionOrdinal = null,
}) {
    const youtubeId = resolveYoutubeId(url);
    const playerSlug = slugifyPlayerName(playerName);
    const uploadOffset = Math.round((level.rank * 1.75) + (order % 21));

    return {
        id: `seed-${youtubeId || `${level.path}-${playerSlug}-${order}`}`,
        source,
        title: '',
        playerName: String(playerName || '').trim(),
        playerSlug,
        levelName: level.name,
        levelAuthor: level.author,
        levelRank: level.rank,
        type,
        youtubeId,
        url: String(url || '').trim(),
        thumbnail: '',
        badge: capitalize(type),
        uploadDate: normalizeDate(uploadDate, isoDaysAgo(uploadOffset)),
        hz: Number(hz || 240),
        fpsCategory: deriveFpsCategory(hz),
        difficulty: level.difficulty,
        progressPercent: Number(percent || 0),
        rawProgressPercent: rawPercent ?? percent,
        hasExactProgressPercent: Boolean(hasExactProgressPercent),
        completionOrdinal: hasMeaningfulNumber(completionOrdinal) ? Number(completionOrdinal) : null,
        isUpcomingRecord: level.scope === 'future',
        featured,
        statMode: 'hybrid',
        views: null,
        likes: null,
        dislikes: null,
        commentsCount: null,
        categoryFlags: normalizeCategoryFlags(categoryFlags),
        simulation: {
            seed: `${level.path}-${type}-${playerSlug}-${youtubeId || order}`,
            baseViews: null,
            dailyGrowth: null,
            stagnationChance: null,
            engagementBias: null,
        },
        comments: [],
    };
}

function normalizeVideo(video, index, source, levelContext) {
    const youtubeId = resolveYoutubeId(video.youtubeId || video.url);
    const id = String(video.id || video.__manifestPath || `${source}-${index + 1}`).trim() || `video-${index + 1}`;
    const playerName = String(video.player || video.playerName || '').trim();
    const playerSlug = video.playerSlug ? slugify(video.playerSlug) : slugifyPlayerName(playerName);
    if (!playerSlug) return null;

    const inferredLevel = inferLevelMetadata(video.title || video.levelName || '', levelContext);
    const type = normalizeType(video.type || inferTypeFromText(video.title || '', 'progress'));
    const fallbackUploadDate = isoDaysAgo(index + 2);

    return {
        id,
        source,
        title: String(video.title || '').trim(),
        playerName,
        playerSlug,
        levelName: String(video.levelName || inferredLevel?.name || '').trim(),
        levelAuthor: String(video.levelAuthor || inferredLevel?.author || '').trim(),
        levelRank: Number(video.levelRank || inferredLevel?.rank || 999),
        type,
        youtubeId,
        url: String(video.url || buildYoutubeUrl(youtubeId)).trim(),
        thumbnail: String(video.thumbnail || '').trim(),
        badge: capitalize(type),
        uploadDate: normalizeDate(video.uploadDate, fallbackUploadDate),
        hz: Number(video.hz || 0),
        fpsCategory: String(video.fpsCategory || deriveFpsCategory(video.hz || 0)),
        difficulty: String(video.difficulty || inferredLevel?.difficulty || difficultyFromRank(video.levelRank)).trim(),
        progressPercent: hasMeaningfulNumber(video.progressPercent) ? Number(video.progressPercent) : (type === 'progress' ? inferProgressPercent(video) : 100),
        rawProgressPercent: video.rawProgressPercent ?? video.progressPercent ?? null,
        hasExactProgressPercent: hasOwn(video, 'hasExactProgressPercent')
            ? Boolean(video.hasExactProgressPercent)
            : hasExactPercentValue(video.progressPercent),
        completionOrdinal: hasMeaningfulNumber(video.completionOrdinal) ? Number(video.completionOrdinal) : null,
        isUpcomingRecord: Boolean(video.isUpcomingRecord),
        featured: Boolean(video.featured),
        statMode: normalizeStatMode(video.statMode),
        views: toNumberOrNull(video.views),
        likes: toNumberOrNull(video.likes),
        dislikes: toNumberOrNull(video.dislikes),
        commentsCount: toNumberOrNull(video.commentsCount),
        categoryFlags: normalizeCategoryFlags(video.categoryFlags),
        simulation: {
            seed: String(video.simulation?.seed || id),
            baseViews: toNumberOrNull(video.simulation?.baseViews),
            dailyGrowth: toNumberOrNull(video.simulation?.dailyGrowth),
            stagnationChance: toNumberOrNull(video.simulation?.stagnationChance),
            engagementBias: toNumberOrNull(video.simulation?.engagementBias),
        },
        comments: normalizeComments(video.comments, normalizeDate(video.uploadDate, fallbackUploadDate)),
    };
}

function normalizeType(type) {
    const value = String(type || '').toLowerCase();
    if (value === 'verification' || value === 'completion') return value;
    return 'progress';
}

function normalizeStatMode(mode) {
    const value = String(mode || '').toLowerCase();
    if (value === 'manual' || value === 'auto') return value;
    return 'hybrid';
}

function normalizeCategoryFlags(flags) {
    const value = flags || {};
    return SECTION_KEYS.reduce((acc, key) => {
        if (hasOwn(value, key)) acc[key] = Boolean(value[key]);
        return acc;
    }, {});
}

function inferLevelMetadata(text, levelContext) {
    const lookup = String(text || '').toLowerCase();
    return levelContext.levelNameIndex.find((level) => lookup.includes(level.name.toLowerCase())) || null;
}

function inferPlayerChannels({ players, videos, videoDetails, videoIdentityMap, manualProfiles }) {
    const result = new Map();
    const candidates = new Map();

    manualProfiles.forEach((profile, slug) => {
        if (!profile.youtube.channelId && !profile.youtube.handle) return;
        result.set(slug, {
            channelId: profile.youtube.channelId,
            channelHandle: profile.youtube.handle || '',
            source: 'manual',
            confidence: 1,
        });
    });

    videos.forEach((video) => {
        const detail = video.youtubeId ? videoDetails.get(video.youtubeId) : null;
        const identity = video.youtubeId ? videoIdentityMap.get(video.youtubeId) : null;
        const channelId = detail?.channelId || identity?.channelId || '';
        const channelHandle = identity?.handle || '';
        const channelTitle = detail?.channelTitle || identity?.authorName || '';
        if (!channelId && !channelHandle) return;

        const key = `${video.playerSlug}::${channelId || `handle:${channelHandle}`}`;
        const playerLookup = normalizePlayerLookup(video.playerName || players.get(video.playerSlug)?.primaryName || video.playerSlug);
        const channelLookup = normalizePlayerLookup(channelTitle);
        const nameBoost = playerLookup && channelLookup && (channelLookup.includes(playerLookup) || playerLookup.includes(channelLookup)) ? 7 : 0;
        const score = 3 + nameBoost + (video.type === 'verification' ? 1 : 0);
        const current = candidates.get(key) || {
            playerSlug: video.playerSlug,
            channelId,
            channelHandle,
            channelTitle,
            score: 0,
            matches: 0,
        };
        current.score += score;
        current.matches += 1;
        candidates.set(key, current);
    });

    players.forEach((_, slug) => {
        if (result.has(slug)) return;
        const top = [...candidates.values()]
            .filter((entry) => entry.playerSlug === slug)
            .sort((a, b) => b.score - a.score || b.matches - a.matches)[0];
        if (!top) return;
        result.set(slug, {
            channelId: top.channelId,
            channelHandle: top.channelHandle || '',
            source: 'inferred',
            confidence: top.score,
        });
    });

    return result;
}

function buildCachedChannelVideos({ playerChannels, channelDetails, levelContext, profileOverrides }) {
    const cachedMap = getCachedChannelUploadsMap([...playerChannels.values()].map((entry) => entry.channelId).filter(Boolean));
    const videos = [];

    [...playerChannels.entries()].forEach(([playerSlug, channelRef], profileIndex) => {
        const manualProfile = profileOverrides.get(playerSlug);
        if (manualProfile?.youtube?.autoFetch === false) return;

        const playerName = manualProfile?.name || restoreNameFromSlug(playerSlug);
        const channel = channelDetails.get(channelRef.channelId) || {};
        const uploads = cachedMap.get(channelRef.channelId) || [];
        uploads.forEach((item, videoIndex) => {
            const inferredLevel = inferLevelMetadata(item.title, levelContext);
            const type = inferTypeFromText(item.title, inferredLevel ? 'progress' : 'progress');
            videos.push({
                id: `channel-${item.youtubeId}`,
                source: 'youtube-channel-cache',
                title: item.title,
                playerName,
                playerSlug,
                levelName: inferredLevel?.name || '',
                levelAuthor: inferredLevel?.author || '',
                levelRank: inferredLevel?.rank || 999,
                type,
                youtubeId: item.youtubeId,
                url: buildYoutubeUrl(item.youtubeId),
                thumbnail: item.thumbnail,
                badge: capitalize(type),
                uploadDate: normalizeDate(item.uploadDate, isoDaysAgo(profileIndex + videoIndex + 3)),
                hz: 240,
                fpsCategory: '240',
                difficulty: inferredLevel?.difficulty || 'Legacy',
                progressPercent: type === 'progress' ? inferProgressPercent({ title: item.title, type }) : 100,
                rawProgressPercent: null,
                hasExactProgressPercent: type !== 'progress' || hasExactPercentValue(inferProgressPercent({ title: item.title, type })),
                completionOrdinal: null,
                isUpcomingRecord: false,
                featured: false,
                statMode: 'hybrid',
                views: Number(item.views || 0),
                likes: Number(item.likes || 0),
                dislikes: null,
                commentsCount: Number(item.commentsCount || 0),
                categoryFlags: {},
                simulation: {
                    seed: `${playerSlug}-${item.youtubeId}`,
                    baseViews: null,
                    dailyGrowth: null,
                    stagnationChance: null,
                    engagementBias: null,
                },
                comments: [],
                youtubeChannelId: item.channelId || channelRef.channelId || channel.id || '',
            });
        });
    });

    return videos;
}

function buildProfileSeedMap({ players, videos, videoDetails, videoIdentityMap, manualProfiles, playerChannels, channelDetails, config }) {
    const grouped = groupVideosBySlug(videos);
    const seeds = new Map();

    const slugs = new Set([
        ...players.keys(),
        ...manualProfiles.keys(),
        ...grouped.keys(),
    ]);

    slugs.forEach((slug) => {
        const manual = manualProfiles.get(slug) || {};
        const discovered = players.get(slug);
        const uploads = grouped.get(slug) || [];
        const association = playerChannels.get(slug);
        const channel = channelDetails.get(manual.youtube?.channelId || association?.channelId) || {};
        const identity = uploads
            .map((video) => video.youtubeId ? videoIdentityMap.get(video.youtubeId) : null)
            .find(Boolean) || null;
        const knownViews = uploads.reduce((sum, video) => {
            const detail = video.youtubeId ? videoDetails.get(video.youtubeId) : null;
            return sum + Number(detail?.views || video.views || 0);
        }, 0);
        const displayName = manual.name || discovered?.primaryName || channel.name || uploads[0]?.playerName || restoreNameFromSlug(slug);
        const followers = resolveSubscriberSignal({
            manual,
            channel,
            knownViews,
            uploadCount: uploads.length,
            config,
        });
        const youtubeChannelId = manual.youtube?.channelId || association?.channelId || identity?.channelId || '';
        const youtubeHandle = manual.youtube?.handle || association?.channelHandle || identity?.handle || channel.customUrl || '';

        const cachedAvatar = getCachedProfileAvatar(slug);
        const resolvedAvatar = manual.avatar
            || (config.preferFetchedProfilePictures && manual.youtube?.autoFetch !== false ? channel.avatar : '')
            || buildYoutubeAvatarFallbackUrl(youtubeChannelId, youtubeHandle, identity?.authorUrl, manual.socials?.youtube);

        const avatar = resolvedAvatar || cachedAvatar || generateAvatar(displayName);
        if (resolvedAvatar && resolvedAvatar !== cachedAvatar) {
            setCachedProfileAvatar(slug, resolvedAvatar);
        }

        seeds.set(slug, {
            slug,
            name: displayName,
            followers,
            channelId: youtubeChannelId,
            channelHandle: youtubeHandle,
            uploadsPlaylistId: channel.uploadsPlaylistId || '',
            avatar,
            bio: manual.bio || channel.description || '',
        });
    });

    return seeds;
}

function resolveSubscriberSignal({ manual, channel, knownViews, uploadCount, config }) {
    if (hasMeaningfulNumber(manual.subscribers)) return Number(manual.subscribers);
    if (config.preferFetchedSubscriberCounts && manual.youtube?.autoFetch !== false && hasMeaningfulNumber(channel.subscribers)) {
        return Number(channel.subscribers);
    }
    if (knownViews > 0) return Math.min(220000, Math.max(1500, Math.round(knownViews / 95)));
    return Math.max(1200, Number(uploadCount || 0) * 1600);
}

function finalizeVideo({ video, videoDetails, videoIdentityMap, videoOverrides, profileSeeds, levelContext, config }) {
    const override = composeVideoOverride(video, videoOverrides);
    const merged = applyVideoOverride(video, override);
    const detail = merged.youtubeId ? (videoDetails.get(merged.youtubeId) || {}) : {};
    const identity = merged.youtubeId ? (videoIdentityMap.get(merged.youtubeId) || {}) : {};
    const inferredLevel = (!merged.levelName || Number(merged.levelRank || 999) === 999)
        ? inferLevelMetadata(merged.title || detail.title || identity.title || '', levelContext)
        : null;
    const profile = profileSeeds.get(merged.playerSlug);
    const progressPercent = hasMeaningfulNumber(merged.progressPercent)
        ? Number(merged.progressPercent)
        : (merged.type === 'progress' ? inferProgressPercent(merged) : 100);
    const derivedTitle = buildDefaultTitle({
        type: merged.type,
        levelName: merged.levelName || inferredLevel?.name,
        progressPercent,
        hasExactProgressPercent: merged.hasExactProgressPercent,
    });
    const cachedTitle = merged.youtubeId ? getCachedVideoTitle(merged.youtubeId) : '';
    const title = hasOwn(override, 'title')
        ? merged.title
        : (
            config.preferFetchedTitles && (detail.title || identity.title)
                ? (detail.title || identity.title)
                : (merged.title || cachedTitle || detail.title || identity.title || derivedTitle)
        );
    if (merged.youtubeId && title && title !== derivedTitle) {
        setCachedVideoTitle(merged.youtubeId, title);
    }
    const levelName = merged.levelName || inferredLevel?.name || '';
    const levelRank = Number(merged.levelRank || inferredLevel?.rank || 999);
    const difficulty = merged.difficulty || inferredLevel?.difficulty || difficultyFromRank(levelRank);
    const fpsCategory = merged.fpsCategory || deriveFpsCategory(merged.hz);
    const thumbnail = merged.thumbnail || detail.thumbnail || buildYoutubeThumbnail(merged.youtubeId, levelName || 'PCD Social');
    const uploadDate = normalizeDate(detail.uploadDate || merged.uploadDate, detail.uploadDate || isoDaysAgo(levelRank));
    const stats = deriveVideoStats({
        video: {
            ...merged,
            levelRank,
            uploadDate,
            progressPercent,
        },
        subscriberSignal: Number(profile?.followers || 0),
        fetchedStats: detail,
        now: config.simulationReferenceDate ? new Date(config.simulationReferenceDate) : new Date(),
    });
    const isFramePerfect = fpsCategory === '240' && (merged.type === 'verification' || progressPercent >= 97 || levelRank <= 10);
    const playerName = merged.playerName || profile?.name || detail.channelTitle || identity.authorName || restoreNameFromSlug(merged.playerSlug);

    return {
        ...merged,
        title,
        playerName,
        levelName,
        levelAuthor: merged.levelAuthor || inferredLevel?.author || '',
        levelRank,
        difficulty,
        fpsCategory,
        progressPercent,
        thumbnail,
        uploadDate,
        views: stats.views,
        likes: stats.likes,
        dislikes: stats.dislikes,
        commentsCount: stats.commentsCount,
        engagementRate: stats.engagementRate,
        dailyViewRate: stats.dailyViewRate,
        isFramePerfect,
        embedUrl: buildEmbedUrl(merged.youtubeId),
        url: merged.url || buildYoutubeUrl(merged.youtubeId),
        youtubeChannelId: detail.channelId || merged.youtubeChannelId || profile?.channelId || '',
        badge: capitalize(merged.type),
    };
}

function composeVideoOverride(video, overrideState) {
    const byYoutube = video.youtubeId ? overrideState.byYoutubeId.get(video.youtubeId) : null;
    const byId = overrideState.byId.get(video.id);
    if (!byYoutube) return byId || null;
    if (!byId) return byYoutube;
    return {
        ...byYoutube,
        ...byId,
        categoryFlags: {
            ...(byYoutube.categoryFlags || {}),
            ...(byId.categoryFlags || {}),
        },
        simulation: {
            ...(byYoutube.simulation || {}),
            ...(byId.simulation || {}),
        },
        comments: byId.comments !== undefined ? byId.comments : byYoutube.comments,
    };
}

function applyVideoOverride(video, override) {
    if (!override) return video;

    const next = {
        ...video,
        categoryFlags: {
            ...(video.categoryFlags || {}),
            ...(override.categoryFlags || {}),
        },
        simulation: {
            ...(video.simulation || {}),
            ...(override.simulation || {}),
        },
    };

    const fields = [
        'id',
        'title',
        'playerName',
        'playerSlug',
        'levelName',
        'levelAuthor',
        'levelRank',
        'type',
        'youtubeId',
        'url',
        'thumbnail',
        'uploadDate',
        'hz',
        'fpsCategory',
        'difficulty',
        'progressPercent',
        'featured',
        'statMode',
        'views',
        'likes',
        'dislikes',
        'commentsCount',
    ];

    fields.forEach((field) => {
        if (hasOwn(override, field) && override[field] !== undefined) next[field] = override[field];
    });

    if (hasOwn(override, 'comments') && override.comments !== undefined) {
        next.comments = Array.isArray(override.comments) ? override.comments : [];
    }
    if (hasOwn(override, 'type') && override.type) {
        next.type = normalizeType(override.type);
        next.badge = capitalize(next.type);
    }

    return next;
}

function deriveVideoStats({ video, subscriberSignal, fetchedStats, now }) {
    const uploadTime = new Date(video.uploadDate).getTime();
    const ageDays = clamp(Math.floor((now.getTime() - uploadTime) / DAY_MS), 0, 800);
    const rank = Math.max(1, Number(video.levelRank || 999));
    const subscriberLog = Math.log10(Math.max(1000, Number(subscriberSignal || 0) + 1000));
    const subscriberBoost = 0.52 + (subscriberLog / 6.4);
    const difficultyPressure = 135000 / Math.pow(rank + 2, 0.84);
    const victorOrdinal = Number(video.completionOrdinal || 0);
    const victorBoost = video.type === 'completion'
        ? (
            victorOrdinal <= 1 ? 4.6
                : victorOrdinal === 2 ? 3.25
                    : victorOrdinal <= 5 ? 2.1
                        : victorOrdinal <= 15 ? 1.45
                            : victorOrdinal <= 50 ? 0.92
                                : victorOrdinal <= 120 ? 0.62
                                    : 0.36
        )
        : 1;
    const verificationBoost = video.type === 'verification'
        ? (rank <= 3 ? 5.3 : rank <= 10 ? 3.8 : rank <= 25 ? 2.45 : 1.55)
        : 1;
    const typeBoost = video.type === 'verification'
        ? verificationBoost
        : video.type === 'completion'
            ? victorBoost
            : (video.isUpcomingRecord ? 1.18 : 0.78);
    const percentBoost = video.type === 'progress'
        ? clamp((inferProgressPercent(video) / 100) + 0.16, 0.35, 1.05)
        : 1;
    const baseViewsAuto = Math.max(
        1400,
        Math.round(
            (video.simulation.baseViews || 0)
            || (difficultyPressure * subscriberBoost * typeBoost * percentBoost * seededRange(video.id, 'base-views', 0.88, 1.16))
        )
    );

    const hardnessBoost = clamp((150 - rank) / 150, 0.05, 1);
    const creatorHeat = clamp(
        (subscriberLog - 3) / 2.35,
        0.12,
        1.25,
    );
    const achievementHeat = clamp(
        (
            (video.type === 'verification' ? 1.18 : 0)
            + (video.type === 'completion' ? Math.min(1.15, victorBoost / 3.2) : 0)
            + (video.type === 'progress' ? ((Number(video.progressPercent || 0) - 50) / 80) : 0)
            + (video.isUpcomingRecord ? 0.42 : 0)
            + ((160 - rank) / 180)
        ),
        0.18,
        2.15,
    );
    const providedDailyGrowth = video.simulation.dailyGrowth;
    const dailyGrowthBase = Math.max(
        110,
        Math.round(
            providedDailyGrowth
            || (
                baseViewsAuto
                * (0.00055 + (hardnessBoost * 0.00105) + (creatorHeat * 0.00085) + (achievementHeat * 0.00075))
                * seededRange(video.id, 'daily-growth', 0.72, 1.12)
            )
        )
    );

    const stagnationChance = clamp(
        video.simulation.stagnationChance
        ?? (0.3 - (hardnessBoost * 0.12) - Math.min(0.08, subscriberBoost * 0.03)),
        0.08,
        0.46
    );

    let growth = 0;
    for (let day = 0; day < ageDays; day += 1) {
        const trendMultiplier = 0.8 + (0.9 * Math.exp(-day / 45));
        const daySeed = `${video.id}-${day}`;
        const stagnant = seededRange(daySeed, 'stagnant', 0, 1) < stagnationChance;
        if (stagnant) continue;
        growth += dailyGrowthBase * trendMultiplier * seededRange(daySeed, 'swing', 0.7, 1.34);
    }

    const autoViews = Math.round(baseViewsAuto + growth);
    const fetchedViews = hasMeaningfulNumber(fetchedStats?.views) ? Number(fetchedStats.views) : null;
    const referenceViews = fetchedViews ?? autoViews;
    const views = resolveMetricValue(video.statMode, referenceViews, video.views);
    const engagementBias = clamp(video.simulation.engagementBias ?? seededRange(video.id, 'engagement-bias', 0.92, 1.14), 0.82, 1.28);
    const likeRatio = (video.type === 'verification' ? 0.107 : video.type === 'completion' ? 0.084 : 0.067) * engagementBias;
    const dislikeRatio = (video.type === 'verification' ? 0.016 : 0.022) * seededRange(video.id, 'dislike-ratio', 0.8, 1.18);
    const commentRatio = (video.type === 'verification' ? 0.0064 : video.type === 'completion' ? 0.0048 : 0.0038) * engagementBias;
    const autoLikes = Math.round(views * likeRatio);
    const autoDislikes = Math.round(views * dislikeRatio);
    const localCommentFloor = countComments(video.comments);
    const autoComments = Math.max(localCommentFloor, Math.round(views * commentRatio));
    const referenceLikes = hasMeaningfulNumber(fetchedStats?.likes) ? Number(fetchedStats.likes) : autoLikes;
    const referenceComments = hasMeaningfulNumber(fetchedStats?.commentsCount) ? Number(fetchedStats.commentsCount) : autoComments;

    const likes = resolveMetricValue(video.statMode, referenceLikes, video.likes);
    const dislikes = resolveMetricValue(video.statMode, autoDislikes, video.dislikes);
    const commentsCount = Math.max(
        localCommentFloor,
        resolveMetricValue(video.statMode, referenceComments, video.commentsCount)
    );

    return {
        views,
        likes,
        dislikes,
        commentsCount,
        engagementRate: views > 0 ? (likes + commentsCount) / views : 0,
        dailyViewRate: ageDays > 0 ? views / ageDays : views,
    };
}

function resolveMetricValue(mode, referenceValue, manualValue) {
    if (mode === 'manual') return Number(manualValue || 0);
    if (mode === 'hybrid' && hasMeaningfulNumber(manualValue)) {
        return Math.max(Number(manualValue), Number(referenceValue || 0));
    }
    return Number(referenceValue || 0);
}

function buildDefaultTitle({ type, levelName, progressPercent, hasExactProgressPercent = true }) {
    if (type === 'verification') return `${levelName || 'Unknown Level'} Verification`;
    if (type === 'completion') return `${levelName || 'Unknown Level'} 100% Completion`;
    if (!hasExactProgressPercent) return `${levelName || 'Unknown Level'} Progress`;
    return `${levelName || 'Unknown Level'} ${progressPercent || 0}% Progress`;
}

function groupVideosBySlug(videos) {
    return videos.reduce((map, video) => {
        if (!map.has(video.playerSlug)) map.set(video.playerSlug, []);
        map.get(video.playerSlug).push(video);
        return map;
    }, new Map());
}

function buildProfiles({ players, videos, profileOverrides, channelDetails, playerChannels, videoIdentityMap, config }) {
    const grouped = groupVideosBySlug(videos);
    const slugs = new Set([
        ...players.keys(),
        ...profileOverrides.keys(),
        ...grouped.keys(),
    ]);

    return [...slugs].map((slug) => {
        const manual = profileOverrides.get(slug) || {};
        const discovered = players.get(slug);
        const uploads = sortByDateDesc(grouped.get(slug) || []);
        const association = playerChannels.get(slug);
        const channel = channelDetails.get(manual.youtube?.channelId || association?.channelId) || {};
        const identity = uploads
            .map((video) => video.youtubeId ? videoIdentityMap.get(video.youtubeId) : null)
            .find(Boolean) || null;
        const displayName = manual.name || discovered?.primaryName || uploads[0]?.playerName || channel.name || restoreNameFromSlug(slug);
        const totalViews = uploads.reduce((sum, video) => sum + Number(video.views || 0), 0);
        const followers = resolveSubscriberSignal({
            manual,
            channel,
            knownViews: totalViews,
            uploadCount: uploads.length,
            config,
        });
        const explicitOrder = Array.isArray(manual.videos) ? manual.videos : [];
        const explicitFeatured = Array.isArray(manual.featuredVideos) ? manual.featuredVideos : [];
        const youtubeChannelId = channel.id || manual.youtube?.channelId || association?.channelId || identity?.channelId || '';
        const youtubeHandle = manual.youtube?.handle || association?.channelHandle || identity?.handle || channel.customUrl || '';
        const orderedUploads = uploads.slice().sort((a, b) => {
            const orderA = explicitOrder.indexOf(a.id);
            const orderB = explicitOrder.indexOf(b.id);
            if (orderA !== -1 || orderB !== -1) {
                return (orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA) - (orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB);
            }
            return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        });
        const featuredVideos = orderedUploads
            .filter((video) => explicitFeatured.includes(video.id) || video.featured || video.categoryFlags.mostPopular || video.categoryFlags.topVerifications)
            .slice(0, 6);
        const liveVideos = orderedUploads
            .filter((video) => video.categoryFlags.activeNow || video.type === 'progress')
            .slice(0, 8);
        const socials = {
            youtube: manual.socials?.youtube || buildYoutubeChannelProfileUrl(
                youtubeChannelId,
                youtubeHandle,
                channel.customUrl,
                identity?.authorUrl,
            ),
            twitch: manual.socials?.twitch || '',
            discord: manual.socials?.discord || '',
            twitter: manual.socials?.twitter || '',
        };

        return {
            slug,
            name: displayName,
            verified: followers >= 100000,
            followers,
            avatar: manual.avatar
                || (config.preferFetchedProfilePictures && manual.youtube?.autoFetch !== false ? channel.avatar : '')
                || buildYoutubeAvatarFallbackUrl(
                    youtubeChannelId,
                    youtubeHandle,
                    identity?.authorUrl,
                    manual.socials?.youtube,
                )
                || generateAvatar(displayName),
            bannerLabel: manual.bannerLabel || `${displayName} / Social Progress`,
            bio: manual.bio || channel.description || 'Progress uploads, completions, verifications, and grind updates from the demonlist scene.',
            socials,
            uploads: orderedUploads,
            featuredVideos: featuredVideos.length ? featuredVideos : orderedUploads.slice(0, 4),
            liveVideos,
            vods: orderedUploads.filter((video) => !video.categoryFlags.activeNow).slice(0, 18),
            communityPosts: sortByDateDesc(manual.communityPosts || [], 'createdAt'),
            stats: {
                totalViews,
                totalUploads: orderedUploads.length,
                totalVideosLabel: `${formatCompactNumber(orderedUploads.length)} uploads`,
            },
            youtubeChannelId,
            youtubeUploadsPlaylistId: channel.uploadsPlaylistId || '',
            youtubeHandle,
            youtubeSyncAvailable: Boolean(youtubeChannelId || youtubeHandle),
        };
    });
}

function dedupeVideos(videos) {
    return dedupeBy(videos.filter(Boolean), (video) => video.youtubeId || video.id);
}

function applyDerivedCategories(videos) {
    const mostPopularIds = new Set(videos
        .slice()
        .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
        .slice(0, 18)
        .map((video) => video.id));
    const latestIds = new Set(videos
        .slice()
        .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
        .slice(0, 18)
        .map((video) => video.id));
    const trendingIds = new Set(videos
        .slice()
        .sort((a, b) => trendingScore(b) - trendingScore(a))
        .slice(0, 18)
        .map((video) => video.id));
    const verificationIds = new Set(videos
        .filter((video) => video.type === 'verification')
        .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
        .slice(0, 18)
        .map((video) => video.id));
    const progressIds = new Set(videos
        .filter((video) => video.type === 'progress')
        .sort((a, b) => progressScore(b) - progressScore(a))
        .slice(0, 18)
        .map((video) => video.id));
    const activeIds = new Set(videos
        .filter((video) => video.type === 'progress')
        .sort((a, b) => activeScore(b) - activeScore(a))
        .slice(0, 18)
        .map((video) => video.id));

    return videos.map((video) => {
        const computed = {
            mostPopular: mostPopularIds.has(video.id),
            latest: latestIds.has(video.id),
            trending: trendingIds.has(video.id),
            topVerifications: verificationIds.has(video.id),
            topProgress: progressIds.has(video.id),
            activeNow: activeIds.has(video.id),
        };

        const categoryFlags = SECTION_KEYS.reduce((acc, key) => {
            acc[key] = hasOwn(video.categoryFlags, key) ? Boolean(video.categoryFlags[key]) : computed[key];
            return acc;
        }, {});

        return {
            ...video,
            categoryFlags,
            featured: video.featured || categoryFlags.mostPopular || categoryFlags.topVerifications,
            trendingScore: trendingScore({ ...video, categoryFlags }),
        };
    });
}

function trendingScore(video) {
    const ageDays = Math.max(1, Math.floor((Date.now() - new Date(video.uploadDate).getTime()) / DAY_MS));
    const freshnessBoost = video.categoryFlags?.activeNow ? 1.22 : 1;
    return ((Number(video.views || 0) * (video.engagementRate || 0.05)) + (Number(video.dailyViewRate || 0) * 6))
        * freshnessBoost
        / Math.sqrt(ageDays);
}

function progressScore(video) {
    return (inferProgressPercent(video) * 1000)
        + Math.max(0, 200 - Number(video.levelRank || 999))
        + Math.log10(Math.max(1, Number(video.views || 0)));
}

function activeScore(video) {
    const ageDays = Math.max(1, Math.floor((Date.now() - new Date(video.uploadDate).getTime()) / DAY_MS));
    return (inferProgressPercent(video) * 50)
        + (Number(video.dailyViewRate || 0) / 100)
        + (50 / ageDays);
}

function pruneUndefined(value) {
    return Object.fromEntries(
        Object.entries(value || {}).filter(([, entry]) => entry !== undefined)
    );
}

function normalizeStringOverride(value) {
    const text = String(value || '').trim();
    return text || undefined;
}
