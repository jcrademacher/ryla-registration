
import { Schema } from '../../data/resource';
import { sendEmail } from '../../email/email';

type Handler = Schema["sendEmail"]["functionHandler"]

export const handler: Handler = async (event) => {
    const { to, subject, body, replyTo } = event.arguments;

    return await sendEmail(to, subject, body, replyTo);
};
