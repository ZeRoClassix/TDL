export function render() {
    return `
        <div class="api-page">
            <div class="version-badge v2">v2 Only</div>
            <h1>🔔 Webhooks</h1>
            <p class="lead">Real-time event notifications via HTTP callbacks.</p>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <code class="path">/v2/webhooks/</code>
                </div>
                <p class="endpoint-desc">Create a new webhook endpoint to receive event notifications.</p>

                <h3>Request Body</h3>
                <table class="api-table params">
                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                    <tr><td>url</td><td>string</td><td>Yes</td><td>HTTPS URL to receive events</td></tr>
                    <tr><td>events</td><td>array</td><td>Yes</td><td>Events to subscribe to</td></tr>
                    <tr><td>secret</td><td>string</td><td>No</td><td>Secret for HMAC signature</td></tr>
                    <tr><td>active</td><td>boolean</td><td>No</td><td>Enable immediately (default: true)</td></tr>
                </table>

                <h3>Available Events</h3>
                <table class="api-table">
                    <tr><th>Event</th><th>Description</th></tr>
                    <tr><td>record.created</td><td>New record submitted</td></tr>
                    <tr><td>record.verified</td><td>Record approved</td></tr>
                    <tr><td>record.rejected</td><td>Record rejected</td></tr>
                    <tr><td>record.revoked</td><td>Record marked invalid</td></tr>
                    <tr><td>demon.created</td><td>New demon added</td></tr>
                    <tr><td>demon.updated</td><td>Demon info updated</td></tr>
                    <tr><td>demon.position_changed</td><td>Demon ranking changed</td></tr>
                    <tr><td>player.rank_changed</td><td>Player moved in leaderboard</td></tr>
                    <tr><td>leaderboard.updated</td><td>Leaderboard recalculated</td></tr>
                </table>

                <h3>Request Example</h3>
                <pre><code>POST /v2/webhooks/ HTTP/1.1
Host: api.pcdemonlist.dev
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/pcdemonlist",
  "events": [
    "record.verified",
    "demon.position_changed",
    "player.rank_changed"
  ],
  "secret": "whsec_your_webhook_secret_123",
  "active": true
}</code></pre>

                <h3>Response (201 Created)</h3>
                <pre><code>{
  "data": {
    "webhook": {
      "id": "whk_abc123def456",
      "url": "https://your-app.com/webhooks/pcdemonlist",
      "events": ["record.verified", "demon.position_changed"],
      "secret": "whsec_************",
      "active": true,
      "created_at": "2024-01-20T14:30:00Z",
      "last_triggered": null
    }
  },
  "meta": {
    "version": "v2.0.0",
    "request_id": "req_2i4k6m8o0q2s"
  }
}</code></pre>
            </div>

            <h2>Webhook Payload Format</h2>
            <pre><code>POST https://your-app.com/webhooks/pcdemonlist HTTP/1.1
X-Webhook-ID: whk_abc123def456
X-Webhook-Event: record.verified
X-Webhook-Signature: sha256=abc123def456...
Content-Type: application/json

{
  "id": "evt_ghi789jkl012",
  "type": "record.verified",
  "created_at": "2024-01-20T15:45:00Z",
  "data": {
    "record": {
      "id": "rec_abc123",
      "demon": {
        "id": "dmn_9c3d5e7f1a2b",
        "name": "Silent Clubstep"
      },
      "player": {
        "id": "plr_7a2b4c6d8e0f",
        "name": "nSwish"
      },
      "percent": 100,
      "verified_at": "2024-01-20T15:45:00Z",
      "points_awarded": 500.0
    }
  }
}</code></pre>

            <h2>Signature Verification</h2>
            <div class="endpoint-block">
                <p>Verify webhook authenticity using the HMAC signature:</p>
                <pre><code>const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
    
  const actual = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(actual, 'hex')
  );
}

// Usage
app.post('/webhooks/pcdemonlist', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhook(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  const event = req.body;
  console.log('Received:', event.type);
  
  res.status(200).send('OK');
});</code></pre>
            </div>

            <h2>Webhook Management</h2>
            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <code class="path">/v2/webhooks/</code>
                </div>
                <p>List all your webhooks.</p>
            </div>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method patch">PATCH</span>
                    <code class="path">/v2/webhooks/{webhook_id}</code>
                </div>
                <p>Update webhook events or status.</p>
            </div>

            <div class="endpoint-block">
                <div class="endpoint-header">
                    <span class="method delete">DELETE</span>
                    <code class="path">/v2/webhooks/{webhook_id}</code>
                </div>
                <p>Delete a webhook.</p>
            </div>

            <h2>Delivery Guarantees</h2>
            <div class="info-block">
                <ul>
                    <li><strong>Retry Policy:</strong> Failed deliveries retried 3 times (1 min, 5 min, 25 min)</li>
                    <li><strong>Timeout:</strong> Webhook must respond within 30 seconds</li>
                    <li><strong>Expected Response:</strong> HTTP 200 status code</li>
                    <li><strong>Ordering:</strong> Events delivered in order per webhook</li>
                    <li><strong>Deduplication:</strong> Each event has unique ID (evt_*)</li>
                </ul>
            </div>

            <h2>Error Handling</h2>
            <table class="api-table">
                <tr><th>Status Code</th><th>Action</th></tr>
                <tr><td>2xx Success</td><td>Mark as delivered</td></tr>
                <tr><td>3xx Redirect</td><td>Follow redirect (max 3)</td></tr>
                <tr><td>4xx Client Error</td><td>Retry, alert after 3 failures</td></tr>
                <tr><td>5xx Server Error</td><td>Retry with exponential backoff</td></tr>
                <tr><td>Timeout</td><td>Retry as 5xx</td></tr>
            </table>
        </div>
    `;
}
