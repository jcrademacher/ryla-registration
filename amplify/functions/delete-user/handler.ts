import { deleteUser as deleteCognitoUser } from "../../auth/utils";
import type { Schema } from "../../data/resource";
import { env } from "$amplify/env/delete-user";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: Schema["deleteUser"]["functionHandler"] = async (event) => {
    const { userSub } = event.arguments;

    const { data: camperProfile, errors: camperErrors } = await client.models.CamperProfile.get({ userSub });
    if (camperErrors) {
        console.error("Error fetching camper profile:", camperErrors);
        throw new Error("Failed to fetch camper profile");
    }

    if (camperProfile) {
        const { errors: deleteCamperErrors } = await client.models.CamperProfile.delete({ userSub });
        if (deleteCamperErrors) {
            console.error("Error deleting camper profile:", deleteCamperErrors);
            throw new Error("Failed to delete camper profile");
        }
    }

    const { data: rotarianProfile, errors: rotarianErrors } = await client.models.RotarianProfile.get({ userSub });
    if (rotarianErrors) {
        console.error("Error fetching rotarian profile:", rotarianErrors);
        throw new Error("Failed to fetch rotarian profile");
    }
    
    if (rotarianProfile) {
        const { errors: deleteRotarianErrors } = await client.models.RotarianProfile.delete({ userSub });
        if (deleteRotarianErrors) {
            console.error("Error deleting rotarian profile:", deleteRotarianErrors);
            throw new Error("Failed to delete rotarian profile");
        }
    }

    const response = await deleteCognitoUser(userSub, env.AMPLIFY_AUTH_USERPOOL_ID);

    return response;
};
