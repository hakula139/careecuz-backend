import { HydratedDocument, Types } from 'mongoose';

import { MessageBase, MessageEntry } from './message';

export interface NotificationBase {
  fromUserId: string;
  channelId: string;
  threadId: string;
}

export interface NotificationSummary extends NotificationBase {
  messageId: string;
}

export interface Notification extends NotificationBase {
  message: MessageBase;
  replyToMessage: MessageBase;
}

export interface NotificationEntry {
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  channelId: Types.ObjectId;
  threadId: Types.ObjectId;
  message: Types.ObjectId | HydratedDocument<MessageEntry>;
  replyToMessage: Types.ObjectId | HydratedDocument<MessageEntry>;
  isRead: boolean;
}
