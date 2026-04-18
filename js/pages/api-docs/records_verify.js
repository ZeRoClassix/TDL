export function render() {
    return `
        <div class="api-page">
            <div class="version-badge v2">v2 Only - Moderators</div>
            <h1>📋 Verify Record</h1>
            <p class="lead">Approve or reject a pending record submission.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <code class="path">/v2/records/{record_id}/verify</code>
                </div>
                <p class="endpoint-desc">Verify (approve) a pending record. Requires moderator or administrator privileges.</p>

                <h3>Path Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                    <tr><td>record_id</td><td>string</td><td>Record ID (rec_*)</td></tr>
                </table>

                <h3>Request Headers</h3>
                <table class="api-table params">
                    <tr><th>Header</th><th>Required</th><th>Description</th></tr>
                    <tr><td>Authorization</td><td>Yes</td><td>Bearer {api_key} (mod/admin only)</td></tr>
                    <tr><td>Content-Type</td><td>Yes</td><td>application/json</td></tr>
                </table>

                <h3>Request Body</h3>
                <table class="api-table params">
                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    <tr><td>decision</td><td>string</td><td>Yes</td><td>approve or reject</td></tr>
                    <tr><td>reason</td><td>string</td><td>If reject</td><td>Reason for rejection</td></tr>
                    <tr><td>notes</td><td>string</td><td>No</td><td>Internal moderator notes</td></tr>
                    <tr><td>notify_player</td><td>boolean</td><td>No</td><td>Send notification (default: true)</td></tr>
                </table>

                <h3>Request Example (Approve)</h3>
                <pre><code>POST /v2/records/rec_new_record789/verify HTTP/1.1
Host: api.pcdemonlist.dev
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "decision": "approve",
  "notes": "Video reviewed. Completes all required percentages. FPS is consistent.",
  "notify_player": true
}</code></pre>

                <h3>Request Example (Reject)</h3>
                <pre><code>{
  "decision": "reject",
  "reason": "Insufficient proof. Raw footage shows cuts in the gameplay.",
  "notes": "Skip at 45% timestamp. Likely used hacks.",
  "notify_player": true
}</code></pre>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "record": {
      "id": "rec_new_record789",
      "status": "verified",
      "verified_at": "2024-01-21T10:15:00Z",
      "verified_by": {
        "id": "usr_mod123",
        "name": "ListModerator"
      }
    },
    "decision": {
      "action": "approved",
      "processed_at": "2024-01-21T10:15:00Z"
    },
    "player_notified": true,
    "points_updated": {
      "previous_points": 125000.0,
      "new_points": 125500.0,
      "points_gained": 500.0
    }
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_4g6i8k0m2o4q"
  }
}</code></pre>
            </div>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v2/records/pending</code>
                </div>
                <p class="endpoint-desc">List all pending records awaiting verification.</p>

                <h3>Query Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th></tr>
                    <tr><td>limit</td><td>integer</td><td>Records per page</td><td>50</td></tr>
                    <tr><td>sort</td><td>string</td><td>submitted_at, demon_position</td><td>submitted_at</td></tr>
                    <tr><td>priority</td><td>boolean</td><td>Top demons first</td><td>false</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "pending_count": 42,
    "records": [
      {
        "id": "rec_pending1",
        "demon": {"name": "Silent Clubstep", "position": 1},
        "player": {"name": "NewPlayer"},
        "percent": 100,
        "submitted_at": "2024-01-20T14:30:00Z",
        "video_url": "https://youtube.com/watch?v=...",
        "raw_footage_url": "https://drive.google.com/...",
        "wait_time": "24 hours"
      }
    ]
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_6i8k0m2o4q6s"
  }
}</code></pre>
            </div>

            <h3>Error Responses</h3>
            <div class="error-block">
                <h4>403 Forbidden</h4>
                <pre><code>{
  "error": {
    "code": 40302,
    "message": "Moderator Access Required",
    "details": "Only moderators and administrators can verify records"
  }
}</code></pre>
            </div>
            <div class="error-block">
                <h4>409 Conflict - Already Verified</h4>
                <pre><code>{
  "error": {
    "code": 40904,
    "message": "Already Processed",
    "details": "Record has already been verified by another moderator"
  }
}</code></pre>
            </div>
        </div>
    `;
}
