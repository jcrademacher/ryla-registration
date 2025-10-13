import { client, checkErrors } from ".";
import { Schema } from "../../amplify/data/resource";

export type CreateCampSchemaType = Schema['Camp']['createType'];
export type UpdateCampSchemaType = Schema['Camp']['updateType'];
export type CampSchemaType = Schema['Camp']['type'];

export type CamperProfileViewStateSchemaType = Schema['CamperProfileViewState']['type'];
export type CamperProfileFilterStateSchemaType = Schema['CamperProfileFilterState']['type'];

export async function createCamp(camp: CreateCampSchemaType): Promise<CampSchemaType | null> {
    const retval = await client.models.Camp.create(camp, { authMode: "userPool" });
    checkErrors(retval.errors);
    return retval.data;
}

export async function getCamp(campId: string): Promise<CampSchemaType | null> {
    const retval = await client.models.Camp.get({ id: campId }, { authMode: "userPool" });
    checkErrors(retval.errors);
    return retval.data;
}

export async function updateCamp(camp: UpdateCampSchemaType): Promise<CampSchemaType | null> {
    const retval = await client.models.Camp.update(camp, { authMode: "userPool" });
    checkErrors(retval.errors);
    return retval.data;
}

export async function deleteCamp(campId: string): Promise<CampSchemaType | null> {
    const retval = await client.models.Camp.delete({ id: campId }, { authMode: "userPool" });
    checkErrors(retval.errors);
    return retval.data;
}

export async function listCamps(): Promise<CampSchemaType[] | null> {
    const retval = await client.models.Camp.list({ authMode: "userPool" });
    checkErrors(retval.errors);
    return retval.data;
}

