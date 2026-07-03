export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>🎮 Player Rankings</h1>
            <p class="lead">Get detailed ranking information for players.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v1/players/{player_id}/ranking</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Get detailed ranking information for a specific player.</p>

                <h3>Path Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                    <tr><td>player_id</td><td>string</td><td>Player ID (plr_*) or player name</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "player": {
      "id": "plr_7a2b4c6d8e0f",
      "name": "nSwish",
      "rank": 1,
      "points": 125847.5
    },
    "ranking": {
      "global_rank": 1,
      "country_rank": 1,
      "device_rank": 1,
      "previous_rank": 2,
      "rank_change": 1,
      "rank_trend": "up"
    },
    "points_breakdown": {
      "total": 125847.5,
      "from_records": 120000.0,
      "from_completions": 5847.5,
      "demons": [
        {"name": "Silent Clubstep", "points": 5000.0, "percent": 100},
        {"name": "Acheron", "points": 4500.0, "percent": 100}
      ]
    },
    "comparison": {
      "ahead_of": {
        "name": "SecondPlace",
        "points": 123456.7,
        "points_diff": 2390.8
      },
      "behind": null
    },
    "history": [
      {
        "date": "2024-01-01T00:00:00Z",
        "rank": 3,
        "points": 110000.0
      },
      {
        "date": "2024-01-15T00:00:00Z",
        "rank": 2,
        "points": 118000.0
      },
      {
        "date": "2024-01-20T00:00:00Z",
        "rank": 1,
        "points": 125847.5
      }
    ]
  },
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_4m6o8q0s2u4w",
    "calculated_at": "2024-01-20T15:00:00Z"
  }
}</code></pre>
            </div>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v1/players/rankings/top</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Get top players leaderboard.</p>

                <h3>Query Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th></tr>
                    <tr><td>limit</td><td>integer</td><td>Number of players (max 100)</td><td>100</td></tr>
                    <tr><td>country</td><td>string</td><td>Filter by country</td><td>-</td></tr>
                    <tr><td>device</td><td>string</td><td>Filter by device</td><td>-</td></tr>
                    <tr><td>period</td><td>string</td><td>all, year, month, week</td><td>all</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "rankings": [
      {
        "rank": 1,
        "player": {
          "id": "plr_7a2b4c6d8e0f",
          "name": "nSwish",
          "country": "US",
          "points": 125847.5
        }
      },
      {
        "rank": 2,
        "player": {
          "id": "plr_3e5f7a9b1c3d",
          "name": "Technical",
          "country": "CA",
          "points": 118923.0
        }
      }
    ],
    "filters_applied": {
      "period": "all",
      "limit": 100
    }
  },
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_6o8q0s2u4w6y"
  }
}</code></pre>
            </div>

            <h3>Error Responses</h3>
            <div class="error-block">
                <h4>404 Not Found</h4>
                <pre><code>{
  "error": {
    "code": 40402,
    "message": "Player Not Found",
    "details": "No player found with ID 'plr_invalid'"
  }
}</code></pre>
            </div>
        </div>
    `;
}
