import { checkErrors, client } from ".";
import { Schema } from "../../amplify/data/resource";

export type GroupRequestSchemaType = Schema['GroupRequest']['type'];
export type CreateGroupRequestSchemaType = Schema['GroupRequest']['createType'];
export type UpdateGroupRequestSchemaType = Schema['GroupRequest']['updateType'];

export async function listGroupRequests(): Promise<GroupRequestSchemaType[] | null> {
    const retval = await client.models.GroupRequest.list({ authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}

export async function createGroupRequest(data: CreateGroupRequestSchemaType): Promise<GroupRequestSchemaType | null> {
    if(data.group === "ROTARIANS" && data.rotaryClubId) {
        const rotaryClub = await client.models.RotaryClub.get({ id: data.rotaryClubId }, { authMode: "userPool" });
        checkErrors(rotaryClub.errors);

        if(!rotaryClub.data) {
            throw new Error(`Rotary club not found. Check provided ID.`);
        }

        const retval = await client.models.GroupRequest.create(data, { authMode: "userPool" });
        checkErrors(retval.errors);

        const cat = `${window.location.origin}/admin/user-management`;

        const body = `
            <p>A user is requesting to be a rotarian.</p>
            <p><b>Name: </b>${data.firstName} ${data.lastName}</p>
            <p><b>Email: </b>${data.email}</p>
            <p><b>Rotary Club: </b>${rotaryClub.data.name}</p>
            <p>Please approve or reject this request at <a href="${cat}">${cat}</a>.</p>
        `;

        await client.mutations.sendEmailToAdmins({
            subject: "New Account Request",
            body,
            replyTo: data.email
        }, { authMode: "userPool" });

        return retval.data;
    }
    else {
        throw new Error(`Account requests are only supported for rotarians at this time.`);
    }
}

export async function updateGroupRequest(data: UpdateGroupRequestSchemaType): Promise<GroupRequestSchemaType | null> {
    const retval = await client.models.GroupRequest.update(data, { authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}

export async function deleteGroupRequest(userSub: string): Promise<GroupRequestSchemaType | null> {
    const retval = await client.models.GroupRequest.delete({ userSub }, { authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}

export async function getGroupRequest(userSub: string): Promise<GroupRequestSchemaType | null> {
    const retval = await client.models.GroupRequest.get({ userSub }, { authMode: "userPool" });
    checkErrors(retval.errors);

    return retval.data;
}