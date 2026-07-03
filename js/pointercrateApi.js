import { score, round } from './score.js';
import { resolveAppUrl } from './appPaths.js';

/**
 * ──────────────────────────────────────────────────────────────────────
 *  Pointercrate-style API layer  –  LIVE API + Overrides
 *
 *  Data resolution priority:
 *    1. playerOverrides / levelOverrides   (highest – custom edits)
 *    2. Local JSON database                (data/*.json – fallback)
 *    3. Pointercrate API                   (live – primary source)
 *
 *  On every page load the module fetches the TOP 150 demons from the
 *  real Pointercrate API, then fetches full details (records, creators)
 *  for each one.  Results are cached in memory for CACHE_TTL_MS so
 *  navigating between pages doesn't re-fetch.
 *
 *  If the API is unreachable (CORS, network, rate-limit) the module
 *  silently falls back to the local JSON files in data/.
 * ──────────────────────────────────────────────────────────────────────
 */

// ── Configuration ────────────────────────────────────────────────────
const POINTERCRATE_API = 'https://pointercrate.com/api/v2';
const DEMONS_PER_PAGE = 50;   // API max
const TOP_N = 150;   // demons to load
const BATCH_SIZE = 10;    // concurrent detail fetches (lower to avoid rate-limits)
const BATCH_DELAY_MS = 300;   // small delay between batches to respect rate limits
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const EXCLUDED_PLAYER_KEYS = new Set([
    'mindzdraf',
    'vorten',
    'roze',
    'nickname09',
    'w3rty',
    'abakarovich',
    'bonngd',
    'andreykapninskii',
    'a6'
]);

// CORS proxy chain — try direct first, then these proxies in order
// Each entry: [prefix, needsEncoding]
const CORS_PROXIES = [
    ['', false],  // direct (no proxy)
    ['https://corsproxy.io/?', false],  // corsproxy.io - raw URL after ?
    ['https://api.allorigins.win/raw?url=', true],  // allorigins - needs encoding
    ['https://api.codetabs.com/v1/proxy?quest=', true],  // codetabs - needs encoding
];

const dir = 'data';
const dataUrl = (path) => resolveAppUrl(`${dir}/${path}`);

const EMPTY_OVERRIDE_STATE = {
    playerOverrides: {},
    levelOverrides: {},
};

// ── Caches ───────────────────────────────────────────────────────────
let overrideStatePromise = null;
let listPromise = null;
let listCacheTime = 0;
let lastFetchSource = 'none'; // 'api' | 'local' | 'none'
let workingProxyIndex = 0; // remember which proxy worked last

// ── String helpers ───────────────────────────────────────────────────

export function normalizeLookupKey(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\[.*?\]/g, '')
        .replace(/\(.*?\)/g, '')
        .replace(/[^a-z0-9]+/g, '');
}

export function slugifyPlayer(value) {
    return normalizeLookupKey(value) || String(value || '').trim().toLowerCase().replace(/\s+/g, '-');
}

export function isExcludedPlayer(value) {
    return EXCLUDED_PLAYER_KEYS.has(normalizeLookupKey(value));
}

// ── Low-level helpers ────────────────────────────────────────────────

async function fetchJson(path, fallback) {
    try {
        const response = await fetch(dataUrl(path));
        if (!response.ok) return fallback;
        return await response.json();
    } catch {
        return fallback;
    }
}

async function fetchApi(endpoint) {
    const targetUrl = `${POINTERCRATE_API}${endpoint}`;
    const errors = [];

    // Try the last working proxy first, then all others
    const proxyOrder = [
        workingProxyIndex,
        ...CORS_PROXIES.map((_, i) => i).filter(i => i !== workingProxyIndex)
    ];

    for (const proxyIdx of proxyOrder) {
        const [prefix, needsEncoding] = CORS_PROXIES[proxyIdx];
        const url = prefix
            ? `${prefix}${needsEncoding ? encodeURIComponent(targetUrl) : targetUrl}`
            : targetUrl;
        try {
            const resp = await fetch(url, {
                headers: { 'Accept': 'application/json' },
            });
            if (!resp.ok) {
                errors.push(`Proxy ${proxyIdx} (${prefix || 'direct'}) returned ${resp.status}`);
                continue;
            }
            const data = await resp.json();
            // Remember which proxy worked
            if (proxyIdx !== workingProxyIndex) {
                workingProxyIndex = proxyIdx;
                console.log(`[PCdemonlist] Switching to proxy ${proxyIdx}: ${prefix || 'direct'}`);
            }
            return data;
        } catch (err) {
            errors.push(`Proxy ${proxyIdx} (${prefix || 'direct'}): ${err.message}`);
        }
    }

    throw new Error(`All API proxies failed for ${endpoint}: ${errors.join('; ')}`);
}

function clone(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
}

function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || typeof value === 'undefined') return [];
    return [value];
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

// ── Record normalization ─────────────────────────────────────────────

function normalizeRecord(record = {}) {
    const user = String(record.user || record.player || record.playerName || '').trim();
    if (isExcludedPlayer(user)) return null;
    return {
        ...record,
        user,
        link: String(record.link || record.video || record.url || '').trim(),
        percent: Number(record.percent ?? record.progress ?? 100),
    };
}

/** Normalize a record coming from the Pointercrate API shape */
function normalizeApiRecord(apiRecord) {
    const user = apiRecord.player?.name || '';
    if (isExcludedPlayer(user)) return null;
    return {
        user,
        link: apiRecord.video || '',
        percent: Number(apiRecord.progress || 100),
        nationality: apiRecord.nationality || null,
        status: apiRecord.status || 'approved',
    };
}

