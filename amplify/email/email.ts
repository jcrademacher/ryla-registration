import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export const sendEmail = async (to: (string | null | undefined)[], subject: string, body: string, replyTo?: string | null, greeting?: string | null) => {
    const sesClient = new SESClient({ region: 'us-east-1' });
    const command = new SendEmailCommand({
        Source: 'RYLA 7780 Registration <registration@ryla7780.org>',
        Destination: {
            ToAddresses: to.filter(t => t !== null && t !== undefined)
        },
        Message: {
            Subject: { Data: subject },
            Body: {
                Html: { Data: `
                <p>${greeting ?? `Hello ${to.join(', ')},`}</p>
                <p>
                ${body}
                </p>
                <p>Best regards,</p>
                <p>RYLA Registration Team</p>
                ================================================
                ${!replyTo ? 
                    `<p><b>Note: this is an automated message. Please do not reply to this email.</b></p>` : 
                    '<p><b>Note: you can reply directly to this email to contact the user who triggered this message.</b></p>'}
                ` }
            }
        },
        ReplyToAddresses: replyTo ? [replyTo] : undefined
    });
    
    // console.log("sending email", command);
    const response = await sesClient.send(command);
    // console.log("email sent", response);

    return response;
}