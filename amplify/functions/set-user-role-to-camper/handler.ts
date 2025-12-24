import { removeUserFromGroups, AUTH_GROUPS } from '../../auth/utils';
import { Schema } from '../../data/resource';
import { env } from '$amplify/env/set-user-role-to-camper';

type SetUserRoleToCamperHandler = Schema["setUserRoleToCamper"]["functionHandler"]

// add user to group
export const handler: SetUserRoleToCamperHandler = async (event) => {
    const { userSub } = event.arguments;

    await removeUserFromGroups(userSub, AUTH_GROUPS, env.AMPLIFY_AUTH_USERPOOL_ID);


    return event;
};