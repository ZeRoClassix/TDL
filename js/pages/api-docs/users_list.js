export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>👤 List Users</h1>
            <p class="lead">Retrieve a paginated list of registered users.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v1/users/</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Get a list of all registered users with pagination support.</p>

                <h3>Request Headers</h3>
                <table class="api-table params">
                    <tr><th>Header</th><th>Required</th><th>Description</th></tr>
                    <tr><td>Authorization</td><td>Yes</td><td>Bearer {api_key}</td></tr>
                </table>

                <h3>Query Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th></tr>
                    <tr><td>page</td><td>integer</td><td>Page number (1-based)</td><td>1</td></tr>
                    <tr><td>limit</td><td>integer</td><td>Items per page (max 100)</td><td>50</td></tr>
                    <tr><td>role</td><td>string</td><td>Filter by role (admin, moderator, player)</td><td>-</td></tr>
                    <tr><td>sort</td><td>string</td><td>Sort by (created_at, username, role)</td><td>created_at</td></tr>
                    <tr><td>order</td><td>string</td><td>asc or desc</td><td>desc</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": [
    {
      "id": "usr_7f8d9a2b4c6e",
      "username": "pro_player",
      "email": "player@example.com",
      "role": "player",
      "gd_username": "nSwish",
      "created_at": "2024-01-15T10:30:00Z",
      "last_login": "2024-01-20T14:30:00Z",
      "is_active": true
    },
    {
      "id": "usr_3e5f7a9b1c3d",
      "username": "list_mod",
      "email": "mod@pcdemonlist.dev",
      "role": "moderator",
      "gd_username": "ModeratorGD",
      "created_at": "2023-08-10T09:15:00Z",
      "last_login": "2024-01-20T08:45:00Z",
      "is_active": true
    }
  ],
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_2b4c6d8e0f1a"
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
                    <code class="path">/v2/users/</code>
                    <span class="badge v2">v2</span>
                </div>
                <p class="endpoint-desc">Get users with cursor-based pagination for better performance with large datasets.</p>

                <h3>Query Parameters (v2 Additions)</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                    <tr><td>cursor</td><td>string</td><td>Opaque cursor for pagination (replaces page)</td></tr>
                    <tr><td>search</td><td>string</td><td>Search in username and GD username</td></tr>
                    <tr><td>country</td><td>string</td><td>Filter by country code (2-letter)</td></tr>
                    <tr><td>fields</td><td>string</td><td>Comma-separated fields to include (field projection)</td></tr>
                </table>

                <h3>Cursor Pagination Response (v2)</h3>
                <pre><code>{
  "data": [...],
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_8c0d2e4f6a8b"
  },
  "pagination": {
    "next_cursor": "eyJpZCI6InVzcl8zZTVmN2E5YjFjM2QiLCJjcmVhdGVkX2F0IjoiMjAyMy0wOC0xMFQwOToxNTowMFoifQ",
    "prev_cursor": null,
    "has_more": true,
    "limit": 50
  }
}</code></pre>

                <div class="info-block">
                    <h4>💡 Cursor Pagination</h4>
                    <p>v2 uses cursor pagination which provides:</p>
                    <ul>
                        <li>Consistent results even with concurrent writes</li>
                        <li>Better performance for deep pagination</li>
                        <li>No "skipped" or "duplicate" items when data changes</li>
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
            <div class="error-block">
                <h4>403 Forbidden</h4>
                <pre><code>{
  "error": {
    "code": 40300,
    "message": "Insufficient Permissions",
    "details": "Only administrators can list all users"
  }
}</code></pre>
            </div>
        </div>
    `;
}
