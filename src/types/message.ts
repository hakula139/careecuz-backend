import { HydratedDocument, Types } from 'mongoose';

import { User, UserEntry } from './user';

export interface MessageForm {
  content: string;
  replyTo?: string;
}

export interface MessageBase extends MessageForm {
  id: string;
  user: User;
  time: string;
}

export interface MessageSummary extends MessageBase {
  replyCount: number;
  lastReplyTime: string;
}

export interface Message extends MessageBase {
  replies: Message[];
}

export interface MessageEntry {
  channelId: Types.ObjectId;
  user: HydratedDocument<UserEntry>;
  content: string;
  replyTo?: Types.ObjectId;
  replies: HydratedDocument<MessageEntry>[];
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
}
