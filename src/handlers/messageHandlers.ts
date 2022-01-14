import { Server, Socket } from 'socket.io';
import { HydratedDocument } from 'mongoose';

import {
  AddMessageReq,
  AddMessageResp,
  GetHistoryMessagesReq,
  GetHistoryMessagesResp,
  GetMessageReq,
  GetMessageResp,
  Message,
  MessageBase,
  MessageEntry,
  MessageSummary,
  PushNewMessage,
  PushNewMessageSummary,
  PushNewNotification,
  User,
  UserEntry,
} from '@/types';
import { addMessage, getMessage, getMessages } from '@/services/messageCollection.service';
import { addNotification } from '@/services/notificationCollection.service';
import { getUserId } from '@/services/userRedis.service';

const parseUser = ({ id, isBlocked, isRemoved }: HydratedDocument<UserEntry>): User => ({
  id,
  isBlocked,
  isRemoved,
});

const parseMessageBase = ({
  id, user, content, replyTo, createdAt,
}: HydratedDocument<MessageEntry>): MessageBase => ({
  id,
  user: parseUser(user),
  content,
  replyTo: replyTo?.toString(),
  time: createdAt.toISOString(),
});

const parseMessageSummary = (message: HydratedDocument<MessageEntry>): MessageSummary => ({
  ...parseMessageBase(message),
  replyCount: message.replyCount,
  lastReplyTime: message.updatedAt.toISOString(),
});

const onGetHistoryMessagesReq = (
  { channelId, lastMessageId, maxMessageCount }: GetHistoryMessagesReq,
  callback: (resp: GetHistoryMessagesResp) => void,
): void => {
  getMessages(channelId, lastMessageId, maxMessageCount)
    .then((messages) => {
      callback({
        code: 200,
        data: messages.map(parseMessageSummary),
      });
    })
    .catch((error) => {
      console.log('[ERROR]', '(messages:get)', error);
      callback({
        code: 500,
        message: '服务器内部错误',
      });
    });
};

const parseMessage = (message: HydratedDocument<MessageEntry>): Message => ({
  ...parseMessageBase(message),
  replies: message.replies.map(parseMessage),
});

const onGetMessageReq = ({ messageId }: GetMessageReq, callback: (resp: GetMessageResp) => void): void => {
  getMessage(messageId)
    .then((message) => {
      if (!message) {
        callback({
          code: 404,
          message: '消息不存在',
        });
      } else {
        callback({
          code: 200,
          data: parseMessage(message),
        });
      }
    })
    .catch((error) => {
      console.log('[ERROR]', '(message:get)', `${messageId}: ${error}`);
      callback({
        code: 500,
        message: '服务器内部错误',
      });
    });
};

const pushNewMessage = ({ sockets }: Server, channelId: string, message: HydratedDocument<MessageEntry>): void => {
  if (message.replyTo) {
    sockets.in(channelId).emit('message:new', {
      data: parseMessage(message!),
    } as PushNewMessage);
  } else {
    sockets.in(channelId).emit('message:new:summary', {
      data: parseMessageSummary(message!),
    } as PushNewMessageSummary);
  }
};

const pushNewNotification = ({ sockets }: Server, replyTo: string, message: HydratedDocument<MessageEntry>): void => {
  sockets.in(replyTo).emit('notification:new', {
    data: {
      message: parseMessageBase(message),
    },
  } as PushNewNotification);
};

const onAddMessageReq = (
  io: Server,
  socket: Socket,
  { channelId, data }: AddMessageReq,
  callback: (resp: AddMessageResp) => void,
): void => {
  getUserId(socket.id).then((userId) => {
    if (userId) {
      addMessage(channelId, userId, data)
        .then(({ id, replyTo }) => {
          console.log('[INFO ]', '(message:add)', `${id}: added`);

          getMessage(id).then((message) => {
            console.log('[DEBUG]', '(message:push)', `${id}: pushed to ${channelId}`);
            pushNewMessage(io, channelId, message!);

            if (replyTo) {
              getMessage(replyTo).then((replyToMessage) => {
                addNotification(userId, replyTo, message!.id).then((notification) => {
                  console.log('[INFO ]', '(notification:add)', `${notification.id}: added`);
                  console.log('[DEBUG]', '(notification:push)', `${notification.id}: pushed to ${replyTo}`);
                  pushNewNotification(io, replyToMessage!.user.id, message!);
                });
              });
            }
          });

          callback({
            code: 200,
            id,
          });
        })
        .catch((error) => {
          console.log('[ERROR]', '(message:add)', error);
          callback({
            code: 500,
            message: '服务器内部错误',
          });
        });
    } else {
      callback({
        code: 403,
        message: '会话已过期',
      });
    }
  });
};

const messageHandlers = (io: Server, socket: Socket) => {
  socket.on('messages:get:history', onGetHistoryMessagesReq);
  socket.on('message:get', onGetMessageReq);
  socket.on('message:add', (req: AddMessageReq, callback: (resp: AddMessageResp) => void): void => {
    onAddMessageReq(io, socket, req, callback);
  });
};

export default messageHandlers;
