import { env } from './env';

const restUrl = process.env.UPSTASH_REDIS_REST_URL || '';
const restToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

const isRestConfigured = !!restUrl && !!restToken;

if (isRestConfigured) {
  console.log('Connected to Upstash Redis REST API caching layer.');
} else {
  console.warn('Upstash REST API credentials missing. Caching disabled.');
}

const upstashQuery = async (command: any[]): Promise<any> => {
  if (!isRestConfigured) return null;
  try {
    const res = await fetch(restUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${restToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!res.ok) {
      throw new Error(`Upstash REST API error: ${res.statusText}`);
    }

    const data = (await res.json()) as any;
    return data.result;
  } catch (err) {
    console.warn('Upstash Redis REST query failed:', err);
    return null;
  }
};

export const cache = {
  get: async (key: string): Promise<string | null> => {
    return await upstashQuery(['GET', key]);
  },

  set: async (key: string, value: string, ttlSeconds: number = 300): Promise<void> => {
    await upstashQuery(['SET', key, value, 'EX', ttlSeconds]);
  },

  del: async (key: string): Promise<void> => {
    await upstashQuery(['DEL', key]);
  },

  clearPattern: async (pattern: string): Promise<void> => {
    try {
      const keys = await upstashQuery(['KEYS', pattern]);
      if (keys && keys.length > 0) {
        await upstashQuery(['DEL', ...keys]);
      }
    } catch (err) {
      console.warn('Upstash Redis clearPattern error:', err);
    }
  }
};
