import { Redis } from '@upstash/redis';
import IORedis from 'ioredis';

new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const createIORedisConnection = () => {
  if (process.env.REDIS_URL) {
    return new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      tls: {},
    });
  }
  
  if (process.env.UPSTASH_REDIS_ENDPOINT && process.env.UPSTASH_REDIS_PASSWORD) {
    return new IORedis({
      host: process.env.UPSTASH_REDIS_ENDPOINT,
      port: 6379,
      password: process.env.UPSTASH_REDIS_PASSWORD,
      tls: {},
      maxRetriesPerRequest: null,
      connectTimeout: 30000,
      lazyConnect: true,
      keepAlive: 10000,
    });
  }

  throw new Error('Redis configuration not found. Please set UPSTASH_REDIS_ENDPOINT and UPSTASH_REDIS_PASSWORD environment variables.');
};

let ioRedisInstance: IORedis | null = null;

export const getIORedisInstance = () => {
  if (!ioRedisInstance) {
    ioRedisInstance = createIORedisConnection();
  }
  return ioRedisInstance;
};