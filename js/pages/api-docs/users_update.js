export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>👤 Update User</h1>
            <p class="lead">Update user profile information.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method patch">PATCH</span>
                    <code class="path">/v1/users/{user_id}/</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Update user profile information. Users can only update their own profile unless they are administrators.</p>

                <h3>Path Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                    <tr><td>user_id</td><td>string</td><td>User ID (usr_*)</td></tr>
                </table>

                <h3>Request Headers</h3>
                <table class="api-table params">
                    <tr><th>Header</th><th>Required</th><th>Description</th></tr>
                    <tr><td>Authorization</td><td>Yes</td><td>Bearer {api_key}</td></tr>
                    <tr><td>Content-Type</td><td>Yes</td><td>application/json</td></tr>
                </table>

                <h3>Request Body</h3>
                <table class="api-table params">
                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    <tr><td>username</td><td>string</td><td>No</td><td>New username (3-32 chars)</td></tr>
                    <tr><td>gd_username</td><td>string</td><td>No</td><td>Geometry Dash username</td></tr>
                    <tr><td>country</td><td>string</td><td>No</td><td>2-letter country code</td></tr>
                    <tr><td>bio</td><td>string</td><td>No</td><td>User bio (max 500 chars)</td></tr>
                    <tr><td>social_links</td><td>object</td><td>No</td><td>Social media links</td></tr>
                    <tr><td>preferences</td><td>object</td><td>No</td><td>User preferences</td></tr>
                </table>

                <h3>Request Example</h3>
                <pre><code>PATCH /v1/users/usr_7f8d9a2b4c6e/ HTTP/1.1
Host: api.pcdemonlist.dev
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "gd_username": "nSwish_GD",
  "country": "CA",
  "bio": "Geometry Dash speedrunner and verifier",
  "social_links": {
    "youtube": "https://youtube.com/@nswishofficial",
    "twitch": "https://twitch.tv/nswish_gd"
  },
  "preferences": {
    "email_notifications": true,
    "public_profile": true
  }
}</code></pre>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "id": "usr_7f8d9a2b4c6e",
    "username": "pro_player",
    "gd_username": "nSwish_GD",
    "country": "CA",
    "bio": "Geometry Dash speedrunner and verifier",
    "social_links": {
      "youtube": "https://youtube.com/@nswishofficial",
      "twitch": "https://twitch.tv/nswish_gd"
    },
    "preferences": {
      "email_notifications": true,
      "public_profile": true
    },
    "updated_at": "2024-01-21T09:15:00Z"
  },
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_8g0i2k4m6o8q"
  }
}</code></pre>
            </div>

            <div class="endpoint-block v2-section">
                <div class="endpoint-header">
                    <span class="method patch">PATCH</span>
                    <code class="path">/v2/users/{user_id}/</code>
                    <span class="badge v2">v2</span>
                </div>
                <p class="endpoint-desc">Update user with improved validation and partial update support.</p>

                <div class="info-block">
                    <h4>v2 Improvements</h4>
                    <ul>
                        <li>Better validation error messages with field-level details</li>
                        <li>Email change requires verification</li>
                        <li>Audit log of profile changes</li>
                    </ul>
                </div>
            </div>

            <h3>Error Responses</h3>
            <div class="error-block">
                <h4>400 Bad Request - Validation Error</h4>
                <pre><code>{
  "error": {
    "code": 40001,
    "message": "Validation Failed",
    "details": {
      "username": "Username must be between 3 and 32 characters",
      "country": "Invalid country code"
    }
  }
}</code></pre>
            </div>
            <div class="error-block">
                <h4>403 Forbidden</h4>
                <pre><code>{
  "error": {
    "code": 40301,
    "message": "Permission Denied",
    "details": "You can only update your own profile"
  }
}</code></pre>
            </div>
            <div class="error-block">
                <h4>409 Conflict</h4>
                <pre><code>{
  "error": {
    "code": 40902,
    "message": "Username Taken",
    "details": "Username 'pro_player' is already in use"
  }
}</code></pre>
            </div>
        </div>
    `;
}
