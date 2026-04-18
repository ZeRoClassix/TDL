export function render() {
    return `
        <div class="api-page">
            <div class="version-badge v2">v2 Only</div>
            <h1>👤 Delete User</h1>
            <p class="lead">Permanently delete a user account.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method delete">DELETE</span>
                    <code class="path">/v2/users/{user_id}/</code>
                </div>
                <p class="endpoint-desc">Permanently delete a user account. This action requires administrator privileges or account ownership with password confirmation.</p>

                <h3>Path Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                    <tr><td>user_id</td><td>string</td><td>User ID (usr_*)</td></tr>
                </table>

                <h3>Request Headers</h3>
                <table class="api-table params">
                    <tr><th>Header</th><th>Required</th><th>Description</th></tr>
                    <tr><td>Authorization</td><td>Yes</td><td>Bearer {api_key}</td></tr>
                </table>

                <h3>Request Body (Self-Deletion)</h3>
                <p>When deleting your own account, password confirmation is required:</p>
                <table class="api-table params">
                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    <tr><td>password</td><td>string</td><td>For self</td><td>Current password confirmation</td></tr>
                    <tr><td>reason</td><td>string</td><td>No</td><td>Deletion reason (optional feedback)</td></tr>
                </table>

                <h3>Request Example (Self-Deletion)</h3>
                <pre><code>DELETE /v2/users/usr_7f8d9a2b4c6e/ HTTP/1.1
Host: api.pcdemonlist.dev
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "password": "CurrentPassword123!",
  "reason": "No longer playing Geometry Dash"
}</code></pre>

                <h3>Response (204 No Content)</h3>
                <p>Successful deletion returns no content.</p>

                <h3>Response (202 Accepted - Admin Deletion)</h3>
                <pre><code>{
  "data": {
    "message": "User scheduled for deletion",
    "deletion_scheduled_at": "2024-01-21T00:00:00Z",
    "grace_period_hours": 24
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_0i2k4m6o8q0s"
  }
}</code></pre>

                <div class="warning-block">
                    <h4>⚠️ Deletion Behavior</h4>
                    <ul>
                        <li><strong>Self-deletion:</strong> 24-hour grace period to cancel</li>
                        <li><strong>Admin deletion:</strong> Immediate or scheduled based on user activity</li>
                        <li>Associated records and submissions are anonymized, not deleted</li>
                        <li>Username becomes available after 30 days</li>
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
    "code": 40301,
    "message": "Permission Denied",
    "details": "You can only delete your own account or need admin privileges"
  }
}</code></pre>
            </div>
            <div class="error-block">
                <h4>400 Bad Request - Invalid Password</h4>
                <pre><code>{
  "error": {
    "code": 40010,
    "message": "Invalid Password",
    "details": "Password confirmation failed"
  }
}</code></pre>
            </div>
        </div>
    `;
}
