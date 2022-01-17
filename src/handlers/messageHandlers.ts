import { Server, Socket } from 'socket.io';
import { HydratedDocument } from 'mongoose';

import {
  AddMessageReq,
  AddMessageResp,
  GetHistoryMessagesReq,
  GetHistoryMessagesResp,
  GetMessageReq,
  GetMessageResp,
  MessageEntry,
  PushNewMessage,
  PushNewMessageSummary,
} from '@/types';
import { parseMessage, parseMessageSummary } from '@/parsers';
import { addMessage, getMessage, getMessages } from '@/services/messageCollection.service';
import { addNotification } from '@/services/notificationCollection.service';
import { getUserId } from '@/services/userRedis.service';
import { pushNewNotification } from './notificationHandlers';

const onGetHistoryMessagesReq = (
  { channelId, lastMessageId, maxMessageCount }: GetHistoryMessagesReq,
  callback: (resp: GetHistoryMessagesResp) => void,
): void => {
  try {
    getMessages(channelId, lastMessageId, maxMessageCount).then((messages) => {
      callback({
        code: 200,
        data: messages.map(parseMessageSummary),
      });
    });
  } catch (error) {
    console.log('[ERROR]', '(messages:get)', error);
    callback({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

const onGetMessageReq = ({ threadId }: GetMessageReq, callback: (resp: GetMessageResp) => void): void => {
  try {
    getMessage(threadId).then((message) => {
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
    });
  } catch (error) {
    console.log('[ERROR]', '(message:get)', `${threadId}: ${error}`);
    callback({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

const pushNewMessage = (
  { sockets }: Server,
  channelId: string,
  threadId: string | undefined,
  message: HydratedDocument<MessageEntry>,
): void => {
  if (threadId) {
    sockets.in(channelId).emit('message:new', {
      data: parseMessage(message),
    } as PushNewMessage);
  } else {
    sockets.in(channelId).emit('message:new:summary', {
      data: parseMessageSummary(message),
    } as PushNewMessageSummary);
  }
};

const onAddMessageReq = (
  io: Server,
  socket: Socket,
  { channelId, threadId, data }: AddMessageReq,
  callback: (resp: AddMessageResp) => void,
): void => {
  try {
    getUserId(socket.id).then((fromUserId) => {
      if (!fromUserId) {
        callback({
          code: 403,
          message: '会话已过期',
        });
        return;
      }

      addMessage(channelId, threadId, fromUserId, data).then(({ id, replyTo }) => {
        console.log('[INFO ]', '(message:add)', `${id}: added`);

        // To populate fields.
        getMessage(id).then((message) => {
          console.log('[DEBUG]', '(message:push)', `${id}: pushed to ${channelId} / ${threadId}`);
          pushNewMessage(io, channelId, threadId, message!);

          if (replyTo && threadId) {
            getMessage(replyTo).then((repliedMessage) => {
              if (repliedMessage) {
                const { id: toUserId } = repliedMessage.user;
                addNotification(fromUserId, toUserId, channelId, threadId, id, replyTo).then((notification) => {
                  console.log('[INFO ]', '(notification:add)', `${notification.id}: added`);
                  console.log('[DEBUG]', '(notification:push)', `${notification.id}: pushed to ${toUserId}`);
                  pushNewNotification(io, toUserId, notification);
                });
              }
            });
          }
        });

        callback({
          code: 200,
          id,
        });
      });
    });
  } catch (error) {
    console.log('[ERROR]', '(message:add)', error);
    callback({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

const messageHandlers = (io: Server, socket: Socket) => {
  socket.on('messages:get:history', onGetHistoryMessagesReq);
  socket.on('message:get', onGetMessageReq);
  socket.on('message:add', (req: AddMessageReq, callback: (resp: AddMessageResp) => void): void => {
    onAddMessageReq(io, socket, req, callback);
  });
};

export default messageHandlers;
