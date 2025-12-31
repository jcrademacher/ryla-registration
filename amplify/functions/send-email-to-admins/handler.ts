import { env } from "$amplify/env/send-email-to-admins";
import { Schema } from '../../data/resource';
import { CognitoIdentityProviderClient, ListUsersInGroupCommand } from "@aws-sdk/client-cognito-identity-provider";
import { sendEmail } from '../../email/email';

type Handler = Schema["sendEmailToAdmins"]["functionHandler"]

const client = new CognitoIdentityProviderClient();

export const handler: Handler = async (event) => {
    const { subject, body, replyTo } = event.arguments;

    const adminUsersCmd = new ListUsersInGroupCommand({
        GroupName: "ADMINS",
        UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID
    });

    const adminUsers = await client.send(adminUsersCmd);

    // console.log("adminUsers", adminUsers);

    const adminEmails = 
        adminUsers.Users?.map((user) => user.Attributes?.find((attr) => attr.Name === 'email')?.Value)
        .filter((email) => email !== null && email !== undefined) ?? [];
    
    // const response = await sendEmail()
    return await sendEmail(adminEmails, subject, body, replyTo);
};
