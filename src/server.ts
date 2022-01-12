import { Server, Socket } from 'socket.io';

import { LISTEN_PORT } from './configs';
import { channelHandlers, messageHandlers, userHandlers } from './handlers';
import DatabaseManager from './services/database.service';

const io = new Server(LISTEN_PORT, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

console.log('[INFO ]', '(server)', 'server started, listening on port', LISTEN_PORT);

const dbManager = new DatabaseManager();
await dbManager.connect();

io.on('connection', (socket: Socket) => {
  channelHandlers(io, socket);
  messageHandlers(io, socket);
  userHandlers(io, socket);
});
