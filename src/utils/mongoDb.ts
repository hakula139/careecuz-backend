import { Types } from 'mongoose';

export const intToObjectId = (id: number): Types.ObjectId => new Types.ObjectId(id);

export const objectIdToInt = (_id: Types.ObjectId): number => parseInt(_id.toString(), 16);
