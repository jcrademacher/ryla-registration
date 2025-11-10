import { CamperProfileSchemaType } from "../api/apiCamperProfile";
import { createFromISO, formatDateFull } from "./datetime";

export function getCamperName(camperProfile?: CamperProfileSchemaType | null) {

    if (!camperProfile) {
        return "No Name";
    }

    const { firstName, nickname, lastName, middleInitial } = camperProfile;

    return `${firstName} ${nickname ? `(${nickname})` : ''} ${middleInitial ? `${middleInitial}.` : ''} ${lastName}`;
}

export function getCamperBirthdate(camperProfile?: CamperProfileSchemaType | null) {
    if (!camperProfile?.birthdate) {
        return "";
    }

    return formatDateFull(createFromISO(camperProfile.birthdate));
}

export function getCamperAddress(camperProfile?: CamperProfileSchemaType | null) {
    if (!camperProfile) {
        return "";
    }

    return `${camperProfile.address}, ${camperProfile.city}, ${camperProfile.state} ${camperProfile.zipcode}`;
}

export function formatPhoneNumber(phoneNumber?: string | null) {
    if (!phoneNumber) {
        return "";
    }

    return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
}

export function getFilepathFilename(filepath?: string | null) {
    if (!filepath) {
        return "";
    }

    return filepath.split("/").pop();
}