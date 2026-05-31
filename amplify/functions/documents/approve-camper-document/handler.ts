import type { Schema } from '../../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/approve-camper-document';
import { upsertDocumentStatus } from '../shared';
import { sendDocumentApprovalEmail } from '../../../email/email';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

type Handler = Schema['approveCamperDocument']['functionHandler'];

export const handler: Handler = async (event) => {
    const { camperUserSub, templateId } = event.arguments;

    const { data: camper, errors: camperErrors } = await client.models.CamperProfile.get({ userSub: camperUserSub });
    if (camperErrors) {
        console.error('Error fetching camper profile:', camperErrors);
        throw new Error('Failed to fetch camper profile');
    }

    if(!camper) {
        console.error('Camper profile not found for:', camperUserSub);
        throw new Error('Camper profile not found');
    }

    const { data: template, errors: templateErrors } = await client.models.DocumentTemplate.get({ id: templateId });
    if (templateErrors) {
        console.error('Error fetching document template:', templateErrors);
        throw new Error('Failed to fetch document template');
    }

    if(!template) {
        console.error('Document template not found for:', templateId);
        throw new Error('Document template not found');
    }

    await upsertDocumentStatus(client, camperUserSub, templateId, {
        approved: true,
        received: true
    });

    const response = await sendDocumentApprovalEmail({
        templateName: template?.name ?? '',
        recipients: [camper.email, camper.parent1Email, camper.parent2Email],
    });

    return { success: true, emailStatus: response.$metadata.httpStatusCode ?? null };
};
