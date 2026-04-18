/**
 * Utility to handle player flags based on 2kplayerflags.txt
 */

let flagData = window.Vue.reactive({
    playerToFlag: {},
    flagIdToName: {}
});

const allEntries = [];

/**
 * Normalize names for comparison:
 * 1. Lowercase
 * 2. Remove clan tags in [...] or (...)
 * 3. Remove all spaces
 */
function normalizeName(name) {
    if (!name) return '';
    return name.toLowerCase()
        .replace(/\[.*?\]/g, '')
        .replace(/\(.*?\)/g, '')
        .replace(/\s+/g, '');
}

/**
 * Fetch and parse the flags data
 */
export async function initFlags() {
    try {
        const response = await fetch('./2kplayerflags.txt');
        const text = await response.text();

        // 1. Parse FLAG IDS
        const flagIdsMatch = text.match(/FLAG IDS:\s*(\{[\s\S]*?\})/);
        if (flagIdsMatch) {
            try {
                const cleanJson = flagIdsMatch[1].replace(/,\s*([\}\]])/g, '$1');
                flagData.flagIdToName = JSON.parse(cleanJson);
            } catch (e) { console.error('[Flags] FLAG IDS parse error', e); }
        }

        // 2. Parse PLAYERS
        const playersMatch = text.match(/PLAYERS\s*:\s*(\{[\s\S]*?\})/);
        if (playersMatch) {
            let rawPlayers = {};
            try {
                const cleanJson = playersMatch[1].replace(/,\s*([\}\]])/g, '$1');
                rawPlayers = JSON.parse(cleanJson);
            } catch (e) {
                console.warn('[Flags] JSON parse failed, using line-fallback');
                const lines = playersMatch[1].split('\n');
                for (const line of lines) {
                    const m = line.match(/"(.*?)"\s*:\s*"(.*?)"/);
                    if (m) rawPlayers[m[1]] = m[2];
                }
            }

            allEntries.length = 0;
            for (const fullKey in rawPlayers) {
                const flagId = rawPlayers[fullKey];
                
                // key example: "#85 [GNG] aidn76" or "#1 [67] Zoink8385.58"
                // 1. Remove rank
                const keyNoRank = fullKey.replace(/^#\d+\s+/, '');
                // 2. Normalize (remove tags and spaces)
                const norm = normalizeName(keyNoRank);
                
                if (norm) {
                    allEntries.push({ norm, flagId });
                }
            }
            console.log(`[Flags] Successfully loaded ${allEntries.length} player mappings.`);
        }
    } catch (e) {
        console.error('[Flags] Initialization failed', e);
    }
}

/**
 * Get flag ID for a player name
 * @param {string} playerName 
 * @returns {string|null} Flag ID (e.g., 'us', 'ar')
 */
export function getPlayerFlag(playerName) {
    if (!playerName || !allEntries.length) return null;
    
    // Normalize target name (Remove tags and spaces)
    const target = normalizeName(playerName);
    
    // Find matching entry
    for (const entry of allEntries) {
        // If the key in the file starts with the player character
        if (entry.norm.startsWith(target)) {
            const remainder = entry.norm.slice(target.length);
            // The remainder must be empty or just digits/dots (the score)
            // This ensures "Aidn" matches "Aidn76" (score 76) 
            // OR "Aidn76" matches "Aidn76" (no score)
            // OR "Zoink" matches "Zoink8385.58" (score 8385.58)
            if (/^[0-9\.]*$/.test(remainder)) {
                return entry.flagId;
            }
        }
    }
    
    return null;
}






/**
 * Get all available flags for the dropdown
 * @returns {Array<{id: string, name: string}>}
 */
export function getAllFlags() {
    return Object.entries(flagData.flagIdToName).map(([fullName, id]) => {
        // Strip country code from name (e.g., "ALAlbania" -> "Albania")
        const name = fullName.replace(/^[A-Z]{2}/, '');
        return { id, name };
    }).sort((a, b) => a.name.localeCompare(b.name));
}
