import { HydratedDocument, Types } from 'mongoose';

import { MessageEntry } from './message';

export interface Notification {
  fromUserId: string;
  channelId: string;
  threadId: string;
  messageId: string;
}

export interface NotificationEntry {
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  channelId: Types.ObjectId;
  threadId: Types.ObjectId;
  message: Types.ObjectId | HydratedDocument<MessageEntry>;
  isRead: boolean;
}
