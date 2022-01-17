import { createClient } from 'redis';

import { REDIS_CONN_STRING } from '@/configs';

export default class RedisManager {
  public db = createClient({
    url: REDIS_CONN_STRING,
  });

  public async connect(): Promise<void> {
    await this.db.connect();

    this.db.on('connect', () => console.log('[INFO ]', '(redis)', 'connected to redis'));
    this.db.on('ready', () => console.log('[DEBUG]', '(redis)', 'connection ready'));
    this.db.on('end', () => console.log('[DEBUG]', '(database)', 'connection end'));
    this.db.on('error', (error) => console.log('[WARN ]', '(redis)', error));
  }
}

export const redisManager = new RedisManager();
