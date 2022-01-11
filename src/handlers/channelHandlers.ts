import { Server, Socket } from 'socket.io';

import {
  AddChannelReq, AddChannelResp, GetChannelReq, GetChannelResp, GetChannelsResp,
} from '@/types';
import { addChannel, getChannel, getChannels } from '@/services/channelCollection.service';
import { objectIdToInt } from '@/utils';

const onGetChannelsReq = (callback: (resp: GetChannelsResp) => void): void => {
  getChannels()
    .then((channels) => {
      const parsedChannels = channels.map(({
        _id, name, isTop, createdAt,
      }) => ({
        id: objectIdToInt(_id),
        name,
        replyCount: 0, // TODO: get reply count from thread collections
        lastReplyTime: createdAt.toISOString(), // TODO: get last reply time from thread collections
        isTop,
      }));

      callback({
        code: 200,
        data: parsedChannels,
      });
    })
    .catch((error) => {
      console.log('[ERROR]', '(channels:get)', error);
      callback({
        code: 500,
        message: '服务器内部错误',
      });
    });
};

const onGetChannelReq = ({ id }: GetChannelReq, callback: (resp: GetChannelResp) => void): void => {
  getChannel(id)
    .then((channel) => {
      if (!channel) {
        callback({
          code: 404,
          message: '频道不存在',
        });
      } else {
        callback({
          code: 200,
          data: {
            name: channel.name,
          },
        });
      }
    })
    .catch((error) => {
      console.log('[ERROR]', '(channel:get)', `${id}: ${error}`);
      callback({
        code: 500,
        message: '服务器内部错误',
      });
    });
};

const onAddChannelReq = ({ data }: AddChannelReq, callback: (resp: AddChannelResp) => void): void => {
  addChannel(data)
    .then(({ id }) => {
      console.log('[INFO ]', '(channel:add)', `${id} (${data.name}): added`);
      callback({
        code: 200,
        id,
      });
    })
    .catch((error) => {
      console.log('[ERROR]', '(channel:add)', error);
      callback({
        code: 500,
        message: '服务器内部错误',
      });
    });
};

const channelHandlers = (_io: Server, socket: Socket) => {
  socket.on('channels:get', onGetChannelsReq);
  socket.on('channel:get', onGetChannelReq);
  socket.on('channel:add', onAddChannelReq);
};

export default channelHandlers;
