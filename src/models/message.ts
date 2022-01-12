import mongoose from 'mongoose';

import { MessageEntry } from '@/types';

const { model, Schema } = mongoose;

const messageSchema = new Schema<MessageEntry>(
  {
    channelId: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
    },
    replyTo: {
      type: String,
    },
  },
  {
    strictQuery: 'throw',
    timestamps: true,
  },
);

const MessageModel = model<MessageEntry>('Message', messageSchema);
export default MessageModel;
