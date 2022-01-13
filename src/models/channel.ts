import mongoose from 'mongoose';

import { ChannelEntry } from '@/types';

const { model, Schema } = mongoose;

const channelSchema = new Schema<ChannelEntry>(
  {
    name: {
      type: String,
      required: true,
    },
    isTop: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    strictQuery: 'throw',
    timestamps: true,
  },
);

channelSchema.virtual('replies', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'channelId',
});

channelSchema.virtual('replyCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'channelId',
  count: true,
});

const ChannelModel = model<ChannelEntry>('Channel', channelSchema);
export default ChannelModel;
