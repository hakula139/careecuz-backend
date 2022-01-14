import { HydratedDocument, Types } from 'mongoose';

import { NotificationModel } from '@/models';
import { NotificationEntry } from '@/types';

export const getNotifications = (userId: string | Types.ObjectId): Promise<HydratedDocument<NotificationEntry>[]> =>
  NotificationModel.find({ toUserId: userId }).populate('message').exec();

export const addNotification = (
  fromUserId: string | Types.ObjectId,
  toUserId: string | Types.ObjectId,
  threadId: string | Types.ObjectId,
  messageId: string | Types.ObjectId,
): Promise<HydratedDocument<NotificationEntry>> => {
  const notification = new NotificationModel({
    fromUserId,
    toUserId,
    threadId,
    message: messageId,
    isRead: false,
  });
  return notification.save();
};

export const updateNotification = (
  id: string | Types.ObjectId,
  isRead: boolean = true,
): Promise<HydratedDocument<NotificationEntry> | null> => NotificationModel.findByIdAndUpdate(id, { isRead }).exec();
