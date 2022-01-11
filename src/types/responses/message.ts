import { Resp } from './base';
import { Message, MessageSummary } from '../message';

export interface GetHistoryMessagesResp extends Resp {
  data?: MessageSummary[];
}

export interface PushNewMessage {
  data: MessageSummary;
}

export interface GetMessageResp extends Resp {
  data?: Message;
}

export interface AddMessageResp extends Resp {
  id?: number;
}
