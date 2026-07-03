import { resolveAppUrl } from './appPaths.js';
import {
    fetchPointercrateDemons,
    fetchPointercrateLeaderboard,
    fetchRecentChanges as fetchPointercrateRecentChanges,
} from './pointercrateApi.js';

/**
 * Path to directory containing `_list.json` and all levels
 */
const dir = 'data';
const dataUrl = (path) => resolveAppUrl(`${dir}/${path}`);

export async function fetchList() {
    const list = await fetchPointercrateDemons();
    if (list) return list;

    try {
        throw new Error('Pointercrate-style list loader returned no data.');
    } catch {
        console.error(`Failed to load list.`);
        return null;
    }
}

export async function fetchEditors() {
    try {
        const editorsResults = await fetch(dataUrl('_editors.json'));
        const editors = await editorsResults.json();
        return editors;
    } catch {
        return null;
    }
}

export async function fetchLeaderboard() {
    return fetchPointercrateLeaderboard();
}

export async function fetchRecentChanges(options) {
    return fetchPointercrateRecentChanges(options);
}

/**
 * Fetch the future demons list
 */
export async function fetchFutureDemons() {
    const listResult = await fetch(dataUrl('_future_list.json') + `?t=${Date.now()}`);
    try {
        const list = await listResult.json();
        return await Promise.all(
            list.map(async (path) => {
                const demonResult = await fetch(dataUrl(`${path}.json`) + `?t=${Date.now()}`);
                try {
                    const demon = await demonResult.json();
                    return {
                        ...demon,
                        id: path.replace(/_/g, '-'),
                        path,
                        records: demon.records ? demon.records.sort((a, b) => b.percent - a.percent) : [],
                    };
                } catch {
                    // Silently handle missing files - don't log to console
                    return null;
                }
            }),
        ).then(demons => demons.filter(d => d !== null));
    } catch {
        console.error(`Failed to load future demons list.`);
        return null;
    }
}

/**
 * Fetch all future records (aggregated from all future demons)
 */
export async function fetchFutureRecords() {
    const demons = await fetchFutureDemons();
    if (!demons) return [];
    
    const allRecords = [];
    demons.forEach(demon => {
        if (demon.records) {
            demon.records.forEach(record => {
                allRecords.push({
                    ...record,
                    demonId: demon.id,
                    demonName: demon.name,
                });
            });
        }
    });
    
    return allRecords.sort((a, b) => b.percent - a.percent);
}

/**
 * Fetch future demons progress for a specific player
 */
export async function fetchFutureProgress(username) {
    const demons = await fetchFutureDemons();
    if (!demons) return [];
    
    const progress = [];
    demons.forEach(demon => {
        if (demon.records) {
            const playerRecords = demon.records.filter(r => {
                const u = r.user || r.username;
                return u && u.toLowerCase() === username.toLowerCase();
            });
            if (playerRecords.length > 0) {
                const bestRecord = playerRecords.sort((a, b) => b.percent - a.percent)[0];
                progress.push({
                    demonId: demon.id,
                    demonName: demon.name,
                    percent: bestRecord.percent,
                    video: bestRecord.video || bestRecord.link,
                    date: bestRecord.date,
                    status: bestRecord.status || demon.status || null,
                    isWR: false // Will be determined by caller
                });
            }
        }
    });
    
    return progress.sort((a, b) => b.percent - a.percent);
}
