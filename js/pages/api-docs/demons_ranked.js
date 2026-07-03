export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>👹 Ranked Demons List</h1>
            <p class="lead">Get the current ranked demonlist with position changes.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v1/demons/ranked</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Get the ranked demonlist with position history and change tracking.</p>

                <h3>Query Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th></tr>
                    <tr><td>limit</td><td>integer</td><td>Number of demons (max 150)</td><td>75</td></tr>
                    <tr><td>include_changes</td><td>boolean</td><td>Include position changes</td><td>true</td></tr>
                    <tr><td>period</td><td>string</td><td>Compare to (day, week, month)</td><td>week</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "list_info": {
      "name": "PC Demonlist - Main",
      "positions": 75,
      "last_updated": "2024-01-20T00:00:00Z",
      "next_update_scheduled": "2024-01-27T00:00:00Z"
    },
    "demons": [
      {
        "position": 1,
        "demon": {
          "id": "dmn_9c3d5e7f1a2b",
          "name": "Silent Clubstep",
          "publisher": "Serponge",
          "verifier": "nSwish"
        },
        "change": {
          "previous_position": 1,
          "change": 0,
          "trend": "stable"
        }
      },
      {
        "position": 3,
        "demon": {
          "id": "dmn_4g6i8k0m2o4q",
          "name": "Acheron",
          "publisher": "RicoX"
        },
        "change": {
          "previous_position": 5,
          "change": 2,
          "trend": "up"
        }
      },
      {
        "position": 15,
        "demon": {
          "id": "dmn_new_2024",
          "name": "New Extreme Demon",
          "publisher": "CreatorGD"
        },
        "change": {
          "previous_position": null,
          "change": null,
          "trend": "new"
        }
      }
    ],
    "summary": {
      "new_this_week": 2,
      "moved_up": 12,
      "moved_down": 12,
      "stable": 49
    }
  },
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_4w6y8a0c2e4g"
  }
}</code></pre>

                <div class="info-block">
                    <h4>Position Change Trends</h4>
                    <ul>
                        <li><strong>stable:</strong> Position unchanged</li>
                        <li><strong>up:</strong> Moved up in ranking (lower position number)</li>
                        <li><strong>down:</strong> Moved down in ranking (higher position number)</li>
                        <li><strong>new:</strong> Newly added to the list</li>
                        <li><strong>removed:</strong> Removed from the list</li>
                    </ul>
                </div>
            </div>

            <div class="endpoint-block v2-section">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v2/demons/ranked/history</code>
                    <span class="badge v2">v2</span>
                </div>
                <p class="endpoint-desc">Get historical ranking data for demons.</p>

                <h3>Query Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th><th>Required</th></tr>
                    <tr><td>demon_id</td><td>string</td><td>Demon ID to get history for</td><td>Yes</td></tr>
                    <tr><td>start_date</td><td>date</td><td>History start date</td><td>No</td></tr>
                    <tr><td>end_date</td><td>date</td><td>History end date</td><td>No</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "demon": {
      "id": "dmn_9c3d5e7f1a2b",
      "name": "Silent Clubstep"
    },
    "position_history": [
      {"date": "2023-01-01", "position": 3},
      {"date": "2023-06-01", "position": 2},
      {"date": "2023-12-01", "position": 1},
      {"date": "2024-01-20", "position": 1}
    ],
    "highest_position": 1,
    "lowest_position": 8,
    "days_at_position_1": 45
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_6y8a0c2e4g6i"
  }
}</code></pre>
            </div>
        </div>
    `;
}
