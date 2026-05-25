import type { Schema } from '../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/list-club-rotarians';
import { AuthGroup, getGroupsForUser, AUTH_GROUPS } from '../../auth/utils';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

type Handler = Schema["listClubRotarians"]["functionHandler"];

const isAuthGroup = (name: string | undefined): name is AuthGroup =>
    !!name && (AUTH_GROUPS as readonly string[]).includes(name);

export const handler: Handler = async (event) => {
    const { rotaryClubId } = event.arguments;

    const { data: rotaryClub, errors: clubErrors } = await client.models.RotaryClub.get({
        id: rotaryClubId
    });

    if (clubErrors) {
        console.error("Error fetching rotary club:", clubErrors);
        throw new Error("Failed to fetch rotary club");
    }

    if (!rotaryClub) {
        console.warn(`Rotary club with ID ${rotaryClubId} not found`);
        return [];
    }

    const { data: rotarianProfiles, errors: profileErrors } = await rotaryClub.rotarians();

    if (profileErrors) {
        console.error("Error fetching rotarian profiles:", profileErrors);
        throw new Error("Failed to fetch rotarian profiles");
    }

    if (!rotarianProfiles || rotarianProfiles.length === 0) {
        return [];
    }

    const results = await Promise.all(
        rotarianProfiles.map(async (profile) => {
            try {
                const groups = await getGroupsForUser(profile.userSub, env.AMPLIFY_AUTH_USERPOOL_ID);
                const groupNames = groups?.map((g) => g.GroupName).filter(isAuthGroup) ?? [];

                let group: AuthGroup | null = null;
                if (groupNames.includes("COORDINATORS")) {
                    group = "COORDINATORS";
                } else if (groupNames.includes("ADMINS")) {
                    group = "ADMINS";
                } else if (groupNames.includes("ROTARIANS")) {
                    group = "ROTARIANS";
                } else if (groupNames.length > 0) {
                    group = groupNames[0];
                }

                return {
                    userSub: profile.userSub,
                    firstName: profile.firstName ?? null,
                    lastName: profile.lastName ?? null,
                    email: profile.email,
                    rotaryClubId: profile.rotaryClubId ?? null,
                    approved: profile.approved ?? null,
                    group,
                };
            } catch (error) {
                console.error(`Error fetching groups for user ${profile.userSub}:`, error);
                return null;
            }
        })
    );

    return results.filter((r) => r !== null);
};
