import { DateTime } from "luxon";
import { CampSchemaType } from "../api/apiCamp";

// Helper function to format camp dates
export const formatCampDates = (camp?: CampSchemaType | null): string => {
    if (!camp) {
        return "";
    }

    const startDate = createEDT(camp.startDate);
    const endDate = createEDT(camp.endDate);

    const startString = formatDateFullWithTime(startDate);
    const endString = formatDateFullWithTime(endDate);

    return `${startString} - ${endString}`;
};  

export const getCampYear = (camp?: CampSchemaType | null): string => {
    if (!camp) {
        return "";
    }

    return createEDT(camp.startDate).year.toString();
}

export function formatDateFull(datetime: DateTime) {
    return datetime.toLocaleString(DateTime.DATE_FULL);
}

export function formatDateFullWithTime(datetime: DateTime) {
    return datetime.toLocaleString(DateTime.DATETIME_FULL);
}

export function formatDateHTML(datetime: DateTime) {
    const formatted = datetime.toFormat("yyyy-MM-dd'T'HH:mm");
    return formatted;
}

export function validateAfterNow(datetime: DateTime) {
    return datetime.diffNow().toMillis() > 0;
}

export function createFromISO(date: string) {
    return DateTime.fromISO(date);
}

export function createEDT(date: string) {
    return DateTime.fromISO(date, { zone: 'America/New_York' });
}