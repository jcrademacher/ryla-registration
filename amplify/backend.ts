import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

import * as iam from "aws-cdk-lib/aws-iam";
import { listUsers } from "./functions/list-users/resource";
import { sendEmail } from "./functions/send-email/resource";
import { sendEmailToAdmins } from "./functions/send-email-to-admins/resource";
import { sendEmailToClubReps } from "./functions/send-email-to-club-reps/resource";
import { notifyAdmittedCampers } from "./functions/notify-admitted-campers/resource";

const backend = defineBackend({
    auth,
    data,
    storage,
    listUsers,
    sendEmail,
    sendEmailToAdmins,
    sendEmailToClubReps,
    notifyAdmittedCampers
});

const lambdaFunction = backend.listUsers.resources.lambda;
lambdaFunction.role?.attachInlinePolicy(
    new iam.Policy(backend.auth.resources.userPool, "AllowListUsers", {
        statements: [
            new iam.PolicyStatement({
                actions: ["cognito-idp:ListUsers"],
                resources: [backend.auth.resources.userPool.userPoolArn],
            }),
        ],
    })
);

const sendEmailPolicy =     
    new iam.Policy(backend.auth.resources.userPool, "AllowSendEmail", {
        statements: [
            new iam.PolicyStatement({
                actions: ["ses:SendEmail", "ses:SendRawEmail"],
                resources: ["*"],
            }),
        ],
    })

const sendEmailLambdaFunction = backend.sendEmail.resources.lambda;
sendEmailLambdaFunction.role?.attachInlinePolicy(sendEmailPolicy);

const sendEmailToAdminsLambdaFunction = backend.sendEmailToAdmins.resources.lambda;
sendEmailToAdminsLambdaFunction.role?.attachInlinePolicy(sendEmailPolicy);

const sendEmailToClubRepsLambdaFunction = backend.sendEmailToClubReps.resources.lambda;
sendEmailToClubRepsLambdaFunction.role?.attachInlinePolicy(sendEmailPolicy);

const notifyAdmittedCampersLambdaFunction = backend.notifyAdmittedCampers.resources.lambda;
notifyAdmittedCampersLambdaFunction.role?.attachInlinePolicy(sendEmailPolicy);

