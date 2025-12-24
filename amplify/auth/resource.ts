import { defineAuth } from '@aws-amplify/backend';
import { preventSignup } from '../functions/preventSignup/resource';
import { createRotarianUser } from "../functions/create-rotarian-user/resource"
import { postConfirmationAddToGroup } from '../functions/post-confirmation-add-to-group/resource';
import { setUserRoleToCamper } from '../functions/set-user-role-to-camper/resource';
import { listUsers } from '../functions/list-users/resource';
import { AUTH_GROUPS } from './utils';
import { setUserGroup } from '../functions/set-user-group/resource';
import { deleteUser } from '../functions/delete-user/resource';
import { getUser } from '../functions/get-user/resource';
import { sendEmailToAdmins } from '../functions/send-email-to-admins/resource';

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
    // senders: {
    //     email: {
    //         fromEmail: "registration@ryla7780.org",
    //         fromName: "RYLA Registration",
    //     },
    // },
    // multifactor: {
    //     mode: 'REQUIRED',
    //     sms: true,
    // },
    // userAttributes: {
    //     phoneNumber: {
    //         required: true
    //     }
    // },
    groups: AUTH_GROUPS,
    access: (allow) => [
        allow.resource(createRotarianUser).to(["createUser"]),
        allow.resource(postConfirmationAddToGroup).to(["addUserToGroup"]),
        allow.resource(setUserRoleToCamper).to(["removeUserFromGroup"]),
        allow.resource(listUsers).to(["manageUsers"]),
        allow.resource(setUserGroup).to(["addUserToGroup", "removeUserFromGroup"]),
        allow.resource(deleteUser).to(["deleteUser"]),
        allow.resource(getUser).to(["getUser"]),
        allow.resource(sendEmailToAdmins).to(["listUsersInGroup"]),
    ]
});