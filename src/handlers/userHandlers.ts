import { compareSync } from 'bcrypt';
import { Server, Socket } from 'socket.io';

import { UserAuthReq, UserAuthResp } from '@/types';
import { addUser, getUserByEmail } from '@/services/userCollection.service';

const onUserLoginReq = ({ data }: UserAuthReq, callback: (resp: UserAuthResp) => void): void => {
  const { email, password } = data;

  getUserByEmail(email)
    .then((user) => {
      if (!user) {
        callback({
          code: 100,
          message: '用户未注册',
        });
      } else if (compareSync(password, user.password)) {
        callback({
          code: 200,
          userId: user.userId,
          token: 'token', // TODO: create a session with redis
        });
      } else {
        callback({
          code: 403,
          message: '密码错误',
        });
      }
    })
    .catch((error) => {
      console.log('[ERROR]', '(user:login)', `${email}: ${error}`);
      callback({
        code: 500,
        message: '服务器内部错误',
      });
    });
};

const onUserRegisterReq = ({ data }: UserAuthReq, callback: (resp: UserAuthResp) => void): void => {
  const { email } = data;

  getUserByEmail(email)
    .then((user) => {
      if (user) {
        // User should not exist.
        callback({
          code: 422,
          message: '用户已注册',
        });
      } else {
        addUser(data).then(({ userId }) => {
          console.log('[INFO ]', '(user:register)', `${email}: registered`);
          callback({
            code: 200,
            userId,
            token: 'token', // TODO: create a session with redis
          });
        });
      }
    })
    .catch((error) => {
      console.log('[ERROR]', '(user:register)', `${email}: ${error}`);
      callback({
        code: 500,
        message: '服务器内部错误',
      });
    });
};

const userHandlers = (_io: Server, socket: Socket) => {
  socket.on('user:login', onUserLoginReq);
  socket.on('user:register', onUserRegisterReq);
};

export default userHandlers;
