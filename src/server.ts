import { Server, Socket } from 'socket.io';

import { LISTEN_PORT } from './configs';
import { userHandlers } from './handlers';
import DatabaseManager from './services/database.service';

const io = new Server(LISTEN_PORT, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

console.log('Server started, press CTRL+C to exit.');
console.log('Listening on port', LISTEN_PORT);

const dbManager = new DatabaseManager();
await dbManager.connect();

io.on('connection', (socket: Socket) => {
  userHandlers(io, socket);
});
