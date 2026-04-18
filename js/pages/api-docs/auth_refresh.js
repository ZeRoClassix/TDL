export function render() {
    return `
        <div class="api-page">
            <div class="version-badge v2">v2 Only</div>
            <h1>🔐 Token Refresh</h1>
            <p class="lead">Obtain a new access token using a refresh token.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <code class="path">/v2/oauth/token</code>
                </div>
                <p class="endpoint-desc">Exchange a refresh token for a new access token. This endpoint is also used for initial authentication.</p>

                <h3>Request Headers</h3>
                <table class="api-table params">
                    <tr><th>Header</th><th>Required</th><th>Description</th></tr>
                    <tr><td>Content-Type</td><td>Yes</td><td>application/x-www-form-urlencoded</td></tr>
                    <tr><td>Authorization</td><td>Yes</td><td>Basic {base64(client_id:client_secret)}</td></tr>
                </table>

                <h3>Request Body (Form Data)</h3>
                <table class="api-table params">
                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    <tr><td>grant_type</td><td>string</td><td>Yes</td><td>Must be "refresh_token"</td></tr>
                    <tr><td>refresh_token</td><td>string</td><td>Yes</td><td>Valid refresh token from previous login</td></tr>
                </table>

                <h3>Request Example</h3>
                <pre><code>POST /v2/oauth/token HTTP/1.1
Host: api.pcdemonlist.dev
Content-Type: application/x-www-form-urlencoded
Authorization: Basic Y2xpZW50X2lkOmNsaWVudF9zZWNyZXQ=

grant_type=refresh_token&refresh_token=eyJhbGciOiJSUzI1NiIs...</code></pre>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "eyJhbGciOiJSUzI1NiIs...",
  "scope": "read write"
}</code></pre>

                <div class="info-block">
                    <h4>Token Lifecycle</h4>
                    <ul>
                        <li><strong>Access Token:</strong> Valid for 1 hour (3600 seconds)</li>
                        <li><strong>Refresh Token:</strong> Valid for 30 days</li>
                        <li>Each refresh token can only be used once - a new one is issued</li>
                        <li>Refresh tokens are revoked on password change</li>
                    </ul>
                </div>

                <h3>Error Responses</h3>
                <div class="error-block">
                    <h4>401 Unauthorized - Invalid Refresh Token</h4>
                    <pre><code>{
  "error": {
    "code": 40103,
    "message": "Invalid Refresh Token",
    "details": "The refresh token has expired or been revoked"
  }
}</code></pre>
                </div>
                <div class="error-block">
                    <h4>401 Unauthorized - Invalid Client</h4>
                    <pre><code>{
  "error": {
    "code": 40102,
    "message": "Invalid Client Credentials",
    "details": "Client ID or secret is invalid"
  }
}</code></pre>
                </div>
            </div>
        </div>
    `;
}
