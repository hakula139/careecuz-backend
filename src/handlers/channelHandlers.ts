import { Server, Socket } from 'socket.io';
import { HydratedDocument } from 'mongoose';

import {
  AddChannelReq,
  AddChannelResp,
  ChannelEntry,
  ChannelInfo,
  ChannelSummary,
  GetChannelReq,
  GetChannelResp,
  GetChannelsResp,
  JoinChannel,
  LeaveChannel,
} from '@/types';
import { addChannel, getChannel, getChannels } from '@/services/channelCollection.service';

const parseChannelSummary = ({
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

const onGetChannelsReq = (callback: (resp: GetChannelsResp) => void): void => {
  getChannels()
    .then((channels) => {
      callback({
        code: 200,
        data: channels.map(parseChannelSummary),
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

const parseChannelInfo = ({ name }: HydratedDocument<ChannelEntry>): ChannelInfo => ({
  name,
});

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
          data: parseChannelInfo(channel),
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

const onJoinChannel = (socket: Socket, { id }: JoinChannel): void => {
  console.log('[DEBUG]', '(channel:join)', `${socket.id} joins ${id}`);
  socket.join(id);
};

const onLeaveChannel = (socket: Socket, { id }: LeaveChannel): void => {
  console.log('[DEBUG]', '(channel:leave)', `${socket.id} leaves ${id}`);
  socket.leave(id);
};

const channelHandlers = (_io: Server, socket: Socket) => {
  socket.on('channels:get', onGetChannelsReq);
  socket.on('channel:get', onGetChannelReq);
  socket.on('channel:add', onAddChannelReq);
  socket.on('channel:join', (req: JoinChannel): void => {
    onJoinChannel(socket, req);
  });
  socket.on('channel:leave', (req: LeaveChannel): void => {
    onLeaveChannel(socket, req);
  });
};

export default channelHandlers;
