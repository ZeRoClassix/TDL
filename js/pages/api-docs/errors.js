export function render() {
    return `
        <div class="api-page">
            <div class="version-badges-row">
                <span class="badge v1">v1</span>
                <span class="badge v2">v2</span>
            </div>
            <h1>⚠️ Errors</h1>
            <p class="lead">Complete error code reference and handling guide.</p>

            <h2>Error Response Format</h2>
            <p>All errors follow a standardized format:</p>
            <pre><code>{
  "error": {
    "code": 40401,
    "message": "Not Found",
    "details": "Resource does not exist",
    "request_id": "req_abc123",
    "documentation_url": "https://api.pcdemonlist.dev/docs/errors/40401"
  }
}</code></pre>

            <h2>Error Code Ranges</h2>
            <table class="api-table">
                <tr><th>Range</th><th>Category</th><th>Description</th></tr>
                <tr><td>400xx</td><td>Client Errors</td><td>Bad requests, validation failures</td></tr>
                <tr><td>401xx</td><td>Authentication</td><td>Login, token, permission issues</td></tr>
                <tr><td>403xx</td><td>Authorization</td><td>Access denied, insufficient rights</td></tr>
                <tr><td>404xx</td><td>Not Found</td><td>Missing resources</td></tr>
                <tr><td>409xx</td><td>Conflicts</td><td>Duplicate data, state conflicts</td></tr>
                <tr><td>429xx</td><td>Rate Limiting</td><td>Too many requests</td></tr>
                <tr><td>500xx</td><td>Server Errors</td><td>Internal failures</td></tr>
            </table>

            <h2>400xx - Client Errors</h2>
            <div class="endpoint-block">
                <table class="api-table error-codes">
                    <tr><th>Code</th><th>Message</th><th>Description</th></tr>
                    <tr><td>40000</td><td>Bad Request</td><td>Malformed request syntax</td></tr>
                    <tr><td>40001</td><td>Validation Failed</td><td>Request validation failed</td></tr>
                    <tr><td>40002</td><td>Invalid JSON</td><td>Request body contains invalid JSON</td></tr>
                    <tr><td>40003</td><td>Missing Required Field</td><td>Required field not provided</td></tr>
                    <tr><td>40004</td><td>Invalid Field Type</td><td>Field has wrong data type</td></tr>
                    <tr><td>40005</td><td>Invalid Demon</td><td>Demon ID doesn't exist</td></tr>
                    <tr><td>40006</td><td>Invalid Video URL</td><td>Video URL must be valid YouTube</td></tr>
                    <tr><td>40007</td><td>Invalid Percent</td><td>Percent must be 1-100</td></tr>
                    <tr><td>40008</td><td>Invalid Date Format</td><td>Date must be ISO 8601</td></tr>
                    <tr><td>40009</td><td>Field Too Long</td><td>Field exceeds maximum length</td></tr>
                    <tr><td>40010</td><td>Invalid Password</td><td>Current password incorrect</td></tr>
                </table>
            </div>

            <h2>401xx - Authentication Errors</h2>
            <div class="endpoint-block">
                <table class="api-table error-codes">
                    <tr><th>Code</th><th>Message</th><th>Description</th></tr>
                    <tr><td>40100</td><td>Authentication Required</td><td>No valid credentials provided</td></tr>
                    <tr><td>40101</td><td>Invalid Credentials</td><td>Email or password incorrect</td></tr>
                    <tr><td>40102</td><td>Invalid Client</td><td>OAuth client ID/secret invalid</td></tr>
                    <tr><td>40103</td><td>Invalid Refresh Token</td><td>Refresh token expired/revoked</td></tr>
                    <tr><td>40104</td><td>Token Expired</td><td>Access token expired</td></tr>
                    <tr><td>40105</td><td>Invalid Token Format</td><td>Token malformed</td></tr>
                    <tr><td>40106</td><td>Account Disabled</td><td>User account is disabled</td></tr>
                    <tr><td>40107</td><td>Account Unverified</td><td>Email not verified</td></tr>
                </table>
            </div>

            <h2>403xx - Authorization Errors</h2>
            <div class="endpoint-block">
                <table class="api-table error-codes">
                    <tr><th>Code</th><th>Message</th><th>Description</th></tr>
                    <tr><td>40300</td><td>Insufficient Permissions</td><td>Not enough privileges</td></tr>
                    <tr><td>40301</td><td>Permission Denied</td><td>Action not allowed</td></tr>
                    <tr><td>40302</td><td>Moderator Access Required</td><td>Need moderator role</td></tr>
                    <tr><td>40303</td><td>Cannot Delete Record</td><td>Not authorized to delete</td></tr>
                    <tr><td>40304</td><td>User Banned</td><td>Account suspended</td></tr>
                    <tr><td>40305</td><td>Read-Only Mode</td><td>API in maintenance</td></tr>
                </table>
            </div>

            <h2>404xx - Not Found Errors</h2>
            <div class="endpoint-block">
                <table class="api-table error-codes">
                    <tr><th>Code</th><th>Message</th><th>Description</th></tr>
                    <tr><td>40400</td><td>Not Found</td><td>Resource doesn't exist</td></tr>
                    <tr><td>40401</td><td>User Not Found</td><td>User ID invalid</td></tr>
                    <tr><td>40402</td><td>Player Not Found</td><td>Player ID invalid</td></tr>
                    <tr><td>40403</td><td>Demon Not Found</td><td>Demon ID invalid</td></tr>
                    <tr><td>40404</td><td>Record Not Found</td><td>Record ID invalid</td></tr>
                    <tr><td>40405</td><td>Submission Not Found</td><td>Submission ID invalid</td></tr>
                    <tr><td>40406</td><td>Endpoint Not Found</td><td>API endpoint doesn't exist</td></tr>
                    <tr><td>40407</td><td>Leaderboard Not Found</td><td>Leaderboard not available</td></tr>
                </table>
            </div>

            <h2>409xx - Conflict Errors</h2>
            <div class="endpoint-block">
                <table class="api-table error-codes">
                    <tr><th>Code</th><th>Message</th><th>Description</th></tr>
                    <tr><td>40900</td><td>Conflict</td><td>Resource state conflict</td></tr>
                    <tr><td>40901</td><td>User Already Exists</td><td>Email/username taken</td></tr>
                    <tr><td>40902</td><td>Username Taken</td><td>Username unavailable</td></tr>
                    <tr><td>40903</td><td>Duplicate Record</td><td>Record already exists</td></tr>
                    <tr><td>40904</td><td>Already Processed</td><td>Action already taken</td></tr>
                    <tr><td>40905</td><td>Concurrent Edit</td><td>Resource modified by another</td></tr>
                </table>
            </div>

            <h2>429xx - Rate Limit Errors</h2>
            <div class="endpoint-block">
                <table class="api-table error-codes">
                    <tr><th>Code</th><th>Message</th><th>Description</th></tr>
                    <tr><td>42900</td><td>Rate Limited</td><td>Too many requests</td></tr>
                    <tr><td>42901</td><td>Login Rate Limited</td><td>Too many login attempts</td></tr>
                    <tr><td>42902</td><td>Submission Rate Limited</td><td>Too many submissions</td></tr>
                    <tr><td>42903</td><td>API Key Rate Limited</td><td>API key quota exceeded</td></tr>
                    <tr><td>42904</td><td>IP Rate Limited</td><td>IP address blocked</td></tr>
                </table>
            </div>

            <h2>500xx - Server Errors</h2>
            <div class="endpoint-block">
                <table class="api-table error-codes">
                    <tr><th>Code</th><th>Message</th><th>Description</th></tr>
                    <tr><td>50000</td><td>Internal Server Error</td><td>Unexpected server error</td></tr>
                    <tr><td>50001</td><td>Database Error</td><td>Database operation failed</td></tr>
                    <tr><td>50002</td><td>External API Error</td><td>Third-party service failed</td></tr>
                    <tr><td>50003</td><td>Calculation Error</td><td>Points calculation failed</td></tr>
                    <tr><td>50004</td><td>Cache Error</td><td>Cache operation failed</td></tr>
                    <tr><td>50005</td><td>Queue Error</td><td>Background job failed</td></tr>
                </table>
            </div>

            <h2>Error Handling Best Practices</h2>
            <div class="info-block">
                <h4>Recommended Approach</h4>
                <pre><code>try {
  const response = await fetch('/v1/records/', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    
    // Handle specific error codes
    switch (error.error.code) {
      case 42902:
        // Retry after delay
        const retryAfter = response.headers.get('Retry-After');
        await delay(retryAfter * 1000);
        return retryRequest();
        
      case 40104:
        // Refresh token and retry
        await refreshToken();
        return retryRequest();
        
      default:
        throw new APIError(error.error);
    }
  }
  
  return await response.json();
} catch (error) {
  console.error('API Error:', error);
}</code></pre>
            </div>
        </div>
    `;
}