// ── Level normalization ──────────────────────────────────────────────

function normalizeLevel(raw = {}, { path = '', position = null } = {}) {
    const id = raw.id ?? raw.levelId ?? raw.level_id ?? path;
    const creators = asArray(raw.creators ?? raw.creator ?? raw.creatorNames)
        .map((entry) => typeof entry === 'object' ? (entry.name || '') : String(entry))
        .map((s) => s.trim())
        .filter(Boolean);
    const completionRecords = asArray(raw.completionRecords || raw.completions)
        .map((record) => normalizeRecord({ ...record, percent: 100 }));
    const progressRecords = asArray(raw.progressRecords)
        .map(normalizeRecord);
    const records = asArray(
        raw.records?.length ? raw.records : [...completionRecords, ...progressRecords]
    ).map(normalizeRecord).filter(Boolean);

    return {
        id,
        name: String(raw.name || raw.levelName || 'Unnamed Demon').trim(),
        author: String(raw.author || raw.publisher || '').trim(),
        creators,
        verifier: String(raw.verifier || raw.verification?.username || '').trim(),
        verification: typeof raw.verification === 'string'
            ? raw.verification
            : String(raw.verification?.video || raw.video || ''),
        showcase: raw.showcase,
        percentToQualify: raw.percentToQualify ?? raw.requirement?.percent ?? raw.requirementPercent ?? raw.requirement ?? 100,
        password: raw.password || '',
        difficulty: raw.difficulty || 'Extreme Demon',
        points: raw.points ?? null,
        thumbnail: raw.thumbnail || '',
        description: raw.description || '',
        legacy: Boolean(raw.legacy ?? raw.isLegacy ?? (position && position > 150)),
        placement: raw.placement || null,
        requirement: raw.requirement || raw.requirementInformation || null,
        position: Number(raw.position || raw.rank || position || 0) || null,
        path: String(raw.path || path || id),
        records: records.sort((a, b) => Number(b.percent || 0) - Number(a.percent || 0)),
        __pointercrate: {
            object: 'demon',
            source: raw.__source || 'local',
            override: Boolean(raw.__override),
        },
    };
}

// ── Level override merging ───────────────────────────────────────────

function normalizeLevelOverride(override = {}, baseLevel = null, key = '') {
    const seed = override.inheritLocal && baseLevel ? clone(baseLevel) : {};
    const merged = {
        ...seed,
        ...override,
        position: seed.position || override.position || override.rank,
        __override: true,
        __source: 'levelOverrides',
        path: override.path || seed.path || key,
        id: override.id ?? override.levelId ?? seed.id ?? key,
    };

    if (override.addCreators?.length) {
        const creators = new Set(asArray(merged.creators).filter(Boolean));
        override.addCreators.forEach((creator) => creators.add(creator));
        merged.creators = [...creators];
    }

    let level = normalizeLevel(merged, {
        path: merged.path || key,
        position: merged.position || merged.rank || seed.position,
    });

    if (override.playerRecords?.length || override.removeRecords?.length) {
        const byUser = new Map(level.records.map((record) => [normalizeLookupKey(record.user), record]));

        if (override.playerRecords?.length) {
            override.playerRecords.map(normalizeRecord).filter(Boolean).forEach((record) => {
                const userKey = normalizeLookupKey(record.user);
                if (userKey) byUser.set(userKey, record);
            });
        }

        if (override.removeRecords?.length) {
            override.removeRecords.forEach((user) => {
                const userKey = normalizeLookupKey(user);
                if (userKey) byUser.delete(userKey);
            });
        }

        level = {
            ...level,
            records: [...byUser.values()].sort((a, b) => Number(b.percent || 0) - Number(a.percent || 0)),
        };
    }

    return level;
}

// ── Player override index ────────────────────────────────────────────

function buildPlayerOverrideIndex(playerOverrides = {}) {
    const index = new Map();
    Object.entries(playerOverrides).forEach(([key, player]) => {
        const aliases = [
            key,
            player.name,
            player.username,
            player.displayName,
            ...(Array.isArray(player.aliases) ? player.aliases : []),
        ];
        aliases.map(normalizeLookupKey).filter(Boolean).forEach((alias) => index.set(alias, player));
    });
    return index;
}

// ── Override state ───────────────────────────────────────────────────

export async function fetchOverrideState() {
    if (!overrideStatePromise) {
        overrideStatePromise = Promise.all([
            fetchJson('playerOverrides.json', { playerOverrides: {} }),
            fetchJson('levelOverrides.json', { levelOverrides: {} }),
        ]).then(([players, levels]) => ({
            playerOverrides: players.playerOverrides || players.players || {},
            levelOverrides: levels.levelOverrides || levels.levels || {},
        })).catch(() => EMPTY_OVERRIDE_STATE);
    }
    return overrideStatePromise;
}

export function getPlayerOverrideFromState(state, username) {
    const index = buildPlayerOverrideIndex(state?.playerOverrides || {});
    return index.get(normalizeLookupKey(username)) || null;
}

export async function fetchPlayerOverrides() {
    const state = await fetchOverrideState();
    return state.playerOverrides;
}

// ══════════════════════════════════════════════════════════════════════
//  LIVE POINTERCRATE API  –  Fetches real data from pointercrate.com
// ══════════════════════════════════════════════════════════════════════

/**
 * Fetch all listed demons from the API (paginated).
 * Returns an array of basic demon objects sorted by position.
 */
