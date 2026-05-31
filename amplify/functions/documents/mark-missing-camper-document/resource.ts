import { defineFunction } from '@aws-amplify/backend';

export const markMissingCamperDocument = defineFunction({
    name: 'mark-missing-camper-document',
    timeoutSeconds: 30
});
