import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
import { checkErrors, client } from ".";
import { AuthGroup } from "../../amplify/auth/utils";
import { AuthSession } from "aws-amplify/auth";
import { Schema } from "../../amplify/data/resource";

export type UserProfile = Schema["UserProfile"]["type"];
export type ListUsersResult = Schema["ListUsersResult"]["type"];

export function getUserGroups(session: AuthSession) {
    // console.log("session", session);
    const groups = session?.tokens?.accessToken.payload['cognito:groups'] || [];
    return JSON.parse(JSON.stringify(groups));
}

export async function refreshAuthSession(forceRefresh: boolean = false) {
    const session = await fetchAuthSession({ forceRefresh });
    return session;
}

export async function getUserAttributes() {
    const attributes = await fetchUserAttributes();
    return attributes;
}

export function isUserNew(groups: string | string[]) {
    return groups.includes('NEW');
}

export function isUserAdmin(groups: string | string[]) {
    return groups.includes('ADMINS');
}

export function isUserRotarian(groups: string | string[]) {
    return groups.includes('ROTARIANS') || groups.includes('COORDINATORS');
}

export function isUserCoordinator(groups: string | string[]) {
    return groups.includes('COORDINATORS');
}


export function isUserCamper(groups: string | string[]) {
    return !isUserAdmin(groups) && !isUserRotarian(groups) && !isUserCoordinator(groups) && !isUserNew(groups);
}

export async function listAllUsers(limit?: number | null, nextToken?: string | null): Promise<ListUsersResult> {
    const response = await client.queries.listUsers({
        limit,
        nextToken
    });

    checkErrors(response.errors);

    return response.data ?? { items: [], nextToken: undefined };
}

export async function setUserGroup(userSub: string, group: AuthGroup): Promise<Object> {
    const response = await client.mutations.setUserGroup({
        userSub,
        group
    });

    checkErrors(response.errors);

    return JSON.parse(response.data as string ?? "{}");
}

export async function deleteUser(userSub: string): Promise<Object> {
    const response = await client.mutations.deleteUser({
        userSub
    });
    checkErrors(response.errors);
    return JSON.parse(response.data as string ?? "{}");
}

export async function getUser(username: string) {
    const response = await client.queries.getUser({
        username
    }, { authMode: "userPool" });

    checkErrors(response.errors);
    return response.data;
}

export function getUserSubFromAttr(attr: any[]): string | undefined {
    return attr.find((a: { Name: string, Value: string }) => a.Name === 'sub')?.Value;
}

export function getUserEmailFromAttr(attr: any[]): string | undefined {
    return attr.find((a: { Name: string, Value: string }) => a.Name === 'email')?.Value;
}

// export async function listAllUsersInGroup(group: string) {
//     const response = await client.queries.listUsers();

//     return JSON.parse(response.data as string ?? "{}");
// }