import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    setUserAsCamper, 
    createCamperProfile, 
    CreateCamperProfileSchemaType, 
    updateCamperProfile, 
    UpdateCamperProfileSchemaType, 
    deleteCamperProfile 
} from "../api/apiCamperProfile";
import { 
    uploadCamperApplication, 
    uploadCamperDocument,
    CreateCamperDocumentSchemaType,
    updateCamperDocumentStatus
} from "../api/apiDocuments.ts";
import { remove, TransferProgressEvent } from "aws-amplify/storage";
import { updateRotarianProfile, UpdateRotarianProfileSchemaType } from "../api/apiRotarianProfile.ts";
import { AuthGroup } from "../../amplify/auth/utils.ts";
import { setUserGroup, deleteUser } from "../api/auth.ts";
import { deleteRotarianProfile } from "../api/apiRotarianProfile.ts";
import { createRotarianReview, deleteRotarianReview, getRotarianReview, RotarianReviewDecision, updateRotarianReview } from "../api/apiRotarianReview.ts";
import { createRecommendation, updateRecommendation, UpdateRecommendationSchemaType, uploadRecommendationUnauthenticated } from "../api/apiRecommendations.ts";
import { sendEmailToClubReps, sendRecommendationLinkEmail } from "../api/apiEmail.ts";
import { CreateGroupRequestSchemaType, createGroupRequest } from "../api/apiGroupRequest.ts";
import { DateTime } from "luxon";
import { getCamperProfile } from "../api/apiCamperProfile.ts";


export function useUpdateProfileMutation() {
    return useMutation({
        mutationKey: ['updateProfile'],
        mutationFn: (data: UpdateCamperProfileSchemaType) => {
            return updateCamperProfile(data);
        }
    });
}

export function useSubmitApplicationMutation() {
    return useMutation({
        mutationKey: ['submitApplication'],
        mutationFn: async ({ userSub }: { userSub: string }) => {
            const profile = await getCamperProfile(userSub);

            if(!profile) {
                throw new Error("Camper profile not found. Cannot submit application.");
            }

            const retval = await updateCamperProfile({
                userSub: userSub,
                applicationComplete: true,
                applicationSubmittedAt: profile.applicationSubmittedAt ?? DateTime.now().toISO()
            });

            // only email if if it is the first time the application is being submitted
            if(!profile.applicationComplete && profile.rotaryClubId) {
                const cat = `${window.location.origin}/rotarian`;

                const body = `
                    <p>A new application to RYLA has been submitted through your club:</p>
                    <ul>
                        <li><b>Name:</b> ${profile.firstName} ${profile.lastName}</li>
                        <li><b>High School:</b> ${profile.highSchool}</li>
                        <li><b>Email:</b> ${profile.email}</li>
                    </ul>
                    <p>Please visit <a href="${cat}">${cat}</a> to review more details about the application and make a decision.</p>
                `;

                sendEmailToClubReps("New RYLA Application", body, profile.rotaryClubId);
            }

            return retval;
        }
    });
}

export function useUpdateMultipleProfilesMutation() {
    return useMutation({
        mutationKey: ['updateMultipleProfiles'],
        mutationFn: (data: UpdateCamperProfileSchemaType[]) => {
            return Promise.all(data.map(item => updateCamperProfile(item)));
        }
    });
}

export function useCreateProfileMutation() {
    return useMutation({
        mutationKey: ['createProfile'],
        mutationFn: (data: CreateCamperProfileSchemaType) => {
            if (!data.userSub) {
                throw new Error("User ID missing. Check auth flow.");
            }
            else if(!data.identityId) {
                throw new Error("Identity ID missing. Check auth flow.");
            }
            else if(!data.email) {
                throw new Error("Email missing. Check auth flow.");
            }
            else {
                return createCamperProfile(data);
            }
        }
    });
}

export function useUploadCamperApplicationMutation() {
    return useMutation({
        mutationKey: ['uploadCamperApplication'],
        mutationFn: ({ file, userSub, onProgress }: { file: File, userSub: string | undefined, onProgress?: (event: TransferProgressEvent) => void }) => {
            if (!userSub) {
                throw new Error("User ID missing. Check auth flow.");
            }
            else {
                return uploadCamperApplication(userSub, file, onProgress);
            }
        }
    });
}

export function useCreateGroupRequestMutation() {
    return useMutation({
        mutationKey: ['createGroupRequest'],
        mutationFn: (data: CreateGroupRequestSchemaType) => {
            return createGroupRequest(data);
        }
    });
}

export function useUpdateRotarianProfileMutation() {
    return useMutation({
        mutationKey: ['updateRotarianProfile'],
        mutationFn: (data: UpdateRotarianProfileSchemaType) => {

            return updateRotarianProfile(data);
        }
    });
}

export function useSetUserAsCamperMutation() {
    return useMutation({
        mutationKey: ['setUserAsCamper'],
        mutationFn: (userSub: string | undefined) => {
            if(!userSub) {
                throw new Error("User sub missing. Check auth flow.");
            }
            else {
                return setUserAsCamper(userSub);
            }
        }
    });
}

export function useSetUserGroupMutation() {
    return useMutation({
        mutationKey: ['setUserGroup'],
        mutationFn: ({ userSub, group }: { userSub: string | undefined, group: AuthGroup | "CAMPERS" }) => {
            if (!userSub) {
                throw new Error("User sub missing. Check auth flow.");
            }
            else {
                if(group === "CAMPERS") {
                    return setUserAsCamper(userSub);
                }
                else {
                    return setUserGroup(userSub, group);
                }
            }
        }
    });
}

