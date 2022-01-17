import { ClientResponse } from '@sendgrid/mail';

import { MAIL_SENDER } from '@/configs';
import MailManager from './mail.service';

export const sendVerifyCode = (to: string, verifyCode: string): Promise<[ClientResponse, {}]> =>
  MailManager.send(
    to,
    MAIL_SENDER,
    '欢迎来到 CareeCuz！请验证您的邮箱～',
    `
      <p>您的验证码是: <strong>${verifyCode}</strong></p>
      <p>此验证码将在 1 小时后过期，请尽快填写。</p>
    `,
  );
