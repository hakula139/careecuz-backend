import mongoose, { Connection } from 'mongoose';

import { DB_CONN_STRING, DB_NAME } from '@/configs';

export default class DatabaseManager {
  public db?: Connection = undefined;

  public async connect(): Promise<void> {
    await mongoose.connect(`${DB_CONN_STRING}/${DB_NAME}`);
    this.db = mongoose.connection;
    this.db.once('open', () => console.log(`connected to database: ${this.db!.name}`));
  }
}
