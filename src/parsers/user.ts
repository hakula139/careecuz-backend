import { HydratedDocument } from 'mongoose';

import { User, UserEntry } from '@/types';

export const parseUser = ({ id, isBlocked, isRemoved }: HydratedDocument<UserEntry>): User => ({
  id,
  isBlocked,
  isRemoved,
});
