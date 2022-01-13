export interface UserForm {
  email: string;
  password: string;
  verifyCode?: string;
}

export interface User {
  id: string;
  isBlocked: boolean;
  isRemoved: boolean;
}

export interface UserEntry {
  email: string;
  password: string;
  isBlocked: boolean;
  isRemoved: boolean;
  createdAt: Date;
}
