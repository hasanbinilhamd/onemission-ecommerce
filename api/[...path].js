import crypto from 'node:crypto';
import { cache, initializeCache } from '../lib/cache.js';

const DEFAULT_HQ_UPSTREAM_URL = 'https://onemission-world.vercel.app/api';
const EARLY_ACCESS_COOKIE_NAME = 'om_early_access';
const EARLY_ACCESS_SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;
const EARLY_ACCESS_RATE_LIMIT_SECONDS = 10 * 60;
const EARLY_ACCESS_RATE_LIMIT_MAX_ATTEMPTS = 8;

void initializeCache();

const ALLOWED_PUBLIC_PATTERNS = [
  /^early-access\/status$/,
  /^early-access\/verify$/,
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
  /^orders\/[^/]+\/confirm-received$/,
  /^orders\/[^/]+\/return-request$/,
  /^faqs$/,
  /^checkout\/history$/,
  /^checkout\/session$/,
  /^checkout\/session\/[^/]+$/,
  /^payment-attempt$/,
  /^payment-attempt\/[^/]+$/,
  /^payment-attempt\/[^/]+\/cancel$/,
  /^payment-attempt\/[^/]+\/snap$/,
  /^newsletter\/subscribe$/,
  /^reviews$/,
  /^promotions\/validate$/,
  /^website$/,
  /^website\/hero$/,
  /^website\/brand-video$/,
  /^website\/product-story$/,
  /^website\/collection$/,
  /^movement\/home$/,
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

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value) {
  return Buffer.from(String(value || ''), 'base64url').toString('utf8');
}

function getEarlyAccessSessionSecret() {
  return String(
    process.env.EARLY_ACCESS_SESSION_SECRET
    || process.env.SESSION_SECRET
    || process.env.UPSTASH_REDIS_REST_TOKEN
    || 'onemission-early-access-development-secret',
  );
}

function signEarlyAccessPayload(payload) {
  return crypto.createHmac('sha256', getEarlyAccessSessionSecret()).update(payload).digest('base64url');
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${value}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  parts.push(`Path=${options.path || '/'}`);
  parts.push('HttpOnly');
  parts.push('SameSite=Lax');
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

function parseCookies(req) {
  const header = String(req.headers.cookie || '');
  return header.split(';').reduce((cookies, part) => {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (!rawName) return cookies;
    cookies[rawName] = decodeURIComponent(rawValue.join('=') || '');
    return cookies;
  }, {});
}

function clearEarlyAccessCookie(res) {
  res.setHeader('Set-Cookie', serializeCookie(EARLY_ACCESS_COOKIE_NAME, '', { maxAge: 0 }));
}

function createEarlyAccessCookie({ chapter, revision }) {
  const expiresAt = Date.now() + EARLY_ACCESS_SESSION_TTL_SECONDS * 1000;
  const payload = base64UrlEncode(JSON.stringify({ chapter, revision, expiresAt }));
  const signature = signEarlyAccessPayload(payload);
  return serializeCookie(EARLY_ACCESS_COOKIE_NAME, `${payload}.${signature}`, { maxAge: EARLY_ACCESS_SESSION_TTL_SECONDS });
}

function readEarlyAccessSession(req) {
  const raw = parseCookies(req)[EARLY_ACCESS_COOKIE_NAME] || '';
  const [payload, signature] = raw.split('.');
  if (!payload || !signature) return null;

  const expectedSignature = signEarlyAccessPayload(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const session = JSON.parse(base64UrlDecode(payload));
    if (!session?.expiresAt || Number(session.expiresAt) <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

function isEarlyAccessSessionValid(req, status) {
  if (!status?.enabled) return true;
  const session = readEarlyAccessSession(req);
  return Boolean(session && session.chapter === status.chapter && session.revision === status.revision);
}

function extractIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || String(req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown');
}

async function enforceEarlyAccessRateLimit(req) {
  const key = `early-access:verify:${extractIp(req)}`;
  const current = Number(await cache.get(key) || 0);
  if (current >= EARLY_ACCESS_RATE_LIMIT_MAX_ATTEMPTS) {
    return false;
  }
  await cache.set(key, String(current + 1), { ttl: EARLY_ACCESS_RATE_LIMIT_SECONDS });
  return true;
}

async function fetchEarlyAccessStatus() {
  const upstreamUrl = `${getUpstreamBaseUrl()}/public/early-access/status`;
  const response = await fetch(upstreamUrl, { headers: { Accept: 'application/json' } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || 'Early Access status could not be loaded.');
  }
  return payload;
}

async function verifyEarlyAccessPassword(password) {
  const upstreamUrl = `${getUpstreamBaseUrl()}/public/early-access/verify`;
  const response = await fetch(upstreamUrl, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.error || 'Early Access password could not be verified.');
    error.statusCode = response.status;
    throw error;
  }
  return payload;
}

async function handleEarlyAccessRoute(req, res, publicPath) {
  if (publicPath === 'early-access/status') {
    const status = await fetchEarlyAccessStatus();
    const authenticated = isEarlyAccessSessionValid(req, status);
    if (!status.enabled) clearEarlyAccessCookie(res);
    res.status(200).json({ enabled: Boolean(status.enabled), chapter: status.chapter || 'CHAPTER 01', authenticated });
    return true;
  }

  if (publicPath === 'early-access/verify') {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed.' });
      return true;
    }

    const allowed = await enforceEarlyAccessRateLimit(req);
    if (!allowed) {
      res.status(429).json({ error: 'Too many attempts. Please try again later.' });
      return true;
    }

    const body = await readRequestBody(req);
    const payload = body ? JSON.parse(Buffer.isBuffer(body) ? body.toString('utf8') : String(body)) : {};
    const verified = await verifyEarlyAccessPassword(payload.password || '');
    res.setHeader('Set-Cookie', createEarlyAccessCookie({ chapter: verified.chapter, revision: verified.revision }));
    res.status(200).json({ success: true, enabled: Boolean(verified.enabled), chapter: verified.chapter || 'CHAPTER 01' });
    return true;
  }

  return false;
}

async function ensureEarlyAccessAllowed(req, res, publicPath) {
  if (publicPath.startsWith('early-access/')) return true;
  const status = await fetchEarlyAccessStatus();
  if (!status.enabled) return true;
  if (isEarlyAccessSessionValid(req, status)) return true;
  res.status(423).json({ error: 'Early Access is required.', code: 'EARLY_ACCESS_REQUIRED' });
  return false;
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

    if (await handleEarlyAccessRoute(req, res, publicPath)) {
      return;
    }

    if (!publicPath || !isAllowedPublicPath(publicPath)) {
      res.status(404).json({ error: 'Commerce public API route was not found.' });
      return;
    }

    if (!(await ensureEarlyAccessAllowed(req, res, publicPath))) {
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
