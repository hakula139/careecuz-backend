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
  MessageEntry,
  MessageSummary,
  PushNewMessage,
  PushNewMessageSummary,
  User,
  UserEntry,
} from '@/types';
import { addMessage, getMessage, getMessages } from '@/services/messageCollection.service';
import { getUserId } from '@/services/userRedis.service';

const parseUser = ({ id, isBlocked, isRemoved }: HydratedDocument<UserEntry>): User => ({
  id,
  isBlocked,
  isRemoved,
});

const parseMessageSummary = ({
  id,
  user,
  content,
  replyTo,
  replyCount,
  createdAt,
  updatedAt,
}: HydratedDocument<MessageEntry>): MessageSummary => ({
  id,
  user: parseUser(user),
  content,
  replyTo: replyTo?.toString(),
  replyCount,
  time: createdAt.toISOString(),
  lastReplyTime: updatedAt.toISOString(),
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

const parseMessage = ({
  id, user, content, replyTo, replies, createdAt,
}: HydratedDocument<MessageEntry>): Message => ({
  id,
  user: parseUser(user),
  content,
  replyTo: replyTo?.toString(),
  replies: replies.map(parseMessage),
  time: createdAt.toISOString(),
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

const onAddMessageReq = (
  { sockets }: Server,
  socket: Socket,
  { channelId, data }: AddMessageReq,
  callback: (resp: AddMessageResp) => void,
): void => {
  getUserId(socket.id).then((userId) => {
    if (userId) {
      addMessage(channelId, userId, data)
        .then(({ id }) => {
          console.log('[INFO ]', '(message:add)', `${id}: added`);
          callback({
            code: 200,
            id,
          });

          getMessage(id).then((message) => {
            console.log('[DEBUG]', '(message:push)', `${id}: pushed to ${channelId}`);
            if (message!.replyTo) {
              sockets.in(channelId).emit('message:new', {
                data: parseMessage(message!),
              } as PushNewMessage);
            } else {
              sockets.in(channelId).emit('message:new:summary', {
                data: parseMessageSummary(message!),
              } as PushNewMessageSummary);
            }
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
