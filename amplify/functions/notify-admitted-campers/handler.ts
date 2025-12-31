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
	
	while(!nextToken) {
		retval = await client.models.RotarianReview.list({
			nextToken
		});

		if(retval.errors) {
			console.error(retval.errors);
			// break;
		}

		nextToken = retval.nextToken;

		reviews.push(...retval.data);
	}

	for(const review of reviews) {
		if(review.review === "APPROVED" && !review.camperNotifiedOn) {
			const camper = await review.camper();

			if(camper.errors) {
				console.error(camper.errors);
				// break;
			}

			if(!camper.data) {
				console.error("Camper not found");
				continue;
			}

				// break;
			const cat = `https://registration.ryla7780.org/camper/important-documents`;
			const body =
                `
                <p>Congratulations! Your local rotary club has approved your application to RYLA!</p>
                <p>$Please continue with your registration process at <a href="${cat}">${cat}</a>.}</p>
                <p>There, you will find important documents that you must to complete prior to camp.</p>
            `;

            const response = await sendEmail([camper.data.email, camper.data.parent1Email], `[ACTION REQUIRED] Acceptance to RYLA!`, body);

			if(response.$metadata.httpStatusCode !== 200) {
				console.error("Failed to send email to camper: ", response.$metadata);
				continue;
			}

			const retval = await client.models.RotarianReview.update({
				camperUserSub: review.camperUserSub,
				camperNotifiedOn: (new Date()).toISOString()
			});

			if(retval.errors) {
				console.error(retval.errors);
				continue;
			}
		}
	}
}