import { env } from "$amplify/env/list-groups-for-user"
import type { Schema } from "../../data/resource"
import { CognitoIdentityProviderClient, AdminListGroupsForUserCommand } from "@aws-sdk/client-cognito-identity-provider";

type Handler = Schema["listGroupsForUser"]["functionHandler"]
const client = new CognitoIdentityProviderClient()

export const handler: Handler = async (event) => {
    const { username } = event.arguments;
    const command = new AdminListGroupsForUserCommand({
        UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
        Username: username
    });


    const response = await client.send(command)
    return response;
}