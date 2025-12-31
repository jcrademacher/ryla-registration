import { defineFunction } from '@aws-amplify/backend';

export const notifyAdmittedCampers = defineFunction({
    name: 'notify-admitted-campers',
    schedule: "0 7 ? * * *", // run every day at 6am UTC
    timeoutSeconds: 30 // 30 seconds
});