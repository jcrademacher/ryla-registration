import { client, checkErrors } from ".";
import { Schema } from "../../amplify/data/resource";
import { getRotaryClub } from "./apiRotaryClub";

export type CreateRotarianProfileSchemaType = Schema['RotarianProfile']['createType'];
export type UpdateRotarianProfileSchemaType = Schema['RotarianProfile']['updateType'];
export type RotarianProfileSchemaType = Schema['RotarianProfile']['type'];
export type RotarianProfileWithGroupType = Schema['RotarianProfileWithGroup']['type'];

export async function listRotariansWithGroup(rotaryClubId?: string | null, limit?: number | null, nextToken?: string | null): Promise<{ items: RotarianProfileWithGroupType[], nextToken?: string | null}> {

    let response;
    if(rotaryClubId) {
        response = await client.queries.listClubRotarians(
            { rotaryClubId, limit: limit ?? undefined, nextToken: nextToken ?? undefined },
            { authMode: "userPool" }
        );
    }
    else {
        response = await client.queries.listAllRotarians(
            { limit: limit ?? undefined, nextToken: nextToken ?? undefined },
            { authMode: "userPool" }
        );
    }

    checkErrors(response.errors);
    return response.data ?? { items: [], nextToken: undefined }
}


export async function createRotarianProfile(rotarianProfile: CreateRotarianProfileSchemaType): Promise<RotarianProfileSchemaType | null> {
    const retval = await client.models.RotarianProfile.create(rotarianProfile, { authMode: "userPool" });
    checkErrors(retval.errors);
    
    return retval.data;
}

export async function getRotarianProfile(userSub: string): Promise<RotarianProfileSchemaType | null> {
    const retval = await client.models.RotarianProfile.get({ userSub }, { authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}

export async function updateRotarianProfile(rotarianProfile: UpdateRotarianProfileSchemaType): Promise<RotarianProfileSchemaType | null> {
    const retval = await client.models.RotarianProfile.update(rotarianProfile, { authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}

export async function deleteRotarianProfile(userSub: string): Promise<RotarianProfileSchemaType | null> {
    const retval = await client.models.RotarianProfile.delete({ userSub }, { authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}

export async function listRotarianProfilesByClub(rotaryClubId: string): Promise<RotarianProfileSchemaType[] | null> {
    // First fetch the club to ensure it exists
    const club = await getRotaryClub(rotaryClubId);
    
    if (!club) {
        return null
    }

    // Then fetch the rotarian profiles for this club
    const retval = await club.rotarians({ authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}