import { env } from "$amplify/env/list-users"
import { getGroupsForUser } from "../../auth/utils";
import type { Schema } from "../../data/resource"
import { CognitoIdentityProviderClient, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";

type Handler = Schema["listUsers"]["functionHandler"]
type UserProfile = Schema["UserProfile"]["type"];
const client = new CognitoIdentityProviderClient()

export const handler: Handler = async (event) => {
    const command = new ListUsersCommand({
        UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID
    });


    const response = await client.send(command);

    // First pass: collect user data and create promises
    const userPromises = (response.Users ?? []).map(async (user) => {
        const sub = user.Attributes?.find((attr) => attr.Name === 'sub')?.Value;
        const email = user.Attributes?.find((attr) => attr.Name === 'email')?.Value;
        const createdAt = user.UserCreateDate;
        const verified = user.Attributes?.find((attr) => attr.Name === 'email_verified')?.Value;

        if(!sub) {
            return null;
        }
        
        // This will execute in parallel with other users
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
    });

    // Execute all promises in parallel and filter out nulls
    const results = await Promise.all(userPromises);
    return results.filter((user) => user !== null);
}