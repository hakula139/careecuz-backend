import { Server, Socket } from 'socket.io';
import { HydratedDocument, Types } from 'mongoose';

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
  Notification,
  NotificationEntry,
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
  threadId: message.threadId?.toString(),
  replies: (message.replies || []).map(parseMessage),
});

const onGetMessageReq = ({ threadId }: GetMessageReq, callback: (resp: GetMessageResp) => void): void => {
  getMessage(threadId)
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
      console.log('[ERROR]', '(message:get)', `${threadId}: ${error}`);
      callback({
        code: 500,
        message: '服务器内部错误',
      });
    });
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

const parseNotification = ({ fromUserId, threadId, message }: HydratedDocument<NotificationEntry>): Notification => ({
  fromUserId: fromUserId.toString(),
  threadId: threadId.toString(),
  messageId: (message as Types.ObjectId).toString(),
});

const pushNewNotification = (
  { sockets }: Server,
  toUserId: string,
  notification: HydratedDocument<NotificationEntry>,
): void => {
  sockets.in(toUserId).emit('notification:new', {
    data: parseNotification(notification),
  } as PushNewNotification);
};

const onAddMessageReq = (
  io: Server,
  socket: Socket,
  { channelId, threadId, data }: AddMessageReq,
  callback: (resp: AddMessageResp) => void,
): void => {
  getUserId(socket.id).then((fromUserId) => {
    if (fromUserId) {
      addMessage(channelId, threadId, fromUserId, data)
        .then(({ id, replyTo }) => {
          console.log('[INFO ]', '(message:add)', `${id}: added`);

          // To populate fields.
          getMessage(id).then((message) => {
            console.log('[DEBUG]', '(message:push)', `${id}: pushed to ${channelId} / ${threadId}`);
            pushNewMessage(io, channelId, threadId, message!);

            if (replyTo && threadId) {
              getMessage(replyTo).then((repliedMessage) => {
                if (repliedMessage) {
                  const { id: toUserId } = repliedMessage.user;
                  addNotification(fromUserId, toUserId, threadId, id).then((notification) => {
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
