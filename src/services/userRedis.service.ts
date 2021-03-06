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

export const setUserId = (
  socketId: string,
  userId: string,
  expire: number = 60 * 60, // will expire in an hour by default
): Promise<string | null> => db.set(`${REDIS_KEY_PREFIX}socket:${socketId}`, userId, { EX: expire });

export const delUserId = (socketId: string): Promise<number> => db.del(`${REDIS_KEY_PREFIX}socket:${socketId}`);

export const getVerifyCode = (email: string): Promise<string | null> =>
  db.get(`${REDIS_KEY_PREFIX}email:verify-code:${email}`);

export const setVerifyCode = (
  email: string,
  verifyCode: string,
  expire: number = 60 * 60, // will expire in an hour by default
): Promise<string | null> => db.set(`${REDIS_KEY_PREFIX}email:verify-code:${email}`, verifyCode, { EX: expire });

export const getVerifyCodeByIp = (ip: string): Promise<string | null> =>
  db.get(`${REDIS_KEY_PREFIX}ip:verify-code:${ip}`);

export const setVerifyCodeByIp = (
  ip: string,
  verifyCode: string,
  expire: number = 60, // will expire in a minute by default
): Promise<string | null> => db.set(`${REDIS_KEY_PREFIX}ip:verify-code:${ip}`, verifyCode, { EX: expire });
