/**
 * Numbers of decimal digits to round to
 */
const scale = 2;

/**
 * Calculate the score awarded when having a certain percentage on a list level
 * @param {Number} rank Position on the list
 * @param {Number} percent Percentage of completion
 * @param {Number} minPercent Minimum percentage required
 * @returns {Number} Rounded to 2 decimals
 */
export function score(rank, percent, minPercent) {
    if (rank > 150) return 0;
    if (rank > 75 && percent < 100) return 0;

    // Formula
    let baseScore = (-24.9975 * Math.pow(rank - 1, 0.4) + 350) *
        ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));

    baseScore = Math.max(0, baseScore);

    if (percent !== 100) {
        return round(baseScore - baseScore / 3);
    }

    return round(baseScore);
}

/**
 * Round a number to 2 decimals
 * @param {Number} num
 * @returns {Number} Rounded number
 */
export function round(num) {
    return Math.round((num + Number.EPSILON) * Math.pow(10, scale)) / Math.pow(10, scale);
}
