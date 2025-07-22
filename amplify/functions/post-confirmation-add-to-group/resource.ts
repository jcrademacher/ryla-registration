import { defineFunction } from '@aws-amplify/backend';
import { adminEmails } from '../../auth/utils';

export const postConfirmationAddToGroup = defineFunction({
    name: 'post-confirmation-add-to-group',
    environment: {
        ADMIN_EMAILS: adminEmails.join(',')
    }
});