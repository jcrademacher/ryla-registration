import { useQuery } from "@tanstack/react-query";
import { AuthUser, fetchAuthSession } from "aws-amplify/auth";
import { CamperProfileSchemaType, getCamperProfile, getCamperStatus, getCamperYear, getRotarianReviewFromCamperSub, listCamperProfilesByRotaryClub } from "../api/apiCamperProfile";
import { getUser, getUserAttributes, getUserGroups, listAllUsers, listGroupsForUser } from "../api/auth";
import { getCamperApplicationFilename, getCamperDocument, getUrlToCamperFile, getUrlToDocument, listDocumentTemplatesByCamp } from "../api/apiDocuments";
import { getRotarianProfile } from "../api/apiRotarianProfile";
import { AuthGroup } from "../../amplify/auth/utils";
import { CampSchemaType, listCamps } from "../api/apiCamp";
import { createFromISO } from "../utils/datetime";
import { listCamperDocuments } from "../api/apiDocuments";

export function useUserQuery(user: AuthUser | undefined) {
    return useQuery({
        queryKey: ["user", user?.userId],
        queryFn: async () => {
            if (!user) {
                throw new Error("User is required");
            }

            console.log("fetching user data");
            const session = await fetchAuthSession();
            const groups = getUserGroups(session);
            const attributes = await getUserAttributes();
            return {
                groups,
                attributes,
                user: user,
                identityId: session.identityId
            }
        },
        enabled: !!user,
        staleTime: 60 * 1000 * 60
    });
}

export function useCamperProfileQuery(userSub: string | undefined) {
    return useQuery({
        queryKey: ["camperProfile", userSub],
        queryFn: () => {
            if (!userSub) {
                throw new Error("User sub is required");
            }
            else {
                return getCamperProfile(userSub);
            }
        },
        enabled: !!userSub,
        staleTime: 60 * 1000 * 60
    });
}

export function useRotarianReviewQuery(camperSub: string | undefined) {
    return useQuery({
        queryKey: ["rotarianReview", camperSub],
        queryFn: async () => {
            if (!camperSub) {
                throw new Error("Camper sub is required. Check auth flow.");
            }
            else {
                return await getRotarianReviewFromCamperSub(camperSub);
            }
        },
        staleTime: 60 * 1000,
        refetchInterval: 60 * 1000,
        enabled: !!camperSub
    });
}

// export function useCamperApplicationFilenameQuery(userSub: string | undefined) {
//     return useQuery({
//         queryKey: ["camperApplicationFilename", userSub],
//         queryFn: getCamperApplicationFilename
//     });
// }

export function useCamperApplicationFilenameQuery(userSub: string | undefined) {
    return useQuery({
        queryKey: ["camperApplication", userSub],
        queryFn: () => getCamperApplicationFilename(),
    });
}

export function useExtCamperApplicationFilenameQuery(identityId?: string) {
    return useQuery({
        queryKey: ["extCamperApplication", identityId],
        queryFn: () => getCamperApplicationFilename(identityId),
        enabled: !!identityId
    });
}

export function useUrlToCamperFileQuery(identityId?: string, subpath?: string, enabled: boolean = false) {
    return useQuery({
        queryKey: ["urlToCamperFile", identityId, subpath],
        queryFn: () => getUrlToCamperFile(identityId, subpath),
        enabled: enabled && !!subpath
    });
}

export function useUrlToDocumentQuery(path?: string | null) {
    return useQuery({
        queryKey: ["urlToDocument", path],
        queryFn: () => {
            if (!path) {
                throw new Error("Path is required");
            }
            return getUrlToDocument(path);
        },
        enabled: !!path
    });
}

export function useUrlToCamperApplicationQuery(identityId?: string, enabled: boolean = false) {
    return useUrlToCamperFileQuery(identityId, "camper-application", enabled);
}

export function useListUsersQuery() {
    return useQuery({
        queryKey: ["users"],
        queryFn: listAllUsers
    });
}

