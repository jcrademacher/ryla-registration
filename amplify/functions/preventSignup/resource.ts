import { defineFunction } from '@aws-amplify/backend';

export const preventSignup = defineFunction({
    name: 'pre-sign-up',
    environment: {
        ADMIN_EMAILS: process.env.REACT_APP_ADMIN_EMAILS ?? ""
    }
});