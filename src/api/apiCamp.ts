import { client, checkErrors } from ".";
import { Schema } from "../../amplify/data/resource";
import { createFromISO } from "../utils/datetime";

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

export async function getActiveCamp(): Promise<CampSchemaType | null> {
    const camps = await listCamps();

    if (camps) {
        // filter by those that have start dates in the future
        const openCamps = camps.filter((camp) => {
            const startDate = createFromISO(camp.startDate);
            return startDate.diffNow().toMillis() > 0;
        });

        // find the earliest in the future
        const earliestCamp = openCamps.reduce((minCamp, curCamp) => {
            const minCampDate = createFromISO(minCamp.startDate);
            const curCampDate = createFromISO(curCamp.startDate);
            return curCampDate < minCampDate ? curCamp : minCamp;
        }, openCamps[0]);

        if (earliestCamp) {
            return earliestCamp;
        }
    }

    // reaching here means that no camps were found at all or none are upcoming in the future
    return null;
}