export function useListGroupsForUserQuery(userSub: string | undefined) {
    return useQuery({
        queryKey: ["userGroups", userSub],
        queryFn: () => {
            if (userSub) {
                return listGroupsForUser(userSub);
            }
            else {
                throw new Error("Cannot find username to list group")
            }
        },
        enabled: !!userSub,
        select: (data): AuthGroup[] => data.Groups.map((g: { GroupName: string }) => g.GroupName),
        staleTime: 60 * 1000 * 60
    });
}

export function useRotarianProfileQuery(userSub: string | undefined) {
    return useQuery({
        queryKey: ["rotarianProfile", userSub],
        queryFn: () => {
            if(!userSub) {
                throw new Error("User sub is required. Check auth flow");
            }

            return getRotarianProfile(userSub);
        },
        enabled: !!userSub,
        staleTime: 10*1000
    });
}

export function useListCamperProfilesByRotaryClubQuery(rotaryClub: string | null) {
    return useQuery({
        queryKey: ["camperProfiles", rotaryClub],
        queryFn: () => {
            return listCamperProfilesByRotaryClub(rotaryClub);
        },
        staleTime: 60*1000,
        refetchInterval: 60*1000
    });
}

export function useGetUserEmailQuery(username: string | undefined) {
    return useQuery({
        queryKey: ["getUserEmail", username],
        queryFn: async() => {
            if (!username) {
                throw new Error("Username is required. Check auth flow.");
            }
            const user = await getUser(username);
            // console.log("user", user);
            const userEmail = user.UserAttributes.find((attr: any) => attr.Name === 'email')?.Value;

            if(userEmail) {
                return userEmail;
            }
            else {
                throw new Error("User email not found");
            }
        },
        enabled: !!username,
        staleTime: 60*1000
    });
}

export function useCamperYearQuery(camperProfile: CamperProfileSchemaType | null) {
    return useQuery({
        queryKey: ["camperYear"],
        queryFn: async () => {
            // first attempt to get the year from the camper's profile
            if(camperProfile) {
                return await getCamperYear(camperProfile);
            }
            
            // if the camper's profile doesn't have a year, we need to find the open camp year
            const camps = await listCamps();

            if(camps) {
                const openCamps = camps.filter((camp) => {
                    const applicationDeadline = createFromISO(camp.applicationDeadline);
                    return applicationDeadline.diffNow().toMillis() > 0;
                });

                if(openCamps.length > 0) {
                    return openCamps[0];
                }
            }

            // reaching here means that no camps were found
            return null;
        }
    });
}

export function useDocumentTemplatesByCampQuery(camp?: CampSchemaType | null) {
    return useQuery({
        queryKey: ['documentTemplatesByCamp', camp?.id],
        queryFn: () => {
            if (!camp) {
                throw new Error("Camp is required");
            }
            return listDocumentTemplatesByCamp(camp.id);
        },
        staleTime: 60 * 1000, // 1 minute
        enabled: !!camp?.id
    });
}

export function useCamperDocumentsQuery(camperUserSub?: string | null) {
    return useQuery({
        queryKey: ["camperDocuments", camperUserSub],
        queryFn: () => {
            if(!camperUserSub) {
                throw new Error("Camper user sub is required");
            }
            return listCamperDocuments(camperUserSub);
        },
        enabled: !!camperUserSub,
    });
}

export function useCamperDocumentQuery(camperUserSub?: string | null, templateId?: string | null) {
    return useQuery({
        queryKey: ["camperDocument", camperUserSub, templateId],
        queryFn: () => {
            if(!camperUserSub) {
                throw new Error("Camper user sub is required");
            }
            if(!templateId) {
                throw new Error("Template id is required");
            }
            return getCamperDocument(camperUserSub, templateId);
        },
        enabled: !!camperUserSub && !!templateId,
    });
}

export function useCamperStatusQuery(camperUserSub?: string | null) {
    return useQuery({
        queryKey: ["camperStatus", camperUserSub],
        queryFn: () => {
            if(!camperUserSub) {
                throw new Error("Camper user sub is required");
            }
            return getCamperStatus(camperUserSub);
        },
        enabled: !!camperUserSub,
    });
}