import { HydratedDocument } from 'mongoose';

import { ChannelModel } from '@/models';
import { ChannelEntry, ChannelForm } from '@/types';

export const getChannels = async (): Promise<HydratedDocument<ChannelEntry>[]> => ChannelModel.find();

export const getChannel = async (id: string): Promise<HydratedDocument<ChannelEntry> | null> =>
  ChannelModel.findById(id);

export const addChannel = async ({ name }: ChannelForm): Promise<HydratedDocument<ChannelEntry>> => {
  const channel = new ChannelModel({
    name,
    isTop: false,
  });
  return channel.save();
};
