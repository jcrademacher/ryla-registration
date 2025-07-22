import { client, checkErrors } from ".";
import { Schema } from "../../amplify/data/resource";

export type CreateRotarianProfileSchemaType = Schema['RotarianProfile']['createType'];
export type UpdateRotarianProfileSchemaType = Schema['RotarianProfile']['updateType'];
export type RotarianProfileSchemaType = Schema['RotarianProfile']['type'];

export async function createRotarianProfile(rotarianProfile: CreateRotarianProfileSchemaType): Promise<RotarianProfileSchemaType | null> {
    const retval = await client.models.RotarianProfile.create(rotarianProfile);
    checkErrors(retval.errors);
    
    return retval.data;
}

export async function getRotarianProfile(userSub: string): Promise<RotarianProfileSchemaType | null> {
    const retval = await client.models.RotarianProfile.get({ userSub });
    checkErrors(retval.errors);

    return retval.data;
}

export async function updateRotarianProfile(rotarianProfile: UpdateRotarianProfileSchemaType): Promise<RotarianProfileSchemaType | null> {
    const retval = await client.models.RotarianProfile.update(rotarianProfile);
    checkErrors(retval.errors);

    return retval.data;
}