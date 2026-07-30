import { Redis } from '@upstash/redis';

const globalRedisState = globalThis.__onemissionRedisState ?? {
  client: null,
  initPromise: null,
  warnedMessages: new Set(),
};

globalThis.__onemissionRedisState = globalRedisState;

function warnOnce(message, error) {
  if (globalRedisState.warnedMessages.has(message)) {
    return;
  }

  globalRedisState.warnedMessages.add(message);
  if (error) {
    console.warn(message, error);
    return;
  }

  console.warn(message);
}

function getRedisCredentials() {
  const url = String(process.env.UPSTASH_REDIS_REST_URL || '').trim();
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();

  return {
    url,
    token,
    configured: Boolean(url && token),
  };
}

function createRedisClient() {
  const credentials = getRedisCredentials();
  if (!credentials.configured) {
    if (process.env.NODE_ENV !== 'production') {
      warnOnce('Redis unavailable. Running without cache.');
    }
    return null;
  }

  return new Redis({
    url: credentials.url,
    token: credentials.token,
  });
}

export async function initializeRedis() {
  if (globalRedisState.initPromise) {
    return globalRedisState.initPromise;
  }

  globalRedisState.initPromise = (async () => {
    const client = createRedisClient();
    if (!client) {
      globalRedisState.client = null;
      return false;
    }

    try {
      await client.ping();
      globalRedisState.client = client;
      return true;
    } catch (error) {
      globalRedisState.client = null;
      warnOnce('Redis unavailable. Running without cache.', error);
      return false;
    }
  })();

  return globalRedisState.initPromise;
}

export async function getRedisClient() {
  const connected = await initializeRedis();
  return connected ? globalRedisState.client : null;
}
