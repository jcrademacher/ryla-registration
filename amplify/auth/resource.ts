import { defineAuth } from '@aws-amplify/backend';
import { preventSignup } from '../functions/preventSignup/resource';
import { createRotarianUser } from "../functions/create-rotarian-user/resource"
import { postConfirmationAddToGroup } from '../functions/post-confirmation-add-to-group/resource';
import { setUserRoleToCamper } from '../functions/set-user-role-to-camper/resource';
import { listUsers } from '../functions/list-users/resource';
import { listGroupsForUser } from '../functions/list-groups-for-user/resource';
import { AUTH_GROUPS } from './utils';
import { setUserGroup } from '../functions/set-user-group/resource';
import { deleteUser } from '../functions/delete-user/resource';
import { getUser } from '../functions/get-user/resource';

// import { selectUserRole } from '../functions/select-user-role/resource';


/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
    loginWith: {
        email: {
            verificationEmailStyle: "CODE",
            verificationEmailSubject: "RYLA REGISTRATION: New Account",
            verificationEmailBody: (createCode) => `Use this code to confirm your account: ${createCode()}`,
            userInvitation: {
                emailSubject: "RYLA REGISTRATION: New Account",
                emailBody: (user, code) =>
                    `A RYLA registration account was setup on your behalf. You can now login with username ${user()} and temporary password ${code()}`, 
            },
        },
    },
    triggers: {
        preSignUp: preventSignup,
        postConfirmation: postConfirmationAddToGroup
    },
    groups: AUTH_GROUPS,
    access: (allow) => [
        allow.resource(createRotarianUser).to(["createUser"]),
        allow.resource(postConfirmationAddToGroup).to(["addUserToGroup"]),
        allow.resource(setUserRoleToCamper).to(["addUserToGroup", "removeUserFromGroup"]),
        allow.resource(listUsers).to(["manageUsers"]),
        allow.resource(listGroupsForUser).to(["listGroupsForUser"]),
        allow.resource(setUserGroup).to(["addUserToGroup", "removeUserFromGroup"]),
        allow.resource(deleteUser).to(["deleteUser"]),
        allow.resource(getUser).to(["getUser"])
    ]
});