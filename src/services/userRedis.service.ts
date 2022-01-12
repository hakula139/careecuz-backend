import { REDIS_KEY_PREFIX } from '@/configs';
import { redisManager } from './redis.service';

const { db } = redisManager;

export const getUserToken = (userId: string): Promise<string | null> =>
  db.get(`${REDIS_KEY_PREFIX}user:token:${userId}`);

export const setUserToken = (
  userId: string,
  token: string,
  expire: number = 7 * 24 * 60 * 60, // will expire in a week by default
): Promise<string | null> => db.set(`${REDIS_KEY_PREFIX}user:token:${userId}`, token, { EX: expire });

export const getUserId = (socketId: string): Promise<string | null> => db.get(`${REDIS_KEY_PREFIX}socket:${socketId}`);

export const setUserId = (socketId: string, userId: string): Promise<string | null> =>
  db.set(`${REDIS_KEY_PREFIX}socket:${socketId}`, userId);
