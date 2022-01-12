import { HydratedDocument } from 'mongoose';

import { ChannelModel } from '@/models';
import { ChannelEntry, ChannelForm } from '@/types';

export const getChannels = (): Promise<HydratedDocument<ChannelEntry>[]> => ChannelModel.find().exec();

export const getChannel = (id: string): Promise<HydratedDocument<ChannelEntry> | null> =>
  ChannelModel.findById(id).exec();

export const addChannel = ({ name }: ChannelForm): Promise<HydratedDocument<ChannelEntry>> => {
  const channel = new ChannelModel({
    name,
    isTop: false,
  });
  return channel.save();
};
