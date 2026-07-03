export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>📤 List Submissions</h1>
            <p class="lead">View your record submissions and their status.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v1/submissions/</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Get all submissions made by the authenticated user.</p>

                <h3>Request Headers</h3>
                <table class="api-table params">
                    <tr><th>Header</th><th>Required</th><th>Description</th></tr>
                    <tr><td>Authorization</td><td>Yes</td><td>Bearer {api_key}</td></tr>
                </table>

                <h3>Query Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th><th>Default</th></tr>
                    <tr><td>status</td><td>string</td><td>pending, verified, rejected, all</td><td>all</td></tr>
                    <tr><td>page</td><td>integer</td><td>Page number</td><td>1</td></tr>
                    <tr><td>limit</td><td>integer</td><td>Items per page</td><td>20</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "submissions": [
      {
        "id": "sub_abc123",
        "record_id": "rec_def456",
        "demon": {
          "id": "dmn_9c3d5e7f1a2b",
          "name": "Silent Clubstep"
        },
        "percent": 100,
        "status": "verified",
        "submitted_at": "2024-01-15T10:30:00Z",
        "reviewed_at": "2024-01-17T14:20:00Z",
        "reviewed_by": "ListModerator",
        "video_url": "https://youtube.com/watch?v=...",
        "points_gained": 500.0
      },
      {
        "id": "sub_ghi789",
        "record_id": "rec_jkl012",
        "demon": {
          "id": "dmn_2f4a6b8c0d2e",
          "name": "Sonic Wave Infinity"
        },
        "percent": 100,
        "status": "pending",
        "submitted_at": "2024-01-20T09:15:00Z",
        "estimated_review": "2024-01-22T09:15:00Z",
        "queue_position": 15,
        "video_url": "https://youtube.com/watch?v=..."
      },
      {
        "id": "sub_mno345",
        "record_id": "rec_pqr678",
        "demon": {
          "id": "dmn_5h7j9l1n3p5r",
          "name": "Acheron"
        },
        "percent": 100,
        "status": "rejected",
        "submitted_at": "2024-01-10T16:45:00Z",
        "reviewed_at": "2024-01-12T11:30:00Z",
        "rejection_reason": "Insufficient proof. Video quality too low.",
        "can_resubmit": true
      }
    ],
    "summary": {
      "total": 45,
      "verified": 42,
      "pending": 2,
      "rejected": 1
    }
  },
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_6s8u0w2y4a6c"
  },
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}</code></pre>
            </div>

            <div class="endpoint-block v2-section">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v2/submissions/{submission_id}</code>
                    <span class="badge v2">v2</span>
                </div>
                <p class="endpoint-desc">Get detailed information about a specific submission including full review history.</p>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "id": "sub_abc123",
    "record": {
      "id": "rec_def456",
      "percent": 100,
      "video_url": "https://youtube.com/watch?v=...",
      "raw_footage_url": "https://drive.google.com/...",
      "device": "PC",
      "fps": 60,
      "attempts": 8542
    },
    "demon": {
      "id": "dmn_9c3d5e7f1a2b",
      "name": "Silent Clubstep",
      "position": 1
    },
    "status_history": [
      {
        "status": "submitted",
        "timestamp": "2024-01-15T10:30:00Z",
        "by": "player"
      },
      {
        "status": "under_review",
        "timestamp": "2024-01-16T09:00:00Z",
        "by": "AutoMod",
        "notes": "Passed initial validation"
      },
      {
        "status": "verified",
        "timestamp": "2024-01-17T14:20:00Z",
        "by": "ListModerator",
        "notes": "Video verified. Completes demon."
      }
    ],
    "moderator_notes": [
      {
        "timestamp": "2024-01-17T14:20:00Z",
        "moderator": "ListModerator",
        "note": "Video verified. Completes demon at 100%."
      }
    ]
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_8u0w2y4a6c8e"
  }
}</code></pre>
            </div>
        </div>
    `;
}
