export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>👹 List Demons</h1>
            <p class="lead">Retrieve the complete demonlist with filtering and pagination.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v1/demons/</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Get the complete demonlist with all demons from Main, Extended, and Legacy lists.</p>

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
                    <tr><td>list_type</td><td>string</td><td>main, extended, legacy, all</td><td>all</td></tr>
                    <tr><td>sort</td><td>string</td><td>position, name, publisher, records_required</td><td>position</td></tr>
                    <tr><td>search</td><td>string</td><td>Search by demon name</td><td>-</td></tr>
                    <tr><td>publisher</td><td>string</td><td>Filter by publisher name</td><td>-</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": [
    {
      "id": "dmn_9c3d5e7f1a2b",
      "name": "Silent Clubstep",
      "position": 1,
      "list_type": "main",
      "publisher": {
        "id": "usr_xyz789",
        "name": "Serponge"
      },
      "verifier": {
        "id": "plr_7a2b4c6d8e0f",
        "name": "nSwish"
      },
      "creators": [
        {"id": "usr_xyz789", "name": "Serponge"}
      ],
      "video_url": "https://youtube.com/watch?v=abc123",
      "records_required": 1,
      "thumbnail": "https://i.ytimg.com/vi/abc123/mqdefault.jpg",
      "records_count": 156,
      "verifications_count": 1,
      "first_victor": {
        "id": "plr_7a2b4c6d8e0f",
        "name": "nSwish",
        "date": "2023-06-15T14:30:00Z"
      },
      "added_at": "2023-06-20T10:00:00Z"
    },
    {
      "id": "dmn_2f4a6b8c0d2e",
      "name": "Sonic Wave Infinity",
      "position": 76,
      "list_type": "extended",
      "publisher": {
        "id": "usr_def456",
        "name": "APTeam"
      },
      "verifier": {
        "id": "plr_3e5f7a9b1c3d",
        "name": "Technical"
      },
      "creators": [
        {"id": "usr_def456", "name": "APTeam"},
        {"id": "usr_ghi789", "name": "Cyclic"}
      ],
      "video_url": "https://youtube.com/watch?v=def456",
      "records_required": 100,
      "thumbnail": "https://i.ytimg.com/vi/def456/mqdefault.jpg",
      "records_count": 89,
      "verifications_count": 1,
      "added_at": "2022-08-10T09:15:00Z"
    }
  ],
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_2u4w6y8a0c2e",
    "list_updated": "2024-01-20T00:00:00Z"
  },
  "pagination": {
    "total": 450,
    "page": 1,
    "limit": 50,
    "pages": 9,
    "has_next": true,
    "has_prev": false
  }
}</code></pre>

                <div class="info-block">
                    <h4>List Types</h4>
                    <ul>
                        <li><strong>main:</strong> Top 75 hardest demons (positions 1-75)</li>
                        <li><strong>extended:</strong> Next 75 demons (positions 76-150)</li>
                        <li><strong>legacy:</strong> Remaining ranked demons (positions 151+)</li>
                    </ul>
                </div>
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
