import type { Schema } from "../../data/resource"
import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { env } from "$amplify/env/get-user"
import { getGroupsForUser } from "../../auth/utils";


type Handler = Schema["getUser"]["functionHandler"]
const client = new CognitoIdentityProviderClient()

export const handler: Handler = async (event) => {
    const { username } = event.arguments;
    const command = new AdminGetUserCommand({
        UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
        Username: username
    });

    let response;

    try {
        response = await client.send(command)
    } catch (error) {
        console.error("Error getting user:", error);
        return null;
    }

    const sub = response.UserAttributes?.find((attr) => attr.Name === 'sub')?.Value;
    const email = response.UserAttributes?.find((attr) => attr.Name === 'email')?.Value;
    const createdAt = response.UserCreateDate;
    const verified = response.UserAttributes?.find((attr) => attr.Name === 'email_verified')?.Value;

    if(!sub) {
        return null;
    }
    
    const groups = await getGroupsForUser(sub, env.AMPLIFY_AUTH_USERPOOL_ID);
    let groupNames = groups?.map((group) => group.GroupName ?? "UNKNOWN_GROUP") ?? [];

    if (groupNames.length === 0) {
        groupNames = ["CAMPERS"];
    }

    // console.log("groups", groups);

    return {
        userSub: sub,
        email: email ?? "",
        groupNames: groupNames,
        createdAt: createdAt ? createdAt.toISOString() : "",
        verified: verified === 'true'
    };
}