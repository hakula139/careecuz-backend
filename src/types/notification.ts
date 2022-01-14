import { HydratedDocument, Types } from 'mongoose';

import { MessageEntry } from './message';

export interface Notification {
  fromUserId: string;
  threadId: string;
  messageId: string;
}

export interface NotificationEntry {
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  threadId: Types.ObjectId;
  message: Types.ObjectId | HydratedDocument<MessageEntry>;
  isRead: boolean;
}
