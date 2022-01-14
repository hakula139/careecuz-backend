import { HydratedDocument } from 'mongoose';

import { ChannelEntry, ChannelInfo, ChannelSummary } from '@/types';

export const parseChannelInfo = ({ name }: HydratedDocument<ChannelEntry>): ChannelInfo => ({
  name,
});

export const parseChannelSummary = ({
  id,
  name,
  replyCount,
  isTop,
  updatedAt,
}: HydratedDocument<ChannelEntry>): ChannelSummary => ({
  id,
  name,
  replyCount,
  isTop,
  lastReplyTime: updatedAt.toISOString(),
});
