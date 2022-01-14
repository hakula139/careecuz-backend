import { HydratedDocument, Types } from 'mongoose';

import { MessageBase, MessageEntry } from './message';

export interface Notification {
  message: MessageBase;
}

export interface NotificationEntry {
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  message: HydratedDocument<MessageEntry>;
  isRead: boolean;
}
