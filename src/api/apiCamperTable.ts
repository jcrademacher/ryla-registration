import { checkErrors, client } from ".";
import type { SelectionSet } from 'aws-amplify/data';
import { CamperProfileSchemaType } from "./apiCamperProfile";
import type { RotarianReviewDecision } from "./apiRotarianReview";
import { checkDocumentStatus, listDocumentTemplatesByCamp } from "./apiDocuments";

export type RecommendationStatus = {
    required: number;
    sent: number;
    uploaded: number;
};

const camperTableSelectionSet = [
    'userSub', 'email', 'firstName', 'middleInitial', 'lastName',
    'nickname', 'birthdate', 'phone', 'gender', 'address', 'city', 'state', 'zipcode',
    'highSchool', 'guidanceCounselorName', 'guidanceCounselorEmail', 'guidanceCounselorPhone',
    'dietaryRestrictions', 'dietaryRestrictionsNotes',
    'parent1FirstName', 'parent1LastName', 'parent1Email', 'parent1Phone',
    'parent2FirstName', 'parent2LastName', 'parent2Email', 'parent2Phone',
    'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship',
    'rotaryClubId', 'profileComplete', 'applicationComplete', 'applicationSubmittedAt',
    'documentsComplete', 'attendanceConfirmations', 'arrivedAtCamp', 'campId',
    'applicationFilepath', 'tshirtSize',
    'createdAt', 'updatedAt',
    'recommendation.*',
    'rotarianReview.*',
    'documents.*',
    'rotaryClub.*',
] as const;

type EagerCamperProfile = SelectionSet<CamperProfileSchemaType, typeof camperTableSelectionSet>;

export type CamperProfileRowData = Omit<
    EagerCamperProfile,
    'recommendation' | 'rotarianReview' | 'documents' | 'documentsComplete'
> & {
    rotarianReview?: RotarianReviewDecision | null;
    recommendationStatus: RecommendationStatus;
    documentsComplete: boolean;
};

export async function listCamperDataAdmin(campId: string, nextToken?: string | null): Promise<CamperProfileRowData[]> {
    const profilesResult = await client.models.CamperProfile.listCamperProfileByCampId(
        { campId },
        {
            selectionSet: camperTableSelectionSet,
            authMode: "userPool",
            limit: 1000,
            nextToken
        }
    );

    checkErrors(profilesResult.errors);

    const profiles = profilesResult.data;
    if (!profiles || profiles.length === 0) return [];

    const documentTemplates = await listDocumentTemplatesByCamp(campId);

    return profiles.map((profile) => {
        const documentsComplete = checkDocumentStatus(documentTemplates ?? [], profile.documents);

        const recommendationStatus: RecommendationStatus = {
            required: profile.rotaryClub?.numRequiredLetters ?? 0,
            sent: profile.recommendation.length,
            uploaded: profile.recommendation.filter(r => !!r.filepath).length,
        };

        return {
            ...profile,
            documentsComplete,
            rotarianReview: profile.rotarianReview?.review,
            recommendationStatus,
        };
    });
}
