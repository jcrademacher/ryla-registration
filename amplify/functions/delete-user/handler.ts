import { deleteUser } from "../../auth/utils";
import type { Schema } from "../../data/resource";
import { env } from "$amplify/env/delete-user"; 

export const handler: Schema["deleteUser"]["functionHandler"] = async (event) => {
    const { userSub } = event.arguments

    const response = await deleteUser(userSub, env.AMPLIFY_AUTH_USERPOOL_ID);

    return response
}

