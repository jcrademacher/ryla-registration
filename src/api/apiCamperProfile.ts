import { client, checkErrors } from ".";
import { Schema } from "../../amplify/data/resource";
import { RotarianReviewSchemaType } from "./apiRotarianReview";
import { CampSchemaType, getCamp } from "./apiCamp";
import { listCamperDocuments, listDocumentTemplatesByCamp } from "./apiDocuments";

export type CreateCamperProfileSchemaType = Schema['CamperProfile']['createType'];
export type UpdateCamperProfileSchemaType = Schema['CamperProfile']['updateType'];
export type CamperProfileSchemaType = Schema['CamperProfile']['type'];
export type CamperProfileEagerSchemaType = Omit<CamperProfileSchemaType, "rotarianReview"> & {
    rotarianReview: RotarianReviewSchemaType | null;
};

export async function listCamperProfilesByRotaryClub(rotaryClub: string | null): Promise<CamperProfileSchemaType[] | null> {
    let retval;
    if (rotaryClub) {
        retval = await client.models.CamperProfile.listCamperProfileBySponsoringRotaryClub({
            sponsoringRotaryClub: rotaryClub
        }, { authMode: "userPool" });
    }
    else {
        retval = await client.models.CamperProfile.list({ authMode: "userPool" });
    }

    checkErrors(retval.errors);
    return retval.data;
}

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

export async function listCamperProfilesByCamp(campId: string): Promise<CamperProfileEagerSchemaType[] | null> {
    const camp = await getCamp(campId);
    const profiles = await camp?.camperProfiles({
        limit: 300
    });

    if (profiles) {
        checkErrors(profiles.errors);

        let retval: CamperProfileEagerSchemaType[] = [];

        for (const camper of profiles.data) {
            const review = await camper.rotarianReview();
            checkErrors(review.errors);
            
            retval.push({
                ...camper,
                rotarianReview: review.data
            });

        }

        return retval;
    }
    return null;
}

export async function listRotarianReviewsByCamp(campId: string) {
    const retval = await client.models.Camp.get({ id: campId }, {
        authMode: "userPool",
        selectionSet: ["camperProfiles.rotarianReview.*"]
    });
    checkErrors(retval.errors);

    return retval.data;
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

interface CamperStatusSchemaType {
    profileComplete: boolean;
    applicationComplete: boolean;
    documentsComplete: boolean;
}

export async function getCamperStatus(camperUserSub: string): Promise<CamperStatusSchemaType> {
    const retval = {
        profileComplete: false,
        applicationComplete: false,
        documentsComplete: false,
    };

    const camperProfile = await getCamperProfile(camperUserSub);

    if(!camperProfile) {
        return retval;
    }

    const templates = await listDocumentTemplatesByCamp(camperProfile.campId);
    const query = await listCamperDocuments(camperUserSub);

    if(query) {
        retval.documentsComplete = 
            templates
            ?.filter(template => template.required)
            .every(template => query.some(document => document.templateId === template.id)) ?? false;
    }

    retval.profileComplete = camperProfile.profileComplete ?? false;
    retval.applicationComplete = camperProfile.applicationComplete ?? false;

    return retval;
}

