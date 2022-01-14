import { HydratedDocument, Types } from 'mongoose';

import { NotificationModel } from '@/models';
import { NotificationEntry } from '@/types';

export const getNotifications = (toUserId: string | Types.ObjectId): Promise<HydratedDocument<NotificationEntry>[]> =>
  NotificationModel.find({ toUserId }).sort({ _id: -1 }).populate('message').populate('replyToMessage')
    .exec();

export const addNotification = (
  fromUserId: string | Types.ObjectId,
  toUserId: string | Types.ObjectId,
  channelId: string | Types.ObjectId,
  threadId: string | Types.ObjectId,
  messageId: string | Types.ObjectId,
  replyTo: string | Types.ObjectId,
): Promise<HydratedDocument<NotificationEntry>> => {
  const notification = new NotificationModel({
    fromUserId,
    toUserId,
    channelId,
    threadId,
    message: messageId,
    replyToMessage: replyTo,
    isRead: false,
  });
  return notification.save();
};

export const updateNotification = (
  id: string | Types.ObjectId,
  isRead: boolean = true,
): Promise<HydratedDocument<NotificationEntry> | null> => NotificationModel.findByIdAndUpdate(id, { isRead }).exec();
