import { HydratedDocument } from 'mongoose';

import { User, UserEntry } from './user';

export interface MessageForm {
  content: string;
  replyTo?: string;
}

interface MessageBase extends MessageForm {
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
  channelId: string;
  user: HydratedDocument<UserEntry>;
  content: string;
  replyTo?: string;
  createdAt: Date;
  updatedAt: Date;
}
