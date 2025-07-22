
import { addUserToGroups, AUTH_GROUPS, removeUserFromGroups } from '../../auth/utils';
import { Schema } from '../../data/resource';
import { env } from '$amplify/env/set-user-group';

type SetUserGroupHandler = Schema["setUserGroup"]["functionHandler"]

// add user to group
export const handler: SetUserGroupHandler = async (event) => {
    const { userSub, group } = event.arguments;

    if (group) {
        await removeUserFromGroups(userSub, AUTH_GROUPS, env.AMPLIFY_AUTH_USERPOOL_ID);
        await addUserToGroups(userSub, [group], env.AMPLIFY_AUTH_USERPOOL_ID);
    }
    else {
        console.error("No group provided");
    }

    return event;
};