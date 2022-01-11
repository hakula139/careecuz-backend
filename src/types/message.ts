import mongoose from 'mongoose';

import { User } from './user';

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
  channelId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  content: string;
  replyTo?: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
