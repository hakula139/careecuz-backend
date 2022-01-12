import { compareSync } from 'bcrypt';
import { randomBytes } from 'crypto';
import { Server, Socket } from 'socket.io';

import {
  PushUserInfo, Resp, UserAuthReq, UserAuthResp,
} from '@/types';
import { addUser, getUserByEmail } from '@/services/userCollection.service';
import { getUserToken, setUserToken } from '@/services/userRedis.service';

const createSession = (userId: string, callback: (resp: UserAuthResp) => void): void => {
  const token = randomBytes(64).toString('hex');
  console.log('[DEBUG]', '(user:login)', `token saved: (${userId}, ${token})`);
  setUserToken(userId, token).then(() => {
    callback({
      code: 200,
      userId,
      token,
    });
  });
};

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
        createSession(user.userId, callback);
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
          createSession(userId, callback);
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
  const onPushUserInfo = ({ userId, token }: PushUserInfo, callback: (resp: Resp) => void): void => {
    getUserToken(userId)
      .then((savedToken) => {
        if (token === savedToken) {
          callback({
            code: 200,
          });
        } else {
          callback({
            code: 403,
            message: '会话已过期',
          });
        }
      })
      .catch((error) => {
        console.log('[ERROR]', '(user:info)', `${userId}: ${error}`);
        callback({
          code: 500,
          message: '服务器内部错误',
        });
      });
  };

  socket.on('user:login', onUserLoginReq);
  socket.on('user:register', onUserRegisterReq);
  socket.on('user:info', onPushUserInfo);
};

export default userHandlers;
