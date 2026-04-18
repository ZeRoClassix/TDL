export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>📋 Delete Record</h1>
            <p class="lead">Remove a record from the system.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method delete">DELETE</span>
                    <code class="path">/v1/records/{record_id}/</code>
                    <span class="badge v1">v1</span>
                </div>
                <p class="endpoint-desc">Delete a record. Can be performed by the record owner (if pending) or moderators.</p>

                <h3>Path Parameters</h3>
                <table class="api-table params">
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                    <tr><td>record_id</td><td>string</td><td>Record ID (rec_*)</td></tr>
                </table>

                <h3>Request Headers</h3>
                <table class="api-table params">
                    <tr><th>Header</th><th>Required</th><th>Description</th></tr>
                    <tr><td>Authorization</td><td>Yes</td><td>Bearer {api_key}</td></tr>
                </table>

                <h3>Request Body (Optional)</h3>
                <table class="api-table params">
                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    <tr><td>reason</td><td>string</td><td>No</td><td>Reason for deletion (logged)</td></tr>
                </table>

                <h3>Response (204 No Content)</h3>
                <p>Successful deletion returns no content.</p>
            </div>

            <div class="endpoint-block v2-section">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <code class="path">/v2/records/{record_id}/revoke</code>
                    <span class="badge v2">v2</span>
                </div>
                <p class="endpoint-desc">Revoke a verified record (mark as invalid without deleting). Creates a record in the revoked records log.</p>

                <h3>Request Body</h3>
                <table class="api-table params">
                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    <tr><td>reason</td><td>string</td><td>Yes</td><td>Reason for revocation</td></tr>
                    <tr><td>evidence_url</td><td>string</td><td>No</td><td>URL to evidence of invalid record</td></tr>
                    <tr><td>notify_player</td><td>boolean</td><td>No</td><td>Default: true</td></tr>
                </table>

                <h3>Response (200 OK)</h3>
                <pre><code>{
  "data": {
    "record": {
      "id": "rec_old123",
      "status": "revoked",
      "revoked_at": "2024-01-21T10:15:00Z",
      "revoked_by": {
        "id": "usr_mod123",
        "name": "ListModerator"
      }
    },
    "revocation": {
      "reason": "Video analysis shows clickbot usage",
      "evidence_url": "https://docs.google.com/...",
      "points_deducted": 500.0
    },
    "player_notified": true
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_8k0m2o4q6s8u"
  }
}</code></pre>

                <div class="info-block">
                    <h4>Delete vs Revoke</h4>
                    <ul>
                        <li><strong>Delete:</strong> Removes record completely (use for duplicates, test submissions)</li>
                        <li><strong>Revoke:</strong> Keeps record visible as "revoked" with reason (use for fake/cheated runs)</li>
                    </ul>
                </div>
            </div>

            <h3>Error Responses</h3>
            <div class="error-block">
                <h4>403 Forbidden</h4>
                <pre><code>{
  "error": {
    "code": 40303,
    "message": "Cannot Delete Record",
    "details": "Verified records can only be deleted by moderators"
  }
}</code></pre>
            </div>
            <div class="error-block">
                <h4>404 Not Found</h4>
                <pre><code>{
  "error": {
    "code": 40404,
    "message": "Record Not Found",
    "details": "No record found with ID 'rec_invalid'"
  }
}</code></pre>
            </div>
        </div>
    `;
}
