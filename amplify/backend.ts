import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { SESClient } from '@aws-sdk/client-ses';

import * as iam from "aws-cdk-lib/aws-iam";
import { listUsers } from "./functions/list-users/resource";
import { sendEmail } from "./functions/send-email/resource";

const backend = defineBackend({
    auth,
    data,
    storage,
    listUsers,
    sendEmail
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

const sendTestEmailLambdaFunction = backend.sendEmail.resources.lambda;
sendTestEmailLambdaFunction.role?.attachInlinePolicy(
    new iam.Policy(backend.auth.resources.userPool, "AllowSendEmail", {
        statements: [
            new iam.PolicyStatement({
                actions: ["ses:SendEmail", "ses:SendRawEmail"],
                resources: ["*"],
            }),
        ],
    })
);
