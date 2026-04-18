// Mock future demon data for demons that don't have JSON files yet
// This prevents fetch errors while maintaining functionality

export const mockFutureDemons = {
    // Demons that have actual JSON files
    "adramelech": {
        id: "future-adramelech",
        name: "Adramelech",
        author: "Rico",
        creators: ["Rico", "Gorochi"],
        verificationStatus: "open",
        difficultyCategory: "hardest",
        estimatedPlace: 15,
        placementContext: { above: "Acheron", below: "Avernus", reason: "Extremely difficult wave sections combined with tight ship timings. Estimated to be slightly harder than Avernus but lacks the consistency needed to surpass Acheron." },
        verification: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        showcase: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        description: "A challenging upcoming extreme demon featuring intricate wave gameplay and precise timings. Currently in open verification with multiple players attempting to verify.",
        devStatus: "In Verification",
        estimatedRelease: "Late 2025",
        completionPercent: 95,
        gameVersion: "2.2",
        song: "Adramelech by Dimrain47",
        records: [
            { user: "GDonut", percent: 78, video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", date: "2025-01-15" },
            { user: "ChaSe", percent: 65, video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", date: "2025-01-10" }
        ]
    },
    "aeternus": {
        id: "future-aeternus",
        name: "Aeternus",
        author: "-",
        creators: [],
        verificationStatus: "unknown",
        difficultyCategory: "hardest",
        estimatedPlace: null,
        placementContext: { above: null, below: null, reason: null },
        verification: null,
        showcase: "https://www.youtube.com/watch?v=3IjecL747vs?si=UdCikYQyJ3uTJPnB",
        description: "Upcoming Extreme Demon.",
        devStatus: "Still Being Made",
        estimatedRelease: null,
        completionPercent: null,
        gameVersion: "2.2",
        song: null,
        records: []
    },
    "dead-silence": {
        id: "future-dead-silence",
        name: "Dead Silence",
        author: "-",
        creators: [],
        verificationStatus: "unknown",
        difficultyCategory: "hardest",
        estimatedPlace: null,
        placementContext: { above: null, below: null, reason: null },
        verification: null,
        showcase: null,
        description: "Upcoming Extreme Demon.",
        devStatus: "Still Being Made",
        estimatedRelease: null,
        completionPercent: null,
        gameVersion: "2.2",
        song: null,
        records: []
    },
    "exasperation": {
        id: "future-exasperation",
        name: "Exasperation",
        author: "-",
        creators: [],
        verificationStatus: "unknown",
        difficultyCategory: "hardest",
        estimatedPlace: null,
        placementContext: { above: null, below: null, reason: null },
        verification: null,
        showcase: null,
        description: "Upcoming Extreme Demon.",
        devStatus: "Still Being Made",
        estimatedRelease: null,
        completionPercent: null,
        gameVersion: "2.2",
        song: null,
        records: []
    }
};

// Function to get mock demon data
export function getMockFutureDemon(id) {
    return mockFutureDemons[id] || null;
}

// Function to get all mock demons
export function getAllMockFutureDemons() {
    return Object.entries(mockFutureDemons).map(([id, demon]) => ({
        ...demon,
        id,
        path: id
    }));
}
