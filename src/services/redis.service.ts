import { createClient } from 'redis';

import { REDIS_CONN_STRING } from '@/configs';

export default class RedisManager {
  public db;

  public constructor() {
    this.db = createClient({
      url: REDIS_CONN_STRING,
    });

    this.db.on('error', (error) => console.log('[ERROR]', '(redis)', error));
  }
}

export const redisManager = new RedisManager();
