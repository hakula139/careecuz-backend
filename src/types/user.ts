export interface UserForm {
  email: string;
  password: string;
  verifyCode?: string;
}

export interface User {
  userId: string;
  isBlocked: boolean;
}

export interface UserEntry {
  userId: string;
  email: string;
  password: string;
  isBlocked: boolean;
}
