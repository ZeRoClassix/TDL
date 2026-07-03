import {
    buildYoutubeThumbnail,
    buildYoutubeUrl,
    parseYoutubeChannelReference,
    readBrowserStorage,
    writeBrowserStorage,
} from './helpers.js';

const CACHE_KEYS = {
    videoDetails: 'pcd_social_youtube_video_details_v3',
    channelDetails: 'pcd_social_youtube_channel_details_v3',
    channelUploads: 'pcd_social_youtube_channel_uploads_v3',
    videoIdentity: 'pcd_social_youtube_video_identity_v1',
};

function chunk(values, size) {
    const result = [];
    for (let index = 0; index < values.length; index += size) {
        result.push(values.slice(index, index + size));
    }
    return result;
}

function isFresh(entry, ttlMs) {
    return Boolean(entry?.fetchedAt && (Date.now() - Number(entry.fetchedAt)) < ttlMs);
}

async function fetchYoutubeJson(endpoint, params) {
    const search = new URLSearchParams(params);
    const response = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}?${search.toString()}`);
    if (!response.ok) throw new Error(`YouTube API request failed: ${response.status}`);
    return response.json();
}

function readBucket(key) {
    return readBrowserStorage(key, {});
}

function writeBucket(key, value) {
    writeBrowserStorage(key, value);
}

function collectFromBucket(bucket, ids) {
    const map = new Map();
    ids.forEach((id) => {
        if (bucket[id]?.value) map.set(id, bucket[id].value);
    });
    return map;
}

export async function fetchYoutubeVideoDetails({ videoIds, apiKey, cacheHours = 12 }) {
    const ids = [...new Set((Array.isArray(videoIds) ? videoIds : []).filter(Boolean))];
    const bucket = readBucket(CACHE_KEYS.videoDetails);
    const ttlMs = Number(cacheHours || 0) * 60 * 60 * 1000;

    if (!apiKey) return collectFromBucket(bucket, ids);

    const missing = ids.filter((id) => !isFresh(bucket[id], ttlMs));

    try {
        const batches = chunk(missing, 50).filter(b => b.length > 0);
        
        // Cache failures to prevent endless lag on retry
        missing.forEach(id => {
            bucket[id] = { fetchedAt: Date.now(), value: null };
        });

        // Fetch in smaller concurrent groups to prevent YouTube 429 Too Many Requests
        for (let i = 0; i < batches.length; i += 3) {
            const currentBatches = batches.slice(i, i + 3);
            await Promise.allSettled(currentBatches.map(async (batch) => {
                try {
                    const data = await fetchYoutubeJson('videos', {
                        part: 'snippet,statistics',
                        id: batch.join(','),
                        key: apiKey,
                    });

                    (data.items || []).forEach((item) => {
                        bucket[item.id] = {
                            fetchedAt: Date.now(),
                            value: {
                                id: item.id,
                                title: item.snippet?.title || '',
                                channelId: item.snippet?.channelId || '',
                                channelTitle: item.snippet?.channelTitle || '',
                                uploadDate: item.snippet?.publishedAt || '',
                                thumbnail: item.snippet?.thumbnails?.high?.url
                                    || item.snippet?.thumbnails?.medium?.url
                                    || buildYoutubeThumbnail(item.id),
                                views: Number(item.statistics?.viewCount || 0),
                                likes: Number(item.statistics?.likeCount || 0),
                                commentsCount: Number(item.statistics?.commentCount || 0),
                            },
                        };
                    });
                } catch (e) {
                    // Failures are already cached as null above
                }
            }));
        }
        writeBucket(CACHE_KEYS.videoDetails, bucket);
    } catch (error) {
        console.warn('YouTube video enrichment failed; falling back to cache and approximations.', error);
    }

    return collectFromBucket(bucket, ids);
}

export async function fetchYoutubeChannelDetails({ channelIds, apiKey, cacheHours = 24 }) {
    const ids = [...new Set((Array.isArray(channelIds) ? channelIds : []).filter(Boolean))];
    const bucket = readBucket(CACHE_KEYS.channelDetails);
    const ttlMs = Number(cacheHours || 0) * 60 * 60 * 1000;

    if (!apiKey) return collectFromBucket(bucket, ids);

    const missing = ids.filter((id) => !isFresh(bucket[id], ttlMs));

    try {
        const batches = chunk(missing, 50).filter(b => b.length > 0);
        
        missing.forEach(id => {
            bucket[id] = { fetchedAt: Date.now(), value: null };
        });

        for (let i = 0; i < batches.length; i += 3) {
            const currentBatches = batches.slice(i, i + 3);
            await Promise.allSettled(currentBatches.map(async (batch) => {
                try {
                    const data = await fetchYoutubeJson('channels', {
                        part: 'snippet,statistics,contentDetails',
                        id: batch.join(','),
                        key: apiKey,
                    });

                    (data.items || []).forEach((item) => {
                        bucket[item.id] = {
                            fetchedAt: Date.now(),
                            value: {
                                id: item.id,
                                name: item.snippet?.title || '',
                                description: item.snippet?.description || '',
                                avatar: item.snippet?.thumbnails?.high?.url
                                    || item.snippet?.thumbnails?.medium?.url
                                    || '',
                                subscribers: Number(item.statistics?.subscriberCount || 0),
                                uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads || '',
                                customUrl: item.snippet?.customUrl || '',
                            },
                        };
                    });
                } catch (e) {
                    // Failures cached as null
                }
            }));
        }
        writeBucket(CACHE_KEYS.channelDetails, bucket);
    } catch (error) {
        console.warn('YouTube channel enrichment failed; falling back to cache and approximations.', error);
    }

    return collectFromBucket(bucket, ids);
}

export function getCachedYoutubeVideoIdentityMap(videoIds) {
    const ids = [...new Set((Array.isArray(videoIds) ? videoIds : []).filter(Boolean))];
    const bucket = readBucket(CACHE_KEYS.videoIdentity);
    const map = new Map();
    ids.forEach((id) => {
        if (bucket[id]?.value) map.set(id, bucket[id].value);
    });
    return map;
}

export async function fetchYoutubeVideoIdentity({ youtubeId, cacheHours = 168 }) {
    if (!youtubeId) return null;

    const bucket = readBucket(CACHE_KEYS.videoIdentity);
    const ttlMs = Number(cacheHours || 0) * 60 * 60 * 1000;
    if (isFresh(bucket[youtubeId], ttlMs) && bucket[youtubeId]?.value) {
        return bucket[youtubeId].value;
    }

    try {
        const response = await fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(buildYoutubeUrl(youtubeId))}&format=json`,
            { cache: 'no-store' },
        );
        if (!response.ok) throw new Error(`YouTube oEmbed request failed: ${response.status}`);
        const data = await response.json();
        const reference = parseYoutubeChannelReference(data.author_url || '');
        const value = {
            youtubeId,
            title: String(data.title || '').trim(),
            authorName: String(data.author_name || '').trim(),
            authorUrl: String(data.author_url || '').trim(),
            channelId: reference.channelId,
            handle: reference.handle,
        };
        bucket[youtubeId] = {
            fetchedAt: Date.now(),
            value,
        };
        writeBucket(CACHE_KEYS.videoIdentity, bucket);
        return value;
    } catch (error) {
        console.warn(`YouTube identity lookup failed for ${youtubeId}; using cached identity if available.`, error);
        return bucket[youtubeId]?.value || null;
    }
}

