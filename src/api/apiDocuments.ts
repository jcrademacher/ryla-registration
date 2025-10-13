import { getProperties, list, TransferProgressEvent, uploadData } from 'aws-amplify/storage';
import { getUrl, remove } from 'aws-amplify/storage';
import { client, checkErrors } from '.';
import { Schema } from '../../amplify/data/resource';
import { CamperProfileSchemaType } from './apiCamperProfile';

export type DocumentTemplateSchemaType = Schema['DocumentTemplate']['type'];
export type CreateDocumentTemplateSchemaType = Schema['DocumentTemplate']['createType'];
export type UpdateDocumentTemplateSchemaType = Schema['DocumentTemplate']['updateType'];

export type CamperDocumentSchemaType = Schema['CamperDocument']['type'];
export type CreateCamperDocumentSchemaType = Schema['CamperDocument']['createType'];
export type UpdateCamperDocumentSchemaType = Schema['CamperDocument']['updateType'];

export async function uploadCamperApplication(userSub: string, file: File, onProgress?: (event: TransferProgressEvent) => void) {
    const fileName = file.name;
    const fileType = file.type;


    console.log("uploading file", file);

    const result = await uploadData({
        path: ({ identityId }) => `camper-documents/${identityId}/${fileName}`,
        data: file,
        options: {
            onProgress,
            contentType: fileType,
        }
    }).result;

    console.log("result", result);

    const retval = await client.models.CamperProfile.update({
        userSub: userSub,
        applicationFilepath: result.path
    }, { authMode: "userPool" });
    
    checkErrors(retval.errors);

    return result;
}

export async function getCamperApplicationFilename(identityId?: string) {
    let result;

    const { items } = await listCamperFiles(identityId, 'camper-application');
    const appFile = items.find(item => item.path.includes('camper-application'));

    if (appFile) {
        result = await getCamperFileProperties(identityId, 'camper-application');
        console.log('File Properties ', result);
        return result.metadata?.['user-filename'];
    }
    else {
        return null;
    }
}

// export async function getExtCamperApplicationFilename(identityId: string | undefined) {
//     if (!identityId) {
//         throw new Error("Identity ID is required");
//     }
//     else {
//         const { items } = await listCamperFiles(identityId);

//         const appFile = items.find(item => item.path.includes('camper-application'));

//         if (appFile) {
//             const filename = await getCamperApplicationFilename(identityId);
//             return filename ?? null;
//         }
//         else {
//             return null;
//         }
//     }
// }

export async function getCamperFileProperties(identityId?: string, subpath?: string) {
    let result;
    if(identityId) {
        result = await getProperties({
            path: `camper-documents/${identityId}/${subpath}`
        });
    }
    else {
        result = await getProperties({
            path: ({ identityId }) => `camper-documents/${identityId}/${subpath}`
        });
    }
    return result;
}

export async function listCamperFiles(identityId?: string, subpath?: string) {

    let result;
    if(identityId) {
        result = await list({
            path: `camper-documents/${identityId}/${subpath}`
        });
    }
    else {
        result = await list({
            path: ({ identityId }) => `camper-documents/${identityId}/${subpath}`
        });
    }
    console.log('List result ', result);
    return result;
}

export async function getUrlToCamperFile(identityId?: string, subpath?: string) {
    let linkToStorageFile;

    if(identityId) {
        linkToStorageFile = await getUrl({
            path: `camper-documents/${identityId}/${subpath}`
        });
    }
    else {
        linkToStorageFile = await getUrl({
            path: ({ identityId }) => `camper-documents/${identityId}/${subpath}`
        });
    }
    
    console.log("Get url result", linkToStorageFile);
    return linkToStorageFile.url.toString();
}

export async function getUrlToDocument(path: string) {
    const linkToStorageFile = await getUrl({
        path: path
    });
    return linkToStorageFile.url.toString();
}

