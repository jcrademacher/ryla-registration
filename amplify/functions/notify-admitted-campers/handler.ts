import type { EventBridgeHandler } from "aws-lambda";
import type { Schema } from '../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/notify-admitted-campers'; // replace with your function name
import { sendEmail } from '../../email/email';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: EventBridgeHandler<"Scheduled Event", null, void> = async (event) => {
	let retval;
	let nextToken: string | null | undefined = null;

	let reviews: Schema['RotarianReview']['type'][] = [];

	do {
		retval = await client.models.RotarianReview.list({
			nextToken
		});

		if (retval.errors) {
			console.error(retval.errors);
			// break;
		}

		nextToken = retval.nextToken;
		// console.log(nextToken);

		reviews.push(...retval.data);
	} while (nextToken !== null);

	console.log("Reviews:", reviews);

	// Filter reviews that need notification
	const reviewsToNotify = reviews.filter(
		review => review.review === "APPROVED" && !review.camperNotifiedOn
	);

	console.log(`Found ${reviewsToNotify.length} campers to notify`);

	const cat = `https://registration.ryla7780.org/camper/important-documents`;
	const body = `
			<p>Congratulations! Your local rotary club has approved your application to RYLA!</p>
			<p>Please continue with your registration process at <a href="${cat}">${cat}</a>.</p>
			<p>There, you will find important documents that you must to complete prior to camp.</p>
		`;

	// Process all notifications in parallel
	const results = await Promise.all(
		reviewsToNotify.map(async (review) => {

			const camper = await review.camper();

			if (camper.errors) {
				console.error("Camper fetch errors:", camper.errors);
				return false;
			}

			if (!camper.data) {
				console.error("Camper not found for review:", review.camperUserSub);
				return false;
			}

			const response = await sendEmail(
				[camper.data.email, camper.data.parent1Email],
				`[ACTION REQUIRED] Acceptance to RYLA!`,
				body
			);

			if (response.$metadata.httpStatusCode !== 200) {
				console.error("Failed to send email to camper:", response.$metadata);
				return false;
			}

			const updateResult = await client.models.RotarianReview.update({
				camperUserSub: review.camperUserSub,
				camperNotifiedOn: (new Date()).toISOString()
			});

			if (updateResult.errors) {
				console.error("Update errors:", updateResult.errors);
				return false;
			}

			console.log(`Successfully notified camper: ${camper.data.email}`);
			return true;
		})
	);

}