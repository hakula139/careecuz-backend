import { compareSync } from 'bcrypt';
import { randomBytes } from 'crypto';
import IsEmail from 'isemail';
import { Server, Socket } from 'socket.io';

import {
  PushUserInfo, Resp, SendVerifyCodeReq, UserAuthReq, UserAuthResp,
} from '@/types';
import { addUser, getUserByEmail } from '@/services/userCollection.service';
import {
  getUserToken,
  getVerifyCode,
  getVerifyCodeByIp,
  setUserId,
  setUserToken,
  setVerifyCode,
  setVerifyCodeByIp,
} from '@/services/userRedis.service';
import { sendVerifyCode } from '@/services/userMail.service';

const createSession = (socketId: string, userId: string, callback: (resp: UserAuthResp) => void): void => {
  const token = randomBytes(64).toString('hex');
  Promise.all([setUserToken(userId, token), setUserId(socketId, userId)]).then(() => {
    console.log('[DEBUG]', '(user:login)', `token saved: (${userId}, ${token})`);
    console.log('[DEBUG]', '(user:info)', `user id saved: (${socketId}, ${userId})`);
    callback({
      code: 200,
      userId,
      token,
    });
  });
};

const validateEmail = (email: string, errorLevel = 17): number => {
  const emailErrorLevel = IsEmail.validate(email, { errorLevel });
  console.log('[DEBUG]', '(email:validate)', `error level: ${emailErrorLevel}`);
  return emailErrorLevel;
};

const onUserLoginReq = (socket: Socket, { data }: UserAuthReq, callback: (resp: UserAuthResp) => void): void => {
  const { email, password } = data;

  if (validateEmail(email)) {
    callback({
      code: 403,
      message: '邮箱格式错误',
    });
    return;
  }

  try {
    getUserByEmail(email).then((user) => {
      if (!user) {
        callback({
          code: 100,
          message: '用户未注册',
        });
      } else if (compareSync(password, user.password)) {
        console.log('[DEBUG]', '(user:join)', `${socket.id} joins ${user.id}`);
        socket.join(user.id);
        createSession(socket.id, user.id, callback);
      } else {
        callback({
          code: 403,
          message: '密码错误',
        });
      }
    });
  } catch (error) {
    console.log('[ERROR]', '(user:login)', `${email}: ${error}`);
    callback({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

const onUserRegisterReq = (socket: Socket, { data }: UserAuthReq, callback: (resp: UserAuthResp) => void): void => {
  const { email, verifyCode } = data;

  if (validateEmail(email)) {
    callback({
      code: 403,
      message: '邮箱格式错误',
    });
    return;
  }

  try {
    getUserByEmail(email).then((user) => {
      if (user) {
        // User should not exist.
        callback({
          code: 422,
          message: '用户已注册',
        });
      } else {
        getVerifyCode(email).then((currentVerifyCode) => {
          if (verifyCode !== currentVerifyCode) {
            callback({
              code: 403,
              message: '验证码错误',
            });
          } else {
            addUser(data).then(({ id }) => {
              console.log('[INFO ]', '(user:register)', `${email}: registered`);
              console.log('[DEBUG]', '(user:join)', `${socket.id} joins ${id}`);
              socket.join(id);
              createSession(socket.id, id, callback);
            });
          }
        });
      }
    });
  } catch (error) {
    console.log('[ERROR]', '(user:register)', `${email}: ${error}`);
    callback({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

const onSendVerifyCodeReq = (socket: Socket, { email }: SendVerifyCodeReq, callback: (resp: Resp) => void): void => {
  const ip = (socket.handshake.headers['x-real-ip'] as string) || socket.handshake.address;

  try {
    getVerifyCodeByIp(ip).then((currentVerifyCode) => {
      if (currentVerifyCode) {
        console.log('[DEBUG]', '(user:verify-code:send)', `current verify code: (${ip}, ${currentVerifyCode})`);
        callback({
          code: 403,
          message: '操作过于频繁',
        });
        return;
      }

      const verifyCode = randomBytes(6).toString('base64').substring(0, 6);
      Promise.all([setVerifyCodeByIp(ip, verifyCode), setVerifyCode(email, verifyCode)]).then(() => {
        console.log('[DEBUG]', '(user:verify-code:send)', `verify code saved: (${ip}, ${email}, ${verifyCode})`);
        sendVerifyCode(email, verifyCode).then(() => {
          console.log('[INFO ]', '(user:verify-code:send)', `verify code sent: (${email}, ${verifyCode})`);
          callback({ code: 200 });
        });
      });
    });
  } catch (error) {
    console.log('[ERROR]', '(user:verify-code:send)', `${email}: ${error}`);
    callback({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

const onPushUserInfo = (socket: Socket, { userId, token }: PushUserInfo, callback: (resp: Resp) => void): void => {
  try {
    getUserToken(userId).then((savedToken) => {
      if (token === savedToken) {
        setUserId(socket.id, userId).then(() => {
          console.log('[DEBUG]', '(user:info)', `user id saved: (${socket.id}, ${userId})`);
          callback({ code: 200 });
        });
        console.log('[DEBUG]', '(user:join)', `${socket.id} joins ${userId}`);
        socket.join(userId);
      } else {
        callback({
          code: 403,
          message: '会话已过期',
        });
      }
    });
  } catch (error) {
    console.log('[ERROR]', '(user:info)', `${userId}: ${error}`);
    callback({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

const userHandlers = (_io: Server, socket: Socket) => {
  socket.on('user:login', (req: UserAuthReq, callback: (resp: UserAuthResp) => void): void => {
    onUserLoginReq(socket, req, callback);
  });
  socket.on('user:register', (req: UserAuthReq, callback: (resp: UserAuthResp) => void): void => {
    onUserRegisterReq(socket, req, callback);
  });
  socket.on('user:verify-code:send', (req: SendVerifyCodeReq, callback: (resp: Resp) => void): void => {
    onSendVerifyCodeReq(socket, req, callback);
  });
  socket.on('user:info', (req: PushUserInfo, callback: (resp: Resp) => void): void => {
    onPushUserInfo(socket, req, callback);
  });
};

export default userHandlers;