export async function fetchYoutubeVideoIdentities({
    videoIds,
    cacheHours = 168,
    forceRefresh = false,
    concurrency = 6,
}) {
    const ids = [...new Set((Array.isArray(videoIds) ? videoIds : []).filter(Boolean))];
    if (!ids.length) return new Map();

    const bucket = readBucket(CACHE_KEYS.videoIdentity);
    const ttlMs = Number(cacheHours || 0) * 60 * 60 * 1000;
    const queue = forceRefresh
        ? ids
        : ids.filter((id) => !isFresh(bucket[id], ttlMs) || !bucket[id]?.value);

    const workers = Array.from({ length: Math.max(1, Math.min(Number(concurrency || 6), 12)) }, async () => {
        while (queue.length) {
            const youtubeId = queue.shift();
            if (!youtubeId) continue;
            await fetchYoutubeVideoIdentity({ youtubeId, cacheHours });
            await new Promise((resolve) => setTimeout(resolve, 350)); // Prevent 403 rate limits
        }
    });

    await Promise.all(workers);
    return getCachedYoutubeVideoIdentityMap(ids);
}

export function readCachedChannelUploads(channelId) {
    const bucket = readBucket(CACHE_KEYS.channelUploads);
    return bucket[channelId]?.value || [];
}

export function getCachedChannelUploadsMap(channelIds) {
    const ids = [...new Set((Array.isArray(channelIds) ? channelIds : []).filter(Boolean))];
    const bucket = readBucket(CACHE_KEYS.channelUploads);
    const map = new Map();
    ids.forEach((id) => {
        if (bucket[id]?.value) map.set(id, bucket[id].value);
    });
    return map;
}

