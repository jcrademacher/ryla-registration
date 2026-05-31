import type { Schema } from '../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/list-club-rotarians';
import { AuthGroup, getGroupsForUser, AUTH_GROUPS } from '../../auth/utils';
import { getGroupForRotarian } from '../list-club-rotarians/handler';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

type Handler = Schema["listAllRotarians"]["functionHandler"];
type RotarianProfileWithGroup = Schema["RotarianProfileWithGroup"]["type"];
type RotarianProfileSchemaType = Schema["RotarianProfile"]["type"];

const isAuthGroup = (name: string | undefined): name is AuthGroup =>
    !!name && (AUTH_GROUPS as readonly string[]).includes(name);


export const handler: Handler = async (event) => {
    const { limit, nextToken } = event.arguments;

    const { data: profiles, errors: profileErrors, nextToken: nextTokenResponse } = await client.models.RotarianProfile.list({
        nextToken,
        limit: limit ?? undefined,
    });

    if (profileErrors) {
        console.error("Error fetching profiles:", profileErrors);
        throw new Error("Failed to fetch profiles");
    }

    if (!profiles) {
        console.warn(`No profiles found`);
        return { items: [], nextToken: nextTokenResponse };
    }

    const results = await Promise.all(
        profiles.map(async (profile) => {
            const [retval, club] = await Promise.all([
                getGroupForRotarian(profile),
                profile.rotaryClub(),
            ]);

            return retval ? { ...retval, clubName: club.data?.name ?? null } : null;
        })
    );

    return { items: results.filter((r) => r !== null), nextToken: nextTokenResponse };
};