async function fetchApiListedDemons() {
    const allDemons = [];
    let after = 0;

    while (true) {
        const url = after === 0
            ? `/demons/listed/?limit=${DEMONS_PER_PAGE}`
            : `/demons/listed/?limit=${DEMONS_PER_PAGE}&after=${after}`;
        const page = await fetchApi(url);
        if (!Array.isArray(page) || page.length === 0) break;
        allDemons.push(...page);
        if (page.length < DEMONS_PER_PAGE) break;
        after = page[page.length - 1].position;
        // Safety: stop after enough
        if (allDemons.length >= TOP_N) break;
    }

    return allDemons
        .filter((d) => d.position <= TOP_N)
        .sort((a, b) => a.position - b.position);
}

/**
 * Fetch full details for a single demon (creators + records).
 * The v2 API wraps individual resources in { data: { ... } }.
 */
async function fetchApiDemonDetail(demonId) {
    const response = await fetchApi(`/demons/${demonId}/`);
    // Handle various response shapes:
    // - { data: { id, name, ... } }  (standard v2 wrapper)
    // - { id, name, ... }            (direct object)
    // - [{ id, name, ... }]          (array, unlikely but safe)
    if (response && typeof response === 'object') {
        if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            return response.data;
        }
        if (Array.isArray(response) && response.length > 0) {
            return response[0];
        }
        return response;
    }
    return null;
}

/**
 * Batch-fetch full details for all demons, with concurrency control.
 */
async function fetchAllDemonDetails(listedDemons) {
    const results = new Map();
    const ids = listedDemons.map((d) => d.id);

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.allSettled(
            batch.map((id) => fetchApiDemonDetail(id))
        );

        batchResults.forEach((result, idx) => {
            if (result.status === 'fulfilled' && result.value) {
                results.set(batch[idx], result.value);
            }
        });

        // Small delay between batches to respect rate limits
        if (BATCH_DELAY_MS > 0 && i + BATCH_SIZE < ids.length) {
            await sleep(BATCH_DELAY_MS);
        }
    }

    return results;
}

// ── Player Rankings from v1 API ──────────────────────────────────────

const POINTERCRATE_V1 = 'https://pointercrate.com/api/v1';
const RANKING_PAGE_SIZE = 100;
const MAX_RANKING_PAGES = 10;  // up to 1000 players

let rankingCachePromise = null;
let rankingCacheTime = 0;

/**
 * Fetch the full player ranking from Pointercrate v1 API.
 * Returns a Map of normalized-name → { id, name, score, rank, nationality }.
 * Cached for CACHE_TTL_MS.
 */
async function fetchApiPlayerRankings({ refresh = false } = {}) {
    if (!refresh && rankingCachePromise && (Date.now() - rankingCacheTime < CACHE_TTL_MS)) {
        return rankingCachePromise;
    }

    rankingCacheTime = Date.now();
    rankingCachePromise = (async () => {
        const allPlayers = [];
        let afterRank = 0;

        for (let page = 0; page < MAX_RANKING_PAGES; page++) {
            try {
                const targetUrl = afterRank === 0
                    ? `${POINTERCRATE_V1}/players/ranking/?limit=${RANKING_PAGE_SIZE}`
                    : `${POINTERCRATE_V1}/players/ranking/?limit=${RANKING_PAGE_SIZE}&after=${afterRank}`;

                // Use the same CORS proxy chain as the v2 API
                let data = null;
                const proxyOrder = [
                    workingProxyIndex,
                    ...CORS_PROXIES.map((_, i) => i).filter(i => i !== workingProxyIndex)
                ];
                for (const proxyIdx of proxyOrder) {
                    const [prefix, needsEncoding] = CORS_PROXIES[proxyIdx];
                    const url = prefix
                        ? `${prefix}${needsEncoding ? encodeURIComponent(targetUrl) : targetUrl}`
                        : targetUrl;
                    try {
                        const resp = await fetch(url, {
                            headers: { 'Accept': 'application/json' },
                        });
                        if (!resp.ok) continue;
                        data = await resp.json();
                        if (proxyIdx !== workingProxyIndex) {
                            workingProxyIndex = proxyIdx;
                        }
                        break;
                    } catch { continue; }
                }
                if (!Array.isArray(data) || data.length === 0) break;

                allPlayers.push(...data);
                afterRank = data[data.length - 1].rank;

                if (data.length < RANKING_PAGE_SIZE) break;
            } catch {
                break;
            }
        }

        console.log(`[PCdemonlist] Fetched ${allPlayers.length} player rankings from v1 API`);

        // Build lookup map: normalized name → ranking data
        const map = new Map();
        allPlayers.forEach((p) => {
            const key = normalizeLookupKey(p.name);
            if (isExcludedPlayer(p.name)) return;
            if (key) {
                map.set(key, {
                    id: p.id,
                    name: p.name,
                    score: p.score,
                    rank: p.rank,
                    banned: p.banned,
                    nationality: p.nationality,
                    countryCode: p.nationality?.country_code?.toLowerCase() || null,
                });
                // Also store nationality in the global map
                if (p.nationality?.country_code) {
                    playerNationalities.set(key, p.nationality.country_code.toLowerCase());
                }
            }
        });

        return map;
    })();

    return rankingCachePromise;
}

/**
 * Convert API demon data into the normalized internal format.
 */
