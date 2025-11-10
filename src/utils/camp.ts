import { CampSchemaType } from "../api/apiCamp";
import { createFromISO } from "./datetime";

type ApplicationStatus = "accepting" | "post-deadline" | "not-accepting";

export function getCampApplicationStatus(camperYear?: CampSchemaType | null): ApplicationStatus {

    if (!camperYear) {
        return "not-accepting";
    }
    const endDate = createFromISO(camperYear.endDate)

    const applicationOpenDate = createFromISO(camperYear.applicationOpenDate)
    const applicationDeadline = createFromISO(camperYear.applicationDeadline)

    const preAppOpen = applicationOpenDate.diffNow().toMillis() > 0;
    const preAppDeadline = applicationDeadline.diffNow().toMillis() > 0 && applicationOpenDate.diffNow().toMillis() < 0;
    const postCampEnd = endDate.diffNow().toMillis() < 0;

    if (postCampEnd || preAppOpen) {
        return "not-accepting";
    }

    if (preAppDeadline) {
        return "accepting";
    }
    else {
        return "post-deadline";
    }
}