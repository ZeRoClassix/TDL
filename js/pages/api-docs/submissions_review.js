export function render() {
    return `
        <div class="api-page">
            <div class="version-badge v2">v2 Only - Moderators</div>
            <h1>📤 Review Submission</h1>
            <p class="lead">Moderator tools for reviewing and processing submissions.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v2/submissions/pending</code>
                </div>
                <p class="endpoint-desc">Get all pending submissions awaiting review (moderator only).</p>

                <h3>Query Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th></tr>
                    <tr><td>priority</td><td>boolean</td><td>High-priority demons first</td><td>true</td></tr>
                    <tr><td>oldest_first</td><td>boolean</td><td>Sort by submission date</td><td>true</td></tr>
                    <tr><td>limit</td><td>integer</td><td>Records per page</td><td>50</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "total_pending": 42,
    "avg_wait_time": "36 hours",
    "submissions": [
      {
        "id": "sub_new123",
        "priority": "high",
        "demon": {
          "id": "dmn_9c3d5e7f1a2b",
          "name": "Silent Clubstep",
          "position": 1
        },
        "player": {
          "id": "plr_7a2b4c6d8e0f",
          "name": "NewPlayer"
        },
        "percent": 100,
        "submitted_at": "2024-01-20T10:00:00Z",
        "wait_hours": 4,
        "video_url": "https://youtube.com/watch?v=...",
        "raw_footage_url": "https://drive.google.com/...",
        "comments": "First ever completion!",
        "device": "PC",
        "has_raw_footage": true
      }
    ]
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_0w2y4a6c8e0g"
  }
}</code></pre>
            </div>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <code class="path">/v2/submissions/{submission_id}/review</code>
                </div>
                <p class="endpoint-desc">Submit a review decision for a submission.</p>

                <h3>Request Body</h3>
                <table class="api-table params">
                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    <tr><td>decision</td><td>string</td><td>Yes</td><td>approve, reject, request_info</td></tr>
                    <tr><td>public_reason</td><td>string</td><td>If reject</td><td>Reason shown to player</td></tr>
                    <tr><td>internal_notes</td><td>string</td><td>No</td><td>Private moderator notes</td></tr>
                    <tr><td>tags</td><td>array</td><td>No</td><td>Review tags (e.g., ["good_proof", "suspected_hacks"])</td></tr>
                </table>

                <h3>Request Example</h3>
                <pre><code>POST /v2/submissions/sub_new123/review HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "decision": "reject",
  "public_reason": "Raw footage shows frame skips at 68%. Please provide uncut footage.",
  "internal_notes": "Suspected teleport hack usage at dual section",
  "tags": ["insufficient_proof", "suspected_cheats"]
}</code></pre>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "submission": {
      "id": "sub_new123",
      "status": "rejected",
      "reviewed_at": "2024-01-20T15:30:00Z",
      "reviewed_by": "ListModerator"
    },
    "next_in_queue": {
      "id": "sub_next456",
      "demon": "Acheron",
      "wait_time": "12 hours"
    }
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_2y4a6c8e0g2i"
  }
}</code></pre>
            </div>

            <h3>Review Tags</h3>
            <table class="api-table">
                <tr><th>Tag</th><th>Usage</th></tr>
                <tr><td>good_proof</td><td>High quality video evidence</td></tr>
                <tr><td>insufficient_proof</td><td>Video doesn't clearly show completion</td></tr>
                <tr><td>suspected_cheats</td><td>Possible hack usage detected</td></tr>
                <tr><td>wrong_percent</td><td>Video shows different percentage than claimed</td></tr>
                <tr><td>wrong_demon</td><td>Video is of a different level</td></tr>
                <tr><td>duplicate</td><td>Record already exists</td></tr>
                <tr><td>fps_violation</td><td>FPS requirements not met</td></tr>
            </table>
        </div>
    `;
}
