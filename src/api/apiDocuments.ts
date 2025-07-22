import { getProperties, list, TransferProgressEvent, uploadData } from 'aws-amplify/storage';

export async function uploadCamperApplication(file: File, onProgress?: (event: TransferProgressEvent) => void) {
    const fileName = file.name;
    const fileType = file.type;


    console.log("uploading file", file);
    // NEED TO DO THIS UPON DEPLOYMENT TO S3 BUCKET IN ORDER FOR METADATA TO BE AVAILABLE
    //https://docs.amplify.aws/react/build-a-backend/storage/extend-s3-resources/#for-manually-configured-s3-resources
    const result = await uploadData({
        path: ({ identityId }) => `camper-documents/${identityId}/camper-application`,
        data: file,
        options: {
   
            metadata: {
                'user-filename': fileName
            },
            onProgress,
            contentType: fileType,
        }
    }).result;

    console.log("result", result);
    return result;
}

export async function getCamperApplicationFilename() {
    const result = await getProperties({
        path: ({ identityId }) => `camper-documents/${identityId}/camper-application`
    });
    console.log('File Properties ', result);
    return result.metadata?.['user-filename'];
}

export async function listCamperFiles() {
    const result = await list({
        path: ({ identityId }) => `camper-documents/${identityId}/camper-application`
    });
    console.log('List result ', result);
    return result;
}