function normalizeApiDemon(listed, detail = null) {
    const src = detail || listed;
    const raw = {
        id: src.id,
        name: src.name,
        position: src.position ?? listed.position,
        author: src.publisher?.name || listed.publisher?.name || '',
        publisher: src.publisher?.name || listed.publisher?.name || '',
        creators: (src.creators || []).map((c) => (typeof c === 'object' ? c.name : String(c))).filter(Boolean),
        verifier: src.verifier?.name || listed.verifier?.name || '',
        verification: src.video || listed.video || '',
        video: src.video || listed.video || '',
        percentToQualify: src.requirement ?? listed.requirement ?? 100,
        thumbnail: src.thumbnail || listed.thumbnail || '',
        level_id: src.level_id || listed.level_id,
        records: (src.records || [])
            .filter((r) => r.status === 'approved')
            .map(normalizeApiRecord)
            .filter(Boolean),
        __source: 'pointercrate-api',
    };

    return normalizeLevel(raw, {
        path: String(src.id),
        position: src.position ?? listed.position,
    });
}

/**
 * Safe version of fetchApiDemonDetail — returns null on error instead of throwing.
 */
async function fetchApiDemonDetailSafe(demonId) {
    try {
        return await fetchApiDemonDetail(demonId);
    } catch {
        return null;
    }
}

/**
 * Merge records from local files (complete) with API records (partial but fresh).
 * Local records are the base; API records are added if not already present.
 */
function mergeRecords(localRecords = [], apiRecords = []) {
    const byUser = new Map();
    // Local records first
    localRecords.forEach((rec) => {
        if (!rec || isExcludedPlayer(rec.user)) return;
        const key = normalizeLookupKey(rec.user);
        if (key) byUser.set(key, rec);
    });
    // Merge in API records, prioritizing higher completion percentages
    apiRecords.forEach((rec) => {
        if (!rec || isExcludedPlayer(rec.user)) return;
        const key = normalizeLookupKey(rec.user);
        if (key) {
            const existing = byUser.get(key);
            if (!existing || Number(rec.percent || 0) > Number(existing.percent || 0)) {
                byUser.set(key, rec);
            }
        }
    });
    return [...byUser.values()].sort((a, b) => Number(b.percent || 0) - Number(a.percent || 0));
}

/**
 * Merge creators from local data and API data.
 */
function mergeCreators(localCreators, apiCreators) {
    const set = new Set();
    asArray(localCreators).forEach((c) => {
        const name = typeof c === 'object' ? (c.name || '') : String(c);
        if (name.trim()) set.add(name.trim());
    });
    asArray(apiCreators).forEach((c) => {
        const name = typeof c === 'object' ? (c.name || '') : String(c);
        if (name.trim()) set.add(name.trim());
    });
    return [...set];
}

// ══════════════════════════════════════════════════════════════════════
//  LOCAL FALLBACK  –  Uses data/*.json when API is unreachable
// ══════════════════════════════════════════════════════════════════════

async function fetchLocalDemonList() {
    const paths = await fetchJson('_list.json', null);
    if (!Array.isArray(paths)) return null;

    const tuples = await Promise.all(paths.slice(0, TOP_N).map(async (path, index) => {
        try {
            const raw = await fetchJson(`${path}.json`, null);
            if (!raw) throw new Error('missing');
            return [normalizeLevel(raw, { path, position: index + 1 }), null];
        } catch {
            return [null, path];
        }
    }));

    return tuples;
}

// ══════════════════════════════════════════════════════════════════════
//  MAIN ENTRY  –  fetchPointercrateDemons()
// ══════════════════════════════════════════════════════════════════════

/**
 * Fetch and normalize the full demon list.
 *
 * Strategy:
 *   1. Try the LIVE Pointercrate API first
 *   2. If API fails → fall back to local JSON files
 *   3. Apply levelOverrides on top of whichever source succeeded
 *   4. Cache the result for CACHE_TTL_MS
 *
 * HYBRID STRATEGY:
 *   - API gives us the current demon positions and new levels (auto-updating)
 *   - Local JSON files give us COMPLETE record lists (the API only returns a subset)
 *   - API records are merged in to catch any new records not yet in local JSON
 *   - Player nationalities are extracted from API records for flag display
 *
 * Returns: Array of [level, error] tuples sorted by position.
 */

// Global map: normalized player name → country_code (from API records)
const playerNationalities = new Map();
export function getPlayerNationality(playerName) {
    return playerNationalities.get(normalizeLookupKey(playerName)) || null;
}

export async function fetchPointercrateDemons({ refresh = false } = {}) {
    // Check memory cache
    if (!refresh && listPromise && (Date.now() - listCacheTime < CACHE_TTL_MS)) {
        return listPromise;
    }

    listCacheTime = Date.now();
    listPromise = fetchPointercrateDemonsInternal();
    return listPromise;
}

/** Returns 'api' if last fetch used live API, 'local' if fallback. */
export function getLastFetchSource() {
    return lastFetchSource;
}
/**
 * Background fetch: Load full details (records/victors) for all demons
 * AFTER the initial fast list load. This runs asynchronously and merges
 * new API records into the already-cached tuples in-place.
 *
 * The page loads instantly with local JSON records, then this function
 * silently updates all demons with the latest API records (new victors).
 */
