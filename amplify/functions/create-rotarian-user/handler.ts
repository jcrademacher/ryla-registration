import type { Schema } from "../../data/resource"
import { createUser, addUserToGroups } from "../../auth/utils"
import { env } from "$amplify/env/create-rotarian-user";

type RotarianHandler = Schema["createRotarianUser"]["functionHandler"]

export const createRotarianUserHandler: RotarianHandler = async (event) => {
    const { email } = event.arguments

    const response = await createUser(email, env.AMPLIFY_AUTH_USERPOOL_ID);

    if (response.User?.Username) {
        await addUserToGroups(response.User.Username, ["ROTARIANS"], env.AMPLIFY_AUTH_USERPOOL_ID);
    }

    return response
}

