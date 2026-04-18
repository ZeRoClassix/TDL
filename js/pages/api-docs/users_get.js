export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>👤 Get User</h1>
            <p class="lead">Retrieve detailed information about a specific user.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v1/users/{user_id}/</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Get detailed information about a specific user by ID.</p>

                <h3>Path Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                    <tr><td>user_id</td><td>string</td><td>User ID (usr_*) or username</td></tr>
                </table>

                <h3>Request Headers</h3>
                <table class="api-table params">
                    <tr><th>Header</th><th>Required</th><th>Description</th></tr>
                    <tr><td>Authorization</td><td>Yes</td><td>Bearer {api_key}</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "id": "usr_7f8d9a2b4c6e",
    "username": "pro_player",
    "email": "player@example.com",
    "role": "player",
    "gd_username": "nSwish",
    "country": "US",
    "bio": "Professional GD player since 2020",
    "social_links": {
      "youtube": "https://youtube.com/@nswish",
      "twitch": "https://twitch.tv/nswish",
      "twitter": "https://twitter.com/nswish"
    },
    "preferences": {
      "email_notifications": true,
      "public_profile": true
    },
    "stats": {
      "records_submitted": 45,
      "records_verified": 42,
      "demons_completed": 156,
      "rank": 15
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:30:00Z",
    "last_login": "2024-01-20T14:30:00Z",
    "is_active": true
  },
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_4c6e8g0i2k4m"
  }
}</code></pre>
            </div>

            <div class="endpoint-block v2-section">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v2/users/{user_id}/</code>
                    <span class="badge v2">v2</span>
                </div>
                <p class="endpoint-desc">Get user with additional v2 features including field projection.</p>

                <h3>Query Parameters (v2)</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                    <tr><td>fields</td><td>string</td><td>Comma-separated fields to include</td></tr>
                    <tr><td>include_stats</td><td>boolean</td><td>Include user statistics (default: true)</td></tr>
                </table>

                <h3>Field Projection Example</h3>
                <pre><code>GET /v2/users/pro_player?fields=id,username,gd_username,stats</code></pre>

                <h3>Partial Response (v2)</h3>
                <pre><code>{
  "data": {
    "id": "usr_7f8d9a2b4c6e",
    "username": "pro_player",
    "gd_username": "nSwish",
    "stats": {
      "records_submitted": 45,
      "records_verified": 42,
      "demons_completed": 156,
      "rank": 15
    }
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_6g8i0k2m4o6q"
  }
}</code></pre>
            </div>

            <h3>Error Responses</h3>
            <div class="error-block">
                <h4>404 Not Found</h4>
                <pre><code>{
  "error": {
    "code": 40400,
    "message": "User Not Found",
    "details": "No user found with ID 'usr_invalid123'"
  }
}</code></pre>
            </div>
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
