import mongoose, { Connection } from 'mongoose';

import { DB_CONN_STRING, DB_NAME } from '@/configs';

export default class DatabaseManager {
  public db?: Connection;

  public async connect(): Promise<void> {
    const tryConnect = async (): Promise<void> => {
      while (!this.db) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await mongoose.connect(`${DB_CONN_STRING}/${DB_NAME}`);
          this.db = mongoose.connection;
          console.log('[INFO ]', '(database)', `connected to database: ${this.db.name}`);
        } catch (error) {
          console.log('[WARN ]', '(database)', `failed to connect to database: ${DB_NAME}, retrying...`);
        }
      }
    };

    await tryConnect();
    if (this.db) {
      this.db.on('connect', () => console.log('[INFO ]', '(database)', `connected to database: ${this.db!.name}`));
      this.db.on('open', () => console.log('[DEBUG]', '(database)', 'connection open'));
      this.db.on('disconnect', async () => {
        console.log('[INFO ]', '(database)', `disconnected from database: ${this.db!.name}`);
        await tryConnect();
      });
      this.db.on('close', () => console.log('[DEBUG]', '(database)', 'connection closed'));
      this.db.on('error', (error) => console.log('[WARN ]', '(database)', error));
    }
  }
}
