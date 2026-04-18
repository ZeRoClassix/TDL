export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>🎮 List Players</h1>
            <p class="lead">Retrieve a list of Geometry Dash players from the demonlist.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v1/players/</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Get a paginated list of players with their statistics and rankings.</p>

                <h3>Request Headers</h3>
                <table class="api-table params">
                    <tr><th>Header</th><th>Required</th><th>Description</th></tr>
                    <tr><td>Authorization</td><td>Yes</td><td>Bearer {api_key}</td></tr>
                </table>

                <h3>Query Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th></tr>
                    <tr><td>page</td><td>integer</td><td>Page number</td><td>1</td></tr>
                    <tr><td>limit</td><td>integer</td><td>Items per page (max 100)</td><td>50</td></tr>
                    <tr><td>sort</td><td>string</td><td>rank, points, name, records, completions</td><td>rank</td></tr>
                    <tr><td>order</td><td>string</td><td>asc or desc</td><td>asc</td></tr>
                    <tr><td>country</td><td>string</td><td>Filter by country code</td><td>-</td></tr>
                    <tr><td>device</td><td>string</td><td>Filter by device (PC, Mobile, Both)</td><td>-</td></tr>
                    <tr><td>active</td><td>boolean</td><td>Filter by active status</td><td>-</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": [
    {
      "id": "plr_7a2b4c6d8e0f",
      "name": "nSwish",
      "rank": 1,
      "points": 125847.5,
      "country": "US",
      "device": "PC",
      "records_count": 234,
      "verified_records": 230,
      "completions_count": 567,
      "hardest_demon": {
        "id": "dmn_9c3d5e7f1a2b",
        "name": "Silent Clubstep",
        "position": 5
      },
      "recent_records": [
        {
          "demon_id": "dmn_abc123",
          "demon_name": "Acheron",
          "percent": 100,
          "date": "2024-01-20T14:30:00Z"
        }
      ],
      "last_active": "2024-01-20T14:30:00Z",
      "is_active": true
    }
  ],
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_2k4m6o8q0s2u"
  },
  "pagination": {
    "total": 15432,
    "page": 1,
    "limit": 50,
    "pages": 309,
    "has_next": true,
    "has_prev": false
  }
}</code></pre>
            </div>

            <div class="endpoint-block v2-section">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v2/players/</code>
                    <span class="badge v2">v2</span>
                </div>
                <p class="endpoint-desc">Enhanced player listing with cursor pagination and advanced filtering.</p>

                <h3>Additional Query Parameters (v2)</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                    <tr><td>cursor</td><td>string</td><td>Cursor for pagination</td></tr>
                    <tr><td>search</td><td>string</td><td>Search by player name</td></tr>
                    <tr><td>min_points</td><td>number</td><td>Minimum points threshold</td></tr>
                    <tr><td>max_points</td><td>number</td><td>Maximum points threshold</td></tr>
                    <tr><td>has_records</td><td>boolean</td><td>Only players with verified records</td></tr>
                    <tr><td>joined_after</td><td>date</td><td>Players active after date</td></tr>
                    <tr><td>fields</td><td>string</td><td>Field projection</td></tr>
                </table>
            </div>

            <h3>Error Responses</h3>
            <div class="error-block">
                <h4>401 Unauthorized</h4>
                <pre><code>{
  "error": {
    "code": 40100,
    "message": "Authentication Required",
    "details": "Valid API key required"
  }
}</code></pre>
            </div>
        </div>
    `;
}
