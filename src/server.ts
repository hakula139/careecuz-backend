import { Server, Socket } from 'socket.io';

import { LISTEN_PORT } from '@/configs';

const io = new Server(LISTEN_PORT, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

console.log('Server started, press CTRL+C to exit.');
console.log('Listening on port', LISTEN_PORT);
