import { round, score } from './score.js';

/**
 * Path to directory containing `_list.json` and all levels
 */
const dir = 'data';

export async function fetchList() {
    const listResult = await fetch(`${dir}/_list.json`);
    try {
        const list = await listResult.json();
        return await Promise.all(
            list.map(async (path, rank) => {
                const levelResult = await fetch(`${dir}/${path}.json`);
                try {
                    const level = await levelResult.json();
                    return [
                        {
                            ...level,
                            path,
                            records: level.records.sort(
                                (a, b) => b.percent - a.percent,
                            ),
                        },
                        null,
                    ];
                } catch {
                    console.error(`Failed to load level #${rank + 1} ${path}.`);
                    return [null, path];
                }
            }),
        );
    } catch {
        console.error(`Failed to load list.`);
        return null;
    }
}

export async function fetchEditors() {
    try {
        const editorsResults = await fetch(`${dir}/_editors.json`);
        const editors = await editorsResults.json();
        return editors;
    } catch {
        return null;
    }
}

export async function fetchLeaderboard() {
    const list = await fetchList();

    const scoreMap = {};
    const errs = [];
    list.forEach(([level, err], rank) => {
        if (err) {
            errs.push(err);
            return;
        }

        // Verification
        const verifier = Object.keys(scoreMap).find(
            (u) => u.toLowerCase() === level.verifier.toLowerCase(),
        ) || level.verifier;
        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
        };
        const { verified } = scoreMap[verifier];
        verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(rank + 1, 100, level.percentToQualify),
            link: level.verification,
        });

        // Records
        level.records.forEach((record) => {
            const user = Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === record.user.toLowerCase(),
            ) || record.user;
            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };
            const { completed, progressed } = scoreMap[user];
            if (record.percent === 100) {
                completed.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(rank + 1, 100, level.percentToQualify),
                    link: record.link,
                });
                return;
            }

            progressed.push({
                rank: rank + 1,
                level: level.name,
                percent: record.percent,
                score: score(rank + 1, record.percent, level.percentToQualify),
                link: record.link,
            });
        });
    });

    // Wrap in extra Object containing the user and total score
    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;
        const total = [verified, completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        return {
            user,
            total: round(total),
            ...scores,
        };
    });

    // Sort by total score
    return [res.sort((a, b) => b.total - a.total), errs];
}

/**
 * Fetch the future demons list
 */
export async function fetchFutureDemons() {
    const listResult = await fetch(`${dir}/_future_list.json`);
    try {
        const list = await listResult.json();
        return await Promise.all(
            list.map(async (path) => {
                const demonResult = await fetch(`${dir}/${path}.json`);
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
            const playerRecords = demon.records.filter(r => 
                r.user.toLowerCase() === username.toLowerCase()
            );
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
