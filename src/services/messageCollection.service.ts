import { HydratedDocument } from 'mongoose';

import { MessageModel } from '@/models';
import { MessageEntry, MessageForm } from '@/types';
import { updateChannelLastReplyTime } from './channelCollection.service';

export const getMessages = (
  channelId: string,
  lastMessageId?: string,
  maxMessageCount?: number,
): Promise<HydratedDocument<MessageEntry>[]> => {
  let query = MessageModel.find({ channelId }).where('replyTo').exists(false);
  if (lastMessageId) query = query.where('_id').lt(lastMessageId as any); // workaround
  if (maxMessageCount) query = query.sort({ _id: -1 }).limit(maxMessageCount).sort({ _id: 1 });
  return query.populate('user').populate('replyCount').exec();
};

export const getMessage = (id: string): Promise<HydratedDocument<MessageEntry> | null> =>
  new Promise((resolve) => {
    MessageModel.findById(id)
      .populate('user')
      .populate('replies')
      .then((message) => {
        if (message && message.replies) {
          // Recursively populate replies.
          Promise.all(message.replies.map((reply) => getMessage(reply.id))).then((replies) => {
            resolve(Object.assign(message, { replies }));
          });
        } else {
          resolve(Object.assign(message, { replies: [] }));
        }
      });
  });

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
    message.save().then((result) => {
      if (replyTo) {
        updateMessageLastReplyTime(replyTo, result.createdAt);
      }
      updateChannelLastReplyTime(channelId, result.createdAt);
      resolve(result);
    });
  });