async function backgroundFetchDetails(listedDemons, localDataMap, tuples) {
    try {
        console.log(`[PCdemonlist] Background: fetching details for ${listedDemons.length} demons...`);
        const startTime = Date.now();

        // Build a map of listed demon id → tuple index for quick lookup
        const idToIndex = new Map();
        tuples.forEach(([level], idx) => {
            if (level) idToIndex.set(level.id, idx);
        });

        // Fetch in batches of 15 with small delays to avoid rate limits
        const BG_BATCH = 15;
        const BG_DELAY = 200;
        let fetched = 0;
        let merged = 0;

        for (let i = 0; i < listedDemons.length; i += BG_BATCH) {
            const batch = listedDemons.slice(i, i + BG_BATCH);
            const results = await Promise.allSettled(
                batch.map(d => fetchApiDemonDetail(d.id))
            );

            results.forEach((result, batchIdx) => {
                if (result.status !== 'fulfilled' || !result.value) return;
                const detail = result.value;
                const demonId = batch[batchIdx].id;
                const tupleIdx = idToIndex.get(demonId);
                if (tupleIdx === undefined) return;

                fetched++;
                const [existingLevel] = tuples[tupleIdx];
                if (!existingLevel) return;

                // Extract nationalities from API records
                if (detail.records) {
                    detail.records
                        .filter(r => r.status === 'approved' && r.nationality?.country_code && !isExcludedPlayer(r.player?.name))
                        .forEach(r => {
                            const key = normalizeLookupKey(r.player?.name);
                            if (key) playerNationalities.set(key, r.nationality.country_code.toLowerCase());
                        });
                }

                // Merge API records into existing records
                const apiRecords = (detail.records || [])
                    .filter(r => r.status === 'approved')
                    .map(normalizeApiRecord)
                    .filter(Boolean);

                if (apiRecords.length > 0) {
                    const existingRecords = existingLevel.records || [];
                    const mergedRecords = mergeRecords(existingRecords, apiRecords);
                    existingLevel.records = mergedRecords;
                    merged++;
                }

                // Also update verifier/creators from API if available
                if (detail.verifier?.name && !existingLevel.verifier) {
                    existingLevel.verifier = detail.verifier.name;
                }
                if (detail.creators?.length > 0 && (!existingLevel.creators || existingLevel.creators.length === 0)) {
                    existingLevel.creators = detail.creators.map(c => typeof c === 'object' ? c.name : c).filter(Boolean);
                }
            });

            if (BG_DELAY > 0 && i + BG_BATCH < listedDemons.length) {
                await sleep(BG_DELAY);
            }
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[PCdemonlist] Background: ✓ fetched ${fetched} details, merged records for ${merged} demons in ${elapsed}s`);
        console.log(`[PCdemonlist] Background: ${playerNationalities.size} player nationalities extracted`);
    } catch (err) {
        console.warn('[PCdemonlist] Background detail fetch failed (non-critical):', err.message);
    }
}

async function fetchPointercrateDemonsInternal() {
    const overrides = await fetchOverrideState();
    let tuples;

    // ── Try HYBRID: API for positions + local for complete records ──
    try {
        console.log('[PCdemonlist] Fetching live demon list from API...');
        const listedDemons = await fetchApiListedDemons();
        console.log(`[PCdemonlist] Got ${listedDemons.length} listed demons, loading local records...`);

        // Load ALL local JSON files in parallel (instant from local server)
        const localDataMap = new Map();
        await Promise.all(listedDemons.map(async (listed) => {
            const data = await fetchJson(`${listed.id}.json`, null);
            if (data) localDataMap.set(listed.id, data);
        }));
        console.log(`[PCdemonlist] Loaded ${localDataMap.size} local JSON files`);

        // SPEED: Skip individual demon detail API calls — they're extremely slow
        // (150 × CORS proxy requests). Use listed endpoint data + local JSON instead.
        // The listed endpoint already gives us: id, name, position, publisher, verifier, video.
        // Local JSON gives us: records, creators, author, verification links.
        const apiDetailMap = new Map();

        // Extract nationalities from local records as fallback
        localDataMap.forEach((localData, id) => {
            if (localData?.records) {
                localData.records.forEach(r => {
                    if (r.nationality || r.country_code) {
                        const key = normalizeLookupKey(r.user || r.player);
                        if (key) playerNationalities.set(key, (r.nationality || r.country_code).toLowerCase());
                    }
                });
            }
        });

        // Merge: API metadata (positions, names) + local records (complete)
        const results = listedDemons.map((listed) => {
            const apiDetail = apiDetailMap.get(listed.id) || null;
            const localData = localDataMap.get(listed.id) || null;

            const apiRecords = (apiDetail?.records || [])
                .filter(r => r.status === 'approved')
                .map(normalizeApiRecord)
                .filter(Boolean);
            const localRecords = (localData?.records || []).map(normalizeRecord).filter(Boolean);
            const mergedRecords = mergeRecords(localRecords, apiRecords);

            const mergedLevel = {
                id: listed.id,
                name: listed.name || localData?.name || 'Unknown',
                position: listed.position,
                author: localData?.author || apiDetail?.publisher?.name || listed.publisher?.name || '',
                publisher: apiDetail?.publisher?.name || listed.publisher?.name || localData?.author || '',
                creators: mergeCreators(localData?.creators, apiDetail?.creators),
                verifier: apiDetail?.verifier?.name || listed.verifier?.name || localData?.verifier || '',
                verification: apiDetail?.video || listed.video || localData?.verification || '',
                video: apiDetail?.video || listed.video || localData?.verification || '',
                percentToQualify: listed.requirement ?? apiDetail?.requirement ?? localData?.percentToQualify ?? 100,
                thumbnail: apiDetail?.thumbnail || listed.thumbnail || '',
                level_id: apiDetail?.level_id || listed.level_id,
                showcase: localData?.showcase,
                records: mergedRecords,
                __source: 'hybrid',
            };

            return normalizeLevel(mergedLevel, { path: String(listed.id), position: listed.position });
        });

        tuples = results.map(level => [level, null]);
        lastFetchSource = 'api';
        console.log(`[PCdemonlist] ✓ Loaded ${tuples.length} demons from LIVE API (fast mode)`);

        // ── BACKGROUND: Fetch full details (records/victors) for all demons ──
        // This runs AFTER we return the initial list, so the page loads instantly.
        // Once details arrive, we merge new records into the cached tuples.
        if (listedDemons.length > 0) {
            backgroundFetchDetails(listedDemons, localDataMap, tuples);
        }

    } catch (apiErr) {
        // ── API failed → fall back to local JSON ─────────────
        console.warn('[PCdemonlist] API unreachable, falling back to local JSON:', apiErr.message);
        const localTuples = await fetchLocalDemonList();
        if (!localTuples) return null;
        tuples = localTuples;
        lastFetchSource = 'local';
        console.log(`[PCdemonlist] ✓ Loaded ${tuples.length} demons from LOCAL fallback`);
    }

    // ── Build lookup indexes (ID, path, name) ────────────────
    const byId = new Map();
    const byPath = new Map();
    const byName = new Map();

    tuples.forEach(([level], index) => {
        if (!level) return;
        byId.set(String(level.id), { level, index });
        byPath.set(String(level.path), { level, index });
        if (level.name) byName.set(level.name.toLowerCase(), { level, index });
    });

    // ── Apply level overrides ────────────────────────────────
    Object.entries(overrides.levelOverrides || {}).forEach(([key, override]) => {
        if (!override || key.startsWith('_') || override.enabled === false) return;

        const baseRef = String(override.sourceLevelId || override.id || override.levelId || key);
        const overrideName = String(override.name || '').toLowerCase();

        const match = byId.get(baseRef)
            || byPath.get(baseRef)
            || byPath.get(key)
            || byId.get(key)
            || (overrideName && byName.get(overrideName))
            || null;

        const level = normalizeLevelOverride(override, match?.level || null, key);

        if (match) {
            tuples[match.index] = [level, null];
            byId.set(String(level.id), { level, index: match.index });
            byPath.set(String(level.path), { level, index: match.index });
            if (level.name) byName.set(level.name.toLowerCase(), { level, index: match.index });
        } else {
            tuples.push([level, null]);
        }
    });

    // ── Sort by position, push errors to end ─────────────────
    const ok = tuples
        .filter(([level]) => level)
        .sort(([a], [b]) => Number(a.position || 9999) - Number(b.position || 9999));
    const errs = tuples.filter(([level, err]) => !level && err);
    const result = [...ok, ...errs];

    return result;
}

// ── Leaderboard ──────────────────────────────────────────────────────

function addScoreEntry(scoreMap, user, bucket, entry) {
    if (!user || isExcludedPlayer(user)) return;
    const key = Object.keys(scoreMap).find((u) => u.toLowerCase() === String(user).toLowerCase()) || user;
    scoreMap[key] ??= { verified: [], completed: [], progressed: [] };
    scoreMap[key][bucket].push(entry);
}

function normalizePlayerScoreItem(item = {}, bucket = 'completed') {
    return {
        rank: Number(item.rank || item.position || 0),
        level: String(item.level || item.levelName || '').trim(),
        percent: item.percent,
        score: Number(item.score || 0),
        link: String(item.link || item.video || item.url || '').trim(),
        id: item.id || item.levelId,
        type: bucket,
    };
}

function entryFromPlayerOverride(player) {
    const displayName = String(player.name || player.username || player.displayName || '').trim();

    const verified = asArray(player.verifications || player.verified)
        .map((item) => normalizePlayerScoreItem(item, 'verified'));
    const completed = asArray(player.completions || player.victories || player.completed)
        .map((item) => normalizePlayerScoreItem(item, 'completed'));
    const progressed = asArray(player.progressRecords || player.progressed || player.progress)
        .map((item) => normalizePlayerScoreItem(item, 'progressed'));
    const total = Number(player.points ?? player.total ?? [...verified, ...completed, ...progressed]
        .reduce((sum, item) => sum + Number(item.score || 0), 0));

    return {
        user: displayName,
        name: displayName,
        username: displayName,
        total: round(total),
        verified,
        completed,
        progressed,
        rankOverride: Number(player.rank || player.position || 0) || null,
        flag: player.countryFlag || player.flag || null,
        nationality: player.nationality || null,
        profile: player.profile || player.profileInformation || {},
        socials: player.socials || player.socialLinks || {},
        avatar: player.avatar || '',
        statistics: player.statistics || player.stats || {},
        __pointercrate: {
            object: 'player',
            source: 'playerOverrides',
            override: true,
        },
    };
}

function applyPlayerOverrides(entries, playerOverrides) {
    const byUser = new Map(entries.map((entry) => [normalizeLookupKey(entry.user), entry]));

    Object.entries(playerOverrides || {}).forEach(([key, player]) => {
        if (!player || key.startsWith('_') || player.enabled === false) return;

        const lookup = normalizeLookupKey(player.name || key);
        if (!lookup) return;

        // If this override only has removeRecords (no full profile replacement),
        // merge it with the existing computed entry rather than replacing it
        const existing = byUser.get(lookup);

        if (player.removeRecords && Array.isArray(player.removeRecords) && existing) {
            // Build a Set of normalized level names to remove
            const toRemove = new Set(
                player.removeRecords.map((name) => normalizeLookupKey(name))
            );

            const filterRecords = (records) =>
                (records || []).filter((r) => !toRemove.has(normalizeLookupKey(r.level)));

            const filtered = {
                ...existing,
                verified: filterRecords(existing.verified),
                completed: filterRecords(existing.completed),
                progressed: filterRecords(existing.progressed),
            };

            // Recalculate total score after removal
            filtered.total = round(
                [filtered.verified, filtered.completed, filtered.progressed]
                    .flat()
                    .reduce((sum, r) => sum + Number(r.score || 0), 0)
            );

            // Apply name/flag overrides if present
            if (player.name) { filtered.user = player.name; filtered.name = player.name; }
            if (player.countryFlag || player.flag) filtered.flag = player.countryFlag || player.flag;
            if (player.rank || player.position) filtered.rankOverride = Number(player.rank || player.position);

            byUser.set(lookup, filtered);
        } else {
            // Full override — replaces the entire player entry
            const overrideEntry = entryFromPlayerOverride({ ...player, name: player.name || key });
            byUser.set(lookup, overrideEntry);
        }
    });

    const withManualRanks = [];
    const regular = [];
    [...byUser.values()].forEach((entry) => {
        if (Number(entry.rankOverride) > 0) withManualRanks.push(entry);
        else regular.push(entry);
    });

    regular.sort((a, b) => Number(b.total || 0) - Number(a.total || 0));
    withManualRanks
        .sort((a, b) => Number(a.rankOverride) - Number(b.rankOverride))
        .forEach((entry) => {
            const index = Math.max(0, Math.min(regular.length, Number(entry.rankOverride) - 1));
            regular.splice(index, 0, entry);
        });

    return regular;
}

/**
 * Compute the full player leaderboard.
 *
 * Strategy:
 *   1. Build verified/completed/progressed lists from demon records (local + API)
 *   2. Fetch OFFICIAL rankings from Pointercrate v1 API for accurate points & names
 *   3. Merge: API score replaces computed score, API name replaces local name
 *   4. Apply playerOverrides on top
 *
 * This gives us: accurate Pointercrate points + complete record lists + overrides.
 */
export async function fetchPointercrateLeaderboard() {
    const [list, overrideState, apiRankings] = await Promise.all([
        fetchPointercrateDemons(),
        fetchOverrideState(),
        fetchApiPlayerRankings().catch(() => new Map()),
    ]);

    if (!list) return [null, []];

    console.log(`[PCdemonlist] Building leaderboard: ${apiRankings.size} API rankings loaded`);

    // ── Step 1: Build record lists from demon data ───────────────
    const scoreMap = {};
    const errs = [];
    list.forEach(([level, err], index) => {
        if (err) {
            errs.push(err);
            return;
        }

        const rank = index + 1;
        addScoreEntry(scoreMap, level.verifier, 'verified', {
            rank,
            level: level.name,
            score: score(rank, 100, level.percentToQualify),
            link: level.verification,
            id: level.id,
        });

        level.records.forEach((record) => {
            const bucket = Number(record.percent) >= 100 ? 'completed' : 'progressed';
            addScoreEntry(scoreMap, record.user, bucket, {
                rank,
                level: level.name,
                percent: Number(record.percent),
                score: score(rank, Number(record.percent), level.percentToQualify),
                link: record.link,
                id: level.id,
            });
        });
    });

    // ── Step 2: Build initial entries from records ────────────────
    const entries = Object.entries(scoreMap).map(([user, scores]) => {
        const computedTotal = [scores.verified, scores.completed, scores.progressed]
            .flat()
            .reduce((prev, cur) => prev + Number(cur.score || 0), 0);
        const flag = getPlayerNationality(user);
        return { user, total: round(computedTotal), flag, ...scores };
    });

    // ── Step 3: Merge with API rankings (points, names, flags) ───
    const byUser = new Map(entries.map((e) => [normalizeLookupKey(e.user), e]));

    // For entries that exist in the API rankings: use the API score & name
    byUser.forEach((entry, key) => {
        const ranking = apiRankings.get(key);
        if (ranking && !ranking.banned) {
            // Use the official Pointercrate score
            entry.total = round(ranking.score);
            // Use the official Pointercrate name (auto-updating)
            entry.user = ranking.name;
            entry.name = ranking.name;
            // Use the official nationality
            if (ranking.countryCode) entry.flag = ranking.countryCode;
        }
    });

    // Add any API-ranked players who DON'T appear in our records
    // (they may have records on extended/legacy list that we don't track)
    apiRankings.forEach((ranking, key) => {
        if (isExcludedPlayer(ranking.name || key)) return;
        if (ranking.banned) return;
        if (!byUser.has(key)) {
            byUser.set(key, {
                user: ranking.name,
                name: ranking.name,
                total: round(ranking.score),
                flag: ranking.countryCode,
                verified: [],
                completed: [],
                progressed: [],
            });
        }
    });

    return [applyPlayerOverrides([...byUser.values()], overrideState.playerOverrides), errs];
}

// ── Recent Changes ───────────────────────────────────────────────────

function snapshotFromLevel(level, position) {
    return {
        id: String(level.id),
        name: level.name,
        position,
        points: score(position, 100, level.percentToQualify),
        verifier: level.verifier,
        creators: [...(level.creators || [])].sort(),
    };
}

const CHANGES_STORAGE_KEY = 'pcdl_recent_changes';

/**
 * Load previously detected changes from localStorage.
 * Each stored change has its original first-detected date preserved.
 */
function loadStoredChanges() {
    try {
        const raw = localStorage.getItem(CHANGES_STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

/**
 * Save detected changes to localStorage so dates persist across sessions.
 */
function saveStoredChanges(changes) {
    try {
        localStorage.setItem(CHANGES_STORAGE_KEY, JSON.stringify(changes));
    } catch { /* storage full or unavailable */ }
}

/**
 * Generate a unique key for a change so we can match stored vs new.
 */
function changeKey(change) {
    return `${change.type}:${change.title}:${change.summary}`;
}

/**
 * Load the FILE-BASED snapshot for comparison.
 * This is the baseline — it represents the last known stable state of the list.
 * We NEVER overwrite this with live data; it stays as a fixed reference point.
 */
async function loadBaselineSnapshot() {
    return fetchJson('_recent_changes_snapshot.json', []);
}

/**
 * Automatically detect recent changes by comparing the current LIVE list
 * against the file-based snapshot (`_recent_changes_snapshot.json`).
 *
 * SMART FILTERING: Only shows meaningful changes:
 *   - New demons added to the list
 *   - Demons removed from the list
 *   - Demons that moved up/down due to DIFFICULTY RECALCULATION
 *     (NOT cascade shifts from other demons being added/removed)
 *
 * When a new demon is inserted at position X, every demon at X or below
 * shifts down by 1. That's just a cascade — not a real change. We filter
 * those out by computing the "expected" position after accounting for
 * all insertions above and removals above each demon.
 *
 * @param {Object} options
 * @param {number} options.limit  Max changes to return (default 50)
 */
export async function fetchRecentChanges({ limit = 50 } = {}) {
    const [list, snapshot] = await Promise.all([
        fetchPointercrateDemons(),
        loadBaselineSnapshot(),
    ]);

    if (!Array.isArray(list) || !Array.isArray(snapshot) || snapshot.length === 0) {
        return loadStoredChanges().slice(0, limit);
    }

    const current = list
        .filter(([level]) => level)
        .map(([level], index) => snapshotFromLevel(level, index + 1));
    const currentById = new Map(current.map((entry) => [entry.id, entry]));
    const snapshotById = new Map(snapshot.map((entry) => [String(entry.id), entry]));
    const now = new Date().toISOString();

    // ── Step 1: Find all new additions and removals ──────────────
    const additions = [];  // { id, position } — new demons in current but not snapshot
    const removals = [];   // { id, position } — old demons in snapshot but not current

    current.forEach((entry) => {
        if (!snapshotById.has(entry.id)) {
            additions.push({ id: entry.id, position: entry.position });
        }
    });

    snapshot.forEach((entry) => {
        if (!currentById.has(String(entry.id))) {
            removals.push({ id: String(entry.id), position: Number(entry.position) });
        }
    });

    // ── Step 2: For each existing demon, compute cascade offset ──
    // Cascade offset = (additions above this demon) - (removals above this demon)
    // If a demon's old position + cascade offset = new position → it's just a cascade shift
    // If not → it's a REAL movement (difficulty recalculation)

    const freshChanges = [];

    current.forEach((entry, index) => {
        const previous = snapshotById.get(entry.id);

        // Build "between X and Y" context string
        let betweenStr = '';
        if (index > 0 && index < current.length - 1) {
            betweenStr = `, between ${current[index - 1].name} and ${current[index + 1].name}`;
        } else if (index === 0 && current.length > 1) {
            betweenStr = `, above ${current[1].name}`;
        } else if (index === current.length - 1 && index > 0) {
            betweenStr = `, below ${current[index - 1].name}`;
        }

        if (!previous) {
            // ── NEW DEMON added to the list ──
            freshChanges.push({
                type: 'add',
                date: now,
                title: entry.name,
                detail: `${entry.name} added to the Demonlist at #${entry.position}`,
                summary: `added to the Demonlist at #${entry.position}${betweenStr}`,
            });
            return;
        }

        const prevPos = Number(previous.position);
        const curPos = Number(entry.position);
        if (prevPos === curPos) return; // no movement

        // Count how many additions are above this demon's CURRENT position
        const additionsAbove = additions.filter(a => a.position <= curPos).length;
        // Count how many removals were above this demon's OLD position
        const removalsAbove = removals.filter(r => r.position <= prevPos).length;

        // Expected position = old position + additions above - removals above
        const cascadeOffset = additionsAbove - removalsAbove;
        const expectedPos = prevPos + cascadeOffset;

        // If current position matches expected → pure cascade, skip it
        if (curPos === expectedPos) return;

        // ── REAL MOVEMENT (difficulty recalculation) ──
        const direction = curPos < prevPos ? 'up' : 'down';
        const arrow = direction === 'up' ? '\u2191' : '\u2193';
        freshChanges.push({
            type: direction,
            date: now,
            title: entry.name,
            detail: `${entry.name} ${arrow} moved ${direction} from #${prevPos} to #${curPos}`,
            summary: `moved ${direction} ${arrow} #${prevPos} \u2192 #${curPos}${betweenStr}`,
        });
    });

    // ── Demons removed from the list ──
    snapshot.forEach((entry) => {
        if (currentById.has(String(entry.id))) return;
        freshChanges.push({
            type: 'remove',
            date: now,
            title: entry.name || `Demon #${entry.position}`,
            detail: `${entry.name} fell off the Demonlist (was #${entry.position})`,
            summary: `fell off the Demonlist (was #${entry.position})`,
        });
    });

    // If no changes detected, return previously stored changes
    if (freshChanges.length === 0) {
        const stored = loadStoredChanges();
        if (stored.length > 0) return stored.slice(0, limit);
        return [];
    }

    // ── Merge with stored changes (preserve original first-detected dates) ──
    const stored = loadStoredChanges();
    const storedByKey = new Map(stored.map((c) => [changeKey(c), c]));

    const merged = freshChanges.map((change) => {
        const key = changeKey(change);
        const existing = storedByKey.get(key);
        if (existing) {
            return { ...change, date: existing.date };
        }
        return change;
    });

    // Sort: additions first, then up/down movements, then removals
    const typePriority = { add: 0, up: 1, down: 2, remove: 3 };
    merged.sort((a, b) => {
        const typeDiff = (typePriority[a.type] ?? 9) - (typePriority[b.type] ?? 9);
        if (typeDiff !== 0) return typeDiff;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    saveStoredChanges(merged);

    return merged.slice(0, limit);
}
