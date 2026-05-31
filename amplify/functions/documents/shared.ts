import type { Schema } from '../../data/resource';
import { generateClient } from 'aws-amplify/data';
import { sendEmail } from '../../email/email';
import { remove } from 'aws-amplify/storage';

export type DataClient = ReturnType<typeof generateClient<Schema>>;

function getFilepathFilename(filepath?: string | null): string {
    if (!filepath) {
        return '';
    }

    return filepath.split('/').pop() ?? '';
}

export interface DocumentContext {
    camper: Schema['CamperProfile']['type'];
    template: Schema['DocumentTemplate']['type'] | null;
    document: Schema['CamperDocument']['type'] | null;
}


/**
 * Creates the camper document if it does not exist yet, otherwise updates it.
 * Mirrors the create-or-update behaviour of the previous front end flow.
 */
export async function upsertDocumentStatus(
    client: DataClient,
    camperUserSub: string,
    templateId: string,
    updates: { approved?: boolean; received?: boolean }

): Promise<Schema['CamperDocument']['type'] | null> {
    const { data: existing, errors: documentErrors } = await client.models.CamperDocument.get({ camperUserSub, templateId });
    if (documentErrors) {
        console.error('Error fetching camper document:', documentErrors);
        throw new Error('Failed to fetch camper document');
    }

    if (existing) {

        const { data, errors } = await client.models.CamperDocument.update({
            camperUserSub,
            templateId,
            owner: camperUserSub,
            ...updates
        });

        if (errors) {
            console.error('Error updating camper document:', errors);
            throw new Error('Failed to update camper document');
        }
        return data;
    }

    const { data, errors } = await client.models.CamperDocument.create({
        camperUserSub,
        templateId,
        owner: camperUserSub,
        ...updates
    });
    if (errors) {
        console.error('Error creating camper document:', errors);
        throw new Error('Failed to create camper document');
    }
    return data;
}


