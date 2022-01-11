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
    timestamps: {
      createdAt: 'created_at',
    },
  },
);

const ChannelModel = model<ChannelEntry>('Channel', channelSchema);
export default ChannelModel;
