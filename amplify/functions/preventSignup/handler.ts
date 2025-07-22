import { PreSignUpTriggerHandler } from 'aws-lambda';
import { env } from '$amplify/env/pre-sign-up';

export const handler: PreSignUpTriggerHandler = async (event) => {
    const userEmail = event.request.userAttributes.email;
    console.log("pre sign up triggered", userEmail);

    // if (!env.ADMIN_EMAILS.includes(userEmail)) {
    //     throw new Error('Signup is not allowed. Please contact administrator.');
    // }

    return event;
};
