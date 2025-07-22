import { client, checkErrors } from ".";
import { Schema } from "../../amplify/data/resource";
import { RotarianReviewSchemaType } from "./apiRotarianReview";

export type CreateCamperProfileSchemaType = Schema['CamperProfile']['createType'];
export type UpdateCamperProfileSchemaType = Schema['CamperProfile']['updateType'];
export type CamperProfileSchemaType = Schema['CamperProfile']['type'];


export async function getCamperProfile(userSub: string): Promise<CamperProfileSchemaType | null> {
    const retval = await client.models.CamperProfile.get({ userSub });
    
    checkErrors(retval.errors);
    return retval.data;
}

export async function createCamperProfile(camperProfile: CreateCamperProfileSchemaType): Promise<CamperProfileSchemaType | null> {
    console.log("Creating camper profile with data:", camperProfile);
    const retval = await client.models.CamperProfile.create(camperProfile);
    checkErrors(retval.errors);
    
    return retval.data;
}

export async function updateCamperProfile(camperProfile: UpdateCamperProfileSchemaType): Promise<CamperProfileSchemaType | null> {
    const retval = await client.models.CamperProfile.update(camperProfile);
    checkErrors(retval.errors);
    
    return retval.data;
}

export async function getRotarianReviewFromCamperSub(userSub: string): Promise<RotarianReviewSchemaType | null> {
    const profile = await client.models.CamperProfile.get({ userSub });
    checkErrors(profile.errors);

    const review = await profile.data?.rotarianReview();
    checkErrors(review?.errors);

    return review?.data ?? null;
}

export async function setUserAsCamper(userSub: string): Promise<Object | null> {
    const retval = await client.mutations.setUserRoleToCamper({ userSub });
    console.log("setUserAsCamper retval", retval);
    checkErrors(retval.errors);

    return retval.data;
}