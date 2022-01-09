import { Server, Socket } from 'socket.io';

import { UserAuthReq, UserAuthResp } from '@/types';

const userHandlers = (io: Server, socket: Socket) => {
  const userRegister = (req: UserAuthReq, callback: (resp: UserAuthResp) => void) => {
    callback({
      code: 200,
      id: 'test',
      token: 'test',
    } as UserAuthResp);
  };

  socket.on('user:register', userRegister);
};

export default userHandlers;
