import { useQuery } from "@tanstack/react-query";
import { AuthUser } from "aws-amplify/auth";
import { getCamperProfile, getRotarianReviewFromCamperSub } from "../api/apiCamperProfile";
import { getUserAttributes, getUserGroups, listAllUsers, listGroupsForUser } from "../api/auth";
import { getCamperApplicationFilename, listCamperFiles } from "../api/apiDocuments";
import { getRotarianProfile } from "../api/apiRotarianProfile";

export function useUserQuery(user: AuthUser | undefined) {
    return useQuery({
        queryKey: ["user", user?.userId],
        queryFn: async () => {
            if (!user) {
                throw new Error("User is required");
            }

            console.log("fetching user data");
            const groups = await getUserGroups();
            const attributes = await getUserAttributes();
            return {
                groups,
                attributes,
                user: user
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

export function useRotarianReviewQuery(userSub: string | undefined) {
    return useQuery({
        queryKey: ["rotarianReview", userSub],
        queryFn: async () => {
            if (!userSub) {
                throw new Error("User sub is required");
            }
            else {
                return await getRotarianReviewFromCamperSub(userSub);
            }
        },
        staleTime: 60 * 1000
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
        queryFn: async (): Promise<string | null> => {
            if (!userSub) {
                throw new Error("User sub is required");
            }
            else {
                const { items } = await listCamperFiles();

                const appFile = items.find(item => item.path.includes('camper-application'));

                if (appFile) {
                    const filename = await getCamperApplicationFilename();
                    return filename ?? null;
                }
                else {
                    return null;
                }
            }
        }
    });
}

export function useListUsersQuery() {
    return useQuery({
        queryKey: ["users"],
        queryFn: listAllUsers
    });
}

export function useListGroupsForUserQuery(username: string | undefined) {
    return useQuery({
        queryKey: ["userGroups", username],
        queryFn: () => {
            if (username) {
                return listGroupsForUser(username);
            }
            else {
                throw new Error("Cannot find username to list group")
            }
        },
        enabled: !!username,
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
        refetchInterval: 10*1000,
        staleTime: 10*1000
    });
}