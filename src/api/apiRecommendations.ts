import { client, checkErrors } from ".";
import { Schema } from "../../amplify/data/resource";
import { CamperProfileSchemaType } from "./apiCamperProfile";
import { TransferProgressEvent, uploadData, remove } from 'aws-amplify/storage';


export type RecommendationSchemaType = Schema['Recommendation']['type'];
export type CreateRecommendationSchemaType = Schema['Recommendation']['createType'];
export type UpdateRecommendationSchemaType = Schema['Recommendation']['updateType'];

export async function getRecommendations(camperProfile: CamperProfileSchemaType): Promise<RecommendationSchemaType[]> {
    // console.log("camperProfile", camperProfile);
    const retval = await camperProfile.recommendation({ authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}

export async function getRecommendation(id: string): Promise<RecommendationSchemaType | null> {
    const retval = await client.models.Recommendation.get({ id }, { authMode: "userPool" });
    checkErrors(retval.errors);
    return retval.data;
}

export async function getRecommendationUnauthenticated(id: string): Promise<RecommendationSchemaType | null> {
    const retval = await client.models.Recommendation.get({ id }, { authMode: "identityPool" });
    checkErrors(retval.errors);
    return retval.data;
}

export async function createRecommendation(recommendation: CreateRecommendationSchemaType): Promise<RecommendationSchemaType | null> {
    const retval = await client.models.Recommendation.create(recommendation, { authMode: "userPool" });
    checkErrors(retval.errors);
    return retval.data;
}

export async function updateRecommendation(recommendation: UpdateRecommendationSchemaType): Promise<RecommendationSchemaType | null> {
    const retval = await client.models.Recommendation.update(recommendation, { authMode: "userPool" });
    checkErrors(retval.errors);
    return retval.data;
}

export async function uploadRecommendationUnauthenticated(
    recId: string,
    camperUserSub: string, 
    file?: File,
    onProgress?: (event: TransferProgressEvent) => void
) {
    const fileName = file?.name;
    const fileType = file?.type;

    let existingEntry = await getRecommendationUnauthenticated(recId);

    let result;
    let updatedRec: UpdateRecommendationSchemaType = {
        id: recId
    };

    if(file) {
        if(file.size > 1000000) {
            throw new Error("File size is too large (Maximum file size is 1MB)");
        }
        
        if(existingEntry?.filepath) {
            console.log("deleting existing file", existingEntry.filepath);
            await remove({
                path: existingEntry.filepath
            });
        }

        result = await uploadData({
            path: () => `camper-recommendations/${camperUserSub}/${fileName}`,
            data: file,
            options: {
                onProgress,
                contentType: fileType,
            }
        }).result;
    }

    let retval;
    if(existingEntry && result?.path) {
        updatedRec.filepath = result.path;
        retval = await client.models.Recommendation.update(updatedRec, { authMode: "identityPool" });
    }
    else {
        throw new Error("Recommendation not found. Refusing to create a new recommendation entry.");
    }

    checkErrors(retval.errors);

    return retval.data;
}
