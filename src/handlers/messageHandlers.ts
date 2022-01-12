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
  User,
  UserEntry,
} from '@/types';
import {
  addMessage,
  getMessage,
  getMessageLastReplyTime,
  getMessageReplies,
  getMessageReplyCount,
  getMessages,
} from '@/services/messageCollection.service';
import { getUserId } from '@/services/userRedis.service';

const parseUser = ({ id, isBlocked, isRemoved }: HydratedDocument<UserEntry>): User => ({
  id,
  isBlocked,
  isRemoved,
});

const parseMessageSummary = async ({
  id,
  user,
  content,
  replyTo,
  createdAt,
}: HydratedDocument<MessageEntry>): Promise<MessageSummary> => ({
  id,
  user: parseUser(user),
  content,
  replyTo,
  time: createdAt.toISOString(),
  replyCount: await getMessageReplyCount(id),
  lastReplyTime: ((await getMessageLastReplyTime(id)) || createdAt).toISOString(),
});

const onGetHistoryMessagesReq = (
  { lastMessageId, maxMessageCount }: GetHistoryMessagesReq,
  callback: (resp: GetHistoryMessagesResp) => void,
): void => {
  getMessages(lastMessageId, maxMessageCount)
    .then((messages) => {
      Promise.all(messages.map(parseMessageSummary)).then((parsedMessages) => {
        callback({
          code: 200,
          data: parsedMessages,
        });
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

const parseMessage = async ({
  id,
  user,
  content,
  replyTo,
  createdAt,
}: HydratedDocument<MessageEntry>): Promise<Message> => ({
  id,
  user: parseUser(user),
  content,
  replyTo,
  time: createdAt.toISOString(),
  replies: await Promise.all((await getMessageReplies(id)).map(parseMessage)),
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
        parseMessage(message).then((parsedMessage) => {
          callback({
            code: 200,
            data: parsedMessage,
          });
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

const messageHandlers = (_io: Server, socket: Socket) => {
  socket.on('messages:get:history', onGetHistoryMessagesReq);
  socket.on('message:get', onGetMessageReq);
  socket.on('message:add', (req: AddMessageReq, callback: (resp: AddMessageResp) => void): void => {
    onAddMessageReq(socket, req, callback);
  });
};

export default messageHandlers;