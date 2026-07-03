export function render() {
    return `
        <div class="api-page">
            <h1>📚 Introduction</h1>
            <p class="lead">Welcome to the PC Demonlist API documentation. This API provides comprehensive access to Geometry Dash demonlist data, player statistics, records, and more.</p>

            <div class="version-section">
                <h2>Base URLs</h2>
                <div class="endpoint-block">
                    <div class="endpoint-header">
                        <span class="badge v1">v1</span>
                        <code class="base-url">https://api.pcdemonlist.dev/v1</code>
                    </div>
                    <p>Stable version with core functionality. Recommended for production use.</p>
                </div>
                <div class="endpoint-block">
                    <div class="endpoint-header">
                        <span class="badge v2">v2</span>
                        <code class="base-url">https://api.pcdemonlist.dev/v2</code>
                    </div>
                    <p>Latest version with advanced features including OAuth2, cursor pagination, webhooks, and improved error handling.</p>
                </div>
            </div>

            <h2>Quick Start</h2>
            <p>Get started with the API in minutes:</p>
            <pre><code>// Get the current demon list
curl -X GET "https://api.pcdemonlist.dev/v1/demons/" \\
  -H "Authorization: Bearer YOUR_API_KEY"

// Response
{
  "data": [
    {
      "id": "dmn_abc123",
      "name": "Silent Clubstep",
      "position": 1,
      "publisher": {"name": "Serponge", "id": "usr_xyz789"},
      "verifier": {"name": "nSwish", "id": "plr_def456"},
      "creators": [{"name": "Serponge", "id": "usr_xyz789"}],
      "video_url": "https://youtube.com/watch?v=...",
      "records_required": 1,
      "thumbnail": "https://i.ytimg.com/vi/.../mqdefault.jpg"
    }
  ],
  "meta": {
    "version": "v1.2.0",
    "request_id": "req_7f8d9a2b4c6e"
  }
}</code></pre>

            <h2>Response Format</h2>
            <p>All API responses follow a standardized JSON structure:</p>
            <pre><code>{
  "data": {},           // The actual response payload
  "meta": {             // Metadata about the request
    "version": "v1.2.0",
    "request_id": "req_7f8d9a2b4c6e",
    "timestamp": "2024-01-20T14:30:00Z"
  },
  "pagination": {       // Pagination information (if applicable)
    "total": 100,
    "page": 1,
    "limit": 50,
    "has_more": true
  }
}</code></pre>

            <h2>HTTP Status Codes</h2>
            <table class="api-table">
                <tr><th>Status</th><th>Meaning</th></tr>
                <tr><td><code class="status success">200</code></td><td>OK - Request successful</td></tr>
                <tr><td><code class="status success">201</code></td><td>Created - Resource created successfully</td></tr>
                <tr><td><code class="status success">204</code></td><td>No Content - Request successful, no body</td></tr>
                <tr><td><code class="status error">400</code></td><td>Bad Request - Invalid parameters</td></tr>
                <tr><td><code class="status error">401</code></td><td>Unauthorized - Authentication required</td></tr>
                <tr><td><code class="status error">403</code></td><td>Forbidden - Insufficient permissions</td></tr>
                <tr><td><code class="status error">404</code></td><td>Not Found - Resource doesn't exist</td></tr>
                <tr><td><code class="status error">409</code></td><td>Conflict - Resource already exists</td></tr>
                <tr><td><code class="status error">429</code></td><td>Too Many Requests - Rate limit exceeded</td></tr>
                <tr><td><code class="status error">500</code></td><td>Internal Server Error</td></tr>
            </table>

            <h2>Authentication</h2>
            <p>The API uses Bearer token authentication. Include your API key in the Authorization header:</p>
            <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>
            <p>Get your API key by registering at <a href="https://pcdemonlist.dev" target="_blank">pcdemonlist.dev</a>.</p>

            <h2>Version Comparison</h2>
            <table class="api-table">
                <tr><th>Feature</th><th>v1</th><th>v2</th></tr>
                <tr><td>API Key Auth</td><td>✅</td><td>✅</td></tr>
                <tr><td>OAuth2</td><td>❌</td><td>✅</td></tr>
                <tr><td>Offset Pagination</td><td>✅</td><td>✅</td></tr>
                <tr><td>Cursor Pagination</td><td>❌</td><td>✅</td></tr>
                <tr><td>Webhooks</td><td>❌</td><td>✅</td></tr>
                <tr><td>Structured Errors</td><td>Basic</td><td>Detailed</td></tr>
                <tr><td>Rate Limit Headers</td><td>Basic</td><td>Detailed</td></tr>
            </table>
        </div>
    `;
}
