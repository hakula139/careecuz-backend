import mongoose from 'mongoose';

export const intToObjectId = (id: number): mongoose.Types.ObjectId => new mongoose.Types.ObjectId(id);

export const objectIdToInt = (_id: mongoose.Types.ObjectId): number => parseInt(_id.toString(), 16);
