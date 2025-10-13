import { DateTime } from "luxon";

// Helper function to format camp dates
export const formatCampDates = (start: DateTime, end: DateTime): string => {

    const startString = formatDateNoYearWithTime(start);
    const endString = formatDateNoYearWithTime(end);

    return `${startString} - ${endString}`;
};  

export function formatDateFull(datetime: DateTime) {
    return datetime.toLocaleString(DateTime.DATE_FULL);
}

export function formatDateNoYearWithTime(datetime: DateTime) {
    return datetime.toFormat("MMMM d 'at' h:mm a");
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