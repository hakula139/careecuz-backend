import { HydratedDocument, Types } from 'mongoose';

import {
  MessageEntry, Notification, NotificationEntry, NotificationSummary,
} from '@/types';
import { parseMessageBase } from './message';

export const parseNotificationSummary = ({
  fromUserId,
  channelId,
  threadId,
  message,
}: HydratedDocument<NotificationEntry>): NotificationSummary => ({
  fromUserId: fromUserId.toString(),
  channelId: channelId.toString(),
  threadId: threadId.toString(),
  messageId: (message as Types.ObjectId).toString(),
});

export const parseNotification = ({
  fromUserId,
  channelId,
  threadId,
  message,
  replyToMessage,
}: HydratedDocument<NotificationEntry>): Notification => ({
  fromUserId: fromUserId.toString(),
  channelId: channelId.toString(),
  threadId: threadId.toString(),
  message: parseMessageBase(message as HydratedDocument<MessageEntry>),
  replyToMessage: parseMessageBase(replyToMessage as HydratedDocument<MessageEntry>),
});
