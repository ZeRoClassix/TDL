export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>🔐 Logout</h1>
            <p class="lead">Revoke the current access token and invalidate the session.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <code class="path">/v1/auth/logout</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Invalidate the current API key session.</p>

                <h3>Request Headers</h3>
                <table class="api-table params">
                    <tr><th>Header</th><th>Required</th><th>Description</th></tr>
                    <tr><td>Authorization</td><td>Yes</td><td>Bearer {token}</td></tr>
                </table>

                <h3>Response (204 No Content)</h3>
                <p>Successful logout returns no content.</p>
            </div>

            <div class="endpoint-block v2-section">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <code class="path">/v2/oauth/revoke</code>
                    <span class="badge v2">v2</span>
                </div>
                <p class="endpoint-desc">Revoke an access or refresh token (OAuth2 Token Revocation RFC 7009).</p>

                <h3>Request Headers</h3>
                <table class="api-table params">
                    <tr><th>Header</th><th>Required</th><th>Description</th></tr>
                    <tr><td>Content-Type</td><td>Yes</td><td>application/x-www-form-urlencoded</td></tr>
                    <tr><td>Authorization</td><td>Yes</td><td>Basic {base64(client_id:client_secret)}</td></tr>
                </table>

                <h3>Request Body (Form Data)</h3>
                <table class="api-table params">
                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    <tr><td>token</td><td>string</td><td>Yes</td><td>Access or refresh token to revoke</td></tr>
                    <tr><td>token_type_hint</td><td>string</td><td>No</td><td>access_token or refresh_token</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "revoked": true
}</code></pre>

                <div class="note">
                    <strong>💡 Note:</strong> Revoking a refresh token also invalidates all associated access tokens.
                </div>
            </div>

            <h3>Error Responses</h3>
            <div class="error-block">
                <h4>401 Unauthorized</h4>
                <pre><code>{
  "error": {
    "code": 40101,
    "message": "Invalid Token",
    "details": "The token provided is invalid or has already been revoked"
  }
}</code></pre>
            </div>
        </div>
    `;
}
