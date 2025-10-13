import type { Schema } from "../../data/resource"
import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { env } from "$amplify/env/get-user"


type Handler = Schema["getUser"]["functionHandler"]
const client = new CognitoIdentityProviderClient()

export const handler: Handler = async (event) => {
    const { username } = event.arguments;
    const command = new AdminGetUserCommand({
        UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
        Username: username
    });


    const response = await client.send(command)
    return response;
}