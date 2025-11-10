import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCamp, listCamps } from "../api/apiCamp";
import { generateCamperPdf, listCamperProfilesByCampId, observeCamperProfilesByCamp } from "../api/apiCamperProfile";
import { useParams } from "react-router";
import { useEffect } from "react";

export function useListCampsQuery() {
    return useQuery({
        queryKey: ['camps'],
        queryFn: listCamps
    });
}

export function useCamperProfilesByCampQuery(campIdArg?: string | null, rotaryClubId?: string | null) {
    let { campId } = useParams();

    campId = campIdArg ?? campId;

    return useQuery({
        queryKey: ['camperProfilesByCamp', campId, rotaryClubId],
        queryFn: () => {
            if (!campId) {
                return [];
            }
            return listCamperProfilesByCampId(campId, rotaryClubId);
        },
        staleTime: 60 * 1000, // 1 minute
    });
}

export function useCampQuery() {
    const { campId } = useParams();

    return useQuery({
        queryKey: ['camp', campId],
        queryFn: () => {
            if (!campId) {
                throw new Error("Camp ID is required");
            }
            return getCamp(campId);
        },
        enabled: !!campId
    });
}

export function useObserveCamperProfilesByCampQuery(campId?: string) {
    const queryClient = useQueryClient();
    
    return useEffect(() => {
        if(campId) {
            const sub = observeCamperProfilesByCamp(campId, () => {
                queryClient.invalidateQueries({ queryKey: ['camperProfilesByCamp', campId] });
            });
            return () => sub.unsubscribe();
        }
    }, [campId, queryClient]);
}

export function useGenerateCamperPdfQuery(camperSub?: string | null) {
    return useQuery({
        queryKey: ['generateCamperPdf', camperSub],
        queryFn: () => {
            if(!camperSub) {
                throw new Error('Camper Sub is required');
            }
            return generateCamperPdf(camperSub);
        },
        enabled: !!camperSub
    });
}