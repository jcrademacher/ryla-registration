import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import { addUserToGroups } from '../../auth/utils';
import { env } from '$amplify/env/post-confirmation-add-to-group';

// add user to group
export const handler: PostConfirmationTriggerHandler = async (event) => {
    const email = event.request.userAttributes.email;

    if (env.ADMIN_EMAILS.includes(email)) {
        // console.log('not admin', email);
        // await addUserToGroup(event.userName, "CAMPERS", env.AMPLIFY_AUTH_USERPOOL_ID);
        await addUserToGroups(event.userName, ["ADMINS"], env.AMPLIFY_AUTH_USERPOOL_ID);
    }
    else {
        await addUserToGroups(event.userName, ["NEW"], env.AMPLIFY_AUTH_USERPOOL_ID);
    }
    
    return event;
};