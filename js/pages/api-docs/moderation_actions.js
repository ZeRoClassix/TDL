export function render() {
    return `
        <div class="api-page">
            <div class="version-badge v2">v2 Only - Admins/Moderators</div>
            <h1>🛡️ Moderation Actions</h1>
            <p class="lead">Administrative and moderation tools for managing the list.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v2/admin/audit-log</code>
                </div>
                <p class="endpoint-desc">View the moderation audit log for tracking all administrative actions.</p>

                <h3>Query Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th></tr>
                    <tr><td>action</td><td>string</td><td>Filter by action type</td><td>-</td></tr>
                    <tr><td>user_id</td><td>string</td><td>Filter by target user</td><td>-</td></tr>
                    <tr><td>moderator_id</td><td>string</td><td>Filter by moderator</td><td>-</td></tr>
                    <tr><td>start_date</td><td>date</td><td>Log start date</td><td>-</td></tr>
                    <tr><td>end_date</td><td>date</td><td>Log end date</td><td>-</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "logs": [
      {
        "id": "log_abc123",
        "timestamp": "2024-01-20T14:30:00Z",
        "action": "record_verified",
        "moderator": {
          "id": "usr_mod123",
          "name": "ListModerator"
        },
        "target": {
          "type": "record",
          "id": "rec_def456",
          "name": "Silent Clubstep by nSwish"
        },
        "details": {
          "decision": "approved",
          "points_awarded": 500.0
        },
        "ip_address": "192.168.1.1"
      },
      {
        "id": "log_ghi789",
        "timestamp": "2024-01-20T13:15:00Z",
        "action": "user_banned",
        "moderator": {
          "id": "usr_admin456",
          "name": "AdminUser"
        },
        "target": {
          "type": "user",
          "id": "usr_bad789",
          "name": "CheaterPlayer"
        },
        "details": {
          "reason": "Confirmed hack usage in 3 records",
          "duration": "permanent",
          "evidence_urls": ["https://docs.google.com/..."]
        }
      }
    ],
    "summary": {
      "total_actions": 1567,
      "actions_24h": 23
    }
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_4a6c8e0g2i4k"
  }
}</code></pre>
            </div>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <code class="path">/v2/admin/users/{user_id}/ban</code>
                </div>
                <p class="endpoint-desc">Ban or suspend a user from the platform.</p>

                <h3>Request Body</h3>
                <table class="api-table params">
                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    <tr><td>duration</td><td>string</td><td>Yes</td><td>1d, 7d, 30d, 90d, 365d, permanent</td></tr>
                    <tr><td>reason</td><td>string</td><td>Yes</td><td>Ban reason (shown to user)</td></tr>
                    <tr><td>evidence_urls</td><td>array</td><td>No</td><td>URLs to supporting evidence</td></tr>
                    <tr><td>revoke_records</td><td>boolean</td><td>No</td><td>Revoke all verified records</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "ban": {
      "id": "ban_abc123",
      "user_id": "usr_bad789",
      "duration": "permanent",
      "expires_at": null,
      "reason": "Confirmed hack usage",
      "banned_by": "AdminUser",
      "banned_at": "2024-01-20T14:30:00Z"
    },
    "actions_taken": {
      "records_revoked": 5,
      "submissions_deleted": 2
    }
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_6c8e0g2i4k6m"
  }
}</code></pre>
            </div>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <code class="path">/v2/admin/demons/{demon_id}/update-position</code>
                </div>
                <p class="endpoint-desc">Update a demon's position in the list (admin only).</p>

                <h3>Request Body</h3>
                <table class="api-table params">
                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    <tr><td>new_position</td><td>integer</td><td>Yes</td><td>New position number</td></tr>
                    <tr><td>reason</td><td>string</td><td>Yes</td><td>Reason for position change</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "demon": {
      "id": "dmn_9c3d5e7f1a2b",
      "name": "Silent Clubstep",
      "previous_position": 2,
      "new_position": 1
    },
    "cascade_changes": [
      {"demon": "Acheron", "from": 1, "to": 2},
      {"demon": "Tartarus", "from": 3, "to": 3}
    ],
    "affected_records": 156
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_8e0g2i4k6m8o"
  }
}</code></pre>
            </div>

            <h3>Moderation Action Types</h3>
            <table class="api-table">
                <tr><th>Action</th><th>Description</th><th>Level</th></tr>
                <tr><td>record_verified</td><td>Record approved</td><td>Moderator</td></tr>
                <tr><td>record_rejected</td><td>Record rejected</td><td>Moderator</td></tr>
                <tr><td>record_revoked</td><td>Verified record marked invalid</td><td>Moderator</td></tr>
                <tr><td>user_banned</td><td>User account banned</td><td>Admin</td></tr>
                <tr><td>user_unbanned</td><td>User ban lifted</td><td>Admin</td></tr>
                <tr><td>demon_added</td><td>New demon added to list</td><td>Admin</td></tr>
                <tr><td>demon_updated</td><td>Demon information updated</td><td>Admin</td></tr>
                <tr><td>demon_position_changed</td><td>Demon ranking changed</td><td>Admin</td></tr>
                <tr><td>points_adjusted</td><td>Manual points adjustment</td><td>Admin</td></tr>
            </table>
        </div>
    `;
}
