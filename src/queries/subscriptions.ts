
import { CamperProfileSchemaType, onCamperProfileUpdate } from "../api/apiCamperProfile";
import { QueryClient } from "@tanstack/react-query";

export function useObserveCamperProfiles(queryClient: QueryClient, campId?: string | null, rotaryClubId?: string | null) {

    return onCamperProfileUpdate((data) => {
        queryClient.setQueryData(['camperProfiles', { campId, rotaryClubId }], 
            (old: CamperProfileSchemaType[]) => {
                const oldRemoved = old.filter((item) => item.userSub !== data.userSub);
                return [...oldRemoved, data];
            });

        queryClient.invalidateQueries({ queryKey: ['camperProfiles', { campId, rotaryClubId }] });
    }, campId, rotaryClubId);
}