export async function listDocumentTemplatesByCamp(campId: string): Promise<DocumentTemplateSchemaType[] | null> {
    const retval = await client.models.Camp.get(
        { id: campId }, 
        { authMode: "userPool" });
    checkErrors(retval.errors);

    const documentTemplates = await retval.data?.documentTemplates();
    checkErrors(documentTemplates?.errors);
    
    return documentTemplates?.data ?? null;
}



export async function uploadDocumentTemplate(
    documentTemplate: CreateDocumentTemplateSchemaType, 
    file: File, 
    existingTemplate?: DocumentTemplateSchemaType,
    onProgress?: (event: TransferProgressEvent) => void
) {
    const fileName = file.name;
    const fileType = file.type;

    const filepath = `templates/${documentTemplate.campId}/${fileName}`;

    documentTemplate.filepath = filepath;

    if(existingTemplate?.filepath) {
        console.log("deleting existing file", existingTemplate.filepath);
        deleteDocument(existingTemplate.filepath);
    }

    console.log("uploading file", file);
    // NEED TO DO THIS UPON DEPLOYMENT TO S3 BUCKET IN ORDER FOR METADATA TO BE AVAILABLE
    //https://docs.amplify.aws/react/build-a-backend/storage/extend-s3-resources/#for-manually-configured-s3-resources
    await uploadData({
        path: () => filepath,
        data: file,
        options: {
            onProgress,
            contentType: fileType,
        }
    }).result;


    let retval;
    if(existingTemplate?.id) {
        retval = await client.models.DocumentTemplate.update({
            ...documentTemplate,
            id: existingTemplate.id
        }, { authMode: "userPool" });
    }
    else {
        retval = await client.models.DocumentTemplate.create(documentTemplate, { authMode: "userPool" });
    }

    checkErrors(retval.errors);

    return retval.data;
}

export async function deleteDocument(filepath: string) {
    await remove({
        path: filepath
    });
}

export async function deleteDocumentTemplate(doc: DocumentTemplateSchemaType) {
    if(doc.filepath) {
        deleteDocument(doc.filepath);
    }
    else {
        throw new Error("Filepath does not exist in template db entry");
    }

    const retval = await client.models.DocumentTemplate.delete({ id: doc.id }, { authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}

export async function uploadCamperDocument(
    document: CreateCamperDocumentSchemaType, 
    file?: File,
    onProgress?: (event: TransferProgressEvent) => void
) {
    const fileName = file?.name;
    const fileType = file?.type;

    let existingEntry = await getCamperDocument(document.camperUserSub, document.templateId);

    let result;
    if(file) {
        if(file.size > 1000000) {
            throw new Error("File size is too large (Maximum file size is 1MB)");
        }
        
        if(existingEntry?.filepath) {
            console.log("deleting existing file", existingEntry.filepath);
            deleteDocument(existingEntry.filepath);
        }

        result = await uploadData({
            path: ({ identityId }) => `camper-documents/${identityId}/${fileName}`,
            data: file,
            options: {
                onProgress,
                contentType: fileType,
            }
        }).result;

        document.filepath = result.path;
        document.received = true;
    }

    let retval;
    if(existingEntry) {
        retval = await client.models.CamperDocument.update(document, { authMode: "userPool" });
    }
    else {
        retval = await client.models.CamperDocument.create(document, { authMode: "userPool" });
    }

    checkErrors(retval.errors);

    return retval.data;
}

export async function getCamperDocument(camperUserSub: string, templateId: string): Promise<CamperDocumentSchemaType | null> {
    const retval = await client.models.CamperDocument.get({ camperUserSub, templateId }, { authMode: "userPool" });
    checkErrors(retval.errors);
    return retval.data;
}

export async function listCamperDocuments(camperProfile: CamperProfileSchemaType): Promise<CamperDocumentSchemaType[] | null> {
    const documents = await camperProfile.documents();
    checkErrors(documents?.errors);

    return documents?.data ?? null;
}

