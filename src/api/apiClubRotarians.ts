import { client, checkErrors } from ".";
import { Schema } from "../../amplify/data/resource";

export type RotarianProfileWithGroupType = Schema['RotarianProfileWithGroup']['type'];

export async function listClubRotarians(rotaryClubId: string): Promise<RotarianProfileWithGroupType[]> {
    const response = await client.queries.listClubRotarians(
        { rotaryClubId },
        { authMode: "userPool" }
    );

    checkErrors(response.errors);
    return (response.data ?? []).filter((r): r is RotarianProfileWithGroupType => r !== null);
}
