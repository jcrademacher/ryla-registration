import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const APP_ORIGIN = 'https://registration.ryla7780.org';
const IMPORTANT_DOCS_URL = `${APP_ORIGIN}/camper/important-documents`;
const DIRECTOR_EMAIL = 'director@ryla7780.org';

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
                    '<p><b>Note: you can reply directly to this email to contact the directors.</b></p>'}
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

interface DocumentNotificationProps {
    templateName: string;
    documentName?: string | null;
    recipients: (string | null | undefined)[];
    message?: string | null;
}

export async function sendDocumentRejectionEmail({
    templateName, 
    documentName, 
    recipients, 
    message
}: DocumentNotificationProps) {
    const docName = documentName || templateName;

    const body = `
        <p>A camp administrator has reviewed your '${templateName}' and found an issue with it.
        Please see the comments below and resubmit the document at
        <a href="${IMPORTANT_DOCS_URL}">${IMPORTANT_DOCS_URL}</a>.</p>
        <p><b>Document: ${docName}</b></p>
        ${message ? `<p>Comments: ${message}</p>` : ''}
    `;

    return sendEmail(
        recipients,
        '[ACTION REQUIRED] Issue with your registration document',
        body,
        DIRECTOR_EMAIL
    );
}

export async function sendDocumentApprovalEmail({
    templateName, 
    recipients, 
}: {
    templateName: string;
    recipients: (string | null | undefined)[];
}) {

    const body = `
        <p>A camp administrator has approved your '${templateName}' document. No further action is required.</p>
        <p>Please continue with your registration process at <a href="${IMPORTANT_DOCS_URL}">${IMPORTANT_DOCS_URL}</a>.</p>
    `;

    return sendEmail(
        recipients,
        'Document Approved',
        body,
        DIRECTOR_EMAIL
    );
}