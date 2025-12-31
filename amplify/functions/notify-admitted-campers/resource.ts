import { defineFunction } from '@aws-amplify/backend';

export const notifyAdmittedCampers = defineFunction({
    name: 'notify-admitted-campers',
    schedule: "0 14 ? * * *" // run every day at 6am UTC
});