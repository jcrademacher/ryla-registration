import { checkErrors, client } from ".";
import { Schema } from "../../amplify/data/resource";

export type RotaryClubSchemaType = Schema['RotaryClub']['type'];
export type CreateRotaryClubSchemaType = Schema['RotaryClub']['createType'];
export type UpdateRotaryClubSchemaType = Schema['RotaryClub']['updateType'];

export async function getRotaryClub(rotaryClubId: string): Promise<RotaryClubSchemaType | null> {
    const retval = await client.models.RotaryClub.get({ id: rotaryClubId }, { authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}

export async function listRotaryClubs(): Promise<RotaryClubSchemaType[] | null> {
    const retval = await client.models.RotaryClub.list({ authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}

export async function createRotaryClub(rotaryClub: CreateRotaryClubSchemaType): Promise<RotaryClubSchemaType | null> {
    const retval = await client.models.RotaryClub.create(rotaryClub, { authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}

export async function updateRotaryClub(rotaryClub: UpdateRotaryClubSchemaType): Promise<RotaryClubSchemaType | null> {
    const retval = await client.models.RotaryClub.update(rotaryClub, { authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}