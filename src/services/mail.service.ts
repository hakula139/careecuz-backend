import mail, { ClientResponse } from '@sendgrid/mail';

import { SENDGRID_API_KEY } from '@/configs';

export default class MailManager {
  public constructor() {
    mail.setApiKey(SENDGRID_API_KEY);
  }

  public static async send(to: string, from: string, subject: string, html: string): Promise<[ClientResponse, {}]> {
    return mail.send({
      to,
      from,
      subject,
      html,
    });
  }
}

export const mailManager = new MailManager();
