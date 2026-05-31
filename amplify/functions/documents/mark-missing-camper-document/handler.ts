import type { Schema } from '../../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/mark-missing-camper-document';
import { upsertDocumentStatus } from '../shared';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

type Handler = Schema['markMissingCamperDocument']['functionHandler'];

export const handler: Handler = async (event) => {
    const { camperUserSub, templateId } = event.arguments;

    await upsertDocumentStatus(client, camperUserSub, templateId, { approved: false, received: false });

    return { success: true };
};
