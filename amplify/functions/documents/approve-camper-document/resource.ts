import { defineFunction } from '@aws-amplify/backend';

export const approveCamperDocument = defineFunction({
    name: 'approve-camper-document',
    timeoutSeconds: 30
});
