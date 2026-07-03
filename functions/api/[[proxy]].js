/**
 * Cloudflare Pages Function – Pointercrate API Proxy
 *
 * Proxies requests to pointercrate.com server-side, bypassing CORS.
 * Only allows requests to pointercrate.com domains for security.
 *
 * Usage: /api/proxy?url=https://pointercrate.com/api/v2/demons/listed/?limit=50
 */

const ALLOWED_HOSTS = ['pointercrate.com'];

export async function onRequest(context) {
    const { request } = context;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders(),
        });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
        return jsonResponse({ error: 'Missing "url" query parameter' }, 400);
    }

    // Validate the target URL
    let parsed;
    try {
        parsed = new URL(targetUrl);
    } catch {
        return jsonResponse({ error: 'Invalid URL' }, 400);
    }

    // Security: only allow pointercrate.com
    if (!ALLOWED_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`))) {
        return jsonResponse({ error: `Host "${parsed.hostname}" is not allowed` }, 403);
    }

    try {
        const apiResponse = await fetch(targetUrl, {
            method: request.method === 'GET' ? 'GET' : request.method,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'PCDemonList-Proxy/1.0',
            },
        });

        const body = await apiResponse.text();

        return new Response(body, {
            status: apiResponse.status,
            headers: {
                ...corsHeaders(),
                'Content-Type': apiResponse.headers.get('Content-Type') || 'application/json',
                'Cache-Control': 'public, max-age=60, s-maxage=120',
            },
        });
    } catch (err) {
        return jsonResponse({ error: 'Upstream request failed', details: err.message }, 502);
    }
}

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Accept, Content-Type',
    };
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            ...corsHeaders(),
            'Content-Type': 'application/json',
        },
    });
}