export async function fetchYoutubeChannelUploads({
    channelId,
    uploadsPlaylistId,
    apiKey,
    limit = 24,
    cacheHours = 6,
    forceRefresh = false,
}) {
    if (!channelId) return [];

    const bucket = readBucket(CACHE_KEYS.channelUploads);
    const existing = bucket[channelId];
    const ttlMs = Number(cacheHours || 0) * 60 * 60 * 1000;

    if (!forceRefresh && existing?.value?.length && isFresh(existing, ttlMs) && Number(existing.limit || 0) >= Number(limit || 0)) {
        return existing.value.slice(0, limit);
    }

    if (!apiKey || !uploadsPlaylistId) return existing?.value?.slice(0, limit) || [];

    try {
        const playlistItems = [];
        let pageToken = '';
        while (playlistItems.length < limit) {
            const pageSize = Math.min(50, limit - playlistItems.length);
            const data = await fetchYoutubeJson('playlistItems', {
                part: 'snippet,contentDetails',
                playlistId: uploadsPlaylistId,
                maxResults: String(pageSize),
                pageToken,
                key: apiKey,
            });

            playlistItems.push(...(data.items || []));
            pageToken = data.nextPageToken || '';
            if (!pageToken || !(data.items || []).length) break;
        }

        const videoIds = playlistItems
            .map((item) => item.contentDetails?.videoId || item.snippet?.resourceId?.videoId)
            .filter(Boolean);
        const detailMap = await fetchYoutubeVideoDetails({
            videoIds,
            apiKey,
            cacheHours,
        });

        const items = playlistItems.map((item) => {
            const youtubeId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId || '';
            const detail = detailMap.get(youtubeId) || {};
            return {
                youtubeId,
                title: detail.title || item.snippet?.title || 'Untitled Upload',
                channelId: detail.channelId || item.snippet?.videoOwnerChannelId || item.snippet?.channelId || channelId,
                channelTitle: detail.channelTitle || item.snippet?.videoOwnerChannelTitle || item.snippet?.channelTitle || '',
                uploadDate: detail.uploadDate || item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt || '',
                thumbnail: detail.thumbnail
                    || item.snippet?.thumbnails?.high?.url
                    || item.snippet?.thumbnails?.medium?.url
                    || buildYoutubeThumbnail(youtubeId),
                views: Number(detail.views || 0),
                likes: Number(detail.likes || 0),
                commentsCount: Number(detail.commentsCount || 0),
            };
        }).filter((item) => item.youtubeId);

        bucket[channelId] = {
            fetchedAt: Date.now(),
            limit,
            uploadsPlaylistId,
            value: items,
        };
        writeBucket(CACHE_KEYS.channelUploads, bucket);
        return items;
    } catch (error) {
        console.warn(`Failed to fetch uploads for channel ${channelId}; using cached uploads if available.`, error);
        return existing?.value?.slice(0, limit) || [];
    }
}
