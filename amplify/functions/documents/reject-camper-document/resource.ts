import { defineFunction } from '@aws-amplify/backend';

export const rejectCamperDocument = defineFunction({
    name: 'reject-camper-document',
    timeoutSeconds: 30
});
