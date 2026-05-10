import { getPercentNumber, getYoutubeIdFromUrl } from '../util.js';
import { resolveAppUrl } from '../appPaths.js';

export const DAY_MS = 1000 * 60 * 60 * 24;

export function slugify(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export function slugifyPlayerName(value) {
    const lookup = normalizePlayerLookup(value);
    const asciiSlug = slugify(lookup);
    if (asciiSlug) return asciiSlug;
    return `player-${Math.abs(stableHash(makeWellFormed(value || 'player')))}`;
}

export function capitalize(value) {
    const text = String(value || '');
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function clamp(value, min, max) {
    return Math.min(Math.max(Number(value || 0), min), max);
}

export function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object || {}, key);
}

export function hasMeaningfulNumber(value) {
    return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

export function toNumberOrNull(value) {
    return hasMeaningfulNumber(value) ? Number(value) : null;
}

export function normalizeDate(value, fallback = new Date().toISOString()) {
    const date = new Date(value || fallback);
    return Number.isNaN(date.getTime()) ? new Date(fallback).toISOString() : date.toISOString();
}

export function isoDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - Number(days || 0));
    return date.toISOString();
}

export function formatCompactNumber(value) {
    const number = Number(value || 0);
    return new Intl.NumberFormat(undefined, {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(number);
}

export function formatFullDate(value) {
    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatRelativeDate(value) {
    const diff = Date.now() - new Date(value).getTime();
    const days = Math.max(1, Math.floor(diff / DAY_MS));
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    }
    if (days < 365) {
        const months = Math.floor(days / 30);
        return `${months} month${months === 1 ? '' : 's'} ago`;
    }

    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? '' : 's'} ago`;
}

export async function fetchJson(path, fallback) {
    try {
        const response = await fetch(resolveAppUrl(path), { cache: 'no-store' });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn(`Failed to load ${path}.`, error);
        return fallback;
    }
}

export async function fetchIndexedFolder(directory, fallback = []) {
    const index = await fetchJson(`${directory}/_index.json`, []);
    if (!Array.isArray(index) || index.length === 0) return fallback;

    const loaded = await Promise.all(
        index.map(async (entry, indexPosition) => {
            const fileId = typeof entry === 'string'
                ? entry
                : typeof entry?.path === 'string'
                    ? entry.path
                    : '';
            if (!fileId) return null;

            const value = await fetchJson(`${directory}/${fileId}.json`, null);
            if (!value) return null;

            return {
                ...value,
                __manifestIndex: indexPosition,
                __manifestPath: fileId,
            };
        })
    );

    return loaded.filter(Boolean);
}

export function readBrowserStorage(key, fallback) {
    if (typeof localStorage === 'undefined') return fallback;
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export function writeBrowserStorage(key, value) {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ignore storage and quota errors in static mode.
    }
}

export function resolveYoutubeId(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    return getYoutubeIdFromUrl(raw) || raw;
}

export function buildYoutubeUrl(youtubeId) {
    return youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : '';
}

export function parseYoutubeChannelReference(value) {
    const raw = String(value || '').trim();
    if (!raw) {
        return {
            channelId: '',
            handle: '',
            url: '',
        };
    }

    if (/^https?:\/\//i.test(raw)) {
        try {
            const url = new URL(raw);
            const parts = url.pathname.split('/').filter(Boolean);
            if (parts[0] === 'channel' && /^UC[\w-]{22}$/.test(parts[1] || '')) {
                return {
                    channelId: parts[1],
                    handle: '',
                    url: url.toString(),
                };
            }

            const handlePart = parts.find((part) => part.startsWith('@'));
            if (handlePart) {
                return {
                    channelId: '',
                    handle: handlePart.replace(/^@/, ''),
                    url: url.toString(),
                };
            }

            if ((parts[0] === 'user' || parts[0] === 'c') && parts[1]) {
                return {
                    channelId: '',
                    handle: parts[1].replace(/^@/, ''),
                    url: url.toString(),
                };
            }

            return {
                channelId: '',
                handle: '',
                url: url.toString(),
            };
        } catch {
            return {
                channelId: '',
                handle: '',
                url: raw,
            };
        }
    }

    if (/^UC[\w-]{22}$/.test(raw)) {
        return {
            channelId: raw,
            handle: '',
            url: `https://www.youtube.com/channel/${raw}`,
        };
    }

    const handle = raw.replace(/^@/, '');
    return {
        channelId: '',
        handle,
        url: `https://www.youtube.com/@${handle}`,
    };
}

