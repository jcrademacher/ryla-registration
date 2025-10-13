import { Schema } from "../../amplify/data/resource";

import { client, checkErrors } from ".";

export type RotarianReviewSchemaType = Schema['RotarianReview']['type'];

export async function createRotarianReview(camperSub: string, review: "APPROVED" | "REJECTED"): Promise<RotarianReviewSchemaType | null> {
    const retval = await client.models.RotarianReview.create(
        { 
            camperUserSub: camperSub, 
            review,
        }, { authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}

export async function deleteRotarianReview(camperSub: string): Promise<RotarianReviewSchemaType | null> {
    const retval = await client.models.RotarianReview.delete({
        camperUserSub: camperSub
    }, { authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}

export async function getRotarianReview(camperSub: string): Promise<RotarianReviewSchemaType | null> {
    const retval = await client.models.RotarianReview.get({
        camperUserSub: camperSub
    }, { authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;

}

export async function listRotarianReviews(): Promise<RotarianReviewSchemaType[] | null> {
    const retval = await client.models.RotarianReview.list({
        authMode: "userPool"
    });
    checkErrors(retval.errors);

    return retval.data;
}