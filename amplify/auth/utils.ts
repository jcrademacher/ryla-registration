
import { AdminAddUserToGroupCommand, AdminCreateUserCommand, AdminDeleteUserCommand, AdminListGroupsForUserCommand, AdminRemoveUserFromGroupCommand } from "@aws-sdk/client-cognito-identity-provider";
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient();

export const createUser = async (email: string, userPoolId: string) => {
    const input = {
        UserAttributes: [
            {
                Name: "email",
                Value: email
            }
        ],
        UserPoolId: userPoolId,
        Username: undefined
    };

    const command = new AdminCreateUserCommand(input);
    const response = await client.send(command);

    return response;
}

export const deleteUser = async (username: string, userPoolId: string) => {
    const command = new AdminDeleteUserCommand({
        Username: username,
        UserPoolId: userPoolId,
    });
    const response = await client.send(command);
    return response;
}

export const addUserToGroups = async (username: string, groupNames: string[], userPoolId: string) => {
    let response;
    for (const groupName of groupNames) {
        const command = new AdminAddUserToGroupCommand({
            Username: username,
            GroupName: groupName,
            UserPoolId: userPoolId,
        });
        response = await client.send(command)
        console.log('added user to group', username, groupName);
    }

    return response;
}

export const removeUserFromGroups = async (username: string, groupNames: string[], userPoolId: string) => {
    let response;
    for (const groupName of groupNames) {
        const command = new AdminRemoveUserFromGroupCommand({
            Username: username,
            GroupName: groupName,
            UserPoolId: userPoolId,
        })
        response = await client.send(command)
        console.log('removed user from group', username, groupName, response);
    }

    return response
}

export const getGroupsForUser = async (username: string, userPoolId: string) => {
    const command = new AdminListGroupsForUserCommand({
        UserPoolId: userPoolId,
        Username: username
    });

    const response = await client.send(command);
    return response.Groups;
}


export type AuthGroup = "ADMINS" | "ROTARIANS" | "COORDINATORS" | "NEW";

export const AUTH_GROUPS: AuthGroup[] = [
    "ADMINS",
    "ROTARIANS",
    "COORDINATORS",
    "NEW"
];