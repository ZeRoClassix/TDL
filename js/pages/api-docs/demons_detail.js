export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>👹 Demon Details</h1>
            <p class="lead">Get comprehensive information about a specific demon.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v1/demons/{demon_id}/</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Retrieve detailed information about a specific demon including records and statistics.</p>

                <h3>Path Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                    <tr><td>demon_id</td><td>string</td><td>Demon ID (dmn_*) or demon name</td></tr>
                </table>

                <h3>Query Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th></tr>
                    <tr><td>include_records</td><td>boolean</td><td>Include verified records</td><td>true</td></tr>
                    <tr><td>records_limit</td><td>integer</td><td>Number of records to include</td><td>10</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "id": "dmn_9c3d5e7f1a2b",
    "name": "Silent Clubstep",
    "position": 1,
    "list_type": "main",
    "publisher": {
      "id": "usr_xyz789",
      "name": "Serponge",
      "profile_url": "https://pcdemonlist.dev/user/Serponge"
    },
    "verifier": {
      "id": "plr_7a2b4c6d8e0f",
      "name": "nSwish",
      "verification_date": "2023-06-15T14:30:00Z",
      "video_url": "https://youtube.com/watch?v=ver123"
    },
    "creators": [
      {
        "id": "usr_xyz789",
        "name": "Serponge",
        "role": "publisher"
      }
    ],
    "video_url": "https://youtube.com/watch?v=abc123",
    "thumbnail": "https://i.ytimg.com/vi/abc123/mqdefault.jpg",
    "records_required": 1,
    "fps": 60,
    "difficulty": "Extreme Demon",
    "game_version": "2.2",
    "objects_count": 99999,
    "length": "XL",
    
    "statistics": {
      "verified_records": 156,
      "attempts_avg": 12543,
      "attempts_min": 842,
      "attempts_max": 95421,
      "completion_rate": 0.008,
      "first_victor": {
        "player": "nSwish",
        "date": "2023-06-15T14:30:00Z"
      }
    },
    
    "records": [
      {
        "id": "rec_abc123",
        "player": {
          "id": "plr_7a2b4c6d8e0f",
          "name": "nSwish"
        },
        "percent": 100,
        "video_url": "https://youtube.com/watch?v=rec1",
        "date": "2023-06-15T14:30:00Z",
        "is_first_victor": true,
        "is_verification": true
      },
      {
        "id": "rec_def456",
        "player": {
          "id": "plr_3e5f7a9b1c3d",
          "name": "Technical"
        },
        "percent": 100,
        "video_url": "https://youtube.com/watch?v=rec2",
        "date": "2023-07-20T10:15:00Z",
        "is_first_victor": false,
        "is_verification": false
      }
    ],
    
    "history": {
      "added_at": "2023-06-20T10:00:00Z",
      "position_changes": [
        {"date": "2023-06-20", "position": 2},
        {"date": "2023-12-01", "position": 1}
      ]
    }
  },
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_8a0c2e4g6i8k"
  }
}</code></pre>
            </div>

            <div class="endpoint-block v2-section">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v2/demons/{demon_id}/analytics</code>
                    <span class="badge v2">v2</span>
                </div>
                <p class="endpoint-desc">Get advanced analytics for a demon including completion trends.</p>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "demon_id": "dmn_9c3d5e7f1a2b",
    "completions_by_month": [
      {"month": "2023-06", "count": 3},
      {"month": "2023-07", "count": 8},
      {"month": "2023-08", "count": 12},
      {"month": "2024-01", "count": 15}
    ],
    "player_nationalities": {
      "US": 45,
      "CA": 23,
      "UK": 18
    },
    "device_breakdown": {
      "PC": 134,
      "Mobile": 22
    },
    "average_completion_time": "3h 45m",
    "trend": "increasing"
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_0c2e4g6i8k0m"
  }
}</code></pre>
            </div>

            <h3>Error Responses</h3>
            <div class="error-block">
                <h4>404 Not Found</h4>
                <pre><code>{
  "error": {
    "code": 40403,
    "message": "Demon Not Found",
    "details": "No demon found with ID 'dmn_invalid'"
  }
}</code></pre>
            </div>
        </div>
    `;
}
