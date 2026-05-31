import { defineFunction } from '@aws-amplify/backend';

export const listAllRotarians = defineFunction({
    name: 'list-all-rotarians',
    timeoutSeconds: 30
});
