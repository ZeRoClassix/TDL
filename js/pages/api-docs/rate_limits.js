export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>⏱️ Rate Limits</h1>
            <p class="lead">API rate limiting guidelines and headers.</p>

            <h2>Rate Limit Tiers</h2>
            <table class="api-table">
                <tr><th>Tier</th><th>Requests/Minute</th><th>Requests/Hour</th><th>Requests/Day</th></tr>
                <tr><td>Anonymous</td><td>10</td><td>100</td><td>500</td></tr>
                <tr><td>Standard (Free)</td><td>60</td><td>1,000</td><td>5,000</td></tr>
                <tr><td>Pro</td><td>300</td><td>10,000</td><td>50,000</td></tr>
                <tr><td>Enterprise</td><td>1,000</td><td>50,000</td><td>Unlimited</td></tr>
            </table>

            <h2>Endpoint-Specific Limits</h2>
            <table class="api-table">
                <tr><th>Endpoint</th><th>Limit</th><th>Window</th></tr>
                <tr><td>POST /records/</td><td>5</td><td>per day</td></tr>
                <tr><td>POST /auth/login</td><td>5</td><td>per minute</td></tr>
                <tr><td>GET /demons/</td><td>100</td><td>per minute</td></tr>
                <tr><td>GET /players/</td><td>100</td><td>per minute</td></tr>
                <tr><td>GET /leaderboards/</td><td>60</td><td>per minute</td></tr>
            </table>

            <h2>Rate Limit Headers</h2>
            <p>All responses include rate limit information:</p>
            <pre><code>HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642681200
X-RateLimit-Policy: standard</code></pre>

            <table class="api-table params">
                <tr><th>Header</th><th>Description</th></tr>
                <tr><td>X-RateLimit-Limit</td><td>Maximum requests allowed in window</td></tr>
                <tr><td>X-RateLimit-Remaining</td><td>Requests remaining in current window</td></tr>
                <tr><td>X-RateLimit-Reset</td><td>Unix timestamp when limit resets</td></tr>
                <tr><td>X-RateLimit-Policy</td><td>Your current rate limit tier</td></tr>
                <tr><td>Retry-After</td><td>Seconds to wait (on 429 response)</td></tr>
            </table>

            <h2>Handling Rate Limits</h2>
            <div class="endpoint-block">
                <h3>Exponential Backoff</h3>
                <pre><code>async function apiRequestWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const delay = retryAfter 
        ? parseInt(retryAfter) * 1000 
        : Math.pow(2, i) * 1000; // Exponential backoff
        
      console.log(\`Rate limited. Retrying after \${delay}ms...\`);
      await new Promise(r => setTimeout(r, delay));
      continue;
    }
    
    return response;
  }
  
  throw new Error('Max retries exceeded');
}</code></pre>
            </div>

            <h2>429 Error Response</h2>
            <pre><code>HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642681200
Retry-After: 3600
Content-Type: application/json

{
  "error": {
    "code": 42900,
    "message": "Rate Limited",
    "details": "You have exceeded 100 requests per hour. Limit resets at 2024-01-20T15:00:00Z",
    "retry_after": 3600,
    "limit": 100,
    "window": "1 hour"
  }
}</code></pre>

            <h2>Best Practices</h2>
            <div class="info-block">
                <ul>
                    <li><strong>Cache responses:</strong> Don't repeatedly fetch the same data</li>
                    <li><strong>Use webhooks (v2):</strong> Get notified of changes instead of polling</li>
                    <li><strong>Implement backoff:</strong> Always handle 429 errors gracefully</li>
                    <li><strong>Batch requests:</strong> Combine multiple needs into fewer calls</li>
                    <li><strong>Monitor headers:</strong> Check remaining quota before heavy operations</li>
                </ul>
            </div>

            <h2>WebSocket Alternative (v2)</h2>
            <p>For real-time updates, use WebSocket connections which don't count against rate limits:</p>
            <pre><code>// v2 WebSocket for real-time updates
const ws = new WebSocket('wss://api.pcdemonlist.dev/v2/stream');

ws.onopen = () => {
  ws.send(JSON.stringify({
    action: 'subscribe',
    events: ['record.verified', 'demon.position_changed']
  }));
};

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Real-time update:', update);
};</code></pre>
        </div>
    `;
}
