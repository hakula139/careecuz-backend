import { HydratedDocument, Types } from 'mongoose';

import { MessageModel } from '@/models';
import { MessageEntry, MessageForm } from '@/types';
import { updateChannelLastReplyTime } from './channelCollection.service';

export const getMessages = (
  channelId: string | Types.ObjectId,
  lastMessageId?: string | Types.ObjectId,
  maxMessageCount?: number,
): Promise<HydratedDocument<MessageEntry>[]> => {
  let query = MessageModel.find({ channelId }).where('replyTo').exists(false);
  if (lastMessageId) query = query.where('_id').lt(lastMessageId as any); // workaround
  if (maxMessageCount) query = query.sort({ _id: -1 }).limit(maxMessageCount);
  return query.populate('user').populate('replyCount').exec();
};

export const getMessage = (id: string | Types.ObjectId): Promise<HydratedDocument<MessageEntry> | null> =>
  MessageModel.findById(id).populate('user').populate({ path: 'replies', populate: 'user' }).exec();

export const updateMessageLastReplyTime = (
  id: string | Types.ObjectId,
  lastReplyTime: Date,
): Promise<HydratedDocument<MessageEntry> | null> =>
  MessageModel.findByIdAndUpdate(id, { updatedAt: lastReplyTime }).exec();

export const addMessage = (
  channelId: string | Types.ObjectId,
  threadId: string | Types.ObjectId | undefined,
  userId: string | Types.ObjectId,
  { content, replyTo }: MessageForm,
): Promise<HydratedDocument<MessageEntry>> =>
  new Promise((resolve) => {
    const message = new MessageModel({
      channelId,
      threadId,
      user: userId,
      content,
      replyTo,
    });
    message.save().then((result) => {
      if (threadId) {
        updateMessageLastReplyTime(threadId, result.createdAt);
      }
      updateChannelLastReplyTime(channelId, result.createdAt);
      resolve(result);
    });
  });
