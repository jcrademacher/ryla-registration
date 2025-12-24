import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "aws-amplify/auth";
import { getCamperProfile, getRotarianReviewFromCamperSub, getCamperYearByUserSub} from "../api/apiCamperProfile";
import { getUser, getUserAttributes, getUserGroups, listAllUsers } from "../api/auth";
import { getCamperApplicationFilename, getCamperDocument, getDocumentStatus, getUrlToCamperFile, getUrlToDocument, listDocumentTemplatesByCamp } from "../api/apiDocuments";
import { getRotarianProfile } from "../api/apiRotarianProfile";
import { listCamperDocuments } from "../api/apiDocuments";
import { getRotaryClub, listRotaryClubs } from "../api/apiRotaryClub";
import { getRecommendationUnauthenticated, getRecommendations } from "../api/apiRecommendations";
import { listGroupRequests, getGroupRequest } from "../api/apiGroupRequest";
import { queryOptions } from '@tanstack/react-query'
import { useContext } from "react";
import { AuthContext } from "../App";
import { getActiveCamp } from "../api/apiCamp";

export function useUserQuery(userId?: string | null) {
    return useQuery({
        queryKey: ["user", userId],
        queryFn: async () => {

            console.log("fetching user data");
            const session = await fetchAuthSession();
            const groups = getUserGroups(session);
            const attributes = await getUserAttributes();
            return {
                groups,
                attributes,
                identityId: session.identityId
            }
        },
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000
    });
}

export function useCamperProfileQuery(userSub?: string | null) {
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
        enabled: !!userSub
    });
}

function rotarianReviewQueryOptions(camperSub?: string | null) {
    return queryOptions({
        queryKey: ["rotarianReview", camperSub],
        queryFn: async () => {
            if (!camperSub) {
                throw new Error("Camper sub is required. Check auth flow.");
            }
            else {
                return await getRotarianReviewFromCamperSub(camperSub);
            }
        },
        enabled: !!camperSub
    });
}

export function useRotarianReviewQuery(camperSub?: string | null) {
    return useQuery(rotarianReviewQueryOptions(camperSub));
}

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
        queryFn: listAllUsers,
        refetchInterval: 10 * 1000
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
    });
}

// export function useListCamperProfilesByRotaryClubQuery(rotaryClub: string | null) {
//     return useQuery({
//         queryKey: ["camperProfilesByRotaryClub", rotaryClub],
//         queryFn: () => {
//             return listCamperProfilesByRotaryClub(rotaryClub);
//         },
//         refetchInterval: 60*1000
//     });
// }


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
    });
}

export function useCamperYearQuery() {
    const { attributes: { sub }} = useContext(AuthContext);

    return useQuery({
        queryKey: ['camperYear', sub],
        queryFn: async () => {
            if(!sub) {
                throw new Error("User sub is required");
            }
            
            const year = await getCamperYearByUserSub(sub);

            if(year) {
                return year;
            }

            return getActiveCamp();
        },
        enabled: !!sub,
    });
}

export function useActiveCampQuery() {
    return useQuery({
        queryKey: ['activeCamp'],
        queryFn: () => {
            return getActiveCamp();
        }
    });
}

export function useDocumentTemplatesByCampQuery(campId?: string | null) {
    return useQuery({
        queryKey: ['documentTemplatesByCamp', campId],
        queryFn: () => {
            if (!campId) {
                throw new Error("Camp is required");
            }
            return listDocumentTemplatesByCamp(campId);
        },
        enabled: !!campId
    });
}

export function useCamperDocumentsQuery(camperUserSub?: string | null) {

    return useQuery({
        queryKey: ["camperDocuments", camperUserSub],
        queryFn: () => {
            if(!camperUserSub) {
                throw new Error("Camper profile null when needed for camper documents");
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

export function useDocumentStatusQuery(camperUserSub?: string | null, campId?: string | null) {
    return useQuery({
        queryKey: ["documentStatus", campId, camperUserSub],
        queryFn: () => {
            if(!campId) {
                throw new Error("Camp id is required");
            }
            if(!camperUserSub) {
                throw new Error("Camper user sub is required");
            }
            return getDocumentStatus(camperUserSub, campId);
        },
        enabled: !!campId && !!camperUserSub,
    });
}

export function useRotaryClubQuery(rotaryClubId?: string | null) {

    return useQuery({
        queryKey: ["rotaryClub", rotaryClubId],
        queryFn: () => {
            if(!rotaryClubId) {
                return null;
            }
            return getRotaryClub(rotaryClubId);
        }
    });
}

export function useListRotaryClubsQuery() {
    return useQuery({
        queryKey: ["rotaryClubs"],
        queryFn: async () => {
            const clubs = await listRotaryClubs();
            return clubs?.sort((a, b) => a.name.localeCompare(b.name));
        }
    });
}

export function useRecommendationQuery(camperUserSub?: string | null) {
    const { data: camperProfile } = useCamperProfileQuery(camperUserSub);

    return useQuery({
        queryKey: ["recommendation", camperUserSub],
        queryFn: async () => {
            if(!camperProfile) {
                throw new Error("Camper user sub is required");
            }
            const recs = await getRecommendations(camperProfile);
            return recs?.length && recs.length > 0 ? recs[0] : null;
        },
        enabled: !!camperProfile,
    });
}

export function useRecommendationUnauthenticatedQuery(recId?: string | null) {
    return useQuery({
        queryKey: ['recommendation', recId],
        queryFn: () => {
            if(!recId) {
                return null;
            }
            return getRecommendationUnauthenticated(recId);
        },
    });
}

export function useListGroupRequestsQuery(enabled?: boolean) {
    return useQuery({
        queryKey: ["groupRequests"],
        queryFn: () => {
            return listGroupRequests();
        },
        refetchInterval: 10 * 1000,
        enabled: enabled === undefined ? true : enabled
    });
}

export function useGroupRequestQuery(id?: string | null) {
    return useQuery({
        queryKey: ["groupRequest", id],
        queryFn: () => {
            if(!id) {
                return null;
            }
            return getGroupRequest(id);
        },
    });
}