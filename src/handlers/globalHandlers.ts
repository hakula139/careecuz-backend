import { Server, Socket } from 'socket.io';

import { delUserId } from '@/services/userRedis.service';

const onDisconnect = (socket: Socket): void => {
  delUserId(socket.id).then(() => {
    console.log('[DEBUG]', '(global)', `user id removed: (${socket.id})`);
  });
};

const globalHandlers = (_io: Server, socket: Socket) => {
  socket.on('disconnect', (): void => {
    onDisconnect(socket);
  });
};

export default globalHandlers;
