declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      LISTEN_PORT: number;
      DB_CONN_STRING: string;
      DB_NAME: string;
      REDIS_CONN_STRING: string;
    }
  }
}

export {};
