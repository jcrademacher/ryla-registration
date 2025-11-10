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

