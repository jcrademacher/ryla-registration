import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth";
import { checkErrors, client } from ".";
import { AuthGroup } from "../../amplify/auth/utils";

export async function getUserGroups() {
    const session = await fetchAuthSession();
    const groups = session?.tokens?.accessToken.payload['cognito:groups'] || [];
    return JSON.stringify(groups);
}

export async function refreshAuthSession(forceRefresh: boolean = false) {
    const session = await fetchAuthSession({ forceRefresh });
    return session;
}

export async function getUserAttributes() {
    const attributes = await fetchUserAttributes();
    return attributes;
}

export function isUserNew(groups: string) {
    return groups.includes('NEW');
}

export function isUserAdmin(groups: string) {
    return groups.includes('ADMINS');
}

export function isUserRotarian(groups: string) {
    return groups.includes('ROTARIANS');
}

export function isUserCamper(groups: string) {
    return !isUserAdmin(groups) && !isUserRotarian(groups) && !isUserNew(groups);
}

export async function listAllUsers() {
    const response = await client.queries.listUsers();

    checkErrors(response.errors);

    return JSON.parse(response.data as string ?? "{}");
}

export async function listGroupsForUser(username: string) {
    const response = await client.queries.listGroupsForUser({
        username
    });

    checkErrors(response.errors);

    return JSON.parse(response.data as string ?? "{}");
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

// export async function listAllUsersInGroup(group: string) {
//     const response = await client.queries.listUsers();

//     return JSON.parse(response.data as string ?? "{}");
// }