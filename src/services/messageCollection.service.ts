import mongoose, { HydratedDocument } from 'mongoose';

import { MessageModel } from '@/models';
import { MessageEntry, MessageForm } from '@/types';

export const getMessages = async (
  lastMessageId?: string,
  maxMessageCount?: number,
): Promise<HydratedDocument<MessageEntry>[]> => {
  let query = MessageModel.find().where('replyTo').exists(false);
  if (lastMessageId) query = query.where('_id').lt(parseInt(lastMessageId, 16));
  if (maxMessageCount) query = query.sort(-1).limit(maxMessageCount).sort(1);
  return query.exec();
};

export const getMessage = async (id: string): Promise<HydratedDocument<MessageEntry> | null> =>
  MessageModel.findById(id).exec();

export const addMessage = async (
  channelId: string,
  userId: string,
  { content, replyTo }: MessageForm,
): Promise<HydratedDocument<MessageEntry>> => {
  const message = new MessageModel({
    channelId,
    userId,
    content,
    replyTo: new mongoose.Types.ObjectId(replyTo),
  });
  return message.save();
};
