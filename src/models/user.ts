import mongoose from 'mongoose';

import { UserEntry } from '@/types';

const { model, Schema } = mongoose;

const userSchema = new Schema<UserEntry>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isBlocked: {
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

const UserModel = model<UserEntry>('User', userSchema);
export default UserModel;
