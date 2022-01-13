import mongoose from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

import { UserEntry } from '@/types';

const { model, Schema } = mongoose;

const userSchema = new Schema<UserEntry>(
  {
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
    isRemoved: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    strictQuery: 'throw',
    timestamps: true,
  },
);

userSchema.plugin(mongooseUniqueValidator);

const UserModel = model<UserEntry>('User', userSchema);
export default UserModel;
