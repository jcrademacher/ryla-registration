import { defineFunction } from '@aws-amplify/backend';
import { adminEmails } from '../../auth/utils';

export const preventSignup = defineFunction({
    name: 'pre-sign-up',
    environment: {
        ADMIN_EMAILS: adminEmails.join(',')
    }
});