import mongoose from 'mongoose';

import { NotificationEntry } from '@/types';

const { model, Schema } = mongoose;

const notificationSchema = new Schema<NotificationEntry>(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Channel',
    },
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Message',
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Message',
    },
    replyToMessage: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Message',
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    strictQuery: 'throw',
    timestamps: true,
  },
);

const NotificationModel = model<NotificationEntry>('Notification', notificationSchema);
export default NotificationModel;
