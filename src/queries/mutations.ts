import { useMutation } from "@tanstack/react-query";
import { emitToast, ToastType } from "../utils/notifications";
import { setUserAsCamper, createCamperProfile, CreateCamperProfileSchemaType, updateCamperProfile, UpdateCamperProfileSchemaType } from "../api/apiCamperProfile";
import { uploadCamperApplication } from "../api/apiDocuments.ts";
import { TransferProgressEvent } from "aws-amplify/storage";
import { createRotarianProfile, CreateRotarianProfileSchemaType, updateRotarianProfile } from "../api/apiRotarianProfile.ts";
import { AuthGroup } from "../../amplify/auth/utils.ts";
import { setUserGroup, deleteUser } from "../api/auth.ts";

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
        mutationFn: (file: File) => {
            return uploadCamperApplication(file, onProgress);
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

export function useSetUserAsCamperMutation() {
    return useMutation({
        mutationKey: ['setUserAsCamper'],
        mutationFn: (userSub: string) => {
            return setUserAsCamper(userSub);
        }
    });
}

export function useSetUserAsRotarianMutation() {
    return useMutation({
        mutationKey: ['setUserAsRotarian'],
        mutationFn: async ({ userSub, group }: { userSub: string | undefined, group: AuthGroup }) => {
            if (!userSub) {
                throw new Error("User sub missing. Check auth flow.");
            }
            else {
                await updateRotarianProfile({ userSub, approved: true });
                return await setUserGroup(userSub, "ROTARIANS");
            }
        },
        onSuccess: (data) => {
            console.log("Mutation success, data:", data);
        },
        onError: (error) => {
            console.error("Mutation error:", error);
            emitToast(`Error setting user group: ${error.message}`, ToastType.Error);
        }
    });
}

export function useDeleteUserMutation() {
    return useMutation({
        mutationKey: ['deleteUser'],
        mutationFn: (userSub: string | undefined) => {
            if (!userSub) {
                throw new Error("User sub missing. Check auth flow.");
            }

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