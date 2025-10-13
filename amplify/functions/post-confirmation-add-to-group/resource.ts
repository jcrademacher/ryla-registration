import { defineFunction } from '@aws-amplify/backend';

export const postConfirmationAddToGroup = defineFunction({
    name: 'post-confirmation-add-to-group',
    environment: {
        ADMIN_EMAILS: process.env.REACT_APP_ADMIN_EMAILS ?? ""
    }
});