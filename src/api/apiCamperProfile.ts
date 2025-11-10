import { client, checkErrors } from ".";
import { Schema } from "../../amplify/data/resource";
import { RotarianReviewSchemaType } from "./apiRotarianReview";
import { CampSchemaType, getCamp } from "./apiCamp";

export type CreateCamperProfileSchemaType = Schema['CamperProfile']['createType'];
export type UpdateCamperProfileSchemaType = Schema['CamperProfile']['updateType'];
export type CamperProfileSchemaType = Schema['CamperProfile']['type'];

// export async function listCamperProfilesByRotaryClub(rotaryClubId?: string | null): Promise<CamperProfileSchemaType[] | null> {
//     let retval;
//     if (rotaryClubId) {
//         retval = await client.models.CamperProfile.listCamperProfileByRotaryClubId({
//             rotaryClubId: rotaryClubId
//         }, { authMode: "userPool" });
//     }
//     else {
//         retval = await client.models.CamperProfile.list({ authMode: "userPool" });
//     }

//     checkErrors(retval.errors);
//     return retval.data;
// }

export function observeCamperProfilesByCamp(campId: string, updateFn: (data: CamperProfileSchemaType[]) => void) {
    return client.models.CamperProfile.observeQuery({
        filter: {
            campId: {
                eq: campId
            }
        }
    }).subscribe({
        next: ({ items }) => {
            updateFn([...items]);
        },
    });
}

// https://www.alexdebrie.com/posts/dynamodb-filter-expressions/
// https://github.com/aws-amplify/amplify-js/issues/2901

export async function listCamperProfilesByCampId(campId: string, rotaryClubId?: string | null): Promise<CamperProfileSchemaType[] | null> {
    const retval = await client.models.CamperProfile.listCamperProfileByCampId({
        campId: campId,
    }, { 
        authMode: "userPool", 
        filter: rotaryClubId ? {
            rotaryClubId: {
                eq: rotaryClubId
            }
        } : undefined,
        limit: 500 
    });
    checkErrors(retval.errors);

    return retval.data ?? null;
}

export async function getCamperProfile(userSub: string): Promise<CamperProfileSchemaType | null> {
    const retval = await client.models.CamperProfile.get({ userSub }, { authMode: "userPool" });

    checkErrors(retval.errors);
    return retval.data;
}

export async function createCamperProfile(camperProfile: CreateCamperProfileSchemaType): Promise<CamperProfileSchemaType | null> {
    console.log("Creating camper profile with data:", camperProfile);
    const retval = await client.models.CamperProfile.create(camperProfile, { authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}

export async function updateCamperProfile(camperProfile: UpdateCamperProfileSchemaType): Promise<CamperProfileSchemaType | null> {
    console.log("Updating camper profile with data:", camperProfile);
    const retval = await client.models.CamperProfile.update(camperProfile, {
        authMode: "userPool"
    });
    checkErrors(retval.errors);

    return retval.data;
}

export async function getRotarianReviewFromCamperSub(userSub: string): Promise<RotarianReviewSchemaType | null> {
    const profile = await client.models.CamperProfile.get({ userSub }, { authMode: "userPool" });
    checkErrors(profile.errors);

    const review = await profile.data?.rotarianReview();
    checkErrors(review?.errors);

    return review?.data ?? null;
}

export async function setUserAsCamper(userSub: string): Promise<Object | null> {
    const retval = await client.mutations.setUserRoleToCamper({ userSub }, { authMode: "userPool" });
    console.log("setUserAsCamper retval", retval);
    checkErrors(retval.errors);

    return retval.data;
}

export async function deleteCamperProfile(userSub: string): Promise<CamperProfileSchemaType | null> {
    const retval = await client.models.CamperProfile.delete({ userSub }, { authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}

export async function getCamperYear(camperProfile: CamperProfileSchemaType): Promise<CampSchemaType | null> {
    const retval = await camperProfile.camp({ authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data ?? null;
}

export async function getCamperYearByUserSub(userSub: string): Promise<CampSchemaType | null> {
    const retval = await client.models.CamperProfile.get({ userSub }, {
        authMode: "userPool",
        selectionSet: ["campId"]
    });
    checkErrors(retval.errors);

    if(retval.data) {
        return getCamp(retval.data.campId);
    }
    
    return null;
}

export async function generateCamperPdf(camperSub: string): Promise<CamperProfileSchemaType | null> {
    const retval = await client.queries.generateCamperPdf({ camperSub });
    console.log(retval);
    // checkErrors(retval.errors);

    return null;
}