export function useDeleteUserMutation() {
    return useMutation({
        mutationKey: ['deleteUser'],
        mutationFn: async ({ userSub }: { userSub: string }) => {

            if (!userSub) {
                throw new Error("User sub missing. Check auth flow.");
            }

            // if(isUserCamper(userGroups)) {
                console.log("Deleting camper profile");
                await deleteCamperProfile(userSub);
                console.log("Deleting camper rotarian review");
                await deleteRotarianReview(userSub);
            // }
            // else if(isUserRotarian(userGroups)) {
                console.log("Deleting rotarian profile");
                await deleteRotarianProfile(userSub);
            // }

            console.log("Deleting user");
            return deleteUser(userSub);
        }
    });
}

export function useDecideCampersMutation() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationKey: ['decideCampers'],
        mutationFn: async ({ campers }: { campers: { camperSub: string | undefined, decision: RotarianReviewDecision | null }[] }) => {
            let promises = [];

            for(const camper of campers) {
                const { camperSub, decision } = camper;

                if(!camperSub) {
                    throw new Error("Camper sub missing. Check auth flow.");
                }

                const review = await getRotarianReview(camperSub);

                if(!review) {
                    promises.push(createRotarianReview(camperSub, decision));
                }
                else {
                    promises.push(updateRotarianReview(camperSub, decision));
                }
            }

            return await Promise.all(promises);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['rotarianReview'] });
        }
    });
}

export function useCreateRotarianReviewMutation() {
    return useMutation({
        mutationKey: ['createRotarianReview'],
        mutationFn: ({ camperSub, review }: { camperSub: string | undefined, review: RotarianReviewDecision | null }) => {
            if(!camperSub) {
                throw new Error("Camper sub missing. Check auth flow.");
            }

            return createRotarianReview(camperSub, review);
        }
    });
}

export function useUpdateRotarianReviewMutation() {
    return useMutation({
        mutationKey: ['updateRotarianReview'],
        mutationFn: ({ camperSub, review }: { camperSub?: string | null, review: RotarianReviewDecision | null }) => {
            if(!camperSub) {
                throw new Error("Camper sub missing. Check auth flow.");
            }

            return updateRotarianReview(camperSub, review);
        }
    });
}

export function useUploadMultipleCamperDocumentsMutation() {
    return useMutation({
        mutationKey: ['uploadMultipleCamperDocuments'],
        mutationFn: ({ objects, onProgress }: { objects: { document: CreateCamperDocumentSchemaType, file?: File }[], onProgress?: (event: TransferProgressEvent) => void }) => {
            return Promise.all(objects.map(object => uploadCamperDocument(object.document, object.file, onProgress)));
        }
    });
}

export function useUploadCamperDocumentMutation() {
    return useMutation({
        mutationKey: ['uploadCamperDocument'],
        mutationFn: ({ document, file, onProgress }: { 
            document: CreateCamperDocumentSchemaType, 
            file?: File,
            onProgress?: (event: TransferProgressEvent) => void
        }) => {
            return uploadCamperDocument(document, file, onProgress);
        }
    });
}

export function useUpdateCamperDocumentStatusMutation() {
    return useMutation({
        mutationKey: ['updateCamperDocumentStatus'],
        mutationFn: ({ 
            camperUserSub, 
            templateId, 
            updates 
        }: { 
            camperUserSub: string, 
            templateId: string, 
            updates: { approved?: boolean; received?: boolean }
        }) => {
            return updateCamperDocumentStatus(camperUserSub, templateId, updates);
        }
    });
}

export function useCreateRecommendationMutation() {
    return useMutation({
        mutationKey: ['createRecommendation'],
        mutationFn: async ({ camperUserSub, emailAddress, name }: { camperUserSub?: string | null, emailAddress: string, name: string }) => {
            if(!camperUserSub) {
                throw new Error("Camper sub missing. Check auth flow.");
            }
            
            const rec = await createRecommendation({ camperUserSub, emailAddress, camperName: name });
            if(rec) {
                await sendRecommendationLinkEmail(rec.id, emailAddress, name);
            }

            return rec;
        }
    });
}

export function useUpdateRecommendationMutation() {
    return useMutation({
        mutationKey: ['updateRecommendation'],
        mutationFn: async ({ rec, name, oldPath }: { rec: UpdateRecommendationSchemaType, name: string, oldPath?: string | null }) => {
            if(rec.emailAddress) {
                if(oldPath) {
                    rec.filepath = null;
                    await remove({
                        path: oldPath
                    });
                }
                await sendRecommendationLinkEmail(rec.id, rec.emailAddress, name);
            }
            return updateRecommendation({
                ...rec,
                camperName: name
            });
        }
    });
}

export function useResendRecommendationLinkMutation() {
    return useMutation({
        mutationKey: ['resendRecommendationLink'],
        mutationFn: ({ recId, emailAddress, name }: { recId: string, emailAddress: string, name: string }) => {

            return sendRecommendationLinkEmail(recId, emailAddress, name);
        }
    });
}

export function useSubmitRecommendationUnauthenticatedMutation(recId?: string | null, camperUserSub?: string | null) {
    return useMutation({
        mutationKey: ['submitRecommendationUnauthenticated'],
        mutationFn: ({ file, onProgress }: { file: File, onProgress?: (event: TransferProgressEvent) => void }) => {
            if(!camperUserSub) {
                throw new Error("Camper sub missing. Check auth flow.");
            }

            if(!recId) {
                throw new Error("Recommendation id missing. Check auth flow.");
            }

            return uploadRecommendationUnauthenticated(recId, camperUserSub, file, onProgress);
        },
    });
}
