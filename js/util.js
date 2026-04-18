// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    if (typeof url !== 'string') return '';
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

export function embed(video) {
    const videoId = getYoutubeIdFromUrl(video);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
}

export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 3 });
}

export function getThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}
export function getPercentNumber(p) {
    if (typeof p === 'number') return p;
    const str = String(p);
    if (str.includes('-')) {
        const nums = str.split('-').map(n => parseFloat(n.trim()));
        // E.g., "25-100" -> roughly prioritize by segment length or highest point 
        return !isNaN(nums[1]) ? nums[1] - 0.01 : 0; 
    }
    return parseFloat(str) || 0;
}
