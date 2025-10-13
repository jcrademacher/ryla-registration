import { useMutation } from "@tanstack/react-query";
import { emitToast, ToastType } from "../utils/notifications";
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
    CreateCamperDocumentSchemaType
} from "../api/apiDocuments.ts";
import { TransferProgressEvent } from "aws-amplify/storage";
import { createRotarianProfile, CreateRotarianProfileSchemaType, updateRotarianProfile, UpdateRotarianProfileSchemaType } from "../api/apiRotarianProfile.ts";
import { AuthGroup } from "../../amplify/auth/utils.ts";
import { setUserGroup, deleteUser, isUserCamper, isUserRotarian, getUserSubFromAttr } from "../api/auth.ts";
import { deleteRotarianProfile } from "../api/apiRotarianProfile.ts";
import { createRotarianReview, deleteRotarianReview } from "../api/apiRotarianReview.ts";

export function useUpdateProfileMutation() {
    return useMutation({
        mutationKey: ['updateProfile'],
        mutationFn: (data: UpdateCamperProfileSchemaType) => {
            if (!data.userSub) {
                throw new Error("User ID missing. Check auth flow.");
            }
            else {
                return updateCamperProfile(data);
            }
        },
        onSuccess: (data) => {
            console.log("Mutation success, data:", data);

        },
        onError: (error) => {
            console.error("Mutation error:", error);
            emitToast(`Error updating camper profile: ${error.message}`, ToastType.Error);
        },
        onMutate: () => {
            // const currentState = state;
            // console.log("Mutation starting with currentState:", currentState);
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
        },
        onSuccess: (data) => {
            console.log("Mutation success, data:", data);
        },
        onError: (error) => {
            console.error("Mutation error:", error);
            emitToast(`Error updating camper profile: ${error.message}`, ToastType.Error);
        }
    });
}

export function useUploadCamperApplicationMutation(onProgress?: (event: TransferProgressEvent) => void) {
    return useMutation({
        mutationKey: ['uploadCamperApplication'],
        mutationFn: ({ file, userSub }: { file: File, userSub: string | undefined }) => {
            if (!userSub) {
                throw new Error("User ID missing. Check auth flow.");
            }
            else {
                return uploadCamperApplication(userSub, file, onProgress);
            }
        },
        onSuccess: (data) => {
            console.log("Mutation success, data:", data);
        },
        onError: (error) => {
            console.error("Mutation error:", error);
            emitToast(`Error uploading camper application: ${error.message}`, ToastType.Error);
        }
    });
}

export function useRequestRotarianAccountMutation() {
    return useMutation({
        mutationKey: ['requestRotarianAccount'],
        mutationFn: (data: CreateRotarianProfileSchemaType) => {
            if (!data.userSub) {
                throw new Error("User ID missing. Check auth flow.");
            }
            
            return createRotarianProfile(data);
        },
        onSuccess: (data) => {
            console.log("Mutation success, data:", data);
        },
        onError: (error) => {
            console.error("Mutation error:", error);
            emitToast(`Error creating rotarian profile: ${error.message}`, ToastType.Error);
        }
    });
}

export function useUpdateRotarianProfileMutation() {
    return useMutation({
        mutationKey: ['updateRotarianProfile'],
        mutationFn: (data: UpdateRotarianProfileSchemaType) => {
            if (!data.userSub) {
                throw new Error("User sub missing. Check auth flow.");
            }

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

export function useSetUserAsRotarianMutation() {
    return useMutation({
        mutationKey: ['setUserAsRotarian'],
        mutationFn: async (userSub: string | undefined) => {
            if(!userSub) {
                throw new Error("User sub missing. Check auth flow.");
            }
            else {
                await setUserGroup(userSub, "ROTARIANS");
                return await updateRotarianProfile({ userSub, approved: true });
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
        mutationFn: async ({ user, userGroups }: { user: any, userGroups: any }) => {
            const userSub = getUserSubFromAttr(user.Attributes);
            console.log(user,userGroups);

            if (!userSub) {
                throw new Error("User sub missing. Check auth flow.");
            }

            if(isUserCamper(userGroups)) {
                console.log("Deleting camper profile");
                await deleteCamperProfile(userSub);
                console.log("Deleting camper rotarian review");
                await deleteRotarianReview(userSub);
            }
            else if(isUserRotarian(userGroups)) {
                console.log("Deleting rotarian profile");
                await deleteRotarianProfile(userSub);
            }

            console.log("Deleting user");
            return deleteUser(userSub);
        },
        onSuccess: (data) => {
            console.log("Mutation success, data:", data);
        },
        onError: (error) => {
            console.error("Mutation error:", error);
            emitToast(`Error deleting user: ${error.message}`, ToastType.Error);
        }
    });
}

export function useCreateRotarianReviewMutation() {
    return useMutation({
        mutationKey: ['createRotarianReview'],
        mutationFn: ({ camperSub, review }: { camperSub: string | undefined, review: "APPROVED" | "REJECTED" }) => {
            if(!camperSub) {
                throw new Error("Camper sub missing. Check auth flow.");
            }

            return createRotarianReview(camperSub, review);
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
