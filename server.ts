import compression from 'compression';
import cors from 'cors';
import express from 'express';
import path from 'path';

const app = express();
const distPath = path.resolve('dist');
const listenPort = 5050;

app
  .use(compression())
  .use(cors())
  .use(express.static(distPath))
  .listen(listenPort, () => {
    console.log('Server started, press CTRL+C to exit.');
    console.log('Listening on port', listenPort);
  });
