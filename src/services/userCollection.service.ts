import { hash } from 'bcrypt';
import { HydratedDocument, Types } from 'mongoose';

import { UserModel } from '@/models';
import { UserEntry, UserForm } from '@/types';

export const getUser = (id: string | Types.ObjectId): Promise<HydratedDocument<UserEntry> | null> =>
  UserModel.findOne({ id }).exec();

export const getUserByEmail = (email: string): Promise<HydratedDocument<UserEntry> | null> =>
  UserModel.findOne({ email }).exec();

export const addUser = async ({ email, password }: UserForm): Promise<HydratedDocument<UserEntry>> => {
  const user = new UserModel({
    email,
    password: await hash(password, 10),
    isBlocked: false,
  });
  return user.save();
};
