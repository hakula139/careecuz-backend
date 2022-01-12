import mongoose, { HydratedDocument } from 'mongoose';

import { MessageModel } from '@/models';
import { MessageEntry, MessageForm } from '@/types';

export const getMessages = (
  lastMessageId?: string,
  maxMessageCount?: number,
): Promise<HydratedDocument<MessageEntry>[]> => {
  let query = MessageModel.find().where('replyTo').exists(false);
  if (lastMessageId) query = query.where('_id').lt(parseInt(lastMessageId, 16));
  if (maxMessageCount) query = query.sort({ _id: -1 }).limit(maxMessageCount).sort({ _id: 1 });
  return query.populate('user').exec();
};

export const getChannelReplyCount = (channelId: string): Promise<number> => MessageModel.count({ channelId }).exec();

export const getChannelLastReplyTime = (channelId: string): Promise<Date | null> =>
  new Promise((resolve) => {
    MessageModel.findOne({ channelId }, 'createdAt', { sort: { _id: -1 } })
      .exec()
      .then((message) => resolve(message?.createdAt || null));
  });

export const getMessageReplies = (messageId: string): Promise<HydratedDocument<MessageEntry>[]> =>
  MessageModel.find({ replyTo: messageId }).exec();

export const getMessageReplyCount = (messageId: string): Promise<number> =>
  MessageModel.count({ replyTo: messageId }).exec();

export const getMessageLastReplyTime = (messageId: string): Promise<Date | null> =>
  new Promise((resolve) => {
    MessageModel.findOne({ replyTo: messageId }, 'createdAt', { sort: { _id: -1 } })
      .exec()
      .then((message) => resolve(message?.createdAt || null));
  });

export const getMessage = (id: string): Promise<HydratedDocument<MessageEntry> | null> =>
  MessageModel.findById(id).exec();

export const addMessage = (
  channelId: string,
  userId: string,
  { content, replyTo }: MessageForm,
): Promise<HydratedDocument<MessageEntry>> => {
  const message = new MessageModel({
    channelId,
    user: userId,
    content,
    replyTo,
  });
  return message.save();
};
