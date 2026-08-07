export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = env.ORIGIN_URL || 'https://appibackend-production.up.railway.app';
    const targetUrl = origin + url.pathname + url.search;

    const headers = new Headers(request.headers);
    headers.set('Host', new URL(origin).host);
    headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');

    const init = {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text(),
      redirect: 'manual',
    };

    let response;
    try {
      response = await fetch(targetUrl, init);
    } catch (e) {
      return new Response(JSON.stringify({ statusCode: 502, message: 'Backend unavailable' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: responseHeaders });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
};
