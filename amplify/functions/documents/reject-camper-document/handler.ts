import type { Schema } from '../../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/reject-camper-document';
import { upsertDocumentStatus } from '../shared';
import { sendDocumentRejectionEmail } from '../../../email/email';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

type Handler = Schema['rejectCamperDocument']['functionHandler'];

export const handler: Handler = async (event) => {
    const { camperUserSub, templateId, message } = event.arguments;

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

    const { data: doc, errors: docErrors } = await client.models.CamperDocument.get({ camperUserSub, templateId });
    if (templateErrors) {
        console.error('Error fetching document:', docErrors);
        throw new Error('Failed to fetch document');
    }

    if(!doc) {
        console.error('Document not found for:', templateId);
        throw new Error('Document not found');
    }

    await upsertDocumentStatus(client, camperUserSub, templateId, { received: true, approved: false });

    const response = await sendDocumentRejectionEmail({
        templateName: template?.name ?? '',
        documentName: doc.filepath?.split("/").pop(),
        recipients: [camper.email, camper.parent1Email, camper.parent2Email],
        message
    });

    return { success: true, emailStatus: response.$metadata.httpStatusCode ?? null };
};
