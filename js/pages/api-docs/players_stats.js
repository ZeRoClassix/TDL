export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>🎮 Player Statistics</h1>
            <p class="lead">Comprehensive statistics for players and global analytics.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v1/players/{player_id}/stats</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Get detailed statistics for a specific player.</p>

                <h3>Path Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                    <tr><td>player_id</td><td>string</td><td>Player ID (plr_*) or player name</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "player_id": "plr_7a2b4c6d8e0f",
    "name": "nSwish",
    "overview": {
      "total_attempts": 15420,
      "total_attempts_time": "452h 15m",
      "join_date": "2019-03-15T00:00:00Z",
      "days_active": 892
    },
    "records": {
      "total_submitted": 234,
      "verified": 230,
      "rejected": 4,
      "pending": 0,
      "completion_rate": 98.29
    },
    "demons": {
      "completed": 567,
      "main_list": 156,
      "extended_list": 234,
      "legacy_list": 177,
      "hardest": {
        "name": "Silent Clubstep",
        "position": 5,
        "completed_at": "2023-12-20T14:30:00Z"
      },
      "by_difficulty": {
        "extreme_demon": 89,
        "hard_demon": 234,
        "medium_demon": 178,
        "easy_demon": 66
      }
    },
    "performance": {
      "avg_attempts_per_demon": 27.2,
      "fastest_completion": {
        "demon": "The Nightmare",
        "attempts": 3,
        "time": "15m 42s"
      },
      "most_attempted": {
        "demon": "Silent Clubstep",
        "attempts": 8542
      }
    },
    "activity": {
      "records_last_30_days": 12,
      "records_last_90_days": 34,
      "most_active_day": "Saturday",
      "avg_records_per_month": 8.5
    }
  },
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_8q0s2u4w6y8a",
    "stats_updated": "2024-01-20T15:00:00Z"
  }
}</code></pre>
            </div>

            <div class="endpoint-block v2-section">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v2/players/stats/aggregated</code>
                    <span class="badge v2">v2</span>
                </div>
                <p class="endpoint-desc">Get aggregated statistics across all players (public endpoint, no auth required for limited data).</p>

                <h3>Query Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                    <tr><td>detailed</td><td>boolean</td><td>Include detailed stats (requires auth)</td></tr>
                    <tr><td>country</td><td>string</td><td>Filter by country</td></tr>
                    <tr><td>period</td><td>string</td><td>all, year, month</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "total_players": 15432,
    "active_players_30d": 5432,
    "total_records": 87654,
    "total_verified_records": 85432,
    "total_demons_completed": 234567,
    "top_countries": [
      {"country": "US", "players": 3456, "records": 12345},
      {"country": "CA", "players": 1234, "records": 5678},
      {"country": "UK", "players": 987, "records": 4321}
    ],
    "device_distribution": {
      "PC": 8923,
      "Mobile": 5432,
      "Both": 1077
    },
    "trends": {
      "new_players_30d": 234,
      "new_records_30d": 1234,
      "avg_completion_rate": 94.5
    }
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_0s2u4w6y8a0c"
  }
}</code></pre>
            </div>
        </div>
    `;
}
