import { hash } from 'bcrypt';
import { v4 as uuid } from 'uuid';

import { UserModel } from '@/models';
import { UserEntry, UserForm } from '@/types';

export const getUser = async (userId: string): Promise<UserEntry | null> => UserModel.findOne({ userId });

export const getUserByEmail = async (email: string): Promise<UserEntry | null> => UserModel.findOne({ email });

export const addUser = async ({ email, password }: UserForm): Promise<UserEntry> => {
  const user = new UserModel({
    userId: uuid(),
    email,
    password: await hash(password, 10),
    isBlocked: false,
  });
  return user.save();
};
