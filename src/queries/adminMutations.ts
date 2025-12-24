import { useMutation } from "@tanstack/react-query";
import { 
    createCamp, 
    CreateCampSchemaType, 
    UpdateCampSchemaType, 
    updateCamp, 
    CampSchemaType, 
    CamperProfileViewStateSchemaType, 
    CamperProfileFilterStateSchemaType 
} from "../api/apiCamp";
import { createFromISO } from "../utils/datetime";
import { DateTime } from "luxon";
import { TransferProgressEvent } from "aws-amplify/storage";
import { CreateDocumentTemplateSchemaType, deleteDocumentTemplate, DocumentTemplateSchemaType, uploadDocumentTemplate } from "../api/apiDocuments";
import { createRotaryClub, CreateRotaryClubSchemaType, UpdateRotaryClubSchemaType, updateRotaryClub } from "../api/apiRotaryClub";
import { GroupRequestSchemaType, deleteGroupRequest } from "../api/apiGroupRequest";
import { sendEmail } from "../api/apiEmail";
import { setUserGroup } from "../api/auth";
import { createRotarianProfile, getRotarianProfile, updateRotarianProfile } from "../api/apiRotarianProfile";

export function useDecideGroupRequestMutation() {
    return useMutation({
        mutationKey: ['decideGroupRequest'],
        mutationFn: async ({ request, decision }: { request: GroupRequestSchemaType, decision: "approve" | "reject" }) => {
            let retval;

            if(decision === "approve") {
                if(request.group === "ROTARIANS") {
                    const cat = `${window.location.origin}/rotarian`;

                    const existingRotarianProfile = await getRotarianProfile(request.userSub);
                    const newProfile = { 
                        userSub: request.userSub, email: request.email,
                        firstName: request.firstName,
                        lastName: request.lastName,
                        rotaryClubId: request.rotaryClubId,
                        approved: true,
                        owner: request.userSub
                    };

                    if(existingRotarianProfile) {
                        retval = await updateRotarianProfile(newProfile);
                    }
                    else {
                        retval = await createRotarianProfile(newProfile);
                    }

                    await setUserGroup(request.userSub, "ROTARIANS");

                    sendEmail(
                        [request.email],
                        "Rotarian Account Approved",
                        `
                            <p>Your request for a rotarian account has been approved.</p>
                            <p>Visit <a href="${cat}">${cat}</a> to manage camper applications.</p>
                        `
                    );
                }
                else {
                    throw new Error(`Invalid group: ${request.group}. Account requests are only supported for rotarians at this time.`);
                }
            }
            else {
                const body = 
                `
                    <p>Your request to join the ${request.group} group has been denied. Please contact the camp directors for more information.</p>
                `;

                sendEmail([request.email], "Account Request Denied", body);
            }

            await deleteGroupRequest(request.userSub);

            return retval;
        }
    });
}

function checkForExistingApplicationsOpen(thisCamp: CampSchemaType | UpdateCampSchemaType | CreateCampSchemaType, otherCamps: CampSchemaType[] | null | undefined) {
    const now = DateTime.now();

    if(!otherCamps) {
        throw new Error(`
            Cannot create a new camp year without knowing whether other camp years have applications open.
        `);
    }

    if(otherCamps.length > 0) {
        const existingApplicationsOpen = otherCamps.some((camp) => {
            if(camp.applicationDeadline && camp.id !== thisCamp.id) {
                const appDeadline = createFromISO(camp.applicationDeadline);
                return appDeadline > now;
            }
        })

        if(existingApplicationsOpen) {
            throw new Error(`
                Applications are open for an existing camp year. 
                Only one camp year can have applications open at any time.
            `);
        }
    }
}

export function useCreateCampMutation(otherCamps: CampSchemaType[] | null | undefined) {
    return useMutation({
        mutationKey: ['createCamp'],
        mutationFn: async (camp: CreateCampSchemaType) => {
            checkForExistingApplicationsOpen(camp, otherCamps);
            
            return createCamp(camp);
        }
    });
}

export function useUpdateCampMutation(otherCamps: CampSchemaType[] | null | undefined) {
    return useMutation({
        mutationKey: ['updateCamp'],
        mutationFn: async (camp: UpdateCampSchemaType) => {
            checkForExistingApplicationsOpen(camp, otherCamps);
            
            return updateCamp(camp);
        }
    });
}

export function useUpdateCamperProfileViewStateMutation() {
    return useMutation({
        mutationKey: ['updateCamperProfileViewState'],
        mutationFn: async ({ campId, viewState }: { campId: string, viewState: CamperProfileViewStateSchemaType}) => {
            if(!campId) {
                throw new Error('Camp ID is required');
            }

            return updateCamp({
                id: campId,
                viewState
            });
        },
    });
}

export function useUpdateCamperProfileFilterStateMutation() {
    return useMutation({
        mutationKey: ['updateCamperProfileFilterState'],
        mutationFn: async ({ campId, filterState }: { campId: string, filterState: CamperProfileFilterStateSchemaType}) => {
            if(!campId) {
                throw new Error('Camp ID is required');
            }

            return updateCamp({
                id: campId,
                filterState
            });
        }
    });
}

export function useUploadDocumentTemplateMutation(onProgress?: (event: TransferProgressEvent) => void) {
    return useMutation({
        mutationKey: ['uploadDocumentTemplate'],
        mutationFn: ({ template, existingTemplate, file }: { 
            template: CreateDocumentTemplateSchemaType, 
            existingTemplate?: DocumentTemplateSchemaType, 
            file: File 
        }) => {
            return uploadDocumentTemplate(template, file, existingTemplate, onProgress);
        }
    });
}

export function useDeleteDocumentTemplateMutation() {
    return useMutation({
        mutationKey: ['deleteDocumentTemplate'],
        mutationFn: async (doc: DocumentTemplateSchemaType) => {
            return deleteDocumentTemplate(doc);
        }
    });
}

export function useCreateRotaryClubMutation() {
    return useMutation({
        mutationKey: ['createRotaryClub'],
        mutationFn: async (rotaryClub: CreateRotaryClubSchemaType) => {
            return createRotaryClub(rotaryClub);
        }
    });
}

export function useUpdateRotaryClubMutation() {
    return useMutation({
        mutationKey: ['updateRotaryClub'],
        mutationFn: async (rotaryClub: UpdateRotaryClubSchemaType) => {
            return updateRotaryClub(rotaryClub);
        }
    });
}



// export function useUploadCamperDocumentMutation() {
//     return useMutation({
//         mutationKey: ['uploadCamperDocument'],
//         mutationFn: ({ document, file, onProgress }: { 
//             document: CreateCamperDocumentSchemaType, 
//             file?: File,
//             onProgress?: (event: TransferProgressEvent) => void
//         }) => {
//             return uploadCamperDocument(document, file, onProgress);
//         }
//     });
// }