export function buildYoutubeChannelProfileUrl(...references) {
    for (const reference of references) {
        if (!reference) continue;
        if (typeof reference === 'object') {
            const nested = buildYoutubeChannelProfileUrl(
                reference.url,
                reference.channelId,
                reference.handle,
                reference.customUrl,
            );
            if (nested) return nested;
            continue;
        }

        const parsed = parseYoutubeChannelReference(reference);
        if (parsed.url) return parsed.url;
    }

    return '';
}

export function buildYoutubeAvatarFallbackUrl(...references) {
    for (const reference of references) {
        if (!reference) continue;
        if (typeof reference === 'object') {
            const nested = buildYoutubeAvatarFallbackUrl(
                reference.channelId,
                reference.handle,
                reference.url,
                reference.customUrl,
            );
            if (nested) return nested;
            continue;
        }

        const parsed = parseYoutubeChannelReference(reference);
        const key = parsed.channelId || parsed.handle;
        if (key) {
            return `https://images.weserv.nl/?url=${encodeURIComponent(`https://unavatar.io/youtube/${key}`)}&w=160&h=160&fit=cover&mask=circle`;
        }
    }

    return '';
}

export function buildEmbedUrl(youtubeId) {
    return youtubeId
        ? `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`
        : '';
}

export function buildYoutubeThumbnail(youtubeId, fallbackLabel = 'PCD Social') {
    return youtubeId
        ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
        : `https://placehold.co/960x540/120b12/f4f4f5?text=${encodeURIComponent(makeWellFormed(fallbackLabel))}`;
}

export function stableHash(value) {
    return [...String(value || 'pcd')].reduce((hash, char) => {
        hash = ((hash << 5) - hash) + char.charCodeAt(0);
        return hash & hash;
    }, 0);
}

export function seededUnit(seed, salt = '') {
    const hash = Math.abs(stableHash(`${seed}:${salt}`));
    return (hash % 10000) / 10000;
}

export function seededRange(seed, salt, min, max) {
    return min + (max - min) * seededUnit(seed, salt);
}

