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
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  {
    strictQuery: 'throw',
    timestamps: true,
  },
);

messageSchema.virtual('replies', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'threadId',
});

messageSchema.virtual('replyCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'threadId',
  count: true,
});

const MessageModel = model<MessageEntry>('Message', messageSchema);
export default MessageModel;
