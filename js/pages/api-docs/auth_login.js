export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2 (OAuth2)</span>
            </div>
            <h1>🔐 Login</h1>
            <p class="lead">Authenticate and obtain access tokens.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <code class="path">/v1/auth/login</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Authenticate with email and password to receive an API key session.</p>

                <h3>Request Headers</h3>
                <table class="api-table params">
                    <tr><th>Header</th><th>Required</th><th>Description</th></tr>
                    <tr><td>Content-Type</td><td>Yes</td><td>application/json</td></tr>
                </table>

                <h3>Request Body</h3>
                <table class="api-table params">
                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    <tr><td>email</td><td>string</td><td>Yes</td><td>Registered email address</td></tr>
                    <tr><td>password</td><td>string</td><td>Yes</td><td>Account password</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": "2024-01-21T14:30:00Z",
    "user": {
      "id": "usr_7f8d9a2b4c6e",
      "username": "pro_player",
      "role": "player"
    }
  },
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_1a2b3c4d5e6f"
  }
}</code></pre>
            </div>

            <div class="endpoint-block v2-section">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <code class="path">/v2/oauth/token</code>
                    <span class="badge v2">v2</span>
                </div>
                <p class="endpoint-desc">OAuth2 token endpoint for obtaining access tokens.</p>

                <h3>Request Headers</h3>
                <table class="api-table params">
                    <tr><th>Header</th><th>Required</th><th>Description</th></tr>
                    <tr><td>Content-Type</td><td>Yes</td><td>application/x-www-form-urlencoded</td></tr>
                    <tr><td>Authorization</td><td>Yes</td><td>Basic {base64(client_id:client_secret)}</td></tr>
                </table>

                <h3>Request Body (Form Data)</h3>
                <table class="api-table params">
                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    <tr><td>grant_type</td><td>string</td><td>Yes</td><td>password, refresh_token, or client_credentials</td></tr>
                    <tr><td>username</td><td>string</td><td>If password</td><td>Email or username</td></tr>
                    <tr><td>password</td><td>string</td><td>If password</td><td>Account password</td></tr>
                    <tr><td>refresh_token</td><td>string</td><td>If refresh_token</td><td>Valid refresh token</td></tr>
                    <tr><td>scope</td><td>string</td><td>No</td><td>Space-separated scopes (default: read)</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "eyJhbGciOiJSUzI1NiIs...",
  "scope": "read write"
}</code></pre>

                <div class="note">
                    <strong>💡 Note:</strong> v2 uses OAuth2 flow with access tokens (1 hour) and refresh tokens (30 days).
                </div>
            </div>

            <h3>Error Responses</h3>
            <div class="error-block">
                <h4>401 Unauthorized - Invalid Credentials</h4>
                <pre><code>{
  "error": {
    "code": 40101,
    "message": "Authentication Failed",
    "details": "Invalid email or password"
  }
}</code></pre>
            </div>
            <div class="error-block">
                <h4>429 Too Many Requests</h4>
                <pre><code>{
  "error": {
    "code": 42901,
    "message": "Too Many Login Attempts",
    "details": "Account temporarily locked. Try again in 15 minutes."
  }
}</code></pre>
            </div>
        </div>
    `;
}
