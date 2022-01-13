import { HydratedDocument } from 'mongoose';

import { MessageModel } from '@/models';
import { MessageEntry, MessageForm } from '@/types';

export const getMessages = (
  lastMessageId?: string,
  maxMessageCount?: number,
): Promise<HydratedDocument<MessageEntry>[]> => {
  let query = MessageModel.find().where('replyTo').exists(false);
  if (lastMessageId) query = query.where('_id').lt(lastMessageId as any); // workaround
  if (maxMessageCount) query = query.sort({ _id: -1 }).limit(maxMessageCount).sort({ _id: 1 });
  return query.populate('user').populate('replyCount').exec();
};

export const getChannelReplyCount = (channelId: string): Promise<number> => MessageModel.count({ channelId }).exec();

export const getChannelLastReplyTime = (channelId: string): Promise<Date | null> =>
  new Promise((resolve) => {
    MessageModel.findOne({ channelId }, 'createdAt', { sort: { _id: -1 } })
      .exec()
      .then((message) => resolve(message?.createdAt || null));
  });

export const getMessage = (id: string): Promise<HydratedDocument<MessageEntry> | null> =>
  MessageModel.findById(id).populate('replies').exec();

export const updateMessageLastReplyTime = (
  id: string,
  lastReplyTime: Date,
): Promise<HydratedDocument<MessageEntry> | null> =>
  MessageModel.findByIdAndUpdate(id, { updatedAt: lastReplyTime }).exec();

export const addMessage = (
  channelId: string,
  userId: string,
  { content, replyTo }: MessageForm,
): Promise<HydratedDocument<MessageEntry>> =>
  new Promise((resolve) => {
    const message = new MessageModel({
      channelId,
      user: userId,
      content,
      replyTo,
    });
    message.save().then((messageEntry) => {
      if (replyTo) {
        updateMessageLastReplyTime(replyTo, messageEntry.createdAt).then(() => {
          resolve(messageEntry);
        });
      } else {
        resolve(messageEntry);
      }
    });
  });
