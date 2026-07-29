const DEFAULT_HQ_UPSTREAM_URL = 'https://onemission-world.vercel.app/api';

const ALLOWED_PUBLIC_PATTERNS = [
  /^commerce\/categories$/,
  /^commerce\/products$/,
  /^commerce\/products\/featured$/,
  /^commerce\/products\/new-arrivals$/,
  /^commerce\/products\/search$/,
  /^commerce\/products\/[^/]+$/,
  /^shipping\/provinces$/,
  /^shipping\/cities$/,
  /^shipping\/districts$/,
  /^shipping\/cost$/,
  /^customer\/auth\/register$/,
  /^customer\/auth\/register\/request$/,
  /^customer\/auth\/register\/verify$/,
  /^customer\/auth\/register\/resend$/,
  /^customer\/auth\/login$/,
  /^customer\/auth\/google$/,
  /^customer\/auth\/refresh$/,
  /^customer\/auth\/logout$/,
  /^customer\/auth\/logout-all$/,
  /^customer\/auth\/me$/,
  /^customer\/auth\/change-password$/,
  /^customer\/auth\/forgot-password$/,
  /^customer\/auth\/reset-password$/,
  /^customer\/profile$/,
  /^customer\/addresses$/,
  /^customer\/addresses\/[^/]+$/,
  /^customer\/addresses\/[^/]+\/default$/,
  /^orders\/customer$/,
  /^orders\/track$/,
  /^orders\/by-number\/[^/]+$/,
  /^orders\/by-checkout-session\/[^/]+$/,
  /^orders\/[^/]+\/cancel$/,
  /^orders\/[^/]+\/return-request$/,
  /^checkout\/history$/,
  /^checkout\/session$/,
  /^checkout\/session\/[^/]+$/,
  /^payment-attempt$/,
  /^payment-attempt\/[^/]+$/,
  /^payment-attempt\/[^/]+\/cancel$/,
  /^payment-attempt\/[^/]+\/snap$/,
  /^newsletter\/subscribe$/,
  /^website$/,
  /^website\/hero$/,
  /^website\/brand-video$/,
  /^website\/product-story$/,
];

function getUpstreamBaseUrl() {
  const candidates = [
    process.env.API_BASE_URL,
    process.env.HQ_API_URL,
    process.env.VITE_API_BASE_URL,
    process.env.NEXT_PUBLIC_HQ_URL,
  ];

  const value = candidates.find((candidate) => String(candidate || '').trim()) || DEFAULT_HQ_UPSTREAM_URL;
  return String(value).trim().replace(/\/$/, '');
}

function isAllowedPublicPath(pathname) {
  return ALLOWED_PUBLIC_PATTERNS.some((pattern) => pattern.test(pathname));
}

async function readRequestBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }

  if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
    return req.body;
  }

  if (req.body && typeof req.body === 'object') {
    return JSON.stringify(req.body);
  }

  return await new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve(undefined);
        return;
      }
      resolve(Buffer.concat(chunks));
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  const startedAt = Date.now();

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathSegments = Array.isArray(req.query.path)
      ? req.query.path
      : typeof req.query.path === 'string'
        ? [req.query.path]
        : [];
    const fallbackPath = url.pathname.replace(/^\/api\/?/, '').replace(/^\/+|\/+$/g, '');
    const publicPath = pathSegments.length > 0 ? pathSegments.join('/') : fallbackPath;

    if (!publicPath || !isAllowedPublicPath(publicPath)) {
      res.status(404).json({ error: 'Commerce public API route was not found.' });
      return;
    }

    const upstreamUrl = new URL(`${getUpstreamBaseUrl()}/${publicPath}`);
    url.searchParams.forEach((value, key) => {
      if (key === 'path') return;
      upstreamUrl.searchParams.append(key, value);
    });

    const body = await readRequestBody(req);
    const headers = {
      Accept: 'application/json',
    };

    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    }
    if (req.headers['user-agent']) {
      headers['User-Agent'] = req.headers['user-agent'];
    }
    if (req.headers['x-forwarded-for']) {
      headers['X-Forwarded-For'] = req.headers['x-forwarded-for'];
    }
    if (req.headers['x-real-ip']) {
      headers['X-Real-IP'] = req.headers['x-real-ip'];
    }

    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: req.method,
      headers,
      body,
    });

    const contentType = upstreamResponse.headers.get('content-type') || 'application/json';
    const payload = await upstreamResponse.arrayBuffer();

    res.status(upstreamResponse.status);
    res.setHeader('Content-Type', contentType);
    res.send(Buffer.from(payload));
  } catch (error) {
    res.status(500).json({
      error: 'Commerce API proxy could not complete the request.',
    });
  } finally {
    if (process.env.NODE_ENV === 'development') {
      console.info(`${req.method} ${req.url} Response Time: ${Date.now() - startedAt} ms`);
    }
  }
}
