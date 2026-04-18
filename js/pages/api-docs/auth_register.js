export function render() {
    return `
        <div class="api-page">
            <div class="version-badge v2">v2 Only</div>
            <h1>🔐 Register</h1>
            <p class="lead">Create a new user account to obtain API credentials.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <code class="path">/v2/auth/register</code>
                </div>
                <p class="endpoint-desc">Register a new user account with email and password.</p>

                <h3>Request Headers</h3>
                <table class="api-table params">
                    <tr><th>Header</th><th>Required</th><th>Description</th></tr>
                    <tr><td>Content-Type</td><td>Yes</td><td>application/json</td></tr>
                </table>

                <h3>Request Body</h3>
                <table class="api-table params">
                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    <tr><td>email</td><td>string</td><td>Yes</td><td>Valid email address</td></tr>
                    <tr><td>username</td><td>string</td><td>Yes</td><td>3-32 characters, alphanumeric + underscore</td></tr>
                    <tr><td>password</td><td>string</td><td>Yes</td><td>8-128 characters, must include uppercase, lowercase, number</td></tr>
                    <tr><td>gd_username</td><td>string</td><td>No</td><td>Geometry Dash username (optional)</td></tr>
                </table>

                <h3>Request Example</h3>
                <pre><code>POST /v2/auth/register HTTP/1.1
Host: api.pcdemonlist.dev
Content-Type: application/json

{
  "email": "player@example.com",
  "username": "pro_player",
  "password": "SecurePass123!",
  "gd_username": "nSwish"
}</code></pre>

                <h3>Response (201 Created)</h3>
                <pre><code>{
  "data": {
    "user": {
      "id": "usr_7f8d9a2b4c6e",
      "username": "pro_player",
      "email": "player@example.com",
      "gd_username": "nSwish",
      "created_at": "2024-01-20T14:30:00Z",
      "role": "player"
    },
    "credentials": {
      "api_key": "dl_api_abc123xyz789...",
      "client_id": "client_def456uvw012",
      "client_secret": "secret_ghi789rst345..."
    }
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_9a8b7c6d5e4f"
  }
}</code></pre>

                <h3>Error Responses</h3>
                <div class="error-block">
                    <h4>400 Bad Request - Validation Error</h4>
                    <pre><code>{
  "error": {
    "code": 40001,
    "message": "Validation Failed",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}</code></pre>
                </div>
                <div class="error-block">
                    <h4>409 Conflict - User Exists</h4>
                    <pre><code>{
  "error": {
    "code": 40901,
    "message": "User Already Exists",
    "details": "Email or username is already registered"
  }
}</code></pre>
                </div>

                <div class="note">
                    <strong>⚠️ Important:</strong> Save your API key, client ID, and client secret securely. 
                    The API key cannot be retrieved later. If lost, you must generate a new one.
                </div>
            </div>
        </div>
    `;
}
