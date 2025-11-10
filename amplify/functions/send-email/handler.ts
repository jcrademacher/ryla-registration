
import { env } from '$amplify/env/send-email';
import { Schema } from '../../data/resource';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

type Handler = Schema["sendEmail"]["functionHandler"]

export const handler: Handler = async (event) => {
    const { to, subject, body, replyTo } = event.arguments;
    const sesClient = new SESClient({ region: 'us-east-1' });
    const command = new SendEmailCommand({
        Source: 'registration@ryla7780.org',
        Destination: {
            ToAddresses: to.filter(t => t !== null && t !== undefined)
        },
        Message: {
            Subject: { Data: subject },
            Body: {
                Html: { Data: `
                <p>Hello ${to.join(', ')},</p>
                <p>
                ${body}
                </p>
                <p>Best regards,</p>
                <p>RYLA Registration Team</p>
                ================================================
                ${!replyTo ? 
                    `<p><b>Note: this is an automated message. Please do not reply to this email.</b></p>` : 
                    '<p><b>Note: you can reply directly to this email to contact the admin who sent this message.</b></p>'}
                ` }
            }
        },
        ReplyToAddresses: replyTo ? [replyTo] : undefined
    });
    
    console.log("sending email", command);
    const response = await sesClient.send(command);
    console.log("email sent", response);

    return response;
};
