import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

import { LISTEN_PORT } from './configs';
import {
  channelHandlers, globalHandlers, messageHandlers, notificationHandlers, userHandlers,
} from './handlers';
import { dbManager } from './services/database.service';
import { redisManager } from './services/redis.service';

const server = createServer();
const io = new Server(server, {
  cors: { origin: '*' },
});

await dbManager.connect();
await redisManager.connect();

io.on('connection', (socket: Socket) => {
  globalHandlers(io, socket);
  channelHandlers(io, socket);
  messageHandlers(io, socket);
  notificationHandlers(io, socket);
  userHandlers(io, socket);
});

server.listen(LISTEN_PORT, () => {
  console.log('[INFO ]', '(server)', 'server started, listening on port', LISTEN_PORT);
});
