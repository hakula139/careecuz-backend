import { Server, Socket } from 'socket.io';
import { HydratedDocument } from 'mongoose';

import { GetNotificationsResp, NotificationEntry, PushNewNotification } from '@/types';
import { parseNotification, parseNotificationSummary } from '@/parsers';
import { getNotifications } from '@/services/notificationCollection.service';
import { getUserId } from '@/services/userRedis.service';

const onGetNotificationsReq = (socket: Socket, callback: (resp: GetNotificationsResp) => void): void => {
  try {
    getUserId(socket.id).then((toUserId) => {
      if (toUserId) {
        getNotifications(toUserId).then((notifications) => {
          callback({
            code: 200,
            data: notifications.map(parseNotification),
          });
        });
      } else {
        callback({
          code: 403,
          message: '会话已过期',
        });
      }
    });
  } catch (error) {
    console.log('[ERROR]', '(notifications:get)', error);
    callback({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

export const pushNewNotification = (
  { sockets }: Server,
  toUserId: string,
  notification: HydratedDocument<NotificationEntry>,
): void => {
  sockets.in(toUserId).emit('notification:new:summary', {
    data: parseNotificationSummary(notification),
  } as PushNewNotification);
};

const notificationHandlers = (_io: Server, socket: Socket) => {
  socket.on('notifications:get', (callback: (resp: GetNotificationsResp) => void) => {
    onGetNotificationsReq(socket, callback);
  });
};

export default notificationHandlers;