export function restoreNameFromSlug(slug) {
    return String(slug || '')
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export function deriveFpsCategory(value) {
    const number = Number(value || 0);
    if (number >= 240) return '240';
    if (number >= 120) return '120';
    return '60';
}

export function difficultyFromRank(rank) {
    const value = Number(rank || 999);
    if (value <= 10) return 'Top 10';
    if (value <= 75) return 'Main List';
    if (value <= 150) return 'Extended List';
    return 'Legacy';
}

export function inferNumericPercent(value) {
    if (hasMeaningfulNumber(value)) return Number(value);
    return getPercentNumber(value);
}

export function hasExactPercentValue(value) {
    if (typeof value === 'number') return Number.isFinite(value);
    const raw = String(value || '').trim();
    if (!raw || raw.includes('-')) return false;
    return Number.isFinite(Number(raw.replace('%', '').trim()));
}

export function inferProgressPercent(video) {
    if (hasMeaningfulNumber(video?.progressPercent)) return Number(video.progressPercent);
    const match = String(video?.title || '').match(/(\d+)%/);
    return match ? Number(match[1]) : (String(video?.type || '') === 'completion' || String(video?.type || '') === 'verification' ? 100 : 0);
}

export function inferTypeFromText(text, fallback = 'progress') {
    const lower = String(text || '').toLowerCase();
    if (/(verification|verifier)/.test(lower)) return 'verification';
    if (/(100%|completion|complete|beaten|clear)/.test(lower)) return 'completion';
    if (/(progress|run|attempt|%\b)/.test(lower)) return 'progress';
    return fallback;
}

export function countComments(comments) {
    return (Array.isArray(comments) ? comments : []).reduce((total, comment) => {
        const replies = Array.isArray(comment?.replies) ? comment.replies.length : 0;
        return total + 1 + replies;
    }, 0);
}

export function pickPalette(value) {
    const options = [
        ['#7f1d1d', '#ef4444'],
        ['#991b1b', '#fb7185'],
        ['#1f2937', '#5ba3f5'],
        ['#450a0a', '#f97316'],
        ['#3f0d12', '#dc2626'],
    ];

    return options[Math.abs(stableHash(value)) % options.length];
}

export function generateAvatar(name) {
    const safeName = makeWellFormed(name || 'PC');
    const initials = String(safeName)
        .replace(/\[[^\]]+\]/g, '')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0] || '')
        .join('')
        .toUpperCase() || 'PC';

    const palette = pickPalette(safeName);
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="${palette[0]}"/>
                    <stop offset="100%" stop-color="${palette[1]}"/>
                </linearGradient>
            </defs>
            <rect width="128" height="128" rx="36" fill="#090912"/>
            <rect x="7" y="7" width="114" height="114" rx="30" fill="url(#g)"/>
            <text x="64" y="74" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#f8fafc">${initials}</text>
        </svg>
    `.trim();

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(makeWellFormed(svg))}`;
}

export function normalizePlayerLookup(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/\[[^\]]+\]/g, ' ')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function dedupeBy(items, keyFn) {
    const seen = new Set();
    return items.filter((item) => {
        const key = keyFn(item);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export function sortByDateDesc(items, key = 'uploadDate') {
    return [...items].sort((a, b) => new Date(b[key]).getTime() - new Date(a[key]).getTime());
}

export function sortByViewsDesc(items) {
    return [...items].sort((a, b) => Number(b.views || 0) - Number(a.views || 0));
}

const VIDEO_TITLE_CACHE_KEY = 'pcd_social_video_title_cache';
const PROFILE_AVATAR_CACHE_KEY = 'pcd_social_profile_avatar_cache';

export function getCachedVideoTitle(youtubeId) {
    if (!youtubeId) return '';
    const cache = readBrowserStorage(VIDEO_TITLE_CACHE_KEY, {});
    const entry = cache[youtubeId];
    if (!entry) return '';
    const age = Date.now() - (entry.ts || 0);
    if (age > 14 * 24 * 60 * 60 * 1000) return '';
    return entry.title || '';
}

export function setCachedVideoTitle(youtubeId, title) {
    if (!youtubeId || !title) return;
    const cache = readBrowserStorage(VIDEO_TITLE_CACHE_KEY, {});
    cache[youtubeId] = { title, ts: Date.now() };
    writeBrowserStorage(VIDEO_TITLE_CACHE_KEY, cache);
}

export function getCachedProfileAvatar(slug) {
    if (!slug) return '';
    const cache = readBrowserStorage(PROFILE_AVATAR_CACHE_KEY, {});
    const entry = cache[slug];
    if (!entry) return '';
    const age = Date.now() - (entry.ts || 0);
    if (age > 14 * 24 * 60 * 60 * 1000) return '';
    return entry.avatar || '';
}

export function setCachedProfileAvatar(slug, avatar) {
    if (!slug || !avatar) return;
    const cache = readBrowserStorage(PROFILE_AVATAR_CACHE_KEY, {});
    cache[slug] = { avatar, ts: Date.now() };
    writeBrowserStorage(PROFILE_AVATAR_CACHE_KEY, cache);
}

function makeWellFormed(value) {
    const text = String(value || '');
    if (typeof text.toWellFormed === 'function') return text.toWellFormed();
    return text.replace(/[\uD800-\uDFFF]/g, '');
}
