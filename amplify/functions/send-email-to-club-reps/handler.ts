import type { Schema } from '../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/send-email-to-club-reps';
import { sendEmail } from '../../email/email';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

type Handler = Schema["sendEmailToClubReps"]["functionHandler"];

export const handler: Handler = async (event) => {
    const { subject, body, replyTo, rotaryClubId } = event.arguments;

    // Query the rotary club by ID
    const { data: rotaryClub, errors: clubErrors } = await client.models.RotaryClub.get({
        id: rotaryClubId
    });

    if (clubErrors) {
        console.error("Error fetching rotary club:", clubErrors);
        throw new Error("Failed to fetch rotary club");
    }

    if (!rotaryClub) {
        console.warn(`Rotary club with ID ${rotaryClubId} not found`);
        return { message: "Rotary club not found" };
    }

    // Use lazy loader to get rotarians associated with this club
    const { data: rotarianProfiles, errors: profileErrors } = await rotaryClub.rotarians();

    if (profileErrors) {
        console.error("Error fetching rotarian profiles:", profileErrors);
        throw new Error("Failed to fetch rotarian profiles");
    }

    console.log(`Found ${rotarianProfiles?.length ?? 0} rotarian profiles for club ${rotaryClubId}`);

    // Extract email addresses from the rotarian profiles
    const rotarianEmails = rotarianProfiles
        ?.map((profile) => profile.email)
        .filter((email) => email !== null && email !== undefined) ?? [];

    if (rotarianEmails.length === 0) {
        console.warn("No rotarian emails found for this club");
        return { message: "No recipients found" };
    }

    // Send email to all rotarians in the club
    return await sendEmail(rotarianEmails, subject, body, replyTo);
}