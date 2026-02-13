import { round, score } from './score.js';

export async function fetchList() {
    try {
        const res = await fetch("/data/top_75_demons.json");
        const demons = await res.json();
        return demons;
    } catch (err) {
        console.error("Failed to load top 75 JSON:", err);
        return [];
    }
}
