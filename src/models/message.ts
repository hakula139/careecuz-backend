import mongoose from 'mongoose';

import { MessageEntry } from '@/types';

const { model, Schema } = mongoose;

const messageSchema = new Schema<MessageEntry>(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Channel',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  {
    strictQuery: 'throw',
    timestamps: true,
  },
);

const MessageModel = model<MessageEntry>('Message', messageSchema);
export default MessageModel;
