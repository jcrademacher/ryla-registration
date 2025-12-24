import { client, checkErrors } from ".";

export async function sendEmail(to: (string | null | undefined)[], subject: string, body: string, replyTo?: string) {
    const retval = await client.mutations.sendEmail({
        to: to.filter(t => t !== null && t !== undefined),
        subject,
        body,
        replyTo
    }, { authMode: "userPool" });
    checkErrors(retval.errors);
    return JSON.parse(retval.data as string ?? "{}");
}

export async function sendEmailToAdmins(subject: string, body: string, replyTo?: string) {
    const retval = await client.mutations.sendEmailToAdmins({
        subject,
        body,
        replyTo
    }, { authMode: "userPool" });
    checkErrors(retval.errors);
    return JSON.parse(retval.data as string ?? "{}");
}

export async function sendRecommendationLinkEmail(recId: string, to: string, name: string) {
    // generate url
    const url = `${window.location.origin}/submit-recommendation?id=${recId}`;

    const subject = "[ACTION REQUIRED] RYLA Letter of Recommendation";
    const body = `
        <p>${name} is requesting a letter of recommendation from you in their application to RYLA. Please visit the following link to submit your letter of recommendation: 
        <a href="${url}">${url}</a></p>
    `;
    return await sendEmail([to], subject, body);
}