export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>🏆 Leaderboards</h1>
            <p class="lead">Comprehensive leaderboard data and rankings.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v1/leaderboards/</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Get the complete leaderboard with all player rankings.</p>

                <h3>Query Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th></tr>
                    <tr><td>page</td><td>integer</td><td>Page number</td><td>1</td></tr>
                    <tr><td>limit</td><td>integer</td><td>Players per page (max 100)</td><td>50</td></tr>
                    <tr><td>country</td><td>string</td><td>Filter by country code</td><td>-</td></tr>
                    <tr><td>device</td><td>string</td><td>PC, Mobile, or Both</td><td>-</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "player": {
          "id": "plr_7a2b4c6d8e0f",
          "name": "nSwish",
          "country": "US",
          "device": "PC"
        },
        "points": 125847.5,
        "records_count": 234,
        "demons_completed": 567
      },
      {
        "rank": 2,
        "player": {
          "id": "plr_3e5f7a9b1c3d",
          "name": "Technical",
          "country": "CA",
          "device": "PC"
        },
        "points": 118923.0,
        "records_count": 198,
        "demons_completed": 489
      }
    ],
    "stats": {
      "total_players": 15432,
      "points_total": 123456789.5,
      "records_total": 87654
    }
  },
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_0m2o4q6s8u0w"
  },
  "pagination": {
    "total": 15432,
    "page": 1,
    "limit": 50,
    "pages": 309
  }
}</code></pre>
            </div>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v1/leaderboards/country/{country_code}</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Get country-specific leaderboard rankings.</p>

                <h3>Path Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                    <tr><td>country_code</td><td>string</td><td>2-letter country code (e.g., US, CA, UK)</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "country": {
      "code": "US",
      "name": "United States",
      "flag": "🇺🇸"
    },
    "leaderboard": [
      {
        "country_rank": 1,
        "global_rank": 1,
        "player": {
          "id": "plr_7a2b4c6d8e0f",
          "name": "nSwish"
        },
        "points": 125847.5
      }
    ],
    "country_stats": {
      "total_players": 3456,
      "total_points": 23456789.5,
      "avg_points": 6789.5,
      "records_count": 12345
    }
  },
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_2o4q6s8u0w2y"
  }
}</code></pre>
            </div>

            <div class="endpoint-block v2-section">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v2/leaderboards/hall-of-fame</code>
                    <span class="badge v2">v2</span>
                </div>
                <p class="endpoint-desc">Hall of Fame for top achievements and special rankings.</p>

                <h3>Query Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                    <tr><td>category</td><td>string</td><td>first_victors, most_records, hardest_demon</td></tr>
                    <tr><td>year</td><td>integer</td><td>Filter by year</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "first_victors": [
      {
        "demon": "Silent Clubstep",
        "player": "nSwish",
        "date": "2023-06-15T14:30:00Z",
        "days_after_verification": 0
      }
    ],
    "most_records_2024": [
      {
        "player": "nSwish",
        "records_count": 45,
        "points_gained": 2250.0
      }
    ],
    "rising_stars": [
      {
        "player": "NewPlayer2024",
        "rank_jump": 150,
        "points_growth": 150.0
      }
    ]
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_4q6s8u0w2y4a"
  }
}</code></pre>
            </div>
        </div>
    `;
}
