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

    const retval: UserProfile[] = [];

    for(const user of response.Users ?? []) {
        const sub = user.Attributes?.find((attr) => attr.Name === 'sub')?.Value;
        const email = user.Attributes?.find((attr) => attr.Name === 'email')?.Value;
        const createdAt = user.UserCreateDate;
        const verified = user.Attributes?.find((attr) => attr.Name === 'email_verified')?.Value;

        if(sub && email && createdAt && verified) {
            const groups = await getGroupsForUser(sub, env.AMPLIFY_AUTH_USERPOOL_ID);
            let groupNames = groups?.map((group) => group.GroupName ?? "UNKNOWN_GROUP") ?? [];

            if(groupNames.length == 0) {
                groupNames = ["CAMPERS"];
            }

            // console.log("groups", groups);

            retval.push({
                userSub: sub,
                email: email,
                groupNames: groupNames,
                createdAt: createdAt.toISOString(),
                verified: verified === 'true'
            });
        }
    }

    return retval;
}