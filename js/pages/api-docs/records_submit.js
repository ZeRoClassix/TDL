export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>📋 Submit Record</h1>
            <p class="lead">Submit a new record for verification.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <code class="path">/v1/records/</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Submit a new record completion for a demon. The record will enter a pending state for moderator review.</p>

                <h3>Request Headers</h3>
                <table class="api-table params">
                    <tr><th>Header</th><th>Required</th><th>Description</th></tr>
                    <tr><td>Authorization</td><td>Yes</td><td>Bearer {api_key}</td></tr>
                    <tr><td>Content-Type</td><td>Yes</td><td>application/json</td></tr>
                </table>

                <h3>Request Body</h3>
                <table class="api-table params">
                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    <tr><td>demon_id</td><td>string</td><td>Yes</td><td>ID of the demon completed</td></tr>
                    <tr><td>percent</td><td>integer</td><td>Yes</td><td>Completion percentage (100 for full completion)</td></tr>
                    <tr><td>video_url</td><td>string</td><td>Yes</td><td>YouTube video URL as proof</td></tr>
                    <tr><td>raw_footage_url</td><td>string</td><td>No</td><td>Raw/unedited footage URL (recommended for top demons)</td></tr>
                    <tr><td>player_id</td><td>string</td><td>Conditional</td><td>Required if submitting for another player</td></tr>
                    <tr><td>device</td><td>string</td><td>No</td><td>PC, Mobile, or Both</td></tr>
                    <tr><td>fps</td><td>integer</td><td>No</td><td>FPS used during completion</td></tr>
                    <tr><td>attempts</td><td>integer</td><td>No</td><td>Number of attempts</td></tr>
                    <tr><td>time_spent</td><td>string</td><td>No</td><td>Time spent (e.g., "3h 45m")</td></tr>
                    <tr><td>comments</td><td>string</td><td>No</td><td>Additional comments for moderators</td></tr>
                </table>

                <h3>Request Example</h3>
                <pre><code>POST /v1/records/ HTTP/1.1
Host: api.pcdemonlist.dev
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "demon_id": "dmn_9c3d5e7f1a2b",
  "percent": 100,
  "video_url": "https://youtube.com/watch?v=submission123",
  "raw_footage_url": "https://drive.google.com/file/d/...",
  "device": "PC",
  "fps": 60,
  "attempts": 8542,
  "time_spent": "45h 30m",
  "comments": "Completed after 2 months of attempts. Had to grind the dual wave section."
}</code></pre>

                <h3>Response (201 Created)</h3>
                <pre><code>{
  "data": {
    "record": {
      "id": "rec_new_record789",
      "demon": {
        "id": "dmn_9c3d5e7f1a2b",
        "name": "Silent Clubstep"
      },
      "player": {
        "id": "plr_7a2b4c6d8e0f",
        "name": "nSwish"
      },
      "percent": 100,
      "video_url": "https://youtube.com/watch?v=submission123",
      "status": "pending",
      "submitted_at": "2024-01-20T14:30:00Z",
      "estimated_review_time": "2024-01-22T14:30:00Z"
    },
    "submission_info": {
      "queue_position": 42,
      "records_ahead": 41,
      "average_review_time": "48 hours"
    }
  },
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_2e4g6i8k0m2o"
  }
}</code></pre>

                <div class="warning-block">
                    <h4>⚠️ Important Notes</h4>
                    <ul>
                        <li>All submissions are manually reviewed by moderators</li>
                        <li>Average review time is 24-48 hours</li>
                        <li>Raw footage is required for top 50 demons</li>
                        <li>Clickbot usage must be disclosed</li>
                        <li>Any submission can be rejected for insufficient proof</li>
                    </ul>
                </div>
            </div>

            <h3>Error Responses</h3>
            <div class="error-block">
                <h4>400 Bad Request - Invalid Demon</h4>
                <pre><code>{
  "error": {
    "code": 40005,
    "message": "Invalid Demon",
    "details": "Demon 'dmn_invalid' does not exist"
  }
}</code></pre>
            </div>
            <div class="error-block">
                <h4>400 Bad Request - Invalid Video URL</h4>
                <pre><code>{
  "error": {
    "code": 40006,
    "message": "Invalid Video URL",
    "details": "Video URL must be a valid YouTube link"
  }
}</code></pre>
            </div>
            <div class="error-block">
                <h4>409 Conflict - Duplicate Submission</h4>
                <pre><code>{
  "error": {
    "code": 40903,
    "message": "Duplicate Record",
    "details": "A record for this demon and player already exists with status: verified"
  }
}</code></pre>
            </div>
            <div class="error-block">
                <h4>429 Too Many Requests</h4>
                <pre><code>{
  "error": {
    "code": 42902,
    "message": "Submission Rate Limited",
    "details": "Maximum 5 submissions per day allowed. Try again in 4 hours."
  }
}</code></pre>
            </div>
        </div>
    `;
}
