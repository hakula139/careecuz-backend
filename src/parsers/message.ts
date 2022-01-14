import { HydratedDocument } from 'mongoose';

import {
  Message, MessageBase, MessageEntry, MessageSummary,
} from '@/types';
import { parseUser } from './user';

export const parseMessageBase = ({
  id,
  user,
  content,
  replyTo,
  createdAt,
}: HydratedDocument<MessageEntry>): MessageBase => ({
  id,
  user: parseUser(user),
  content,
  replyTo: replyTo?.toString(),
  time: createdAt.toISOString(),
});

export const parseMessageSummary = (message: HydratedDocument<MessageEntry>): MessageSummary => ({
  ...parseMessageBase(message),
  replyCount: message.replyCount,
  lastReplyTime: message.updatedAt.toISOString(),
});

export const parseMessage = (message: HydratedDocument<MessageEntry>): Message => ({
  ...parseMessageBase(message),
  threadId: message.threadId?.toString(),
  replies: (message.replies || []).map(parseMessage),
});
